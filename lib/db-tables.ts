// Tên các bảng của BookingKols trong Supabase.
// Có tiền tố "bk_" vì database được DÙNG CHUNG với dự án khác (BookingModel, vốn đã có bảng public.users...):
// tiền tố giúp hai dự án không trùng tên và không đụng dữ liệu của nhau. Cấu trúc bảng: supabase/migrations.
export const TABLES = {
  users: 'bk_users',
  articles: 'bk_articles',
  seoHtml: 'bk_seo_html_contents',
  contacts: 'bk_contact_requests',
  kols: 'bk_kols'
} as const;
