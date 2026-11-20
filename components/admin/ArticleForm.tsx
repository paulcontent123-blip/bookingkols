'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { adminFetch, ApiClientError } from '@/lib/admin-client';
import { normalizeSlug } from '@/lib/slug';
import { useToast } from '@/components/ui/Toast';
import { ARTICLE_STATUS_OPTIONS, ARTICLE_TYPE_OPTIONS } from './ArticlesAdmin';
import { RichEditor } from './RichEditor';
import s from './admin.module.scss';

interface ArticleData {
  title: string;
  slug: string;
  type: string;
  status: string;
  description: string;
  content: string;
  thumbnailPath: string;
  thumbnail: string;
}

const EMPTY: ArticleData = { title: '', slug: '', type: '', status: 'draft', description: '', content: '', thumbnailPath: '', thumbnail: '' };

/** Thêm / sửa bài viết. Có `slug` là chế độ sửa (đường dẫn bị khoá để không mất liên kết của bài đã đăng). */
export function ArticleForm({ slug }: { slug?: string }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(slug);
  const [data, setData] = useState<ArticleData>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(false);

  useEffect(() => {
    if (!slug) return;
    adminFetch<ArticleData>(`/api/admin/articles/${encodeURIComponent(slug)}`)
      .then((article) => setData(article))
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải được bài viết'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const set = <K extends keyof ArticleData>(key: K, value: ArticleData[K]) => setData((d) => ({ ...d, [key]: value }));

  // Tạo mới: đường dẫn tự lấy từ tiêu đề cho tới khi người dùng sửa tay.
  function onTitle(title: string) {
    setData((d) => ({ ...d, title, slug: isEdit || slugTouched.current ? d.slug : normalizeSlug('', title) }));
  }

  async function uploadThumbnail(file: File) {
    setUploading(true);
    try {
      const form = new FormData();
      form.set('file', file);
      const result = await adminFetch<{ path: string; url: string }>('/api/admin/files', { method: 'POST', body: form });
      setData((d) => ({ ...d, thumbnailPath: result.path, thumbnail: result.url }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được ảnh');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    const found: Record<string, string> = {};
    if (!data.thumbnailPath) found.thumbnail = 'Vui lòng chọn ảnh đại diện';
    if (!data.title.trim()) found.title = 'Tiêu đề không được để trống';
    if (!data.slug.trim()) found.slug = 'Đường dẫn không được để trống';
    if (!data.type) found.type = 'Vui lòng chọn loại bài viết';
    if (!data.description.trim()) found.description = 'Mô tả không được để trống';
    if (!data.content.replace(/<[^>]*>/g, '').trim() && !/<img\b/i.test(data.content)) found.content = 'Nội dung không được để trống';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      const body = { title: data.title, slug: data.slug, type: data.type, status: data.status, description: data.description, content: data.content, thumbnail: data.thumbnailPath };
      if (isEdit) await adminFetch(`/api/admin/articles/${encodeURIComponent(slug!)}`, { method: 'PUT', json: body });
      else await adminFetch('/api/admin/articles', { method: 'POST', json: body });
      toast.success(isEdit ? 'Cập nhật bài viết thành công' : 'Tạo bài viết thành công');
      router.push('/admin/news-management');
      router.refresh();
    } catch (e) {
      if (e instanceof ApiClientError && e.field) setErrors({ [e.field === 'article_type' ? 'type' : e.field === 'article_status' ? 'status' : e.field]: e.message });
      else toast.error(e instanceof Error ? e.message : 'Không lưu được bài viết');
    } finally {
      setBusy(false);
    }
  }

  const err = (key: string) => (errors[key] ? <div className={s.error}>{errors[key]}</div> : null);
  if (loading) return <div className={s.empty}>Đang tải...</div>;

  return (
    <div className={s['form-page']}>
      <div className={s.field}>
        <input
          ref={fileRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = '';
            if (file) void uploadThumbnail(file);
          }}
        />
        <label data-required>Ảnh đại diện</label>
        <div className={s['thumb-upload']} onClick={() => fileRef.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}>
          {data.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.thumbnail} alt="preview" />
          ) : (
            <span>{uploading ? 'Đang tải...' : 'Upload'}</span>
          )}
        </div>
        {err('thumbnail')}
      </div>

      <div className={s.field}>
        <label data-required>Tiêu đề:</label>
        <input className={`${s.input} ${errors.title ? s.invalid : ''}`} value={data.title} onChange={(e) => onTitle(e.target.value)} placeholder="Nhập tiêu đề" />
        {err('title')}
      </div>

      <div className={s.field}>
        <label data-required>Đường dẫn:</label>
        <input
          className={`${s.input} ${errors.slug ? s.invalid : ''}`}
          value={data.slug}
          onChange={(e) => {
            slugTouched.current = true;
            set('slug', e.target.value);
          }}
          readOnly={isEdit}
          title={isEdit ? 'Không đổi đường dẫn của bài đã đăng để tránh mất liên kết' : ''}
          placeholder="Nhập đường dẫn"
        />
        {err('slug')}
      </div>

      <div className={s.field}>
        <label data-required>Loại bài viết:</label>
        <select className={`${s.select} ${errors.type ? s.invalid : ''}`} value={data.type} onChange={(e) => set('type', e.target.value)}>
          <option value="">Chọn loại bài viết</option>
          {ARTICLE_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {err('type')}
      </div>

      <div className={s.field}>
        <label data-required>Trạng thái:</label>
        <select className={s.select} value={data.status} onChange={(e) => set('status', e.target.value)}>
          {ARTICLE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {err('status')}
      </div>

      <div className={s.field}>
        <label data-required>Mô tả:</label>
        <textarea className={`${s.textarea} ${errors.description ? s.invalid : ''}`} rows={3} value={data.description} onChange={(e) => set('description', e.target.value)} placeholder="Nhập giới thiệu ngắn" />
        {err('description')}
      </div>

      <div className={s.field}>
        <label data-required>Nội dung:</label>
        <RichEditor value={data.content} onChange={(html) => set('content', html)} />
        {err('content')}
      </div>

      <div className={s['form-actions']}>
        <Link href="/admin/news-management" className={s.btn}>
          Hủy
        </Link>
        <button type="button" className={`${s.btn} ${s.primary}`} onClick={submit} disabled={busy || uploading}>
          Xác nhận
        </button>
      </div>
    </div>
  );
}
