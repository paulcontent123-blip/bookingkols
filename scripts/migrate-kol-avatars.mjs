// Ảnh đại diện KOL ở trang chủ vốn nằm trên server cũ (https://bookingkols.com.vn/images/...).
// Server cũ đã tắt, nên script lấy ảnh theo thứ tự: server cũ (nếu còn sống) -> bản lưu Wayback Machine,
// rồi đưa lên Cloudinary (thư mục bookingkol/images/kol) và sửa địa chỉ trong lib/home-data.ts.
// Chạy: npm run migrate:avatars   (cần CLOUDINARY_* trong .env)
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

const nap = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safe = (value) =>
  value
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9_-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');

/** Tải ảnh, trả về Buffer. Ném lỗi nếu nội dung không phải ảnh. */
async function tai(url, timeoutMs) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs), redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const type = res.headers.get('content-type') ?? '';
  if (!type.startsWith('image/')) throw new Error(`không phải ảnh (${type})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.length < 1024) throw new Error(`ảnh rỗng (${bytes.length} byte)`);
  return bytes;
}

/** Lấy ảnh từ bản lưu Wayback. Gặp 429 thì chờ rồi thử lại (tối đa 5 lượt). */
async function taiTuWayback(url) {
  const hoi = await fetch(`https://archive.org/wayback/available?url=${encodeURIComponent(url.replace(/^https?:\/\//, ''))}`, {
    signal: AbortSignal.timeout(30_000)
  });
  const ban = (await hoi.json())?.archived_snapshots?.closest;
  if (!ban?.available) throw new Error('Wayback không có bản lưu');
  // Hậu tố "if_" lấy đúng file gốc, không kèm thanh điều hướng của Wayback.
  const moc = `https://web.archive.org/web/${ban.timestamp}if_/${encodeURI(decodeURI(url))}`;
  let loiCuoi;
  for (let luot = 1; luot <= 5; luot++) {
    try {
      return await tai(moc, 90_000);
    } catch (error) {
      loiCuoi = error;
      if (!String(error.message).includes('429')) throw error;
      const cho = luot * 20_000;
      console.log(`       Wayback đang giới hạn tốc độ, chờ ${cho / 1000}s rồi thử lại (lượt ${luot}/5)...`);
      await nap(cho);
    }
  }
  throw loiCuoi;
}

let failed = 0;
for (const url of urls) {
  const ten = decodeURI(url.split('/').pop());
  let bytes;
  let nguon = 'server cũ';
  try {
    bytes = await tai(encodeURI(decodeURI(url)), 15_000);
  } catch {
    try {
      bytes = await taiTuWayback(url);
      nguon = 'Wayback';
    } catch (error) {
      failed++;
      console.log(`  LỖI  ${ten}: ${error.message}`);
      continue;
    }
  }

  try {
    const publicId = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { public_id: `bookingkol/images/kol/${safe(ten.replace(/\.[^.]+$/, '')) || 'kol'}`, overwrite: true, resource_type: 'image' },
          (e, r) => (e || !r ? reject(e ?? new Error('không có kết quả')) : resolve(r.public_id))
        )
        .end(bytes);
    });
    const hosted = `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,c_limit,w_800/${publicId}`;
    source = source.split(url).join(hosted);
    console.log(`  OK   ${ten}  (${nguon}, ${(bytes.length / 1024).toFixed(0)} KB)  ->  ${publicId}`);
  } catch (error) {
    failed++;
    console.log(`  LỖI  ${ten}: tải lên Cloudinary hỏng - ${error.message}`);
  }
}

fs.writeFileSync(file, source);
console.log(failed ? `\nXong, còn ${failed} ảnh lỗi (giữ nguyên địa chỉ cũ).` : '\nXong. Hãy build lại website để áp dụng.');
