'use client';

import { createContext, useCallback, useContext, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { SpinnerIcon } from '@/components/ui/icons';
import { useContactSubmit, validateContact, type FieldErrors } from '@/components/useContactSubmit';
import s from './BookingModal.module.scss';

const BookingContext = createContext<{ openBooking: () => void } | null>(null);

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error('useBooking phải nằm trong BookingModalProvider');
  return ctx;
}

const EMPTY = { name: '', phone: '', email: '', message: '', hpField: '' };

function BookingForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const { submit, submitting } = useContactSubmit();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => {
    const next = { ...values, [key]: e.target.value };
    setValues(next);
    if (touched[key]) setErrors(validateContact(next));
  };
  const blur = (key: string) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    setErrors(validateContact(values));
  };

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    setTouched({ name: true, phone: true, email: true, message: true });
    if (Object.keys(found).length > 0) return;
    if (await submit(values)) {
      onDone();
      toast.success('Cảm ơn bạn đã liên hệ. Chúng tôi sẽ phản hồi bạn trong thời gian sớm nhất.');
    } else {
      toast.error('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.');
    }
  }

  const err = (key: keyof FieldErrors) => (touched[key] && errors[key] ? <div className={s.error}>{errors[key]}</div> : null);

  return (
    <div className={s['booking-modal']}>
      <h2>Để lại thông tin</h2>
      <div className={s.row}>
        <div className={s['col-form']}>
          <form onSubmit={onSubmit} noValidate>
            {/* Ô ẩn chống bot, người thật không nhìn thấy và không điền */}
            <input type="text" value={values.hpField} onChange={set('hpField')} className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
            <div>
              <label className={s.label} data-required>Tên Của Bạn</label>
              <input className="ant-input" value={values.name} onChange={set('name')} onBlur={blur('name')} placeholder="Họ và tên *" />
              {err('name')}
            </div>
            <div>
              <label className={s.label} data-required>Phone</label>
              <input className="ant-input" value={values.phone} onChange={set('phone')} onBlur={blur('phone')} placeholder="Số điện thoại*" />
              {err('phone')}
            </div>
            <div>
              <label className={s.label}>Địa Chỉ Email</label>
              <input className="ant-input" type="email" value={values.email} onChange={set('email')} onBlur={blur('email')} placeholder="Email" />
              {err('email')}
            </div>
            <div>
              <label className={s.label} data-required>Tin Nhắn</label>
              <textarea className="ant-input" rows={4} value={values.message} onChange={set('message')} onBlur={blur('message')} placeholder="Yêu cầu cụ thể *" />
              {err('message')}
            </div>
            <button className={`ant-btn ant-btn-primary ant-btn-block ${s['submit-btn']}`} type="submit" disabled={submitting}>
              {submitting && <SpinnerIcon className="spin" />}
              GỬI THÔNG TIN
            </button>
          </form>
        </div>
        <div className={s['col-info']}>
          <div className={s['right-section']}>
            <div className={s['contact-info']}>
              <div className={s['contact-item']}>
                <span className={`${s.icon} ${s['location-icon']}`}>📍</span>
                <span className={s.text}>162B Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh</span>
              </div>
              <div className={s['contact-item']}>
                <span className={`${s.icon} ${s['phone-icon']}`}>📞</span>
                <span className={s.text}> 0767 977 415</span>
              </div>
              <div className={s['contact-item']}>
                <span className={`${s.icon} ${s['email-icon']}`}>✉️</span>
                <span className={s.text}>phongnguyen@veagroup.global</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Cung cấp hàm openBooking() cho mọi nơi trong website (nút nổi, nút "Booking" ở các trang). */
export function BookingModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openBooking = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ openBooking }), [openBooking]);
  return (
    <BookingContext.Provider value={value}>
      {children}
      <Modal open={open} onClose={() => setOpen(false)} width={800}>
        <BookingForm onDone={() => setOpen(false)} />
      </Modal>
    </BookingContext.Provider>
  );
}
