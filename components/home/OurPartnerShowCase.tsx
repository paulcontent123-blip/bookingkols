'use client';

import { useState } from 'react';
import { PARTNER_SHOWCASE } from '@/lib/home-data';
import s from './our-partner-show-case.module.scss';

/** Ba chiến dịch tiêu biểu: bấm một thẻ để mở rộng và xem ảnh hoạt động của chiến dịch đó. */
export function OurPartnerShowCase() {
  const [selected, setSelected] = useState(-1);
  const [activity, setActivity] = useState<Record<number, number>>({});

  return (
    <div className={`${s['list-partner']} ${s.row}`}>
      {PARTNER_SHOWCASE.map((partner, idx) => {
        const active = idx === selected;
        const inactive = selected !== -1 && !active;
        const activityIndex = activity[idx] ?? 0;
        return (
          <div key={partner.name} className={`${s.col} ${active ? s['col-active'] : ''} ${inactive ? s['col-inactive'] : ''}`}>
            <div className={`${s['partner-container']} ${active ? s.active : ''} ${inactive ? s.inactive : ''}`}>
              <div className={s['partner-activities']}>
                {partner.activityImages.map((image, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} className={i === activityIndex ? s['selected-activity'] : undefined} src={image} alt={`activity ${i} of ${partner.name}`} onClick={() => setActivity((a) => ({ ...a, [idx]: i }))} />
                ))}
              </div>
              <div className={s['partner-card']} onClick={() => setSelected(active ? -1 : idx)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={partner.activityImages[activityIndex]} alt={`banner of ${partner.name}`} className={s.banner} />
                <div className={s['partner-info']}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={partner.logo} className={s.logo} alt={partner.name} />
                  <div className={s['partner-details']}>
                    <h3>{partner.name}</h3>
                    <a href="#" className={s['view-campaign-link']} onClick={(e) => e.preventDefault()}>
                      Xem chiến dịch
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
