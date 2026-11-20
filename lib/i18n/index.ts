import vi from './vi.json';
import en from './en.json';

export const LANGUAGES = ['vi', 'en'] as const;
export type Lang = (typeof LANGUAGES)[number];
export const DEFAULT_LANG: Lang = 'vi';
export const LANG_COOKIE = 'bk_lang';

export type Dict = Record<string, unknown>;
const dictionaries: Record<Lang, Dict> = { vi: vi as Dict, en: en as Dict };

export function isLang(value: unknown): value is Lang {
  return value === 'vi' || value === 'en';
}

export function getDict(lang: Lang): Dict {
  return dictionaries[lang];
}

const lookup = (dict: Dict, key: string): string | null => {
  let value: unknown = dict;
  for (const part of key.split(".")) {
    if (value && typeof value === "object" && part in (value as Dict)) value = (value as Dict)[part];
    else return null;
  }
  return typeof value === "string" ? value : null;
};

/**
 * Tra khoá dạng "menu.home". Thiếu khoá trong ngôn ngữ hiện tại thì dùng tiếng Việt; thiếu cả hai thì trả lại chính khoá.
 * Hỗ trợ {{tham_so}}.
 */
export function translate(dict: Dict, key: string, params?: Record<string, string | number>): string {
  const value = lookup(dict, key) ?? lookup(dictionaries[DEFAULT_LANG], key);
  if (value === null) return key;
  if (!params) return value;
  return value.replace(/\{\{\s*(\w+)\s*\}\}/g, (_m, name: string) => String(params[name] ?? ''));
}
