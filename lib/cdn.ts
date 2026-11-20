import { CDN_ASSETS, CDN_CLOUD_NAME } from './cdn-assets.manifest';

// Dùng được cả ở máy chủ lẫn trình duyệt (không import 'server-only').
const BASE_URL = `https://res.cloudinary.com/${CDN_CLOUD_NAME}/image/upload`;

/**
 * Ảnh bitmap (png, jpg...): f_auto chọn định dạng nhẹ nhất, q_auto chọn chất lượng nén hợp lý,
 * c_limit,w_1920 không phục vụ ảnh rộng quá 1920px. SVG là ảnh vector nên giữ nguyên.
 */
const RASTER_TRANSFORMATION = 'f_auto,q_auto,c_limit,w_1920';

/** SVG nặng (bitmap nhúng trong SVG) được dựng thành WebP rộng 1200px, nhẹ hơn khoảng 30 lần. */
const HEAVY_SVG_TRANSFORMATION = 'f_auto,q_auto,w_1200';

function lookup(path: string) {
  let key = path.replace(/^\//, '');
  try {
    key = decodeURI(key);
  } catch {
    // giữ nguyên để tra cứu
  }
  return CDN_ASSETS[key];
}

/**
 * Đổi đường dẫn ảnh giao diện (ví dụ `assets/images/home-page/lodigital.png`) thành địa chỉ Cloudinary.
 * Ảnh chưa có trong danh sách thì trả lại đúng đường dẫn đã truyền vào.
 */
export function cdnImage(path: string): string {
  if (!path) return path;
  const asset = lookup(path);
  if (!asset) return path;
  const publicId = asset.id.split('/').map(encodeURIComponent).join('/');
  if (asset.format === 'svg') {
    return asset.raster ? `${BASE_URL}/${HEAVY_SVG_TRANSFORMATION}/${publicId}` : `${BASE_URL}/${publicId}.svg`;
  }
  return `${BASE_URL}/${RASTER_TRANSFORMATION}/${publicId}`;
}

/** Ảnh cho thẻ og:image: giữ đúng định dạng gốc (có đuôi file), rộng 1200px. */
export function cdnShareImage(path: string): string {
  const url = cdnImage(path);
  const asset = lookup(path);
  if (!asset || asset.format === 'svg') return url;
  const publicId = asset.id.split('/').map(encodeURIComponent).join('/');
  return `${BASE_URL}/q_auto,c_limit,w_1200/${publicId}.${asset.format}`;
}
