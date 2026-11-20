import 'server-only';
import type { Metadata } from 'next';
import { config } from './config';
import { DEFAULT_SEO, type MetaTag } from './seo-defaults';
import { getSeoHtmlByUrl, normalizeSeoUrl } from './seo-html';

/** Tách các thẻ <meta> trong đoạn HTML cấu hình SEO thành danh sách thuộc tính. */
export function extractMetaTags(html: string): MetaTag[] {
  const tags: MetaTag[] = [];
  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attrs: Record<string, string> = {};
    for (const a of match[0].matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)) attrs[a[1].toLowerCase()] = a[2];
    if (attrs.content === undefined) continue;
    tags.push({ name: attrs.name, property: attrs.property, content: attrs.content });
  }
  return tags;
}

const TWITTER_CARDS = ['summary', 'summary_large_image', 'app', 'player'] as const;

/** Đổi danh sách thẻ meta sang Metadata của Next. Thẻ không nhận diện được đưa vào "other". */
export function metaTagsToMetadata(tags: MetaTag[]): Metadata {
  const md: Metadata = {};
  const og: Record<string, unknown> = {};
  const tw: Record<string, unknown> = {};
  const other: Record<string, string> = {};
  let title: string | undefined;

  for (const tag of tags) {
    const key = (tag.name || tag.property || '').toLowerCase();
    const value = tag.content;
    if (key === 'title') title = value;
    else if (key === 'description') md.description = value;
    else if (key === 'keywords') md.keywords = value;
    else if (key === 'robots') md.robots = value;
    else if (key === 'viewport') continue;
    else if (key.startsWith('og:')) {
      const field = key.slice(3);
      if (field === 'image') og.images = [{ url: value }];
      else og[field] = value;
    } else if (key.startsWith('twitter:')) {
      const field = key.slice(8);
      if (field === 'image') tw.images = [value];
      else if (field === 'card') tw.card = (TWITTER_CARDS as readonly string[]).includes(value) ? value : 'summary_large_image';
      else tw[field] = value;
    } else if (key) other[key] = value;
  }

  if (title === undefined && typeof og.title === 'string') title = og.title;
  if (title) md.title = { absolute: title };
  if (Object.keys(og).length) md.openGraph = og as Metadata['openGraph'];
  if (Object.keys(tw).length) md.twitter = tw as Metadata['twitter'];
  if (Object.keys(other).length) md.other = other;
  return md;
}

/**
 * Metadata của một trang công khai: cấu hình SEO riêng (đặt trong trang quản trị) thay thế hoàn toàn bản mặc định,
 * đúng như website cũ. Luôn có canonical và hreflang vi/en theo từng trang.
 */
export async function pageMetadata(opts: { path: string; title?: string; defaults?: MetaTag[] }): Promise<Metadata> {
  const path = opts.path === '/' ? '' : opts.path.replace(/\/+$/, '');
  const key = normalizeSeoUrl(path);
  const custom = await getSeoHtmlByUrl(key);
  const tags = custom ? extractMetaTags(custom) : (opts.defaults ?? DEFAULT_SEO[key] ?? []);
  const md = metaTagsToMetadata(tags);
  // Không có cấu hình SEO riêng: dùng tiêu đề trang (như route.title của website cũ); thẻ og:title chỉ dùng cho chia sẻ.
  if (!custom && opts.title) md.title = { absolute: opts.title };
  else if (!md.title && opts.title) md.title = { absolute: opts.title };
  const url = `${config.appUrl}${path || '/'}`;
  md.alternates = {
    canonical: url,
    languages: { vi: url, en: `${url}?lang=en`, 'x-default': url }
  };
  if (md.openGraph && !md.openGraph.url) (md.openGraph as { url?: string }).url = url;
  return md;
}
