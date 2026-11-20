import { cdnImage } from '@/lib/cdn';
import { COOPERATE_BRANDS } from '@/lib/home-data';
import s from './list-brand.module.scss';

export function ListBrand() {
  return (
    <div className={s['list-brand-container']}>
      <h2 className={s['section-title']}>Các nhãn hàng đã hợp tác</h2>
      <div className={s['list-brand-grid']}>
        {COOPERATE_BRANDS.map((brand) => (
          <div key={brand.file} className={s.brand} style={{ background: brand.background ?? '#fff' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cdnImage(encodeURI(`assets/cooperate-brand/${brand.file}`))} alt={brand.name} loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
}
