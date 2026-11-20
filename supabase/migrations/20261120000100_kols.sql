-- Danh sách KOL hiển thị ở trang chủ ("Danh sách KOL hợp tác"), quản lý trong trang quản trị.
-- avatar là mã ảnh trên Cloudinary (public id) hoặc địa chỉ ảnh đầy đủ (giống cột thumbnail của bài viết).
create table if not exists public.kols (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  name text not null,
  nickname text not null default '',
  avatar text not null default '',
  province text not null default '',
  fields text[] not null default '{}',
  tiktok_url text,
  tiktok_followers text,
  facebook_url text,
  facebook_followers text,
  youtube_url text,
  youtube_followers text,
  instagram_url text,
  instagram_followers text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists kols_slug_idx on public.kols (slug);
create index if not exists kols_published_order_idx on public.kols (is_published, sort_order, created_at);

drop trigger if exists kols_touch_updated_at on public.kols;
create trigger kols_touch_updated_at before update on public.kols for each row execute function public.touch_updated_at();

-- Giống các bảng khác: bật RLS và không tạo policy; chỉ khoá service role của máy chủ mới đọc/ghi được.
alter table public.kols enable row level security;

-- Dữ liệu ban đầu: 8 KOL đang hiện ở trang chủ (trước đây gõ cứng trong lib/home-data.ts).
-- Chạy lại nhiều lần vẫn an toàn (trùng slug thì bỏ qua, không ghi đè chỉnh sửa trong trang quản trị).
-- Ảnh còn trỏ về server cũ (bookingkols.com.vn) đã hỏng: hãy cập nhật lại ảnh trong trang quản trị.
insert into public.kols (slug, name, nickname, avatar, province, fields, tiktok_url, tiktok_followers, facebook_url, youtube_url, youtube_followers, sort_order)
values
  ('khoa-pug--6858', 'Khoa Pug', 'Khoa Pug', 'bookingkol/site-assets/web/images/home-page/exclusive_koc4', 'Thành phố Hà Nội', array['travel','beauty'], 'https://www.tiktok.com/@khoapug.1102', '399.4K', null, 'https://www.youtube.com/@KhoaPug_TV/community', '4,66 Tr', 1),
  ('phuong-doan-ri-viu-vo1p', 'Phương Đoàn Rì Viu', 'Phương Đoàn review', 'https://bookingkols.com.vn/images/addb581d-c44c-4faa-a503-0d4905191d94-asd.jpg', 'Thành phố Hồ Chí Minh', array['fashion','beauty'], null, '231,7K', null, null, null, 2),
  ('quan-khong-go-5mtl', 'Quan không gờ', 'Quan Không Gờ', 'bookingkol/images/kol/quan-khong-go', 'Thành phố Hồ Chí Minh', array['fashion','beauty'], 'https://www.tiktok.com/@quankhonggo', '4,6M', null, null, null, 3),
  ('doan-kim-anh-qkzf', 'Đoàn Kim Anh', 'Kazinh', 'https://bookingkols.com.vn/images/9efa7e53-1933-49eb-a437-1de57bf4ae82-dsabdsdsb.png', 'Thành phố Đà Nẵng', array['fashion','beauty'], null, '62,5K', null, null, null, 4),
  ('ngoc-eng-ozsv', 'Ngọc Éng', 'Ngọc Éng', 'bookingkol/images/kol/ngoc-eng', 'Thành phố Hồ Chí Minh', array['fashion','beauty','education'], 'https://www.tiktok.com/@ngoc.eng', '6,4M', null, null, null, 5),
  ('am-thuc-me-lam-0499', 'Ẩm Thực Mẹ Làm', 'Ẩm Thực Mẹ Làm', 'bookingkol/images/kol/am-thuc-me-lam', 'Tỉnh Thái Nguyên', array['cuisine'], 'https://www.tiktok.com/@amthucmelam.official', '286,5K', 'https://www.facebook.com/AmThucMeLam.Official', null, null, 6),
  ('gia-dinh-tihi--7035', 'Gia Đình TiHi', 'Gia Đình TiHi', 'bookingkol/images/kol/gia-dinh-tihi', 'Thành phố Hồ Chí Minh', array['cuisine','travel','fashion'], 'https://www.tiktok.com/@giadinhtihi', '112,2K', null, null, null, 7),
  ('tasee-tasee-9810', 'tasee_tasee', 'tasee_tasee', 'bookingkol/images/kol/tasee-tasee', 'Thành phố Hồ Chí Minh', array['beauty','other'], 'https://www.tiktok.com/@tasee_tasee', '380,4K', null, null, null, 8)
on conflict (slug) do nothing;
