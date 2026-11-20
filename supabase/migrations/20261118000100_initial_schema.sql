-- BookingKols: cấu trúc database trên Supabase (PostgreSQL).
-- Chạy trong Supabase: SQL Editor -> dán toàn bộ file này -> Run.
-- Ứng dụng chỉ truy cập bằng khoá service role ở phía máy chủ; trình duyệt không đọc/ghi trực tiếp.

create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
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
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text not null default '',
  password text not null,
  slug text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists users_email_lower_idx on public.users (lower(email));

-- Bài viết: type = kol | agency | project, status = published | draft.
-- thumbnail là mã ảnh trên Cloudinary (public id) hoặc đường dẫn/địa chỉ ảnh đầy đủ.
create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  thumbnail text not null default '',
  slug text not null,
  description text not null default '',
  content text not null default '',
  author_id uuid references public.users (id) on delete set null,
  type text not null default 'kol' check (type in ('kol', 'agency', 'project')),
  status text not null default 'draft' check (status in ('published', 'draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists articles_slug_idx on public.articles (slug);
create index if not exists articles_status_updated_idx on public.articles (status, updated_at desc);
create index if not exists articles_type_idx on public.articles (type);

-- Cấu hình SEO theo từng trang: đoạn HTML (thẻ meta...) chèn vào <head> của url tương ứng.
create table if not exists public.seo_html_contents (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  html_content text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists seo_html_contents_url_idx on public.seo_html_contents (url);

-- Thông tin khách để lại qua form liên hệ.
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  message text not null,
  is_processed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contact_requests_created_idx on public.contact_requests (created_at desc);
create index if not exists contact_requests_phone_idx on public.contact_requests (phone, created_at desc);

create trigger users_touch_updated_at before update on public.users for each row execute function public.touch_updated_at();
create trigger articles_touch_updated_at before update on public.articles for each row execute function public.touch_updated_at();
create trigger seo_html_contents_touch_updated_at before update on public.seo_html_contents for each row execute function public.touch_updated_at();
create trigger contact_requests_touch_updated_at before update on public.contact_requests for each row execute function public.touch_updated_at();

-- Bảo mật: bật RLS và KHÔNG tạo policy nào => khoá anon/public không đọc được gì.
-- Khoá service role của ứng dụng bỏ qua RLS nên vẫn làm việc bình thường.
alter table public.users enable row level security;
alter table public.articles enable row level security;
alter table public.seo_html_contents enable row level security;
alter table public.contact_requests enable row level security;
