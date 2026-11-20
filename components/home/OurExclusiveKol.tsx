'use client';

import { useState } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { EXCLUSIVE_KOLS } from '@/lib/home-data';
import { FieldTag } from './FieldTag';
import { PlatformTag } from './PlatformTag';
import s from './our-exclusive-kol.module.scss';

export function OurExclusiveKol() {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const current = EXCLUSIVE_KOLS[index];
  const previous = () => setIndex((i) => (i === 0 ? EXCLUSIVE_KOLS.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === EXCLUSIVE_KOLS.length - 1 ? 0 : i + 1));

  return (
    <div className={s['our-exclusive-kol']}>
      <h1 className={s.title}>{t('home_page.exclusive_talent_title')}</h1>
      <div className={s['carousel-container']}>
        <div className={s['kol-detail']}>
          <h1>{current.name}</h1>
          <p style={{ whiteSpace: 'pre-line' }}>{current.description}</p>
          <div className={s.platform}>
            <p>
              <strong>Nền tảng</strong>
            </p>
            <div className={s['list-platform']}>
              {current.platforms.map((item) => (
                <PlatformTag key={item.name} platform={item.name} numberOfSubscribers={item.total} />
              ))}
            </div>
          </div>
          <div className={s.field}>
            <p>
              <strong>Lĩnh vực</strong>
            </p>
            <div className={s['list-field']}>
              {current.fields.map((field) => (
                <div key={field} className={s['field-tag-wrap']}>
                  <FieldTag hideIcon field={field} />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={s.footer}>
          <div className={s['list-kol']}>
            {EXCLUSIVE_KOLS.map((user, idx) => (
              <div key={user.name} className={`${s.kol} ${user.name === current.name ? s.active : ''}`} onClick={() => setIndex(idx)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && setIndex(idx)}>
                <div className={s.image}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.avatar} alt={user.name} />
                </div>
                <p>{user.name}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={s.avatar}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current.avatar} alt={current.name} />
        </div>
        <button type="button" className={s['button-left']} onClick={previous} aria-label="Trước">
          <ChevronLeftIcon />
        </button>
        <button type="button" className={s['button-right']} onClick={next} aria-label="Sau">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
