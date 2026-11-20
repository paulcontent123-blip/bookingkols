'use client';

import type { ReactNode } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { Empty } from '@/components/ui/Empty';
import { cdnImage } from '@/lib/cdn';
import type { KolProfile } from '@/lib/home-data';
import { KolProfileCard } from './KolProfileCard';
import s from './popular-list.module.scss';

export function PopularList({ kols, pager }: { kols: KolProfile[]; pager?: ReactNode }) {
  const { t } = useI18n();
  return (
    <div className={s['popular-container']}>
      <div className={s.logo}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cdnImage('assets/icon/logo.svg')} alt="logo Booking KOLs" />
      </div>
      <div className={s['popular-list']} id="kol-list">
        <h2 className={s['section-title']}>{t('home_page.kol_cooperation_list')}</h2>
        <div className={s['kol-grid']}>
          {kols.length === 0 && <Empty className={s['bk-empty']} />}
          {kols.map((item) => (
            <KolProfileCard key={item.slug} profile={item} />
          ))}
        </div>
        {pager && <div className={s.pager}>{pager}</div>}
        <div className={s['view-more']}>
          <a href="https://bookingkoc.com.vn" target="_blank" rel="noopener noreferrer">
            {t('button.more')}
          </a>
        </div>
      </div>
    </div>
  );
}
