'use client';

import type { ReactNode } from 'react';

/** Bấm vào mục lục trong bài thì cuộn mượt tới tiêu đề tương ứng (a[data-link]). */
export function TocLinks({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={className}
      onClick={(event) => {
        const link = (event.target as HTMLElement).closest('a[data-link]');
        if (!link) return;
        const target = document.getElementById(link.getAttribute('data-link') ?? '');
        target?.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
      }}
    >
      {children}
    </div>
  );
}
