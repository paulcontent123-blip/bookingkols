'use client';

import { useState } from 'react';
import { adminFetch } from '@/lib/admin-client';
import { formatDateTime } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { Pager, useDebounced, usePagedList } from './adminUi';
import s from './admin.module.scss';

interface ContactItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  isProcessed: boolean;
  createdAt: string;
}

export function ContactsAdmin() {
  const toast = useToast();
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  const debounced = useDebounced(keyword);
  const list = usePagedList<ContactItem>('/api/admin/contacts', { keyword: debounced, isProcessed: status || undefined });

  async function toggle(item: ContactItem) {
    try {
      await adminFetch(`/api/admin/contacts/${item.id}/processed`, { method: 'PATCH', json: { isProcessed: !item.isProcessed } });
      toast.success('Đã cập nhật trạng thái');
      await list.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không cập nhật được');
    }
  }

  async function remove(item: ContactItem) {
    if (!window.confirm('Bạn có chắc muốn xóa thông tin liên hệ này không?')) return;
    try {
      await adminFetch(`/api/admin/contacts/${item.id}`, { method: 'DELETE' });
      toast.success('Đã xóa');
      await list.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không xóa được');
    }
  }

  return (
    <>
      <div className={s.toolbar}>
        <div>
          <label>Tìm kiếm:</label>
          <input className={s.input} placeholder="Tên, số điện thoại hoặc email" value={keyword} onChange={(e) => setKeyword(e.target.value)} />
        </div>
        <div>
          <label>Trạng thái:</label>
          <select className={s.select} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả</option>
            <option value="false">Chưa xử lý</option>
            <option value="true">Đã xử lý</option>
          </select>
        </div>
      </div>
      {list.error && <div className={s.error}>{list.error}</div>}
      <div className={`${s['table-wrap']} ${list.loading ? s.loading : ''}`}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Họ tên</th>
              <th>Số điện thoại</th>
              <th>Email</th>
              <th>Nội dung</th>
              <th>Trạng thái</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.data?.items.map((c) => (
              <tr key={c.id}>
                <td>{formatDateTime(c.createdAt)}</td>
                <td>{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.email || '—'}</td>
                <td className={s['cell-wrap']}>{c.message}</td>
                <td>
                  <span className={`${s['status-tag']} ${c.isProcessed ? s.done : s.pending}`}>{c.isProcessed ? 'Đã xử lý' : 'Chưa xử lý'}</span>
                </td>
                <td>
                  <div className={s['btn-group']}>
                    <button type="button" className={`${s.btn} ${c.isProcessed ? '' : s.primary}`} onClick={() => toggle(c)}>
                      {c.isProcessed ? 'Bỏ đánh dấu' : 'Đã xử lý'}
                    </button>
                    <button type="button" className={`${s.btn} ${s.danger}`} onClick={() => remove(c)}>
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.data?.items.length === 0 && <div className={s.empty}>Trống</div>}
      </div>
      {list.data && <Pager pageIndex={list.pageIndex} pageSize={list.data.pageSize} total={list.data.totalCount} onChange={list.setPageIndex} />}
    </>
  );
}
