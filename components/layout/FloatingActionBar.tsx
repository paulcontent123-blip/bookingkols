'use client';

import { FormIcon, MailIcon, PhoneIcon } from '@/components/ui/icons';
import { useBooking } from './BookingModal';
import s from './FloatingActionBar.module.scss';

const HOTLINE = '0767977415';
const EMAIL = 'phongnguyen@veagroup.global';

export function FloatingActionBar() {
  const { openBooking } = useBooking();
  return (
    <div className={s['floating-action-bar']}>
      <button type="button" className={`${s['action-btn']} ${s['hotline-btn']}`} onClick={() => window.open(`https://zalo.me/${HOTLINE}`, '_blank')}>
        <PhoneIcon />
        <span className={s['btn-text']}>{HOTLINE}</span>
      </button>
      <button type="button" className={`${s['action-btn']} ${s['email-btn']}`} onClick={() => (window.location.href = `mailto:${EMAIL}`)}>
        <MailIcon />
        <span className={s['btn-text']}>Email</span>
      </button>
      <button type="button" className={`${s['action-btn']} ${s['booking-btn']}`} onClick={openBooking}>
        <FormIcon />
        <span className={s['btn-text']}>Booking</span>
      </button>
    </div>
  );
}
