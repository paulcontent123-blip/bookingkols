'use client';

import { createContext, useCallback, useContext, useMemo, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LANG_COOKIE, translate, type Dict, type Lang } from '@/lib/i18n';

interface I18nValue {
  lang: Lang;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLang: (lang: Lang) => void;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ lang, dict, children }: { lang: Lang; dict: Dict; children: ReactNode }) {
  const router = useRouter();
  const t = useCallback((key: string, params?: Record<string, string | number>) => translate(dict, key, params), [dict]);
  const setLang = useCallback(
    (next: Lang) => {
      document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    },
    [router]
  );
  const value = useMemo(() => ({ lang, t, setLang }), [lang, t, setLang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n phải nằm trong I18nProvider');
  return ctx;
}
