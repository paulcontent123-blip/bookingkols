# BookingKols (Next.js 15 + Supabase)

Website, trang quản trị và API của **bookingkols.com.vn** trong **một** ứng dụng Next.js 15 (App Router, TypeScript).
Thay cho 3 dự án cũ: website Angular `booking-kol`, portal Angular `booking-kol-portal` và backend .NET `booking-kol-be`.

| Phần | Địa chỉ | Thay cho |
|---|---|---|
| Website công khai (vi/en) | `/`, `/news`, `/news/<slug>`, `/campaigns`, `/our-service`, `/about-us`, `/contact`, `/privacy`, `/policy`, `/security` | `booking-kol` |
| Trang quản trị | `/admin` (đăng nhập, Quản lý User / Tin tức / KOL / Liên hệ / config SEO, đổi mật khẩu) | `booking-kol-portal` |
| API | `/api/articles`, `/api/contacts`, `/api/seo-html-contents`, `/api/admin/...` | `booking-kol-be` |
| SEO | `/sitemap.xml` (mục lục), `/sitemap-pages.xml`, `/sitemap-news.xml`, `/robots.txt`, JSON-LD, hreflang, GTM (GA4 qua GTM) | như cũ |

Database: **Supabase (PostgreSQL)**. Ảnh bài viết: **Cloudinary**. Email thông báo liên hệ: SMTP (tuỳ chọn).

## Cấu trúc thư mục

```
app/            trang và API (route group (site) = website, admin = quản trị, api = API)
components/     giao diện (layout, home, news, admin, ui...)
lib/            logic: Supabase, đăng nhập, bài viết, liên hệ, SEO, Cloudinary, sitemap, i18n
styles/         SCSS toàn cục (chuyển từ website cũ)
public/         font, favicon, robots.txt
supabase/       cấu trúc database (migrations)
scripts/        create-admin, import-old-db, check-database, smoke-test, prepare-deploy
```

## Cài đặt lần đầu

1. **Tạo project Supabase**, mở **SQL Editor**, lần lượt dán rồi **Run** từng file trong `supabase/migrations/` (theo thứ tự tên file:
   `20261118000100_initial_schema.sql`, sau đó `20261120000100_kols.sql` tạo bảng KOL và nạp sẵn 8 KOL của trang chủ). Hoặc chạy `npm run db:migrate`.
2. Sao chép `.env.example` thành `.env` và điền: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (Project Settings → API → *service_role*),
   `CLOUDINARY_*`, `JWT_SECRET` (chuỗi ngẫu nhiên dài), `APP_URL`. SMTP điền nếu muốn nhận email khi có liên hệ.
3. Cài và kiểm tra kết nối:

```bash
npm install
npm run check:db
```

4. Tạo tài khoản quản trị đầu tiên rồi chạy:

```bash
npm run create:admin -- admin@bookingkols.com.vn "Tên Admin" "mat-khau-manh"
npm run dev
```

Mở `http://localhost:3000` (website) và `http://localhost:3000/admin` (quản trị).

## Chuyển dữ liệu từ hệ thống cũ

```bash
# Chép người dùng (giữ nguyên mật khẩu), bài viết, config SEO, liên hệ từ PostgreSQL cũ
OLD_DATABASE_URL="postgres://dev:MAT_KHAU@IP_SERVER_CU:5433/bookingkol" npm run import:old-db
```

Danh sách KOL ở trang chủ nay do admin quản lý tại **/admin/kol-management** (thêm, sửa, xoá, ẩn/hiện, sắp thứ tự; ảnh tải lên Cloudinary và tự cắt vừa khung thẻ), không còn gõ cứng trong mã.

Mật khẩu admin cũ (băm bcrypt của .NET) dùng được nguyên trên hệ thống mới. Ảnh bài viết cũ dạng `images/ten-file.png`
nằm trên server cũ: đặt `LEGACY_IMAGE_BASE_URL=https://bookingkols.com.vn` để chúng vẫn hiện (chỉ cần khi database cũ có bài viết).

## Kiểm thử

```bash
npm run typecheck     # kiểm tra kiểu TypeScript
npm run smoke         # kiểm thử đầu-cuối trên website đang chạy (39 kiểm tra), cần SMOKE_EMAIL/SMOKE_PASSWORD
```

`BOOKINGKOLS_FAKE_DB=1` bật database giả trong bộ nhớ **chỉ để kiểm thử cục bộ** (không cần Supabase). Biến này bị chặn
hoàn toàn khi chạy `NODE_ENV=production`; đừng đặt nó trong `.env` thật.

## Đóng gói và chạy thật

```bash
npm run build:deploy   # tạo deploy/bookingkols.zip (khoảng 21 MB, chạy bằng "node server.js")
```

Hướng dẫn đưa lên hosting Vietnix (cPanel → Setup Node.js App): xem `DEPLOY-VIETNIX.md`.

## Khác biệt so với hệ thống cũ

- Một ứng dụng duy nhất, không Docker, không backend riêng; website, quản trị và API cùng một tiến trình Node.
- Phiên đăng nhập quản trị là cookie `httpOnly` (12 giờ); đổi mật khẩu sẽ vô hiệu mọi phiên cũ. Không còn refresh token.
- Đăng nhập sai quá 8 lần/15 phút (theo IP + email) bị tạm khoá (đếm trong bộ nhớ của tiến trình).
- Email thông báo liên hệ gửi ngay khi khách gửi form (thay cho tác vụ nền Quartz); lỗi email không làm mất liên hệ.
- Danh sách tin tức phân trang bằng liên kết `?page=N` (Google đọc được các trang sau).
- Nội dung bài viết được làm sạch (loại script, thuộc tính nguy hiểm) khi lưu và khi hiển thị; video chỉ nhúng được từ YouTube, Vimeo, TikTok, Facebook.
- Sửa lỗi nhỏ của bản cũ: nút "Bắt đầu" ở trang Giới thiệu trỏ tới `/contact` (trước đây trỏ tới `/login` không tồn tại);
  hai chữ "охват" (tiếng Nga, gõ nhầm) ở trang Dịch vụ đổi thành "độ phủ".
