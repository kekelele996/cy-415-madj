import { defineStore } from 'pinia';
import { intersection, orderBy, uniq } from 'lodash-es';

import { itemApi } from '@/api/itemApi';
import { ItemStatus } from '@/constants/item';
import { FORM_MESSAGES, PAGE_MESSAGES } from '@/constants/messages';
import type { Item, ItemDraft } from '@/models/item';
import { useAuthStore } from '@/stores/authStore';
import type { ItemMatch } from '@/types';
import { message } from '@/utils/message';
import { validateItemDraft, validateWantedCategories } from '@/utils/validators';

export const useItemStore = defineStore('items', {
  state: () => ({
    items: [] as Item[],
    keyword: '',
    category: '全部',
    statusFilter: ItemStatus.AVAILABLE as ItemStatus,
    loading: false,
  }),
  getters: {
    visibleItems: (state) => {
      return orderBy(
        state.items.filter((item) => {
          const categoryMatched = state.category === '全部' || item.category === state.category;
          const keywordMatched = `${item.title}${item.description}${item.location}`
            .toLowerCase()
            .includes(state.keyword.toLowerCase());
          return categoryMatched && keywordMatched && item.status === state.statusFilter;
        }),
        ['created_at'],
        ['desc'],
      );
    },
    // 双向匹配：我的期望分类与物主期望（物品想换分类 ∪ 物主资料期望分类）有交集的在架物品，
    // 排除本人发布与已交换/已下架，按共同分类数降序、发布时间降序。
    mutualMatches: (state): ItemMatch[] => {
      const authStore = useAuthStore();
      const me = authStore.currentUser;
      if (!me || !me.wanted_categories.length) return [];
      const matches = state.items
        .filter((item) => item.status === ItemStatus.AVAILABLE && item.user_id !== me.id)
        .map((item) => {
          const owner = authStore.users.find((user) => user.id === item.user_id);
          const ownerExpectations = uniq([...item.wanted_categories, ...(owner?.wanted_categories ?? [])]);
          const commonCategories = intersection(me.wanted_categories, ownerExpectations);
          return { item, commonCategories };
        })
        .filter((match) => match.commonCategories.length > 0);
      return orderBy(
        matches,
        [(match) => match.commonCategories.length, (match) => match.item.created_at],
        ['desc', 'desc'],
      );
    },
    // 普通列表：匹配区出现的物品不再进入普通列表。
    regularItems(state): Item[] {
      const matchedIds = new Set(this.mutualMatches.map((match) => match.item.id));
      return this.visibleItems.filter((item) => !matchedIds.has(item.id));
    },
    myItems: (state) => (userId: string) => state.items.filter((item) => item.user_id === userId),
    availableMyItems: (state) => (userId: string) =>
      state.items.filter((item) => item.user_id === userId && item.status === ItemStatus.AVAILABLE),
  },
  actions: {
    async hydrate() {
      this.loading = true;
      try {
        this.items = await itemApi.list();
      } finally {
        this.loading = false;
      }
    },
    async publish(draft: ItemDraft) {
      const error = validateItemDraft(draft);
      if (error) {
        message(error, 'error');
        return null;
      }
      const item = await itemApi.create({
        user_id: draft.user_id,
        title: draft.title,
        description: draft.description,
        category: draft.category,
        condition: draft.condition,
        images: [...draft.images],
        location: draft.location,
        wanted_categories: [...draft.wanted_categories],
        status: ItemStatus.AVAILABLE,
      });
      this.items = await itemApi.list();
      message('物品已发布，等待合适的交换', 'success');
      return item;
    },
    async updateWantedCategories(itemId: string, wantedCategories: string[]) {
      const error = validateWantedCategories(wantedCategories);
      if (error) {
        message(error, 'error');
        return;
      }
      await itemApi.update(itemId, { wanted_categories: [...wantedCategories] });
      this.items = await itemApi.list();
      message(PAGE_MESSAGES.wantedUpdated, 'success');
    },
    async offline(itemId: string) {
      await itemApi.setStatus(itemId, ItemStatus.OFFLINE);
      this.items = await itemApi.list();
      message('物品已下架', 'success');
    },
    assertCanExchange(userId: string) {
      const ownItems = this.availableMyItems(userId);
      if (!ownItems.length) {
        message(FORM_MESSAGES.exchangeNeedOwnItem, 'error');
        return false;
      }
      return true;
    },
  },
});
