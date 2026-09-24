import type { ItemDraft } from '@/models/item';
import type { UserDraft } from '@/models/user';

import { DESIRED_CATEGORY_LIMIT } from '@/constants/item';
import { FORM_MESSAGES } from '@/constants/messages';

export const validateItemDraft = (draft: Partial<ItemDraft>) => {
  if (!draft.title?.trim()) return FORM_MESSAGES.requiredTitle;
  if (!draft.description?.trim()) return FORM_MESSAGES.requiredDescription;
  if ((draft.desired_categories?.length ?? 0) > DESIRED_CATEGORY_LIMIT) {
    return FORM_MESSAGES.desiredCategoryLimit;
  }
  return '';
};

export const validateUserDraft = (draft: Partial<UserDraft>) => {
  if (!draft.nickname?.trim()) return '昵称不能为空';
  if (!draft.phone?.trim()) return FORM_MESSAGES.requiredPhone;
  if ((draft.desired_categories?.length ?? 0) > DESIRED_CATEGORY_LIMIT) {
    return FORM_MESSAGES.desiredCategoryLimit;
  }
  return '';
};
