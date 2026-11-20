'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import { adminFetch } from '@/lib/admin-client';
import { cdnImage } from '@/lib/cdn';
import { UserIcon } from '@/components/ui/icons';
import s from './admin.module.scss';

const MENU = [
  { url: '/admin/user-management', title: 'Quản lý User' },
  { url: '/admin/news-management', title: 'Quản lý Tin tức' },
  { url: '/admin/kol-management', title: 'Quản lý KOL' },
  { url: '/admin/contact-management', title: 'Quản lý Liên hệ' },
  { url: '/admin/seo-config-management', title: 'Quản lý config SEO' }
];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    try {
      await adminFetch('/api/admin/users/logout', { method: 'DELETE' });
    } finally {
      router.replace('/admin/login');
      router.refresh();
    }
  }

  return (
    <div className={s.layout}>
      <aside className={s.sider}>
        <div className={s.logo}>
          <Link href="/admin">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cdnImage('assets/images/logo/booking KOLS-logo-white.svg')} alt="logo" />
            <h1>Booking KOLs Portal</h1>
          </Link>
        </div>
        <ul className={s.menu}>
          {MENU.map((item) => (
            <li key={item.url} className={pathname.startsWith(item.url) ? s.active : undefined}>
              <Link href={item.url}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </aside>
      <div className={s.main}>
        <header className={s.header}>
          <div className={s.account}>
            <p>{email}</p>
            <button type="button" className={s.avatar} onClick={() => setOpen((v) => !v)} aria-label="Tài khoản">
              <UserIcon />
            </button>
          </div>
          {open && (
            <div className={s.dropdown} onClick={() => setOpen(false)}>
              <Link href="/admin/change-password">⚙ Đổi mật khẩu</Link>
              <button type="button" onClick={logout}>
                ⎋ Đăng xuất
              </button>
            </div>
          )}
        </header>
        <div className={s.content}>
          <div className={s.inner}>{children}</div>
        </div>
      </div>
    </div>
  );
}
