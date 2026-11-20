import Link from 'next/link';
import type { ReactNode } from 'react';
import s from './gradient-button.module.scss';

interface Props {
  children: ReactNode;
  width?: string;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit';
}

/** Nút gradient vàng-hồng của website (nhận href để chuyển trang, hoặc onClick). */
export function GradientButton({ children, width = '200px', href, onClick, disabled, type = 'button' }: Props) {
  const inner = (
    <div className={`${s['button-background']} ${disabled ? s.disabled : ''}`} style={{ width }}>
      <div className={s.button}>{children}</div>
    </div>
  );
  if (href) {
    return (
      <Link href={href} className={s['gradient-root']} style={{ display: 'inline-block' }}>
        {inner}
      </Link>
    );
  }
  return (
    <button type={type} className={s['gradient-root']} onClick={onClick} disabled={disabled}>
      {inner}
    </button>
  );
}
