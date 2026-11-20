'use client';

import { useState, type FormEvent } from 'react';
import { useToast } from '@/components/ui/Toast';
import { SpinnerIcon } from '@/components/ui/icons';
import { useContactSubmit, validateContact, type FieldErrors } from '@/components/useContactSubmit';
import s from './contact.module.scss';

const EMPTY = { name: '', phone: '', email: '', message: '', hpField: '' };
// Nút "gradient": thuộc tính này được styles/_button.scss nhận diện để tô nền gradient hồng-cam.
const gradientAttr = { gradient: '' } as Record<string, string>;

export function ContactForm() {
  const toast = useToast();
  const { submit, submitting } = useContactSubmit();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));
  const invalid = (key: keyof FieldErrors) => (errors[key] ? { borderColor: '#ff4d4f' } : undefined);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.warning('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (await submit(values)) {
      toast.success('Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ trong 24h!');
      setValues(EMPTY);
      setErrors({});
    } else {
      toast.error('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.');
    }
  }

  return (
    <div className={s['form-block']}>
      <h3 style={{ color: 'white' }}>Gửi yêu cầu tư vấn</h3>
      <p className={s.sub}>
        Để lại thông tin — đội ngũ <strong>Booking KOLs</strong> sẽ liên hệ trong 24h.
      </p>

      <form onSubmit={onSubmit} noValidate>
        {/* Ô ẩn chống bot, người thật không nhìn thấy và không điền */}
        <input type="text" value={values.hpField} onChange={set('hpField')} className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        <div className={s.fi}>
          <label>Họ và tên *</label>
          <input className={`ant-input ${s['form-input']}`} style={invalid('name')} value={values.name} onChange={set('name')} placeholder="Nguyễn Văn A" />
        </div>
        <div className={s.fi}>
          <label>Số điện thoại *</label>
          <input className={`ant-input ${s['form-input']}`} style={invalid('phone')} value={values.phone} onChange={set('phone')} placeholder="09xx xxx xxx" type="tel" />
        </div>
        <div className={s.fi}>
          <label>Email *</label>
          <input className={`ant-input ${s['form-input']}`} style={invalid('email')} value={values.email} onChange={set('email')} placeholder="Nhập email của bạn" type="email" />
        </div>
        <div className={s.fi}>
          <div>
            <label>Tin Nhắn *</label>
            <textarea className={`ant-input ${s['form-input']}`} style={invalid('message')} rows={4} value={values.message} onChange={set('message')} placeholder="Yêu cầu cụ thể *" />
          </div>
        </div>
        <button className={`ant-btn ${s['submit-btn']}`} type="submit" disabled={submitting} {...gradientAttr}>
          {submitting && <SpinnerIcon className="spin" />}
          Liên hệ tư vấn ngay
        </button>
      </form>
    </div>
  );
}
