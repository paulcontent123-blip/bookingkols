'use client';

import { useState, type FormEvent } from 'react';
import { adminFetch, ApiClientError } from '@/lib/admin-client';
import { useToast } from '@/components/ui/Toast';
import s from './admin.module.scss';

export function ChangePasswordForm() {
  const toast = useToast();
  const [oldPassword, setOld] = useState('');
  const [newPassword, setNew] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setErrors({});
    setBusy(true);
    try {
      await adminFetch('/api/admin/users/change-password', { method: 'PATCH', json: { oldPassword, newPassword } });
      toast.success('Đổi mật khẩu thành công');
      setOld('');
      setNew('');
    } catch (error) {
      if (error instanceof ApiClientError && error.field) setErrors({ [error.field]: error.message });
      else toast.error(error instanceof Error ? error.message : 'Không đổi được mật khẩu');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s['form-page']} style={{ maxWidth: 420 }}>
      <h2 style={{ marginTop: 0 }}>Đổi mật khẩu</h2>
      <form onSubmit={onSubmit} noValidate>
        <div className={s.field}>
          <input className={`${s.input} ${errors.oldPassword ? s.invalid : ''}`} type="password" value={oldPassword} onChange={(e) => setOld(e.target.value)} placeholder="Password cũ" autoComplete="current-password" />
          {errors.oldPassword && <div className={s.error}>{errors.oldPassword}</div>}
        </div>
        <div className={s.field}>
          <input className={`${s.input} ${errors.newPassword ? s.invalid : ''}`} type="password" value={newPassword} onChange={(e) => setNew(e.target.value)} placeholder="Password mới" autoComplete="new-password" />
          {errors.newPassword && <div className={s.error}>{errors.newPassword}</div>}
        </div>
        <button type="submit" className={`${s.btn} ${s.primary}`} disabled={busy}>
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
}
