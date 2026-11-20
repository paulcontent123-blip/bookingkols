'use client';

import { useState } from 'react';

export interface ContactPayload {
  name: string;
  phone: string;
  email?: string;
  message: string;
  hpField?: string;
}

export type FieldErrors = Partial<Record<'name' | 'phone' | 'email' | 'message', string>>;

/** Kiểm tra form liên hệ giống website cũ (họ tên, số điện thoại 10-11 số, email hợp lệ nếu có, nội dung). */
export function validateContact(values: ContactPayload, opts: { emailRequired?: boolean } = {}): FieldErrors {
  const errors: FieldErrors = {};
  if (!values.name.trim()) errors.name = 'Vui lòng nhập họ tên';
  if (!/^[0-9]{10,11}$/.test(values.phone.trim())) errors.phone = 'Vui lòng nhập số điện thoại hợp lệ (10-11 số)';
  const email = (values.email ?? '').trim();
  if ((opts.emailRequired && !email) || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) errors.email = 'Vui lòng nhập email hợp lệ';
  if (!values.message.trim()) errors.message = 'Vui lòng nhập nội dung';
  return errors;
}

/** Gửi form liên hệ tới API; trả về true nếu thành công. */
export function useContactSubmit() {
  const [submitting, setSubmitting] = useState(false);

  async function submit(payload: ContactPayload): Promise<boolean> {
    setSubmitting(true);
    try {
      const res = await fetch('/api/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      setSubmitting(false);
    }
  }

  return { submit, submitting };
}
