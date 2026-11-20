import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getSession } from '@/lib/auth';
import { AdminShell } from '@/components/admin/AdminShell';

export const dynamic = 'force-dynamic';

// Mọi trang trong nhóm này yêu cầu đã đăng nhập; chưa đăng nhập thì chuyển về /admin/login.
export default async function PortalLayout({ children }: { children: ReactNode }) {
  const user = await getSession();
  if (!user) redirect('/admin/login');
  return <AdminShell email={user.email}>{children}</AdminShell>;
}
