# Deploy BookingKols lên Vietnix (cPanel, Setup Node.js App)

Cách làm giống dự án `nothue`: gói `deploy/bookingkols.zip` chạy độc lập bằng Node.js (CloudLinux/Passenger), database Supabase.
**Giữ nguyên website cũ chạy trên Mắt Bão cho tới khi bản mới được kiểm tra xong**, rồi mới đổi tên miền (bước 6).

## 0. Chuẩn bị (một lần)

- Hosting Vietnix có **Setup Node.js App** (cPanel → Software). Chọn Node.js **20.x hoặc 22.x**. Nếu không thấy mục này, nhờ Vietnix bật Node.js Selector.
- Supabase đã chạy migration `supabase/migrations/20261125000100_bookingkols_schema.sql` (`npm run db:migrate`; các bảng đều có tiền tố `bk_` nên dùng chung database được) và `npm run check:db` báo ổn.
- Dữ liệu cũ đã chép sang bằng `npm run import:old-db`; ảnh KOL nay quản lý trong admin (/admin/kol-management).
- Hosting dùng chung có giới hạn RAM/CPU theo gói: sau khi chạy, xem **cPanel → Resource Usage**; bookingkols cần khoảng 150–300 MB RAM.

## 1. Đóng gói trên máy

```bash
npm install
npm run build:deploy
```

Kết quả: `deploy/bookingkols.zip` (khoảng 21 MB). Gói **không** chứa `.env` (khoá bí mật).

## 2. Tạo file `.env` cho hosting

Sao chép nội dung `.env.example`, điền thật và **xoá dòng `PORT=...`** (Passenger tự cấp cổng):

```
NODE_ENV=production
APP_URL=https://bookingkols.com.vn
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
CLOUDINARY_CLOUD_NAME=...   CLOUDINARY_API_KEY=...   CLOUDINARY_API_SECRET=...   CLOUDINARY_FOLDER=bookingkol/images
JWT_SECRET=<chuỗi ngẫu nhiên dài, tạo mới>
SMTP_HOST=... SMTP_PORT=587 SMTP_USER=... SMTP_PASSWORD=... MAIL_FROM=... CONTACT_RECEIVER=...
GTM_ID=GTM-KP2KXTQB
GOOGLE_SITE_VERIFICATION=9qDCBzEZ36xZWpacyClnjvGMmqYnMK36Fa6mzAKlMb8
```

Không đặt `BOOKINGKOLS_FAKE_DB`. Đổi `JWT_SECRET` thì mọi phiên đăng nhập quản trị hiện có hết hiệu lực (bình thường).

## 3. Tải lên và tạo ứng dụng

1. cPanel → **File Manager** → thư mục gốc tài khoản → tạo thư mục `bookingkols-next`.
2. Vào thư mục đó → **Upload** `bookingkols.zip` → chuột phải → **Extract** → xoá file zip. Bật *Show Hidden Files* để thấy thư mục `.next`.
3. Đổi tên thư mục `node_modules` thành `_node_modules` (CloudLinux Node.js Selector không cho tạo ứng dụng khi đã có `node_modules` thật).
4. Tạo file `.env` trong `bookingkols-next` (nội dung ở bước 2), quyền `600`.
5. cPanel → **Setup Node.js App** → **Create Application**:

| Trường | Giá trị |
|---|---|
| Node.js version | 20.x hoặc 22.x (bản cao nhất có) |
| Application mode | Production |
| Application root | `bookingkols-next` |
| Application URL | tên miền dùng thử (xem bước 4) |
| Application startup file | `server.js` |

6. Bấm **Create**. **Không** bấm *Run NPM Install*. Sau khi tạo, mở `_node_modules` → *Select All* → *Move* vào `node_modules` (thư mục liên kết CloudLinux vừa tạo), xoá `_node_modules`, rồi **Restart** ứng dụng.

## 4. Kiểm tra trên tên miền thử

Dùng một tên miền phụ (ví dụ `moi.bookingkols.com.vn`) trỏ vào ứng dụng, đặt `APP_URL` khớp tên miền đó khi thử. Kiểm tra:

- Trang chủ, giới thiệu, dịch vụ, chiến dịch, tin tức, liên hệ, 3 trang chính sách: ảnh đủ, menu có chữ, đổi ngôn ngữ vi/en.
- `/sitemap.xml`, `/robots.txt` mở được.
- `/admin` → đăng nhập → có 4 mục menu; thử thêm một bài **có ảnh** (ảnh phải lên Cloudinary, thư mục `bookingkol/images`), xuất bản, xem ở `/news`.
- Gửi form liên hệ (ghi "test" trong nội dung, báo người nhận email): liên hệ hiện ở **Quản lý Liên hệ**.
- GA: Analytics → Thời gian thực thấy lượt truy cập; Search Console vẫn xác minh (thẻ meta + DNS TXT).

Có thể chạy kiểm thử tự động ở máy: `SMOKE_BASE_URL=https://moi.bookingkols.com.vn SMOKE_EMAIL=... SMOKE_PASSWORD=... npm run smoke`
(sẽ tạo rồi xoá một bài và một liên hệ thử; nếu đã cấu hình SMTP thì có 1 email thật gửi đi).

## 5. Lỗi thường gặp

- "Something went wrong / Incomplete response": xem `/home/<user>/logs/<ứng dụng>.log` và `stderr.log` trong thư mục ứng dụng. Thường do thiếu/sai `.env`, chưa chuyển `_node_modules` vào `node_modules`, hoặc chọn Node thấp hơn 18.18.
- Trang quản trị đăng nhập được nhưng bị đẩy ra ngay: `JWT_SECRET` chưa đặt hoặc dưới 16 ký tự.
- Ảnh tải lên báo lỗi: kiểm tra `CLOUDINARY_*` và dung lượng ảnh (tối đa 10 MB).
- Supabase gói miễn phí tự **tạm dừng sau 1 tuần không có hoạt động** và không có bản sao lưu tự động: dùng gói Pro, hoặc tự chạy sao lưu định kỳ.

## 6. Chuyển tên miền chính thức (khi đã ổn)

1. Giảm TTL bản ghi DNS của `bookingkols.com.vn` xuống thấp (300 giây) **một ngày trước**.
2. Đặt `APP_URL=https://bookingkols.com.vn`, **Restart** ứng dụng, đổi Application URL sang tên miền chính.
3. Trỏ DNS (bản ghi A / CNAME) về Vietnix; bật *Force HTTPS Redirect*. Giữ nguyên bản ghi TXT xác minh Google.
4. Theo dõi vài ngày. **Giữ nguyên server Mắt Bão** (dừng container thay vì xoá) để quay lại nhanh nếu cần.
5. Search Console: gửi `https://bookingkols.com.vn/sitemap.xml`; các sitemap cũ (`sitemap_index.xml`, `sitemap-kol.xml`, `sitemap-news-content.xml`) được tự chuyển hướng về sitemap mới.

## Cập nhật phiên bản mới

1. Máy: `npm run build:deploy`.
2. Server: **Stop** ứng dụng → trong thư mục ứng dụng xoá `.next`, `public`, `server.js`, `package.json` (giữ `.env`, `node_modules`) → Upload + Extract zip mới.
   Gói mới có `node_modules`: mở nó, *Select All → Move* vào `node_modules` (chọn ghi đè), xoá thư mục thừa → **Start/Restart**.

## Quay lại bản cũ

Trỏ DNS về lại IP Mắt Bão (container `frontend`, `bookingkol-portal`, `backend` vẫn còn) — mất vài phút theo TTL.
