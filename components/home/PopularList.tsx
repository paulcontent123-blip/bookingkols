'use client';

import { useI18n } from '@/components/I18nProvider';
import { Empty } from '@/components/ui/Empty';
import { cdnImage } from '@/lib/cdn';
import { POPULAR_KOLS } from '@/lib/home-data';
import { KolProfileCard } from './KolProfileCard';
import s from './popular-list.module.scss';

export function PopularList() {
  const { t } = useI18n();
  return (
    <div className={s['popular-container']}>
      <div className={s.logo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cdnImage('assets/icon/logo.svg')} alt="logo Booking KOLs" />
      </div>
      <div className={s['popular-list']}>
        <h2 className={s['section-title']}>{t('home_page.kol_cooperation_list')}</h2>
        <div className={s['kol-grid']}>
          {POPULAR_KOLS.length === 0 && <Empty className={s['bk-empty']} />}
          {POPULAR_KOLS.map((item) => (
            <KolProfileCard key={item.slug} profile={item} />
          ))}
        </div>
        <div className={s['view-more']}>
          <a href="https://bookingkoc.com.vn" target="_blank" rel="noopener noreferrer">
            {t('button.more')}
          </a>
        </div>
      </div>
    </div>
  );
}
