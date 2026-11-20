import type { ReactNode } from 'react';
import { getLang } from '@/lib/i18n/server';
import '@/styles/globals.scss';

// Layout gốc dùng chung cho website và trang quản trị. Phần giao diện website nằm ở app/(site)/layout.tsx.
export default async function RootLayout({ children }: { children: ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
