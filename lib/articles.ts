import 'server-only';
import { z } from 'zod';
import { getSupabase } from './supabase/server';
import { ApiError } from './errors';
import { canonicalArticleSlug, normalizeSlug } from './slug';
import { imageUrl } from './cloudinary';
import { cleanHtml } from './sanitize';
import { collectImagePaths, deleteImages, normalizePublicImageUrls, prepareContentForSave } from './rich-html';

export const ARTICLE_TYPES = ['kol', 'agency', 'project'] as const;
export const ARTICLE_STATUSES = ['published', 'draft'] as const;
export type ArticleType = (typeof ARTICLE_TYPES)[number];
export type ArticleStatus = (typeof ARTICLE_STATUSES)[number];

export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  author: { name: string; slug: string; email?: string };
  createdAt: string;
  lastUpdatedAt: string;
  thumbnail: string;
  /** Giá trị gốc lưu trong DB (mã ảnh), dùng khi sửa bài để lưu lại đúng. */
  thumbnailPath: string;
  type: string;
  status: string;
}

export interface Paged<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
}

interface ArticleRow {
  id: string;
  title: string;
  thumbnail: string;
  slug: string;
  description: string;
  content: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  author?: { name: string; slug: string; email: string } | null;
}

const SELECT = 'id, title, thumbnail, slug, description, content, type, status, created_at, updated_at, author:users(name, slug, email)';

function toArticle(row: ArticleRow, opts: { admin?: boolean; withContent?: boolean } = {}): Article {
  return {
    id: row.id,
    title: row.title,
    slug: canonicalArticleSlug(row.slug, row.title),
    description: row.description,
    content: opts.withContent === false ? '' : normalizePublicImageUrls(cleanHtml(row.content)),
    author: {
      name: row.author?.name ?? '',
      slug: row.author?.slug ?? '',
      ...(opts.admin ? { email: row.author?.email ?? '' } : {})
    },
    createdAt: row.created_at,
    lastUpdatedAt: row.updated_at,
    thumbnail: imageUrl(row.thumbnail),
    thumbnailPath: row.thumbnail,
    type: row.type,
    status: row.status
  };
}

export function clampPaging(pageIndex: unknown, pageSize: unknown, defaultSize = 10) {
  const index = Math.max(1, Math.floor(Number(pageIndex)) || 1);
  let size = Math.floor(Number(pageSize)) || defaultSize;
  if (size < 1) size = defaultSize;
  return { pageIndex: index, pageSize: Math.min(size, 100) };
}

/** Bỏ ký tự đặc biệt của bộ lọc PostgREST/ILIKE khỏi từ khoá tìm kiếm. */
export function safeKeyword(value: string | null | undefined): string {
  return (value ?? '').trim().replace(/[%_*\\,()"']/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100);
}

/**
 * Tìm id bài viết theo đường dẫn mà không nạp cả nội dung:
 * 1) khớp chính xác; 2) khớp dạng chuẩn hoá; 3) so dạng chuẩn hoá của mọi bài (chỉ dành cho slug cũ chưa chuẩn hoá).
 */
async function findIdBySlug(slug: string, onlyPublished: boolean): Promise<string | null> {
  if (!slug || !slug.trim()) return null;
  const db = getSupabase();
  const base = () => {
    const q = db.from('articles').select('id');
    return onlyPublished ? q.eq('status', 'published') : q;
  };

  const exact = await base().eq('slug', slug).limit(1).maybeSingle();
  if (exact.data) return exact.data.id;

  const normalized = normalizeSlug(slug);
  if (!normalized) return null;
  if (normalized !== slug) {
    const second = await base().eq('slug', normalized).limit(1).maybeSingle();
    if (second.data) return second.data.id;
  }

  const rows = await (onlyPublished
    ? db.from('articles').select('id, slug, title').eq('status', 'published')
    : db.from('articles').select('id, slug, title'));
  const found = (rows.data ?? []).find((r) => canonicalArticleSlug(r.slug, r.title) === normalized);
  return found?.id ?? null;
}

async function getById(id: string, admin = false): Promise<Article | null> {
  const { data, error } = await getSupabase().from('articles').select(SELECT).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toArticle(data as unknown as ArticleRow, { admin }) : null;
}

/* ------------------------------ Phía người đọc ------------------------------ */

export async function listPublishedArticles(params: {
  pageIndex?: number;
  pageSize?: number;
  isProject?: boolean;
}): Promise<Paged<Article>> {
  const { pageIndex, pageSize } = clampPaging(params.pageIndex, params.pageSize);
  let query = getSupabase()
    .from('articles')
    .select(SELECT, { count: 'exact' })
    .eq('status', 'published');
  if (params.isProject) query = query.eq('type', 'project');
  const { data, count, error } = await query
    .order('updated_at', { ascending: false })
    .range((pageIndex - 1) * pageSize, pageIndex * pageSize - 1);
  if (error) throw error;
  return {
    items: (data as unknown as ArticleRow[]).map((r) => toArticle(r, { withContent: false })),
    totalCount: count ?? 0,
    pageIndex,
    pageSize
  };
}

export async function getPublishedArticle(slug: string): Promise<Article | null> {
  const id = await findIdBySlug(slug, true);
  return id ? getById(id) : null;
}

export async function getRelatedArticles(slug: string): Promise<Article[]> {
  const id = await findIdBySlug(slug, false);
  if (!id) return [];
  const current = await getSupabase().from('articles').select('id, type').eq('id', id).maybeSingle();
  if (!current.data) return [];
  const { data, error } = await getSupabase()
    .from('articles')
    .select(SELECT)
    .eq('status', 'published')
    .eq('type', current.data.type)
    .neq('id', current.data.id)
    .order('updated_at', { ascending: false })
    .limit(4);
  if (error) throw error;
  return (data as unknown as ArticleRow[]).map((r) => toArticle(r, { withContent: false }));
}

/** Dùng cho sitemap: slug và ngày cập nhật của mọi bài đã xuất bản. */
export async function listPublishedForSitemap(): Promise<{ slug: string; lastUpdatedAt: string }[]> {
  const { data, error } = await getSupabase()
    .from('articles')
    .select('slug, title, updated_at')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })
    .limit(5000);
  if (error) throw error;
  return (data ?? []).map((r) => ({ slug: canonicalArticleSlug(r.slug, r.title), lastUpdatedAt: r.updated_at }));
}

/* ------------------------------ Phía quản trị ------------------------------ */

export async function listArticlesAdmin(params: {
  title?: string;
  author?: string;
  type?: string;
  status?: string;
  pageIndex?: number;
  pageSize?: number;
}): Promise<Paged<Article>> {
  const { pageIndex, pageSize } = clampPaging(params.pageIndex, params.pageSize);
  const author = safeKeyword(params.author);
  const title = safeKeyword(params.title);
  const select = author ? SELECT.replace('author:users(', 'author:users!inner(') : SELECT;
  let query = getSupabase().from('articles').select(select, { count: 'exact' });
  if (params.status && (ARTICLE_STATUSES as readonly string[]).includes(params.status)) query = query.eq('status', params.status);
  if (params.type && (ARTICLE_TYPES as readonly string[]).includes(params.type)) query = query.eq('type', params.type);
  if (title) query = query.ilike('title', `%${title}%`);
  if (author) query = query.ilike('author.name', `%${author}%`);
  const { data, count, error } = await query
    .order('updated_at', { ascending: false })
    .range((pageIndex - 1) * pageSize, pageIndex * pageSize - 1);
  if (error) throw error;
  return {
    items: (data as unknown as ArticleRow[]).map((r) => toArticle(r, { admin: true, withContent: false })),
    totalCount: count ?? 0,
    pageIndex,
    pageSize
  };
}

export async function getArticleAdmin(slug: string): Promise<Article | null> {
  const id = await findIdBySlug(slug, false);
  return id ? getById(id, true) : null;
}

const articleBody = z.object({
  title: z.string().trim().min(1, 'Tiêu đề không được để trống').max(500, 'Tiêu đề tối đa 500 ký tự'),
  description: z.string().trim().min(1, 'Mô tả không được để trống'),
  content: z.string().trim().min(1, 'Nội dung không được để trống'),
  thumbnail: z.string().trim().min(1, 'Ảnh đại diện không được để trống'),
  slug: z.string().optional().default(''),
  type: z.enum(ARTICLE_TYPES, { errorMap: () => ({ message: 'Loại bài viết không hợp lệ' }) }),
  status: z.enum(ARTICLE_STATUSES, { errorMap: () => ({ message: 'Trạng thái không hợp lệ' }) })
});
export type ArticleInput = z.input<typeof articleBody>;

function parseBody(input: unknown) {
  const parsed = articleBody.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApiError(400, issue.message, String(issue.path[0] ?? ''));
  }
  return parsed.data;
}

async function assertSlugAvailable(slug: string, exceptId?: string) {
  const { data, error } = await getSupabase().from('articles').select('id').eq('slug', slug).limit(1).maybeSingle();
  if (error) throw error;
  if (data && data.id !== exceptId) throw new ApiError(400, 'Đường dẫn đã tồn tại, hãy dùng đường dẫn khác', 'slug');
}

export async function createArticle(input: unknown, authorId: string): Promise<Article> {
  const body = parseBody(input);
  const slug = canonicalArticleSlug(body.slug, body.title);
  if (!slug) throw new ApiError(400, 'Đường dẫn không được để trống', 'slug');
  await assertSlugAvailable(slug);
  const content = await prepareContentForSave(body.content, body.title);
  const { data, error } = await getSupabase()
    .from('articles')
    .insert({
      title: body.title,
      description: body.description,
      content,
      thumbnail: body.thumbnail,
      slug,
      type: body.type,
      status: body.status,
      author_id: authorId
    })
    .select('id')
    .single();
  if (error) throw error;
  return (await getById(data.id, true))!;
}

export async function updateArticle(currentSlug: string, input: unknown): Promise<Article> {
  const id = await findIdBySlug(currentSlug, false);
  if (!id) throw new ApiError(404, 'Bài viết không tồn tại', 'article');
  const body = parseBody(input);
  const slug = canonicalArticleSlug(body.slug, body.title);
  if (!slug) throw new ApiError(400, 'Đường dẫn không được để trống', 'slug');
  await assertSlugAvailable(slug, id);
  const content = await prepareContentForSave(body.content, body.title);
  const { error } = await getSupabase()
    .from('articles')
    .update({
      title: body.title,
      description: body.description,
      content,
      thumbnail: body.thumbnail,
      slug,
      type: body.type,
      status: body.status
    })
    .eq('id', id);
  if (error) throw error;
  return (await getById(id, true))!;
}

export async function deleteArticle(slug: string): Promise<void> {
  const id = await findIdBySlug(slug, false);
  if (!id) throw new ApiError(404, 'Bài viết không tồn tại', 'article');
  const db = getSupabase();
  const { data } = await db.from('articles').select('thumbnail, content').eq('id', id).maybeSingle();
  // Xoá bài trước; dọn ảnh trên Cloudinary chỉ là phụ, lỗi Cloudinary không được làm hỏng việc xoá bài.
  const { error } = await db.from('articles').delete().eq('id', id);
  if (error) throw error;
  if (data) await deleteImages(collectImagePaths(data.thumbnail, data.content));
}
