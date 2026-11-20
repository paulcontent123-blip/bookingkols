'use client';

import { useI18n } from '@/components/I18nProvider';
import { cls } from '@/lib/cls';
import s from './field-tag.module.scss';

/** Thẻ lĩnh vực của KOL (ví dụ "Thời trang"). Biểu tượng lĩnh vực đã bị bỏ ở website cũ (luôn ẩn). */
export function FieldTag({ field, isActive = false, type = 'default' }: { field: string; isActive?: boolean; hideIcon?: boolean; type?: 'default' | 'primary' }) {
  const { t } = useI18n();
  return (
    <div data-field-tag className={cls(s, `tag ${type}`, isActive && 'active')}>
      {t(`field.${field}`)}
    </div>
  );
}
