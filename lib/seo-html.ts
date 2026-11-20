import 'server-only';
import { z } from 'zod';
import { getSupabase } from './supabase/server';
import { ApiError } from './errors';
import { clampPaging, safeKeyword, type Paged } from './articles';

export interface SeoHtmlItem {
  id: string;
  url: string;
  htmlContent: string;
  createdAt: string;
}

/** Địa chỉ trang trong cấu hình SEO được lưu không có dấu "/" đầu (ví dụ "news", "news/ten-bai"); trang chủ là "". */
export function normalizeSeoUrl(url: string): string {
  return (url ?? '').trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

/** Chỉ chấp nhận chuỗi gồm các thẻ <meta> hợp lệ (đúng như backend cũ). */
export function isValidMetaHtml(html: string): boolean {
  if (!html || !html.trim()) return false;
  const tags = [...html.matchAll(/<\s*([^/\s>]+)[^>]*>/gi)];
  if (tags.length === 0) return false;
  for (const tag of tags) {
    if (tag[1].toLowerCase() !== 'meta') return false;
    if (!/\b(name|property|content)\s*=\s*["'][^"']*["']/i.test(tag[0])) return false;
  }
  return true;
}

export async function getSeoHtmlByUrl(url: string): Promise<string | null> {
  try {
    const { data } = await getSupabase()
      .from('seo_html_contents')
      .select('html_content')
      .eq('url', normalizeSeoUrl(url))
      .maybeSingle();
    return data?.html_content || null;
  } catch {
    return null;
  }
}

export async function listSeoHtml(params: { url?: string; pageIndex?: number; pageSize?: number }): Promise<Paged<SeoHtmlItem>> {
  const { pageIndex, pageSize } = clampPaging(params.pageIndex, params.pageSize);
  const url = safeKeyword(params.url);
  let query = getSupabase().from('seo_html_contents').select('id, url, html_content, created_at', { count: 'exact' });
  if (url) query = query.ilike('url', `%${url}%`);
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((pageIndex - 1) * pageSize, pageIndex * pageSize - 1);
  if (error) throw error;
  return {
    items: (data ?? []).map((r) => ({ id: r.id, url: r.url, htmlContent: r.html_content, createdAt: r.created_at })),
    totalCount: count ?? 0,
    pageIndex,
    pageSize
  };
}

const seoBody = z.object({
  url: z.string().max(500).default(''),
  htmlContent: z.string()
});

function parse(input: unknown) {
  const parsed = seoBody.safeParse(input);
  if (!parsed.success) throw new ApiError(400, 'Dữ liệu không hợp lệ');
  if (!isValidMetaHtml(parsed.data.htmlContent)) {
    throw new ApiError(400, 'Nội dung chỉ được gồm các thẻ <meta> hợp lệ', 'htmlContent');
  }
  return { url: normalizeSeoUrl(parsed.data.url), html_content: parsed.data.htmlContent.trim() };
}

export async function createSeoHtml(input: unknown): Promise<void> {
  const row = parse(input);
  const db = getSupabase();
  const exists = await db.from('seo_html_contents').select('id').eq('url', row.url).limit(1).maybeSingle();
  if (exists.data) throw new ApiError(400, 'Đã có cấu hình SEO cho địa chỉ này', 'url');
  const { error } = await db.from('seo_html_contents').insert(row);
  if (error) throw error;
}

export async function getSeoHtmlById(id: string): Promise<SeoHtmlItem | null> {
  const { data } = await getSupabase().from('seo_html_contents').select('id, url, html_content, created_at').eq('id', id).maybeSingle();
  return data ? { id: data.id, url: data.url, htmlContent: data.html_content, createdAt: data.created_at } : null;
}

export async function updateSeoHtml(id: string, input: unknown): Promise<void> {
  const row = parse(input);
  const db = getSupabase();
  const clash = await db.from('seo_html_contents').select('id').eq('url', row.url).neq('id', id).limit(1).maybeSingle();
  if (clash.data) throw new ApiError(400, 'Đã có cấu hình SEO cho địa chỉ này', 'url');
  const { data, error } = await db.from('seo_html_contents').update(row).eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new ApiError(404, 'Không tìm thấy cấu hình SEO');
}

export async function deleteSeoHtml(id: string): Promise<void> {
  const { data, error } = await getSupabase().from('seo_html_contents').delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new ApiError(404, 'Không tìm thấy cấu hình SEO');
}
