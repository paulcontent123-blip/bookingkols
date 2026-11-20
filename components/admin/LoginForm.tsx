'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { adminFetch, ApiClientError } from '@/lib/admin-client';
import s from './admin.module.scss';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found: typeof errors = {};
    if (!email.trim()) found.email = 'Vui lòng nhập email!';
    if (!password) found.password = 'Vui lòng nhập password!';
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setBusy(true);
    try {
      await adminFetch('/api/admin/users/login', { method: 'POST', json: { email, password } });
      router.replace('/admin');
      router.refresh();
    } catch (error) {
      if (error instanceof ApiClientError && (error.field === 'email' || error.field === 'password')) setErrors({ [error.field]: error.message });
      else setErrors({ form: error instanceof Error ? error.message : 'Không đăng nhập được.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={s['login-page']}>
      <div className={s['login-card']}>
        <h3>Login</h3>
        <form onSubmit={onSubmit} noValidate>
          <div className={s.field}>
            <label data-required>Email</label>
            <input className={`${s.input} ${errors.email ? s.invalid : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} type="text" autoComplete="username" />
            {errors.email && <div className={s.error}>{errors.email}</div>}
          </div>
          <div className={s.field}>
            <label data-required>Password</label>
            <input className={`${s.input} ${errors.password ? s.invalid : ''}`} value={password} onChange={(e) => setPassword(e.target.value)} type="password" autoComplete="current-password" />
            {errors.password && <div className={s.error}>{errors.password}</div>}
          </div>
          {errors.form && <div className={s.error} style={{ marginBottom: 12 }}>{errors.form}</div>}
          <button type="submit" className={`${s.btn} ${s.primary} ${s.block}`} disabled={busy}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
