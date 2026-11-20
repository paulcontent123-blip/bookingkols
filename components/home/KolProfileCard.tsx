'use client';

import { useBooking } from '@/components/layout/BookingModal';
import { cdnImage } from '@/lib/cdn';
import type { KolProfile } from '@/lib/home-data';
import s from './kol-profile-card.module.scss';

export function KolProfileCard({ profile }: { profile: KolProfile }) {
  const { openBooking } = useBooking();
  return (
    <div className={s['profile-background']}>
      <div className={s['profile-info']}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={s.avatar} src={profile.avatar} alt={profile.name} />
        <div className={s.details}>
          <h3 className={s.profilename}>{profile.nickname || profile.name}</h3>
          <div className={s['btn-group']}>
            <a className={s.button} href={profile.socialNetworkInfo.tiktokUrl ?? undefined} target="_blank" rel="noopener noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdnImage('assets/icon/tiktok.svg')} alt="tiktok" />
              {profile.socialNetworkInfo.tiktokFollowerCount}
            </a>
            <button type="button" className={`${s.button} ${s.secondary}`} onClick={openBooking}>
              Booking KOL
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
