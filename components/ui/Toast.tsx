'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircleIcon, CloseCircleIcon, WarningIcon } from './icons';
import styles from './Toast.module.scss';

type Kind = 'success' | 'error' | 'warning';
interface Item { id: number; kind: Kind; text: string }

interface ToastApi {
  success: (text: string) => void;
  error: (text: string) => void;
  warning: (text: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);
let counter = 0;

/** Thông báo nhanh ở giữa phía trên màn hình (tương đương NzMessageService của website cũ). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const push = useCallback((kind: Kind, text: string) => {
    const id = ++counter;
    setItems((list) => [...list, { id, kind, text }]);
    setTimeout(() => setItems((list) => list.filter((i) => i.id !== id)), 3500);
  }, []);
  const api = useMemo<ToastApi>(
    () => ({ success: (t) => push('success', t), error: (t) => push('error', t), warning: (t) => push('warning', t) }),
    [push]
  );
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className={styles.stack} role="status" aria-live="polite">
        {items.map((item) => (
          <div key={item.id} className={`${styles.toast} ${styles[item.kind]}`}>
            {item.kind === 'success' ? <CheckCircleIcon /> : item.kind === 'error' ? <CloseCircleIcon /> : <WarningIcon />}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast phải nằm trong ToastProvider');
  return ctx;
}
