'use client';

import Link from 'next/link';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-client';
import { useToast } from '@/components/ui/Toast';
import { Pager, useDebounced, usePagedList } from './adminUi';
import s from './admin.module.scss';

interface SeoItem {
  id: string;
  url: string;
}

export function SeoAdmin() {
  const toast = useToast();
  const [url, setUrl] = useState('');
  const debounced = useDebounced(url);
  const list = usePagedList<SeoItem>('/api/admin/seo-html-contents', { url: debounced });

  async function remove(item: SeoItem) {
    if (!window.confirm('Bạn có chắc xóa config này không?')) return;
    try {
      await adminFetch(`/api/admin/seo-html-contents/${item.id}`, { method: 'DELETE' });
      toast.success('Đã xóa config');
      await list.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không xóa được');
    }
  }

  return (
    <>
      <div className={s.toolbar}>
        <div>
          <label>Đường dẫn:</label>
          <input className={s.input} placeholder="Nhập đường dẫn" value={url} onChange={(e) => setUrl(e.target.value)} />
        </div>
        <Link href="/admin/seo-config-management/create" className={`${s.btn} ${s.primary}`}>
          Tạo config
        </Link>
      </div>
      {list.error && <div className={s.error}>{list.error}</div>}
      <div className={`${s['table-wrap']} ${list.loading ? s.loading : ''}`}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Đường dẫn</th>
              <th style={{ width: 350 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.data?.items.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.url || '(trang chủ)'}</td>
                <td>
                  <div className={s['btn-group']}>
                    <button type="button" className={`${s.btn} ${s.danger}`} onClick={() => remove(c)}>
                      Xóa Config
                    </button>
                    <Link href={`/admin/seo-config-management/update/${c.id}`} className={`${s.btn} ${s.primary}`}>
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
