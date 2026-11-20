'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/ui/icons';
import { cdnImage } from '@/lib/cdn';
import { CUSTOMER_REVIEWS } from '@/lib/home-data';
import { cls } from '@/lib/cls';
import s from './our-customer.module.scss';

export function OurCustomer() {
  const [index, setIndex] = useState(0);
  const count = CUSTOMER_REVIEWS.length;
  const goTo = (i: number) => setIndex(((i % count) + count) % count);

  return (
    <div className={s['customer-review-container']}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={s.background} src={cdnImage('assets/images/home-page/background-review-customer.svg')} alt="background" />
      {CUSTOMER_REVIEWS.map((item, idx) => (
        <div key={item.name} className={cls(s, `customer customer${idx + 1}`, idx === index && 'active')} onClick={() => goTo(idx)} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && goTo(idx)}>
          <div className={s['customer-avatar']}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.avatar} alt={item.name} />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.country} alt="flag" src={cdnImage('assets/images/home-page/vi.svg')} />
        </div>
      ))}
      <div className={s['carousel-container']}>
        <div className={s.carousel}>
          <div className={s['carousel-track']} style={{ transform: `translateX(-${index * 100}%)` }}>
            {CUSTOMER_REVIEWS.map((item) => (
              <div key={item.name} className={s['carousel-slide']}>
                <div className={s['customer-review']}>
                  <div className={s.avatar}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.avatar} alt={item.name} />
                  </div>
                  <div className={s.detail}>
                    <div className={s['tag-role']}>Agency</div>
                    <p>{item.comment}</p>
                    <p>
                      <strong>{item.name}</strong>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <button type="button" className={s['button-left']} onClick={() => goTo(index - 1)} aria-label="Trước">
          <ChevronLeftIcon />
        </button>
        <button type="button" className={s['button-right']} onClick={() => goTo(index + 1)} aria-label="Sau">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
