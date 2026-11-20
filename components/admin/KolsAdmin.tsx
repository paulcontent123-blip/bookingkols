'use client';

import Link from 'next/link';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-client';
import { KOL_FIELDS } from '@/lib/kol-fields';
import { useToast } from '@/components/ui/Toast';
import { Pager, useDebounced, usePagedList } from './adminUi';
import s from './admin.module.scss';

interface KolRow {
  id: string;
  name: string;
  nickname: string;
  avatar: string;
  province: string;
  fields: string[];
  tiktokFollowers: string;
  sortOrder: number;
  isPublished: boolean;
  isFeatured: boolean;
}

const fieldLabel = (value: string) => KOL_FIELDS.find((f) => f.value === value)?.label ?? value;

export function KolsAdmin() {
  const toast = useToast();
  const [name, setName] = useState('');
  const debounced = useDebounced(name);
  const list = usePagedList<KolRow>('/api/admin/kols', { name: debounced });

  async function remove(item: KolRow) {
    if (!window.confirm(`Bạn có chắc xóa KOL "${item.name}" không? Ảnh đại diện cũng sẽ bị xóa.`)) return;
    try {
      await adminFetch(`/api/admin/kols/${item.id}`, { method: 'DELETE' });
      toast.success('Đã xóa KOL');
      await list.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không xóa được KOL');
    }
  }

  return (
    <>
      <div className={s.toolbar}>
        <div>
          <label>Tên KOL:</label>
          <input className={s.input} placeholder="Nhập tên hoặc biệt danh" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Link href="/admin/kol-management/create" className={`${s.btn} ${s.primary}`}>
          Thêm KOL
        </Link>
      </div>
      {list.error && <div className={s.error}>{list.error}</div>}
      <div className={`${s['table-wrap']} ${list.loading ? s.loading : ''}`}>
        <table className={s.table}>
          <thead>
            <tr>
              <th style={{ width: 80 }}>Ảnh</th>
              <th>Tên KOL</th>
              <th>Lĩnh vực</th>
              <th>Tỉnh/Thành</th>
              <th>TikTok</th>
              <th style={{ width: 70 }}>Thứ tự</th>
              <th>Trạng thái</th>
              <th style={{ width: 220 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.data?.items.map((k) => (
              <tr key={k.id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {k.avatar ? <img src={k.avatar} alt={k.name} width={56} height={56} style={{ objectFit: 'cover', borderRadius: 8, background: '#f0f0f0' }} /> : null}
                </td>
                <td className={s['cell-wrap']}>
                  {k.name}
                  {k.nickname && k.nickname !== k.name ? <div className={s.hint}>{k.nickname}</div> : null}
                </td>
                <td className={s['cell-wrap']}>{k.fields.map(fieldLabel).join(', ')}</td>
                <td>{k.province}</td>
                <td>{k.tiktokFollowers}</td>
                <td>{k.sortOrder}</td>
                <td>
                  <span className={`${s['status-tag']} ${k.isPublished ? s.published : s.draft}`}>{k.isPublished ? 'Đang hiển thị' : 'Đã ẩn'}</span>
                  {k.isFeatured && (
                    <div className={s.hint} style={{ marginTop: 6 }}>
                      ★ Nổi bật
                    </div>
                  )}
                </td>
                <td>
                  <div className={s['btn-group']}>
                    <button type="button" className={`${s.btn} ${s.danger}`} onClick={() => remove(k)}>
                      Xóa
                    </button>
                    <Link href={`/admin/kol-management/update/${k.id}`} className={`${s.btn} ${s.primary}`}>
                      Cập nhật
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.data?.items.length === 0 && <div className={s.empty}>Không có dữ liệu</div>}
      </div>
      {list.data && <Pager pageIndex={list.pageIndex} pageSize={list.data.pageSize} total={list.data.totalCount} onChange={list.setPageIndex} />}
    </>
  );
}
