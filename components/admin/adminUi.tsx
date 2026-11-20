'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { adminFetch, query } from '@/lib/admin-client';
import s from './admin.module.scss';

export interface Paged<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

/** Giá trị trì hoãn: ô tìm kiếm chỉ gọi API sau khi người dùng ngừng gõ. */
export function useDebounced<T>(value: T, ms = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return debounced;
}

/** Danh sách phân trang đọc từ một API quản trị; đổi bộ lọc thì tự về trang 1. */
export function usePagedList<T>(endpoint: string, filters: Record<string, string | boolean | undefined>, pageSize = 10) {
  const [pageIndex, setPageIndex] = useState(1);
  const [data, setData] = useState<Paged<T> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const filterKey = JSON.stringify(filters);
  const previousFilter = useRef(filterKey);

  const load = useCallback(
    async (page: number) => {
      setLoading(true);
      setError('');
      try {
        const result = await adminFetch<Paged<T>>(`${endpoint}${query({ ...JSON.parse(filterKey), pageIndex: page, pageSize })}`);
        setData(result);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.');
      } finally {
        setLoading(false);
      }
    },
    [endpoint, filterKey, pageSize]
  );

  useEffect(() => {
    const filterChanged = previousFilter.current !== filterKey;
    previousFilter.current = filterKey;
    if (filterChanged && pageIndex !== 1) {
      setPageIndex(1);
      return;
    }
    void load(pageIndex);
  }, [filterKey, pageIndex, load]);

  return { data, loading, error, pageIndex, setPageIndex, reload: () => load(pageIndex) };
}

/** Dãy nút phân trang kèm tổng số dòng. */
export function Pager({ pageIndex, pageSize, total, onChange }: { pageIndex: number; pageSize: number; total: number; onChange: (page: number) => void }) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (pageIndex - 1) * pageSize + 1;
  const to = Math.min(total, pageIndex * pageSize);
  const pages: number[] = [];
  for (let p = Math.max(1, pageIndex - 2); p <= Math.min(last, pageIndex + 2); p++) pages.push(p);
  return (
    <div className={s.pager}>
      <span className={s.total}>
        {from}-{to} / {total} mục
      </span>
      <button type="button" disabled={pageIndex <= 1} onClick={() => onChange(pageIndex - 1)} aria-label="Trang trước">
        ‹
      </button>
      {pages.map((p) => (
        <button key={p} type="button" className={p === pageIndex ? s.active : undefined} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
      <button type="button" disabled={pageIndex >= last} onClick={() => onChange(pageIndex + 1)} aria-label="Trang sau">
        ›
      </button>
    </div>
  );
}
