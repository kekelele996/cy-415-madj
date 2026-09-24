<template>
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
</template>

<script setup lang="ts">
import { DESIRED_CATEGORY_LIMIT, ITEM_CATEGORIES } from '@/constants/item';
import { FORM_MESSAGES } from '@/constants/messages';
import { useThemeStore } from '@/stores/themeStore';
import { message } from '@/utils/message';

const props = withDefaults(
  defineProps<{
    modelValue: string[];
    categories?: string[];
    max?: number;
  }>(),
  {
    categories: () => ITEM_CATEGORIES.filter((category) => category !== '全部'),
    max: DESIRED_CATEGORY_LIMIT,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string[]];
}>();

useThemeStore();

const toggle = (category: string) => {
  if (props.modelValue.includes(category)) {
    emit(
      'update:modelValue',
      props.modelValue.filter((item) => item !== category),
    );
    return;
  }
  if (props.modelValue.length >= props.max) {
    message(FORM_MESSAGES.desiredCategoryLimit, 'error');
    return;
  }
  emit('update:modelValue', [...props.modelValue, category]);
};
</script>
