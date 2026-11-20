import 'server-only';
import { cookies, headers } from 'next/headers';
import { DEFAULT_LANG, LANG_COOKIE, getDict, isLang, translate, type Lang } from './index';

/** Ngôn ngữ của yêu cầu hiện tại: ?lang=en (do middleware chuyển thành header) > cookie > tiếng Việt. */
export async function getLang(): Promise<Lang> {
  const fromHeader = (await headers()).get('x-lang');
  if (isLang(fromHeader)) return fromHeader;
  const fromCookie = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(fromCookie) ? fromCookie : DEFAULT_LANG;
}

/** Dùng trong server component: const t = await getT(); t('menu.home') */
export async function getT() {
  const lang = await getLang();
  const dict = getDict(lang);
  return {
    lang,
    t: (key: string, params?: Record<string, string | number>) => translate(dict, key, params)
  };
}
