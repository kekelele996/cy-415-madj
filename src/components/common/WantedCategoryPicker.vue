<template>
  <div class="wanted-picker">
    <div class="category-filter" aria-label="想换分类多选">
      <button
        v-for="category in categories"
        :key="category"
        class="category-filter__item"
        :class="{ 'category-filter__item--active': modelValue.includes(category) }"
        type="button"
        @click="toggle(category)"
      >
        {{ category }}
      </button>
    </div>
    <small class="wanted-picker__hint">已选 {{ modelValue.length }}/{{ limit }} 个，点击分类可增删</small>
  </div>
</template>

<script setup lang="ts">
import { WANTED_CATEGORY_LIMIT, WANTED_CATEGORY_OPTIONS } from '@/constants/item';
import { FORM_MESSAGES } from '@/constants/messages';
import { useThemeStore } from '@/stores/themeStore';
import { message } from '@/utils/message';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    categories?: string[];
    limit?: number;
  }>(),
  {
    categories: () => WANTED_CATEGORY_OPTIONS,
    limit: WANTED_CATEGORY_LIMIT,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

useThemeStore();

const toggle = (category: string) => {
  if (props.modelValue.includes(category)) {
    emit('update:modelValue', props.modelValue.filter((item) => item !== category));
    return;
  }
  if (props.modelValue.length >= props.limit) {
    message(FORM_MESSAGES.wantedLimit, 'error');
    return;
  }
  emit('update:modelValue', [...props.modelValue, category]);
};
</script>
