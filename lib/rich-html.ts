import 'server-only';
import { cleanHtml } from './sanitize';
import { deleteImage, imageUrl, uploadImageBytes } from './cloudinary';

const IMG_SRC = /(<img\b[^>]*?\bsrc=")([^"]+)(")/gi;

/** Ảnh trong bài lưu dạng mã Cloudinary: đổi thành địa chỉ hiển thị khi gửi cho người đọc. */
export function normalizePublicImageUrls(html: string): string {
  if (!html) return html;
  return html.replace(IMG_SRC, (_m, prefix: string, src: string, suffix: string) => `${prefix}${imageUrl(src)}${suffix}`);
}

/**
 * Chuẩn bị nội dung bài trước khi lưu: ảnh dán thẳng vào trình soạn thảo (data:image/...;base64)
 * được tải lên Cloudinary và thay bằng mã ảnh; sau đó làm sạch HTML.
 */
export async function prepareContentForSave(html: string, title: string): Promise<string> {
  let result = html || '';
  const pattern = /<img\b[^>]*?\bsrc="data:image\/([^;"]+);base64,([^"]+)"[^>]*>/gi;
  const matches = [...result.matchAll(pattern)];
  for (const match of matches) {
    const bytes = Buffer.from(match[2], 'base64');
    const publicId = await uploadImageBytes(bytes, title || 'image');
    result = result.replace(match[0], `<img src="${publicId}">`);
  }
  return cleanHtml(result);
}

/** Danh sách ảnh (ảnh đại diện + ảnh trong nội dung) của một bài, dùng để dọn Cloudinary khi xoá bài. */
export function collectImagePaths(thumbnail: string, content: string): string[] {
  const paths = new Set<string>();
  if (thumbnail?.trim()) paths.add(thumbnail.trim());
  for (const match of (content || '').matchAll(/<img\b[^>]*?\bsrc="([^"]+)"/gi)) {
    if (match[1]?.trim()) paths.add(match[1].trim());
  }
  return [...paths];
}

/** Xoá ảnh trên Cloudinary; lỗi từng ảnh chỉ ghi log, không làm hỏng thao tác xoá bài. */
export async function deleteImages(paths: string[]): Promise<void> {
  for (const path of paths) {
    try {
      await deleteImage(path);
    } catch (error) {
      console.warn('[cloudinary] Không xoá được ảnh', path, error);
    }
  }
}
