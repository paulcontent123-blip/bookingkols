-- BookingKols: cấu trúc database trên Supabase (PostgreSQL).
-- Chạy trong Supabase: SQL Editor -> dán toàn bộ file này -> Run. (Hoặc: npm run db:migrate)
--
-- DÙNG CHUNG DATABASE VỚI DỰ ÁN KHÁC (ví dụ BookingModel): mọi bảng/chỉ mục/trigger/hàm của bookingkols đều có tiền tố "bk_"
-- nên KHÔNG trùng và KHÔNG đụng vào bất kỳ bảng nào của dự án kia (đặc biệt public.users và public.touch_updated_at()).
-- Chạy lại nhiều lần vẫn an toàn.
-- Ứng dụng chỉ truy cập bằng khoá service role ở phía máy chủ; trình duyệt không đọc/ghi trực tiếp.

create extension if not exists pgcrypto;

create or replace function public.bk_touch_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- Tài khoản quản trị (mật khẩu băm bcrypt, tương thích với hệ thống .NET cũ).
create table if not exists public.bk_users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null default '',
  password text not null,
  slug text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists bk_users_email_lower_idx on public.bk_users (lower(email));

-- Bài viết: type = kol | agency | project, status = published | draft.
-- thumbnail là mã ảnh trên Cloudinary (public id) hoặc đường dẫn/địa chỉ ảnh đầy đủ.
create table if not exists public.bk_articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  thumbnail text not null default '',
  slug text not null,
  description text not null default '',
  content text not null default '',
  author_id uuid references public.bk_users (id) on delete set null,
  type text not null default 'kol' check (type in ('kol', 'agency', 'project')),
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists bk_articles_slug_idx on public.bk_articles (slug);
create index if not exists bk_articles_status_updated_idx on public.bk_articles (status, updated_at desc);
create index if not exists bk_articles_type_idx on public.bk_articles (type);

-- Cấu hình SEO theo từng trang: đoạn HTML (thẻ meta...) chèn vào <head> của url tương ứng.
create table if not exists public.bk_seo_html_contents (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  html_content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists bk_seo_html_contents_url_idx on public.bk_seo_html_contents (url);

-- Thông tin khách để lại qua form liên hệ.
create table if not exists public.bk_contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  is_processed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bk_contact_requests_created_idx on public.bk_contact_requests (created_at desc);
create index if not exists bk_contact_requests_phone_idx on public.bk_contact_requests (phone, created_at desc);

-- Danh sách KOL hiển thị ở trang chủ ("Danh sách KOL hợp tác" và mục "Top profile"), quản lý trong trang quản trị.
-- avatar là mã ảnh trên Cloudinary (public id) hoặc địa chỉ ảnh đầy đủ (giống cột thumbnail của bài viết).
create table if not exists public.bk_kols (
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
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists bk_kols_slug_idx on public.bk_kols (slug);
create index if not exists bk_kols_published_order_idx on public.bk_kols (is_published, sort_order, created_at);
create index if not exists bk_kols_featured_idx on public.bk_kols (is_featured, is_published, sort_order);

drop trigger if exists bk_users_touch_updated_at on public.bk_users;
create trigger bk_users_touch_updated_at before update on public.bk_users for each row execute function public.bk_touch_updated_at();
drop trigger if exists bk_articles_touch_updated_at on public.bk_articles;
create trigger bk_articles_touch_updated_at before update on public.bk_articles for each row execute function public.bk_touch_updated_at();
drop trigger if exists bk_seo_html_contents_touch_updated_at on public.bk_seo_html_contents;
create trigger bk_seo_html_contents_touch_updated_at before update on public.bk_seo_html_contents for each row execute function public.bk_touch_updated_at();
drop trigger if exists bk_contact_requests_touch_updated_at on public.bk_contact_requests;
create trigger bk_contact_requests_touch_updated_at before update on public.bk_contact_requests for each row execute function public.bk_touch_updated_at();
drop trigger if exists bk_kols_touch_updated_at on public.bk_kols;
create trigger bk_kols_touch_updated_at before update on public.bk_kols for each row execute function public.bk_touch_updated_at();

-- Bảo mật: bật RLS và KHÔNG tạo policy nào => khoá anon/public không đọc được gì.
-- Khoá service role của ứng dụng bỏ qua RLS nên vẫn làm việc bình thường.
alter table public.bk_users enable row level security;
alter table public.bk_articles enable row level security;
alter table public.bk_seo_html_contents enable row level security;
alter table public.bk_contact_requests enable row level security;
alter table public.bk_kols enable row level security;

-- Dữ liệu ban đầu cho trang chủ: CHỈ nạp khi bảng KOL còn trống (không ghi đè dữ liệu đã có hoặc đã chép từ database cũ).
-- Ảnh còn trỏ về server cũ (bookingkols.com.vn) đã hỏng: hãy cập nhật lại ảnh trong trang quản trị.
-- Huỳnh Khánh Đông được tạo ở trạng thái ẨN (ảnh cũ đã hỏng): tải ảnh lên rồi chọn "Hiển thị ở trang chủ".
do $$
begin
  if not exists (select 1 from public.bk_kols) then
    insert into public.bk_kols (slug, name, nickname, avatar, province, fields, tiktok_url, tiktok_followers, facebook_url, youtube_url, youtube_followers, sort_order, is_published, is_featured)
    values
      ('khoa-pug--6858', 'Khoa Pug', 'Khoa Pug', 'bookingkol/site-assets/web/images/home-page/exclusive_koc4', 'Thành phố Hà Nội', array['travel','beauty'], 'https://www.tiktok.com/@khoapug.1102', '399.4K', null, 'https://www.youtube.com/@KhoaPug_TV/community', '4,66 Tr', 1, true, true),
      ('phuong-doan-ri-viu-vo1p', 'Phương Đoàn Rì Viu', 'Phương Đoàn review', 'https://bookingkols.com.vn/images/addb581d-c44c-4faa-a503-0d4905191d94-asd.jpg', 'Thành phố Hồ Chí Minh', array['fashion','beauty'], null, '231,7K', null, null, null, 2, true, false),
      ('quan-khong-go-5mtl', 'Quan không gờ', 'Quan Không Gờ', 'bookingkol/images/kol/quan-khong-go', 'Thành phố Hồ Chí Minh', array['fashion','beauty'], 'https://www.tiktok.com/@quankhonggo', '4,6M', null, null, null, 3, true, true),
      ('doan-kim-anh-qkzf', 'Đoàn Kim Anh', 'Kazinh', 'https://bookingkols.com.vn/images/9efa7e53-1933-49eb-a437-1de57bf4ae82-dsabdsdsb.png', 'Thành phố Đà Nẵng', array['fashion','beauty'], null, '62,5K', null, null, null, 4, true, false),
      ('ngoc-eng-ozsv', 'Ngọc Éng', 'Ngọc Éng', 'bookingkol/images/kol/ngoc-eng', 'Thành phố Hồ Chí Minh', array['fashion','beauty','education'], 'https://www.tiktok.com/@ngoc.eng', '6,4M', null, null, null, 5, true, false),
      ('am-thuc-me-lam-0499', 'Ẩm Thực Mẹ Làm', 'Ẩm Thực Mẹ Làm', 'bookingkol/images/kol/am-thuc-me-lam', 'Tỉnh Thái Nguyên', array['cuisine'], 'https://www.tiktok.com/@amthucmelam.official', '286,5K', 'https://www.facebook.com/AmThucMeLam.Official', null, null, 6, true, false),
      ('gia-dinh-tihi--7035', 'Gia Đình TiHi', 'Gia Đình TiHi', 'bookingkol/images/kol/gia-dinh-tihi', 'Thành phố Hồ Chí Minh', array['cuisine','travel','fashion'], 'https://www.tiktok.com/@giadinhtihi', '112,2K', null, null, null, 7, true, false),
      ('tasee-tasee-9810', 'tasee_tasee', 'tasee_tasee', 'bookingkol/images/kol/tasee-tasee', 'Thành phố Hồ Chí Minh', array['beauty','other'], 'https://www.tiktok.com/@tasee_tasee', '380,4K', null, null, null, 8, true, false),
      ('huynh-khanh-dong-5220', 'Huỳnh Khánh Đông', 'Huỳnh Khánh Đông', '', 'Thành phố Hồ Chí Minh', array['fashion','streamingAndModel','beauty'], null, null, null, null, null, 9, false, true);
  end if;
end $$;
