import 'server-only';
import { v2 as cloudinary } from 'cloudinary';
import { config, hasCloudinary } from './config';
import { removeDiacritics } from './slug';

if (hasCloudinary) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true
  });
}

const FOLDER = config.cloudinary.folder;
// Ảnh hiển thị: tự chọn định dạng/chất lượng nhẹ nhất, không phục vụ ảnh rộng quá 1600px.
const DELIVERY_TRANSFORMATION = 'f_auto,q_auto,c_limit,w_1600';
// Ảnh upload từ website cũ (dạng "images/ten-file.png") vẫn được phục vụ từ địa chỉ này nếu có cấu hình.
const LEGACY_BASE_URL = (process.env.LEGACY_IMAGE_BASE_URL || '').replace(/\/+$/, '');

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/svg+xml': 'svg'
};
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB (giới hạn ảnh của Cloudinary gói Free)

/** Cloudinary từ chối một số ký tự đặc biệt: đổi về chữ không dấu, chỉ giữ chữ, số, "-", "_" và "/". */
export function sanitizePublicId(value: string): string {
  const withoutMarks = removeDiacritics(value || '');
  const safe = withoutMarks.replace(/[^A-Za-z0-9_\-/]+/g, '-').replace(/-{2,}/g, '-').replace(/^-+|-+$/g, '');
  return safe || crypto.randomUUID();
}

function buildPublicId(fileName: string): string {
  let name = (fileName || '').trim().replace(/^\/+|\/+$/g, '');
  if (name.toLowerCase().startsWith(`${FOLDER.toLowerCase()}/`)) name = name.slice(FOLDER.length + 1);
  return sanitizePublicId(name);
}

/** Tải ảnh lên Cloudinary, trả về public id (đây là giá trị lưu vào database). */
export async function uploadImageBytes(bytes: Buffer, fileName: string): Promise<string> {
  if (!hasCloudinary) throw new Error('Chưa cấu hình Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET).');
  const baseName = (fileName || 'image').replace(/\.[^.]+$/, '');
  const publicId = buildPublicId(`${crypto.randomUUID()}-${baseName}`);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        asset_folder: FOLDER,
        public_id_prefix: FOLDER,
        overwrite: false,
        use_filename: false,
        unique_filename: false,
        resource_type: 'image'
      } as never,
      (error, result) => {
        if (error || !result) reject(new Error(error?.message || 'Tải ảnh lên Cloudinary thất bại.'));
        else resolve(result.public_id);
      }
    );
    stream.end(bytes);
  });
}

/** Đổi giá trị lưu trong database (public id hoặc địa chỉ ảnh) thành địa chỉ hiển thị. */
export function imageUrl(filePath: string | null | undefined): string {
  if (!filePath) return '';
  const value = filePath.trim();
  if (/^https?:\/\//i.test(value) || value.startsWith('data:')) return value;
  const normalized = value.replace(/\\/g, '/').replace(/^\/+/, '');
  if (LEGACY_BASE_URL && /^images\//i.test(normalized) && !normalized.toLowerCase().startsWith(`${FOLDER.toLowerCase()}/`)) {
    return `${LEGACY_BASE_URL}/${normalized}`;
  }
  if (!config.cloudinary.cloudName) return normalized;
  const encoded = normalized.split('/').map(encodeURIComponent).join('/');
  return `https://res.cloudinary.com/${config.cloudinary.cloudName}/image/upload/${DELIVERY_TRANSFORMATION}/${encoded}`;
}

/** Lấy public id từ địa chỉ Cloudinary hoặc đường dẫn lưu trong bài. Trả về null nếu không phải ảnh của mình. */
export function extractPublicId(filePath: string): string | null {
  const value = (filePath || '').trim();
  if (!value) return null;
  if (!/^https?:\/\//i.test(value)) return value.replace(/^\/+|\/+$/g, '');
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!url.hostname.includes('cloudinary.com')) return null;
  if (!url.pathname.toLowerCase().includes(`/${config.cloudinary.cloudName.toLowerCase()}/`)) return null;
  const marker = '/upload/';
  const index = url.pathname.toLowerCase().indexOf(marker);
  if (index < 0) return null;
  let segments = url.pathname
    .slice(index + marker.length)
    .split('/')
    .filter(Boolean)
    .map((s) => decodeURIComponent(s));
  // Bỏ đoạn biến đổi (f_auto,q_auto...) và đoạn phiên bản (v1234) ở đầu địa chỉ.
  while (segments.length > 0 && (/^v\d+$/.test(segments[0]) || /^([a-z]{1,3}_[^/]*)(,[a-z]{1,3}_[^/]*)*$/i.test(segments[0]))) {
    segments = segments.slice(1);
  }
  if (segments.length === 0) return null;
  let publicId = segments.join('/');
  const dot = publicId.lastIndexOf('.');
  if (dot > publicId.lastIndexOf('/')) publicId = publicId.slice(0, dot);
  return publicId;
}

/**
 * Xoá ảnh trên Cloudinary. Chỉ xoá ảnh nằm trong thư mục upload của dự án (ví dụ "bookingkol/images/"):
 * tài khoản Cloudinary còn chứa ảnh giao diện (site-assets), tuyệt đối không xoá ảnh ở thư mục khác.
 */
export async function deleteImage(filePath: string): Promise<void> {
  if (!hasCloudinary) return;
  const publicId = extractPublicId(filePath);
  if (!publicId) return;
  if (!publicId.toLowerCase().startsWith(`${FOLDER.toLowerCase()}/`)) return;
  await cloudinary.uploader.destroy(publicId, { invalidate: true, resource_type: 'image' });
}
