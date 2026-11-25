import 'server-only';
import { config } from './config';
import { getSupabase } from './supabase/server';
import { canonicalArticleSlug } from './slug';
import { imageUrl } from './cloudinary';
import { TABLES } from './db-tables';

/**
 * Sitemap tự động (giống website cũ):
 *  /sitemap.xml         mục lục các sitemap
 *  /sitemap-pages.xml   các trang cố định
 *  /sitemap-news.xml    các bài viết đã xuất bản (chỉ có khi có ít nhất 1 bài)
 * Danh sách bài viết được lưu đệm 1 giờ trong bộ nhớ.
 */

/** Các trang cố định có thật của website (không gồm trang bài viết chi tiết). */
export const STATIC_PAGES = ['/', '/news', '/campaigns', '/our-service', '/about-us', '/contact', '/privacy', '/policy', '/security'];

const SITEMAP_NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const IMAGE_NS = 'http://www.google.com/schemas/sitemap-image/1.1';
const CACHE_TTL_MS = 60 * 60 * 1000;

export interface SitemapArticle {
  slug: string;
  thumbnail?: string;
  lastUpdatedAt?: string;
}

let cache: { expiresAt: number; articles: SitemapArticle[] } | null = null;

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

async function fetchArticles(): Promise<SitemapArticle[]> {
  const { data, error } = await getSupabase()
    .from(TABLES.articles)
    .select('slug, title, thumbnail, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(20000);
  if (error) throw error;
  return (data ?? []).map((r) => ({
    slug: canonicalArticleSlug(r.slug, r.title),
    thumbnail: imageUrl(r.thumbnail),
    lastUpdatedAt: r.updated_at
  }));
}

/**
 * Lấy danh sách bài viết (có lưu đệm). Lỗi mà còn bản cũ thì dùng bản cũ; không có gì thì ném lỗi để
 * KHÔNG trả sitemap rỗng (sitemap rỗng có thể làm Google gỡ bài khỏi chỉ mục).
 */
export async function getSitemapArticles(): Promise<SitemapArticle[]> {
  const now = Date.now();
  if (cache && cache.expiresAt > now) return cache.articles;
  try {
    const articles = (await fetchArticles()).filter((a) => a.slug);
    cache = { expiresAt: now + CACHE_TTL_MS, articles };
    return articles;
  } catch (error) {
    if (cache) {
      console.error('[sitemap] Không lấy được bài viết mới, dùng bản cũ:', error);
      return cache.articles;
    }
    throw error;
  }
}

export function buildIndexXml(includeNews: boolean): string {
  const names = ['sitemap-pages.xml', ...(includeNews ? ['sitemap-news.xml'] : [])];
  const entries = names.map((name) => `  <sitemap>\n    <loc>${escapeXml(`${config.appUrl}/${name}`)}</loc>\n  </sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="${SITEMAP_NS}">\n${entries}\n</sitemapindex>\n`;
}

export function buildPagesXml(): string {
  const entries = STATIC_PAGES.map((path) => `  <url>\n    <loc>${escapeXml(path === '/' ? `${config.appUrl}/` : `${config.appUrl}${path}`)}</loc>\n  </url>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NS}">\n${entries}\n</urlset>\n`;
}

export function buildNewsXml(articles: SitemapArticle[]): string {
  const seen = new Set<string>();
  const entries: string[] = [];
  for (const article of articles) {
    if (seen.has(article.slug)) continue;
    seen.add(article.slug);
    const lines = [`    <loc>${escapeXml(`${config.appUrl}/news/${encodeURIComponent(article.slug)}`)}</loc>`];
    const modified = article.lastUpdatedAt ? new Date(article.lastUpdatedAt) : null;
    if (modified && !Number.isNaN(modified.getTime())) lines.push(`    <lastmod>${modified.toISOString().slice(0, 10)}</lastmod>`);
    if (article.thumbnail && /^https?:\/\//i.test(article.thumbnail)) {
      lines.push(`    <image:image>\n      <image:loc>${escapeXml(article.thumbnail)}</image:loc>\n    </image:image>`);
    }
    entries.push(`  <url>\n${lines.join('\n')}\n  </url>`);
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="${SITEMAP_NS}" xmlns:image="${IMAGE_NS}">\n${entries.join('\n')}\n</urlset>\n`;
}

export function xmlResponse(xml: string, maxAgeSeconds = 3600): Response {
  return new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': `public, max-age=${maxAgeSeconds}` }
  });
}
