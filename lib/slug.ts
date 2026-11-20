/** Bỏ dấu tiếng Việt. "đ" không tách được thành chữ + dấu nên đổi riêng. */
export function removeDiacritics(text: string): string {
  return text
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .normalize('NFC');
}

function isAbsoluteHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Chuẩn hoá đường dẫn bài viết (giống backend cũ): bỏ dấu, chỉ giữ chữ, số, dấu gạch ngang.
 * Nếu đường dẫn trống hoặc là một địa chỉ http(s) thì lấy từ tiêu đề.
 */
export function normalizeSlug(slug: string | null | undefined, fallbackTitle = ''): string {
  let candidate = (slug ?? '').trim();
  if (!candidate || isAbsoluteHttpUrl(candidate)) candidate = (fallbackTitle ?? '').trim();
  if (!candidate) return '';
  candidate = removeDiacritics(candidate);
  candidate = candidate.replace(/[^\w\s-]/g, ' ');
  candidate = candidate.replace(/[\s_]+/g, '-');
  candidate = candidate.replace(/-+/g, '-');
  return candidate.replace(/^-+|-+$/g, '').toLowerCase();
}

export function canonicalArticleSlug(slug: string | null | undefined, title: string): string {
  return normalizeSlug(slug, title);
}

/** Slug cho tên người dùng, thêm 4 số ngẫu nhiên để không trùng. */
export function generateUserSlug(name: string): string {
  const base = removeDiacritics(name).replace(/[^\w-]+/g, '-').toLowerCase();
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}-${suffix}`;
}
