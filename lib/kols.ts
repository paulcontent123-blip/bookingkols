import 'server-only';
import { z } from 'zod';
import { getSupabase } from './supabase/server';
import { ApiError } from './errors';
import { clampPaging, safeKeyword, type Paged } from './articles';
import { deleteImage } from './cloudinary';
import { kolCardImage, kolSquareImage } from './kol-image';
import { normalizeSlug } from './slug';
import { KOL_FIELD_KEYS } from './kol-fields';
import { POPULAR_KOLS, TOP_PROFILES, type KolProfile, type TopProfile } from './home-data';

// Danh sách công khai KHÔNG đọc cột is_featured: trang chủ vẫn chạy bình thường kể cả khi chưa chạy migration thêm cột đó.
const COLUMNS =
  'id, slug, name, nickname, avatar, province, fields, tiktok_url, tiktok_followers, facebook_url, facebook_followers, youtube_url, youtube_followers, instagram_url, instagram_followers, sort_order, is_published, created_at';
const ADMIN_COLUMNS = `${COLUMNS}, is_featured`;

/** Số KOL mỗi trang ở trang chủ: 8 = 2 hàng × 4 cột. */
export const KOL_PAGE_SIZE = 8;

interface KolRow {
  id: string;
  slug: string;
  name: string;
  nickname: string;
  avatar: string;
  province: string;
  fields: string[] | null;
  tiktok_url: string | null;
  tiktok_followers: string | null;
  facebook_url: string | null;
  facebook_followers: string | null;
  youtube_url: string | null;
  youtube_followers: string | null;
  instagram_url: string | null;
  instagram_followers: string | null;
  sort_order: number;
  is_published: boolean;
  is_featured?: boolean;
  created_at: string;
}

/** Dạng trả về cho trang quản trị (kèm giá trị gốc của ảnh để lưu lại đúng khi sửa). */
export interface KolAdminItem {
  id: string;
  slug: string;
  name: string;
  nickname: string;
  avatar: string;
  avatarPath: string;
  province: string;
  fields: string[];
  tiktokUrl: string;
  tiktokFollowers: string;
  facebookUrl: string;
  facebookFollowers: string;
  youtubeUrl: string;
  youtubeFollowers: string;
  instagramUrl: string;
  instagramFollowers: string;
  sortOrder: number;
  isPublished: boolean;
  isFeatured: boolean;
  createdAt: string;
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const assertId = (id: string) => {
  if (!UUID.test(id)) throw new ApiError(404, 'Không tìm thấy KOL');
};

const text = (value: string | null | undefined) => value ?? '';

function toAdminItem(r: KolRow): KolAdminItem {
  return {
    id: r.id,
    slug: r.slug,
    name: r.name,
    nickname: r.nickname,
    avatar: kolCardImage(r.avatar),
    avatarPath: r.avatar,
    province: r.province,
    fields: r.fields ?? [],
    tiktokUrl: text(r.tiktok_url),
    tiktokFollowers: text(r.tiktok_followers),
    facebookUrl: text(r.facebook_url),
    facebookFollowers: text(r.facebook_followers),
    youtubeUrl: text(r.youtube_url),
    youtubeFollowers: text(r.youtube_followers),
    instagramUrl: text(r.instagram_url),
    instagramFollowers: text(r.instagram_followers),
    sortOrder: r.sort_order,
    isPublished: r.is_published,
    isFeatured: Boolean(r.is_featured),
    createdAt: r.created_at
  };
}

function toProfile(r: KolRow): KolProfile {
  return {
    userId: r.id,
    slug: r.slug,
    name: r.name,
    nickname: r.nickname,
    fields: r.fields ?? [],
    province: r.province,
    avatar: kolCardImage(r.avatar),
    socialNetworkInfo: {
      facebookUrl: r.facebook_url,
      facebookFollowerCount: r.facebook_followers,
      youtubeUrl: r.youtube_url,
      youtubeFollowerCount: r.youtube_followers,
      tiktokUrl: r.tiktok_url,
      tiktokFollowerCount: r.tiktok_followers,
      instagramUrl: r.instagram_url,
      instagramFollowerCount: r.instagram_followers
    }
  };
}

/**
 * KOL hiển thị ở trang chủ, theo thứ tự đã sắp trong trang quản trị.
 * Chỉ khi không đọc được database (ví dụ chưa chạy migration bảng kols) mới dùng danh sách dự phòng gõ cứng,
 * để trang chủ không bị trống; danh sách rỗng hợp lệ (đã ẩn/xoá hết) thì giữ nguyên là rỗng.
 */
export async function listPublishedKols(params: { pageIndex?: number; pageSize?: number } = {}): Promise<Paged<KolProfile>> {
  const { pageIndex, pageSize } = clampPaging(params.pageIndex, params.pageSize ?? KOL_PAGE_SIZE, KOL_PAGE_SIZE);
  const fetchPage = async (page: number) => {
    const { data, count, error } = await getSupabase()
      .from('kols')
      .select(COLUMNS, { count: 'exact' })
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .range((page - 1) * pageSize, page * pageSize - 1);
    if (error) throw error;
    return { rows: data as KolRow[], total: count ?? 0 };
  };
  try {
    let page = pageIndex;
    let { rows, total } = await fetchPage(page);
    // Trang yêu cầu vượt quá số trang hiện có (ví dụ vừa xoá/ẩn bớt KOL): lấy trang cuối thay vì hiện trống.
    if (rows.length === 0 && total > 0 && page > 1) {
      page = Math.ceil(total / pageSize);
      ({ rows, total } = await fetchPage(page));
    }
    return { items: rows.map(toProfile), totalCount: total, pageIndex: page, pageSize };
  } catch (error) {
    console.error('[kols] Không đọc được bảng kols, dùng danh sách dự phòng:', error);
    return {
      items: POPULAR_KOLS.slice((pageIndex - 1) * pageSize, pageIndex * pageSize),
      totalCount: POPULAR_KOLS.length,
      pageIndex,
      pageSize
    };
  }
}

/**
 * KOL nổi bật cho mục "Top profile" (đã bật hiển thị và tick "Nổi bật"), theo thứ tự đã sắp.
 * Lỗi database (ví dụ chưa chạy migration thêm cột is_featured) thì dùng danh sách dự phòng gõ cứng.
 */
export async function listFeaturedKols(): Promise<TopProfile[]> {
  try {
    const { data, error } = await getSupabase()
      .from('kols')
      .select('id, slug, name, fields, province, avatar')
      .eq('is_featured', true)
      .eq('is_published', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });
    if (error) throw error;
    return (data as Pick<KolRow, 'id' | 'slug' | 'name' | 'fields' | 'province' | 'avatar'>[]).map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      fields: r.fields ?? [],
      province: r.province,
      role: 'KOL',
      avatar: kolSquareImage(r.avatar),
      totalJob: 0
    }));
  } catch (error) {
    console.error('[kols] Không đọc được KOL nổi bật, dùng danh sách dự phòng:', error);
    return TOP_PROFILES;
  }
}

export async function listKolsAdmin(params: { name?: string; pageIndex?: number; pageSize?: number }): Promise<Paged<KolAdminItem>> {
  const { pageIndex, pageSize } = clampPaging(params.pageIndex, params.pageSize);
  const keyword = safeKeyword(params.name);
  let query = getSupabase().from('kols').select(ADMIN_COLUMNS, { count: 'exact' });
  if (keyword) query = query.or(`name.ilike.%${keyword}%,nickname.ilike.%${keyword}%`);
  const { data, count, error } = await query
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })
    .range((pageIndex - 1) * pageSize, pageIndex * pageSize - 1);
  if (error) throw error;
  return { items: (data as KolRow[]).map(toAdminItem), totalCount: count ?? 0, pageIndex, pageSize };
}

export async function getKolAdmin(id: string): Promise<KolAdminItem | null> {
  assertId(id);
  const { data, error } = await getSupabase().from('kols').select(ADMIN_COLUMNS).eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? toAdminItem(data as KolRow) : null;
}

// ---- Kiểm tra dữ liệu gửi lên ----

const optionalUrl = z
  .string()
  .trim()
  .max(500, 'Đường dẫn quá dài')
  .refine((v) => v === '' || /^https?:\/\/\S+$/i.test(v), 'Phải là địa chỉ bắt đầu bằng http:// hoặc https://');
const optionalCount = z.string().trim().max(30, 'Tối đa 30 ký tự');

const kolBody = z.object({
  name: z.string().trim().min(1, 'Tên KOL không được để trống').max(200, 'Tên quá dài'),
  nickname: z.string().trim().max(200, 'Biệt danh quá dài').default(''),
  slug: z.string().trim().max(200).default(''),
  avatar: z.string().trim().min(1, 'Vui lòng chọn ảnh đại diện').max(1000),
  province: z.string().trim().max(100, 'Tối đa 100 ký tự').default(''),
  fields: z.array(z.enum(KOL_FIELD_KEYS, { errorMap: () => ({ message: 'Lĩnh vực không hợp lệ' }) })).max(KOL_FIELD_KEYS.length).default([]),
  tiktokUrl: optionalUrl.default(''),
  tiktokFollowers: optionalCount.default(''),
  facebookUrl: optionalUrl.default(''),
  facebookFollowers: optionalCount.default(''),
  youtubeUrl: optionalUrl.default(''),
  youtubeFollowers: optionalCount.default(''),
  instagramUrl: optionalUrl.default(''),
  instagramFollowers: optionalCount.default(''),
  sortOrder: z.coerce.number({ invalid_type_error: 'Thứ tự phải là số' }).int('Thứ tự phải là số nguyên').min(0, 'Thứ tự không được âm').max(100000).default(0),
  isPublished: z.boolean().default(true),
  isFeatured: z.boolean().default(false)
});

function parseBody(input: unknown) {
  const parsed = kolBody.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApiError(400, issue.message, String(issue.path[0] ?? ''));
  }
  const b = parsed.data;
  const slug = normalizeSlug(b.slug, b.name);
  if (!slug) throw new ApiError(400, 'Đường dẫn không được để trống', 'slug');
  const orNull = (v: string) => (v === '' ? null : v);
  return {
    slug,
    name: b.name,
    nickname: b.nickname,
    avatar: b.avatar,
    province: b.province,
    fields: [...new Set(b.fields)],
    tiktok_url: orNull(b.tiktokUrl),
    tiktok_followers: orNull(b.tiktokFollowers),
    facebook_url: orNull(b.facebookUrl),
    facebook_followers: orNull(b.facebookFollowers),
    youtube_url: orNull(b.youtubeUrl),
    youtube_followers: orNull(b.youtubeFollowers),
    instagram_url: orNull(b.instagramUrl),
    instagram_followers: orNull(b.instagramFollowers),
    sort_order: b.sortOrder,
    is_published: b.isPublished,
    is_featured: b.isFeatured
  };
}

async function assertSlugAvailable(slug: string, exceptId?: string) {
  const { data, error } = await getSupabase().from('kols').select('id').eq('slug', slug).limit(1).maybeSingle();
  if (error) throw error;
  if (data && data.id !== exceptId) throw new ApiError(400, 'Đường dẫn đã tồn tại, hãy dùng đường dẫn khác', 'slug');
}

/** Dọn ảnh trên Cloudinary chỉ là phụ: lỗi ở đây không được làm hỏng thao tác lưu/xoá đã thành công. */
async function removeImageQuietly(path: string) {
  try {
    await deleteImage(path);
  } catch (error) {
    console.error('[kols] Không xoá được ảnh cũ trên Cloudinary:', error);
  }
}

export async function createKol(input: unknown): Promise<KolAdminItem> {
  const row = parseBody(input);
  await assertSlugAvailable(row.slug);
  const { data, error } = await getSupabase().from('kols').insert(row).select(ADMIN_COLUMNS).single();
  if (error) {
    // Hai người cùng lưu một đường dẫn gần như đồng thời: chỉ mục duy nhất của database chặn lại.
    if ((error as { code?: string }).code === '23505') throw new ApiError(400, 'Đường dẫn đã tồn tại, hãy dùng đường dẫn khác', 'slug');
    throw error;
  }
  return toAdminItem(data as KolRow);
}

export async function updateKol(id: string, input: unknown): Promise<KolAdminItem> {
  assertId(id);
  const db = getSupabase();
  const current = await db.from('kols').select('avatar').eq('id', id).maybeSingle();
  if (current.error) throw current.error;
  if (!current.data) throw new ApiError(404, 'Không tìm thấy KOL');
  const row = parseBody(input);
  await assertSlugAvailable(row.slug, id);
  const { data, error } = await db.from('kols').update(row).eq('id', id).select(ADMIN_COLUMNS).single();
  if (error) {
    if ((error as { code?: string }).code === '23505') throw new ApiError(400, 'Đường dẫn đã tồn tại, hãy dùng đường dẫn khác', 'slug');
    throw error;
  }
  if (current.data.avatar && current.data.avatar !== row.avatar) await removeImageQuietly(current.data.avatar);
  return toAdminItem(data as KolRow);
}

export async function deleteKol(id: string): Promise<void> {
  assertId(id);
  const db = getSupabase();
  const { data, error } = await db.from('kols').delete().eq('id', id).select('avatar');
  if (error) throw error;
  if (!data?.length) throw new ApiError(404, 'Không tìm thấy KOL');
  if (data[0].avatar) await removeImageQuietly(data[0].avatar);
}
