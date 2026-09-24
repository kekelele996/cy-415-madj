<template>
  <section class="page home-page">
    <div class="page-heading home-heading">
      <div>
        <p class="eyebrow">本地以物换物</p>
        <h1>把闲置重新放回生活里</h1>
      </div>
      <RouterLink class="primary-link" to="/publish">发布闲置</RouterLink>
    </div>

    <section class="match-section">
      <div class="match-section__heading">
        <h2>双向匹配</h2>
        <p>你的期望与物主期望有交集的在架物品，按共同分类数排序</p>
      </div>
      <div v-if="matchedItems.length" class="waterfall">
        <ItemCard
          v-for="entry in matchedItems"
          :key="entry.item.id"
          :item="entry.item"
          :owner="ownerOf(entry.item.user_id)"
          :common-categories="entry.commonCategories"
        />
      </div>
      <p v-else-if="!myDesiredCategories.length" class="match-section__hint">
        {{ PAGE_MESSAGES.homeMatchHint }}
        <RouterLink class="text-link" to="/profile">去设置期望分类</RouterLink>
      </p>
      <p v-else class="match-section__hint">{{ PAGE_MESSAGES.homeMatchEmpty }}</p>
    </section>

    <div class="toolbar">
      <van-search v-model="itemStore.keyword" placeholder="搜索物品、描述或地点" />
      <CategoryFilter v-model="itemStore.category" />
    </div>

    <div v-if="normalItems.length" class="waterfall">
      <ItemCard
        v-for="item in normalItems"
        :key="item.id"
        :item="item"
        :owner="ownerOf(item.user_id)"
      />
    </div>
    <EmptyState
      v-else-if="!matchedItems.length"
      mark="空"
      title="没有找到可交换物品"
      :description="PAGE_MESSAGES.homeEmpty"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { Search as VanSearch } from 'vant';

import CategoryFilter from '@/components/common/CategoryFilter.vue';
import EmptyState from '@/components/common/EmptyState.vue';
import ItemCard from '@/components/common/ItemCard.vue';
import { PAGE_MESSAGES } from '@/constants/messages';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useAuthStore } from '@/stores/authStore';
import { useItemStore } from '@/stores/itemStore';

const itemStore = useItemStore();
const authStore = useAuthStore();
const ownerOf = (userId: string) => authStore.users.find((user) => user.id === userId);
const savedKeyword = useLocalStorage('reswap:last-home-keyword', '');

const myDesiredCategories = computed(() => authStore.currentUser?.desired_categories ?? []);
const matchedItems = computed(() =>
  authStore.currentUser
    ? itemStore.matchedItems(authStore.currentUser.id, myDesiredCategories.value)
    : [],
);
const normalItems = computed(() => {
  const matchedIds = new Set(matchedItems.value.map((entry) => entry.item.id));
  return itemStore.visibleItems.filter((item) => !matchedIds.has(item.id));
});

onMounted(() => {
  if (!itemStore.keyword && savedKeyword.value) {
    itemStore.keyword = savedKeyword.value;
  }
});

watch(
  () => itemStore.keyword,
  (value) => {
    savedKeyword.value = value;
  },
);
</script>
