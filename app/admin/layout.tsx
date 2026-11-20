import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/Toast';

// Trang quản trị: không cho Google lập chỉ mục và không gắn GTM/GA.
export const metadata: Metadata = {
  title: 'Booking KOLs Portal',
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
