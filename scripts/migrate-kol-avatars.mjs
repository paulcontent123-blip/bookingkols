// Ảnh đại diện KOL ở trang chủ hiện nằm trên server cũ (https://bookingkols.com.vn/images/...).
// Script này tải các ảnh đó, đưa lên Cloudinary (thư mục bookingkol/images/kol) và sửa địa chỉ trong lib/home-data.ts,
// để sau khi tắt server cũ trang chủ vẫn đủ ảnh.
// Chạy 1 lần: npm run migrate:avatars  (cần CLOUDINARY_* trong .env; chạy trước khi tắt server cũ!)
import fs from 'node:fs';
import { v2 as cloudinary } from 'cloudinary';

const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
if (!cloud || !key || !secret) {
  console.error('Thiếu CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET trong .env');
  process.exit(1);
}
cloudinary.config({ cloud_name: cloud, api_key: key, api_secret: secret, secure: true });

const file = 'lib/home-data.ts';
let source = fs.readFileSync(file, 'utf8');
const urls = [...new Set([...source.matchAll(/'(https:\/\/bookingkols\.com\.vn\/images\/[^']+)'/g)].map((m) => m[1]))];
console.log(`Tìm thấy ${urls.length} ảnh cần chuyển.`);

const safe = (value) =>
  value
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

let failed = 0;
for (const url of urls) {
  try {
    const res = await fetch(encodeURI(decodeURI(url)));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const bytes = Buffer.from(await res.arrayBuffer());
    const name = safe(decodeURI(url.split('/').pop()).replace(/\.[^.]+$/, '')) || 'kol';
    const publicId = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ public_id: `bookingkol/images/kol/${name}`, overwrite: true, resource_type: 'image' }, (e, r) => (e || !r ? reject(e ?? new Error('không có kết quả')) : resolve(r.public_id)))
        .end(bytes);
    });
    const hosted = `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,c_limit,w_800/${publicId}`;
    source = source.split(url).join(hosted);
    console.log(`  OK   ${url.split('/').pop()}  ->  ${publicId}`);
  } catch (error) {
    failed++;
    console.log(`  LỖI  ${url}: ${error.message}`);
  }
}

fs.writeFileSync(file, source);
console.log(failed ? `\nXong, còn ${failed} ảnh lỗi (giữ nguyên địa chỉ cũ).` : '\nXong. Hãy build lại website để áp dụng.');
