import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, imageUrl, uploadImageBytes } from '@/lib/cloudinary';
import { ApiError, fail, ok } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/** Tải ảnh lên Cloudinary. Trả về { path (mã ảnh lưu vào database), url (địa chỉ hiển thị) }. */
export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const form = await req.formData();
    const file = form.get('file');
    if (!(file instanceof File)) throw new ApiError(400, 'Chưa chọn file', 'file');
    if (file.size === 0) throw new ApiError(400, 'File rỗng', 'file');
    if (file.size > MAX_IMAGE_BYTES) throw new ApiError(400, 'File quá lớn, tối đa 10 MB', 'file');
    if (!ALLOWED_IMAGE_TYPES[file.type]) throw new ApiError(400, 'Chỉ cho phép ảnh png, jpg, jpeg, gif, webp, svg', 'file');
    const path = await uploadImageBytes(Buffer.from(await file.arrayBuffer()), file.name);
    return ok({ path, url: imageUrl(path) }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
