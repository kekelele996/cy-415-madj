import type { ItemDraft } from '@/models/item';
import type { UserDraft } from '@/models/user';

import { WANTED_CATEGORY_LIMIT } from '@/constants/item';
import { FORM_MESSAGES } from '@/constants/messages';

export const validateWantedCategories = (wantedCategories?: string[]) => {
  if ((wantedCategories?.length ?? 0) > WANTED_CATEGORY_LIMIT) return FORM_MESSAGES.wantedLimit;
  return '';
};

export const validateItemDraft = (draft: Partial<ItemDraft>) => {
  if (!draft.title?.trim()) return FORM_MESSAGES.requiredTitle;
  if (!draft.description?.trim()) return FORM_MESSAGES.requiredDescription;
  return validateWantedCategories(draft.wanted_categories);
};

export const validateUserDraft = (draft: Partial<UserDraft>) => {
  if (!draft.nickname?.trim()) return '昵称不能为空';
  if (!draft.phone?.trim()) return FORM_MESSAGES.requiredPhone;
  return validateWantedCategories(draft.wanted_categories);
};
