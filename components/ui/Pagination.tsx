import Link from 'next/link';
import s from './Pagination.module.scss';

/** Dãy số trang: luôn có trang đầu, trang cuối và 2 trang quanh trang hiện tại (dấu "…" cho phần bị ẩn). */
function pageList(current: number, last: number): (number | 'dots-l' | 'dots-r')[] {
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
  const pages = new Set<number>([1, last, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= last).sort((a, b) => a - b);
  const out: (number | 'dots-l' | 'dots-r')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(i === 1 ? 'dots-l' : 'dots-r');
    out.push(p);
  });
  return out;
}

/** Phân trang bằng liên kết thật (?page=N) để Google đọc được các trang sau. */
export function Pagination({ pageIndex, pageSize, total, basePath }: { pageIndex: number; pageSize: number; total: number; basePath: string }) {
  const last = Math.max(1, Math.ceil(total / pageSize));
  if (last <= 1) return null;
  const href = (page: number) => (page === 1 ? basePath : `${basePath}?page=${page}`);
  return (
    <nav className={s.pagination} aria-label="Phân trang">
      {pageList(pageIndex, last).map((p) =>
        typeof p === 'number' ? (
          <Link key={p} href={href(p)} className={`${s['pagination-item']} ${p === pageIndex ? s.active : ''}`} aria-current={p === pageIndex ? 'page' : undefined}>
            {p}
          </Link>
        ) : (
          <span key={p} className={s.dots}>
            …
          </span>
        )
      )}
    </nav>
  );
}
