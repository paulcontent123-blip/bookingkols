import Link from 'next/link';
import s from './Breadcrumb.module.scss';

export interface Crumb {
  label: string;
  href?: string;
}

/** Đường dẫn "Trang chủ / Tin tức / ..." (thay cho nz-breadcrumb). */
export function Breadcrumb({ items, light = false }: { items: Crumb[]; light?: boolean }) {
  return (
    <nav className={`${s.breadcrumb} ${light ? s.light : ""}`} aria-label="breadcrumb">
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span className={s.current}>{item.label}</span>}
          {i < items.length - 1 && <span className={s.sep}>/</span>}
        </span>
      ))}
    </nav>
  );
}
