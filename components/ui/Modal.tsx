'use client';

import { useEffect, type ReactNode } from 'react';
import { CloseIcon } from './icons';
import styles from './Modal.module.scss';

/** Hộp thoại (tương đương NzModal): bấm nền hoặc nhấn Esc để đóng, khoá cuộn trang phía sau. */
export function Modal({ open, onClose, width = 800, children }: { open: boolean; onClose: () => void; width?: number; children: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className={styles.wrap} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} style={{ width }} role="dialog" aria-modal="true">
        <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng">
          <CloseIcon />
        </button>
        {children}
      </div>
    </div>
  );
}
