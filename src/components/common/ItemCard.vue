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
      <div v-if="item.wanted_categories.length" class="item-card__wanted">
        <span class="wanted-label">想换</span>
        <span v-for="category in item.wanted_categories" :key="category" class="wanted-pill">
          {{ category }}
        </span>
      </div>
      <div v-if="matchedCategories?.length" class="item-card__matched">
        <span class="matched-label">共同想换 {{ matchedCategories.length }} 类</span>
        <span v-for="category in matchedCategories" :key="category" class="wanted-pill wanted-pill--hit">
          {{ category }}
        </span>
      </div>
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

const props = defineProps<{
  item: Item;
  owner?: User;
  matchedCategories?: string[];
}>();

const authStore = useAuthStore();
useThemeStore();
const isMine = computed(() => authStore.currentUser?.id === props.item.user_id);
</script>
