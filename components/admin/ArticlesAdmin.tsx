'use client';

import Link from 'next/link';
import { useState } from 'react';
import { adminFetch } from '@/lib/admin-client';
import { formatDateTime } from '@/lib/format';
import { useToast } from '@/components/ui/Toast';
import { Pager, useDebounced, usePagedList } from './adminUi';
import s from './admin.module.scss';

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: string;
  type: string;
  createdAt: string;
  author: { name: string; email?: string };
}

export const ARTICLE_TYPE_OPTIONS = [
  { value: 'kol', label: 'ĐỀ XUẤT CHO KOL/KOC' },
  { value: 'agency', label: 'ĐỀ XUẤT CHO AGENCY' },
  { value: 'project', label: 'DỰ ÁN / CHIẾN DỊCH' }
];
export const ARTICLE_STATUS_OPTIONS = [
  { value: 'draft', label: 'Nháp' },
  { value: 'published', label: 'Xuất bản' }
];

export function ArticlesAdmin() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const dTitle = useDebounced(title);
  const dAuthor = useDebounced(author);
  const list = usePagedList<ArticleRow>('/api/admin/articles', { title: dTitle, author: dAuthor, type: type || undefined, status: status || undefined });

  async function remove(item: ArticleRow) {
    if (!window.confirm('Bạn có chắc xóa bài viết này không?')) return;
    try {
      await adminFetch(`/api/admin/articles/${encodeURIComponent(item.slug)}`, { method: 'DELETE' });
      toast.success('Đã xóa bài viết');
      await list.reload();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Không xóa được bài viết');
    }
  }

  return (
    <>
      <div className={s.toolbar}>
        <div>
          <label>Tiêu đề:</label>
          <input className={s.input} placeholder="Nhập tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label>Loại bài viết:</label>
          <select className={s.select} value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">Tất cả</option>
            {ARTICLE_TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Trạng thái:</label>
          <select className={s.select} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Tất cả</option>
            {ARTICLE_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Tác giả:</label>
          <input className={s.input} placeholder="Nhập tác giả" value={author} onChange={(e) => setAuthor(e.target.value)} />
        </div>
        <Link href="/admin/news-management/create" className={`${s.btn} ${s.primary}`}>
          Tạo bài viết
        </Link>
      </div>
      {list.error && <div className={s.error}>{list.error}</div>}
      <div className={`${s['table-wrap']} ${list.loading ? s.loading : ''}`}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Tiêu đề</th>
              <th>Trạng thái</th>
              <th>Mô tả</th>
              <th>Người đăng</th>
              <th>Ngày đăng</th>
              <th style={{ width: 350 }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.data?.items.map((a) => (
              <tr key={a.id}>
                <td className={s['cell-wrap']}>{a.title}</td>
                <td>
                  <span className={`${s['status-tag']} ${a.status === 'published' ? s.published : s.draft}`}>{a.status === 'published' ? 'Xuất bản' : 'Nháp'}</span>
                </td>
                <td className={s['cell-wrap']}>{a.description}</td>
                <td>{a.author.email || a.author.name}</td>
                <td>{formatDateTime(a.createdAt)}</td>
                <td>
                  <div className={s['btn-group']}>
                    <Link href={`/admin/news-detail/${encodeURIComponent(a.slug)}`} className={s.btn}>
                      Chi tiết
                    </Link>
                    <button type="button" className={`${s.btn} ${s.danger}`} onClick={() => remove(a)}>
                      Xóa bài viết
                    </button>
                    <Link href={`/admin/news-management/update/${encodeURIComponent(a.slug)}`} className={`${s.btn} ${s.primary}`}>
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
