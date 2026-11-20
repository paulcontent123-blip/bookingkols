'use client';

import { useBooking } from '@/components/layout/BookingModal';
import { useI18n } from '@/components/I18nProvider';
import { cdnImage } from '@/lib/cdn';
import type { TopProfile as TopProfileItem } from '@/lib/home-data';
import { Empty } from '@/components/ui/Empty';
import { FieldTag } from './FieldTag';
import { OurExclusiveKol } from './OurExclusiveKol';
import s from './top-profile.module.scss';

const TIKTOK_VIDEOS = ['7600042095834959122', '7498332271338884360', '7499841032234765575', '7543284128708398343'];

export function TopProfile({ profiles }: { profiles: TopProfileItem[] }) {
  const { t } = useI18n();
  const { openBooking } = useBooking();
  return (
    <div className={s['top-profile-container']}>
      <div className={s['top-profile-content']}>
        <div className={s['title-container']}>
          <h3>{t('home_page.popular_for_month')}</h3>
          <div className={s['popular-type-options']}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={s['popular-type']}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cdnImage(`assets/images/home-page/popular-${i}.svg`)} alt={`icon-popular${i}`} />
              </div>
            ))}
          </div>
        </div>
        <div className={s.row}>
          <div className={s['col-main']}>
            <div className={s['video-tiktok']}>
              {TIKTOK_VIDEOS.map((id) => (
                <div key={id} className={s['video-container']}>
                  <iframe src={`https://www.tiktok.com/embed/${id}`} loading="lazy" title={`TikTok ${id}`} style={{ width: '100%', height: 733, border: 'none' }} />
                </div>
              ))}
            </div>
          </div>
          <div className={s['col-side']}>
            <div className={s['list-profile-container']}>
              <h3>{t('home_page.popular_kol')}</h3>
              <div className={s['list-profile']}>
                {profiles.length === 0 && <Empty />}
                {profiles.map((user) => (
                  <div key={user.id} className={s.profile} onClick={openBooking} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && openBooking()}>
                    <div className={s.image}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={user.avatar} alt={user.name} />
                    </div>
                    <div>
                      <p>
                        <strong>{user.name}</strong>
                      </p>
                      {user.fields[0] && <FieldTag hideIcon field={user.fields[0]} />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <OurExclusiveKol />
    </div>
  );
}
