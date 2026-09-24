<template>
  <RouterLink class="item-card" :to="`/item/${item.id}`">
    <ItemImageGallery :images="item.images" :fallback-text="item.category" />
    <div class="item-card__body">
      <div class="item-card__topline">
        <span class="pill">{{ item.category }}</span>
        <span class="status-pill" :class="statusToneClass(item.status)">{{ formatItemStatus(item.status) }}</span>
      </div>
      <h3>{{ item.title }}</h3>
      <p>{{ item.description }}</p>
      <div v-if="item.desired_categories.length" class="desired-row">
        <span
          v-for="category in item.desired_categories"
          :key="category"
          class="pill"
          :class="{ 'pill--common': commonCategories.includes(category) }"
        >
          想换 {{ category }}
        </span>
      </div>
      <p v-if="commonCategories.length" class="match-note">
        共同期望 {{ commonCategories.length }} 类：{{ commonCategories.join('、') }}
      </p>
      <div class="item-card__meta">
        <span>{{ item.location }}</span>
        <span>{{ formatCondition(item.condition) }}</span>
      </div>
      <div class="item-card__owner">
        <span v-if="owner">{{ owner.nickname }}</span>
        <span v-if="isMine" class="mine">我的</span>
      </div>
    </div>
  </RouterLink>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

import type { Item } from '@/models/item';
import type { User } from '@/models/user';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { formatCondition, formatItemStatus, statusToneClass } from '@/utils/formatters';

import ItemImageGallery from './ItemImageGallery.vue';

const props = withDefaults(
  defineProps<{
    item: Item;
    owner?: User;
    commonCategories?: string[];
  }>(),
  {
    commonCategories: () => [],
  },
);

const authStore = useAuthStore();
useThemeStore();
const isMine = computed(() => authStore.currentUser?.id === props.item.user_id);
</script>
