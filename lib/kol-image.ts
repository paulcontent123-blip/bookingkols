import { CDN_CLOUD_NAME } from './cdn-assets.manifest';

// Khung ảnh trên thẻ KOL ở trang chủ (components/home/kol-profile-card.module.scss) có tỉ lệ khoảng 11:12 (hơi dọc).
// Mọi ảnh KOL đều được Cloudinary tự cắt theo tỉ lệ này, nên ảnh tải lên ở kích thước nào cũng vừa khung.
export const KOL_IMAGE_RATIO = '11:12';
export const KOL_IMAGE_WIDTH = 800;
export const KOL_IMAGE_HEIGHT = 873; // 800 x 12 / 11
/** Dưới cỡ này ảnh sẽ bị phóng to và mờ trên thẻ. */
export const KOL_IMAGE_MIN_WIDTH = 600;

// c_fill + g_auto: cắt vừa tỉ lệ, Cloudinary tự giữ lại khuôn mặt/chủ thể chính; f_auto,q_auto: nhẹ nhất có thể.
const TRANSFORMATION = `f_auto,q_auto,c_fill,g_auto,ar_${KOL_IMAGE_RATIO},w_${KOL_IMAGE_WIDTH}`;
const BASE = `https://res.cloudinary.com/${CDN_CLOUD_NAME}/image/upload`;

/** Bỏ đoạn biến đổi (f_auto,w_800...), đoạn phiên bản (v123) và đuôi file khỏi địa chỉ Cloudinary, chỉ giữ mã ảnh. */
function publicIdFromCloudinaryUrl(url: string): string | null {
  const marker = `res.cloudinary.com/${CDN_CLOUD_NAME}/image/upload/`;
  const at = url.indexOf(marker);
  if (at < 0) return null;
  let segments = url
    .slice(at + marker.length)
    .split(/[?#]/)[0]
    .split('/')
    .filter(Boolean)
    .map((s) => decodeURIComponent(s));
  while (segments.length > 1 && (/^v\d+$/.test(segments[0]) || /^[a-z]{1,3}_[^/]*$/i.test(segments[0]))) segments = segments.slice(1);
  let id = segments.join('/');
  const dot = id.lastIndexOf('.');
  if (dot > id.lastIndexOf('/')) id = id.slice(0, dot);
  return id || null;
}

/**
 * Địa chỉ ảnh KOL đã cắt vừa khung thẻ. Nhận mã ảnh Cloudinary hoặc địa chỉ Cloudinary đầy đủ;
 * ảnh ở nơi khác (ví dụ server cũ) được giữ nguyên vì không cắt được.
 */
export function kolCardImage(value: string | null | undefined): string {
  const v = (value ?? '').trim();
  if (!v) return '';
  let id: string | null;
  if (/^https?:\/\//i.test(v)) id = publicIdFromCloudinaryUrl(v);
  else if (v.startsWith('data:')) return v;
  else id = v.replace(/\\/g, '/').replace(/^\/+/, '');
  if (!id) return v;
  return `${BASE}/${TRANSFORMATION}/${id.split('/').map(encodeURIComponent).join('/')}`;
}
