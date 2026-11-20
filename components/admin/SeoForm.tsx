'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminFetch, ApiClientError } from '@/lib/admin-client';
import { useToast } from '@/components/ui/Toast';
import s from './admin.module.scss';

/** Thêm / sửa cấu hình SEO của một trang: đoạn HTML chỉ gồm các thẻ <meta>. */
export function SeoForm({ id }: { id?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [url, setUrl] = useState('');
  const [html, setHtml] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(id));

  useEffect(() => {
    if (!id) return;
    adminFetch<{ url: string; htmlContent: string }>(`/api/admin/seo-html-contents/${id}`)
      .then((item) => {
        setUrl(item.url);
        setHtml(item.htmlContent);
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải được cấu hình'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function submit() {
    if (!html.trim()) {
      setErrors({ htmlContent: 'Vui lòng nhập nội dung HTML Meta' });
      return;
    }
    setErrors({});
    setBusy(true);
    try {
      const body = { url, htmlContent: html };
      if (id) await adminFetch(`/api/admin/seo-html-contents/${id}`, { method: 'PUT', json: body });
      else await adminFetch('/api/admin/seo-html-contents', { method: 'POST', json: body });
      toast.success('Đã lưu cấu hình SEO');
      router.push('/admin/seo-config-management');
      router.refresh();
    } catch (e) {
      if (e instanceof ApiClientError && e.field) setErrors({ [e.field]: e.message });
      else toast.error(e instanceof Error ? e.message : 'Không lưu được');
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className={s.empty}>Đang tải...</div>;
  return (
    <div className={s['form-page']}>
      <div className={s.field}>
        <label>Url đề:</label>
        <div className={s.addon}>
          <span>https://bookingkols.com.vn/</span>
          <input className={`${s.input} ${errors.url ? s.invalid : ''}`} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Nhập đường dẫn (để trống = trang chủ)" />
        </div>
        {errors.url && <div className={s.error}>{errors.url}</div>}
      </div>
      <div className={s.field}>
        <label data-required>HTML Meta Tag:</label>
        <textarea className={`${s.textarea} ${errors.htmlContent ? s.invalid : ''}`} rows={18} value={html} onChange={(e) => setHtml(e.target.value)} placeholder="Nhập nội dung HTML Meta" />
        {errors.htmlContent && <div className={s.error}>{errors.htmlContent}</div>}
        <div className={s.hint}>Chỉ gồm các thẻ meta, ví dụ: &lt;meta name=&quot;description&quot; content=&quot;...&quot;&gt;</div>
      </div>
      <div className={s['form-actions']}>
        <Link href="/admin/seo-config-management" className={s.btn}>
          Hủy
        </Link>
        <button type="button" className={`${s.btn} ${s.primary}`} onClick={submit} disabled={busy}>
          Xác nhận
        </button>
      </div>
    </div>
  );
}
