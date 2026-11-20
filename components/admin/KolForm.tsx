'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { adminFetch, ApiClientError } from '@/lib/admin-client';
import { KOL_FIELDS, PROVINCE_SUGGESTIONS } from '@/lib/kol-fields';
import { KOL_IMAGE_HEIGHT, KOL_IMAGE_MIN_WIDTH, KOL_IMAGE_RATIO, KOL_IMAGE_WIDTH, kolCardImage } from '@/lib/kol-image';
import { normalizeSlug } from '@/lib/slug';
import { useToast } from '@/components/ui/Toast';
import s from './admin.module.scss';

interface KolData {
  name: string;
  nickname: string;
  slug: string;
  province: string;
  fields: string[];
  avatarPath: string;
  avatar: string;
  tiktokUrl: string;
  tiktokFollowers: string;
  facebookUrl: string;
  facebookFollowers: string;
  youtubeUrl: string;
  youtubeFollowers: string;
  instagramUrl: string;
  instagramFollowers: string;
  sortOrder: number;
  isPublished: boolean;
}

const EMPTY: KolData = {
  name: '',
  nickname: '',
  slug: '',
  province: '',
  fields: [],
  avatarPath: '',
  avatar: '',
  tiktokUrl: '',
  tiktokFollowers: '',
  facebookUrl: '',
  facebookFollowers: '',
  youtubeUrl: '',
  youtubeFollowers: '',
  instagramUrl: '',
  instagramFollowers: '',
  sortOrder: 0,
  isPublished: true
};

const PLATFORMS = [
  { label: 'TikTok', url: 'tiktokUrl', count: 'tiktokFollowers', placeholder: 'https://www.tiktok.com/@ten-kenh' },
  { label: 'Facebook', url: 'facebookUrl', count: 'facebookFollowers', placeholder: 'https://www.facebook.com/...' },
  { label: 'YouTube', url: 'youtubeUrl', count: 'youtubeFollowers', placeholder: 'https://www.youtube.com/@...' },
  { label: 'Instagram', url: 'instagramUrl', count: 'instagramFollowers', placeholder: 'https://www.instagram.com/...' }
] as const;

/** Thêm / sửa KOL hiển thị ở trang chủ. Ảnh đại diện tải lên Cloudinary, thông tin còn lại lưu vào database. */
export function KolForm({ id }: { id?: string }) {
  const router = useRouter();
  const toast = useToast();
  const isEdit = Boolean(id);
  const [data, setData] = useState<KolData>(EMPTY);
  const [loading, setLoading] = useState(isEdit);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageWarning, setImageWarning] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileRef = useRef<HTMLInputElement>(null);
  const slugTouched = useRef(false);

  useEffect(() => {
    if (!id) return;
    adminFetch<KolData>(`/api/admin/kols/${id}`)
      .then((kol) => {
        slugTouched.current = true;
        setData({ ...EMPTY, ...kol });
      })
      .catch((e) => toast.error(e instanceof Error ? e.message : 'Không tải được KOL'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const set = <K extends keyof KolData>(key: K, value: KolData[K]) => setData((d) => ({ ...d, [key]: value }));

  // Tạo mới: đường dẫn tự lấy từ tên cho tới khi người dùng sửa tay.
  function onName(name: string) {
    setData((d) => ({ ...d, name, slug: slugTouched.current ? d.slug : normalizeSlug('', name) }));
  }

  function toggleField(value: string) {
    setData((d) => ({ ...d, fields: d.fields.includes(value) ? d.fields.filter((f) => f !== value) : [...d.fields, value] }));
  }

  /** Cảnh báo (không chặn) khi ảnh quá nhỏ hoặc quá lệch tỉ lệ khung: ảnh vẫn lưu được, nhưng sẽ bị cắt nhiều hoặc bị mờ. */
  async function inspectImage(file: File) {
    setImageWarning('');
    try {
      const bitmap = await createImageBitmap(file);
      const { width, height } = bitmap;
      bitmap.close();
      const ratio = width / height;
      const target = 11 / 12;
      const notes: string[] = [];
      if (width < KOL_IMAGE_MIN_WIDTH) notes.push(`ảnh chỉ rộng ${width}px (nên từ ${KOL_IMAGE_MIN_WIDTH}px), sẽ bị mờ trên thẻ`);
      if (ratio > target * 1.35) notes.push(`ảnh quá ngang (${width}×${height}px), hai bên sẽ bị cắt nhiều`);
      else if (ratio < target / 1.35) notes.push(`ảnh quá dọc (${width}×${height}px), phần trên/dưới sẽ bị cắt nhiều`);
      if (notes.length) setImageWarning('Lưu ý: ' + notes.join('; ') + '. Hãy xem ảnh xem trước bên cạnh trước khi lưu.');
    } catch {
      // trình duyệt không đọc được kích thước: bỏ qua, máy chủ vẫn xử lý bình thường
    }
  }

  async function uploadAvatar(file: File) {
    void inspectImage(file);
    setUploading(true);
    try {
      const form = new FormData();
      form.set('file', file);
      const result = await adminFetch<{ path: string; url: string }>('/api/admin/files', { method: 'POST', body: form });
      setData((d) => ({ ...d, avatarPath: result.path, avatar: kolCardImage(result.path) }));
      setErrors((e) => ({ ...e, avatar: '' }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không tải được ảnh');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    const found: Record<string, string> = {};
    if (!data.avatarPath) found.avatar = 'Vui lòng chọn ảnh đại diện';
    if (!data.name.trim()) found.name = 'Tên KOL không được để trống';
    if (!data.slug.trim()) found.slug = 'Đường dẫn không được để trống';
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setBusy(true);
    try {
      const { avatar: _preview, avatarPath, ...rest } = data;
      const body = { ...rest, avatar: avatarPath, sortOrder: Number(data.sortOrder) || 0 };
      if (isEdit) await adminFetch(`/api/admin/kols/${id}`, { method: 'PUT', json: body });
      else await adminFetch('/api/admin/kols', { method: 'POST', json: body });
      toast.success(isEdit ? 'Cập nhật KOL thành công' : 'Thêm KOL thành công');
      router.push('/admin/kol-management');
      router.refresh();
    } catch (e) {
      if (e instanceof ApiClientError && e.field) setErrors({ [e.field]: e.message });
      else toast.error(e instanceof Error ? e.message : 'Không lưu được KOL');
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
            if (file) void uploadAvatar(file);
          }}
        />
        <label data-required>Ảnh đại diện</label>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div
            className={s['thumb-upload']}
            style={{ width: 176, height: 192 }}
            onClick={() => fileRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}
          >
            {data.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={data.avatar} alt="preview" style={{ objectPosition: 'center top' }} />
            ) : (
              <span>{uploading ? 'Đang tải...' : 'Upload'}</span>
            )}
          </div>
          <div className={s.hint} style={{ flex: 1, minWidth: 240, lineHeight: 1.7, marginTop: 0 }}>
            <strong>Kích thước khuyến nghị: {KOL_IMAGE_WIDTH} × {KOL_IMAGE_HEIGHT} px</strong> (tỉ lệ {KOL_IMAGE_RATIO}, ảnh chân dung hơi dọc), tối thiểu {KOL_IMAGE_MIN_WIDTH}px chiều rộng.
            <br />
            Đặt khuôn mặt ở giữa, phần trên của ảnh; chừa chỗ phía dưới vì thanh tên và nút Booking sẽ che một phần.
            <br />
            Định dạng png/jpg/webp, tối đa 10 MB. Ảnh sai tỉ lệ vẫn dùng được: hệ thống tự cắt vừa khung và giữ lại khuôn mặt, ô bên trái là ảnh xem trước đúng khung ở trang chủ.
          </div>
        </div>
        {imageWarning && <div className={s.error}>{imageWarning}</div>}
        {err('avatar')}
      </div>

      <div className={s.field}>
        <label data-required>Tên KOL:</label>
        <input className={`${s.input} ${errors.name ? s.invalid : ''}`} value={data.name} onChange={(e) => onName(e.target.value)} placeholder="Nhập tên KOL" />
        {err('name')}
      </div>

      <div className={s.field}>
        <label>Biệt danh (hiển thị trên thẻ, để trống = dùng tên):</label>
        <input className={`${s.input} ${errors.nickname ? s.invalid : ''}`} value={data.nickname} onChange={(e) => set('nickname', e.target.value)} placeholder="Nhập biệt danh" />
        {err('nickname')}
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
          placeholder="Tự tạo từ tên"
        />
        {err('slug')}
      </div>

      <div className={s.field}>
        <label>Tỉnh/Thành:</label>
        <input className={`${s.input} ${errors.province ? s.invalid : ''}`} list="kol-provinces" value={data.province} onChange={(e) => set('province', e.target.value)} placeholder="Chọn hoặc nhập tỉnh/thành" />
        <datalist id="kol-provinces">
          {PROVINCE_SUGGESTIONS.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>
        {err('province')}
      </div>

      <div className={s.field}>
        <label>Lĩnh vực:</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px' }}>
          {KOL_FIELDS.map((f) => (
            <label key={f.value} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontWeight: 400 }}>
              <input type="checkbox" checked={data.fields.includes(f.value)} onChange={() => toggleField(f.value)} />
              {f.label}
            </label>
          ))}
        </div>
        {err('fields')}
      </div>

      {PLATFORMS.map((p) => (
        <div className={s.field} key={p.label}>
          <label>{p.label}:</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className={`${s.input} ${errors[p.url] ? s.invalid : ''}`} style={{ flex: 1 }} value={data[p.url]} onChange={(e) => set(p.url, e.target.value)} placeholder={p.placeholder} />
            <input className={`${s.input} ${errors[p.count] ? s.invalid : ''}`} style={{ width: 140 }} value={data[p.count]} onChange={(e) => set(p.count, e.target.value)} placeholder="Số follow, vd 4,6M" />
          </div>
          {err(p.url)}
          {err(p.count)}
        </div>
      ))}
      <div className={s.hint}>Trang chủ hiện số follow TikTok trên thẻ KOL; nền tảng khác được lưu để dùng sau.</div>

      <div className={s.field}>
        <label>Thứ tự hiển thị (số nhỏ hiện trước):</label>
        <input className={`${s.input} ${errors.sortOrder ? s.invalid : ''}`} type="number" min={0} value={data.sortOrder} onChange={(e) => set('sortOrder', Number(e.target.value))} />
        {err('sortOrder')}
      </div>

      <div className={s.field}>
        <label>Trạng thái:</label>
        <select className={s.select} value={data.isPublished ? 'on' : 'off'} onChange={(e) => set('isPublished', e.target.value === 'on')}>
          <option value="on">Hiển thị ở trang chủ</option>
          <option value="off">Ẩn</option>
        </select>
      </div>

      <div className={s['form-actions']}>
        <Link href="/admin/kol-management" className={s.btn}>
          Hủy
        </Link>
        <button type="button" className={`${s.btn} ${s.primary}`} onClick={submit} disabled={busy || uploading}>
          Xác nhận
        </button>
      </div>
    </div>
  );
}
