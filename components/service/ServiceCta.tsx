'use client';

import { useBooking } from '@/components/layout/BookingModal';

export function ServiceCta({ className }: { className?: string }) {
  const { openBooking } = useBooking();
  return (
    <button type="button" className={className} onClick={openBooking}>
      Đăng ký tư vấn ngay
    </button>
  );
}
