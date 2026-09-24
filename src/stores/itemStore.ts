import { defineStore } from 'pinia';
import { orderBy } from 'lodash-es';

import { itemApi } from '@/api/itemApi';
import { DESIRED_CATEGORY_LIMIT, ItemStatus } from '@/constants/item';
import { FORM_MESSAGES, PAGE_MESSAGES } from '@/constants/messages';
import type { Item, ItemDraft } from '@/models/item';
import type { MatchedItem } from '@/types';
import { message } from '@/utils/message';
import { validateItemDraft } from '@/utils/validators';

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
    matchedItems: (state) => (userId: string, desiredCategories: string[]): MatchedItem[] => {
      if (!userId || !desiredCategories.length) return [];
      const matched = state.items
        .filter((item) => item.user_id !== userId && item.status === ItemStatus.AVAILABLE)
        .map((item) => ({
          item,
          commonCategories: desiredCategories.filter((category) =>
            item.desired_categories.includes(category),
          ),
        }))
        .filter((entry) => entry.commonCategories.length > 0);
      return orderBy(
        matched,
        [(entry) => entry.commonCategories.length, (entry) => entry.item.created_at],
        ['desc', 'desc'],
      );
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
        desired_categories: [...draft.desired_categories],
        condition: draft.condition,
        images: [...draft.images],
        location: draft.location,
        status: ItemStatus.AVAILABLE,
      });
      this.items = await itemApi.list();
      message('物品已发布，等待合适的交换', 'success');
      return item;
    },
    async updateDesiredCategories(itemId: string, desiredCategories: string[]) {
      if (desiredCategories.length > DESIRED_CATEGORY_LIMIT) {
        message(FORM_MESSAGES.desiredCategoryLimit, 'error');
        return;
      }
      await itemApi.update(itemId, { desired_categories: [...desiredCategories] });
      this.items = await itemApi.list();
      message(PAGE_MESSAGES.desiredCategoriesUpdated, 'success');
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
