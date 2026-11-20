'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { cdnImage } from '@/lib/cdn';
import { useI18n } from '@/components/I18nProvider';
import { CloseIcon, MenuIcon } from '@/components/ui/icons';
import { cls } from '@/lib/cls';
import s from './Header.module.scss';

const MENU = [
  { url: '/', title: 'menu.home' },
  { url: '/news', title: 'menu.news' },
  { url: '/our-service', title: 'menu.service' },
  { url: '/campaigns', title: 'menu.campaigns' },
  { url: '/contact', title: 'menu.contact' }
];

const LANGS = [
  { lang: 'vi' as const, title: 'VIET' },
  { lang: 'en' as const, title: 'ENG' }
];

const LOGO = 'assets/images/logo/booking KOLS-logo-white.svg';

function Menu() {
  const pathname = usePathname();
  const { t } = useI18n();
  return (
    <ul className={s.menu}>
      {MENU.map((item) => {
        const active = pathname === item.url;
        return (
          <li key={item.title}>
            <div className={cls(s, 'bar', active && 'active')} />
            <Link href={item.url} className={active ? s.active : undefined}>
              {t(item.title)}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function LanguageOptions({ onChanged }: { onChanged?: () => void }) {
  const { lang, setLang } = useI18n();
  const change = (next: 'vi' | 'en') => {
    if (next === lang) return;
    setLang(next);
    onChanged?.();
  };
  return (
    <>
      <button type="button" className={s['lang-desktop']} onClick={() => change(lang === 'vi' ? 'en' : 'vi')} aria-label="Đổi ngôn ngữ">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={s.language} alt={lang} src={cdnImage(`assets/images/lang/${lang}.svg`)} />
      </button>
      <div className={s['lang-mobile']}>
        {LANGS.map((item) => (
          <button type="button" key={item.lang} className={cls(s, 'language-option', item.lang === lang && 'active')} onClick={() => change(item.lang)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className={s.language} alt={item.lang} src={cdnImage(`assets/images/lang/${item.lang}.svg`)} />
            <p>{item.title}</p>
          </button>
        ))}
      </div>
    </>
  );
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Chuyển trang thì đóng ngăn kéo menu.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <header className={s['mobile-header']}>
        <div className={s['left-header']}>
          <Link href="/" className={s.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cdnImage(LOGO)} alt="Booking KOLs logo" />
          </Link>
          <button type="button" className={s['mobile-icon']} onClick={() => setOpen(true)} aria-label="Mở menu">
            <MenuIcon />
          </button>
        </div>
      </header>

      {open && <div className={s['drawer-mask']} onClick={() => setOpen(false)} />}
      <aside className={cls(s, 'drawer', open && 'open')} aria-hidden={!open}>
        <div className={s['drawer-header']}>
          <div className={s['drawer-title']}>
            <Link href="/" className={s.logo}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdnImage(LOGO)} alt="Booking KOLs logo" />
            </Link>
            <button type="button" className={s['title-icon']} onClick={() => setOpen(false)} aria-label="Đóng menu">
              <CloseIcon />
            </button>
          </div>
        </div>
        <div className={s['drawer-body']}>
          <Menu />
          <div className={s['drawer-language-options']}>
            <LanguageOptions onChanged={() => setOpen(false)} />
          </div>
        </div>
      </aside>

      <header className={s['desktop-header']}>
        <div>
          <Link href="/" className={s.logo}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cdnImage(LOGO)} alt="Booking KOLs logo" />
          </Link>
        </div>
        <div className={s['menu-group']}>
          <div className={s['menu-wrap']}>
            <Menu />
          </div>
          <LanguageOptions />
        </div>
      </header>
    </>
  );
}
