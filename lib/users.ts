import 'server-only';
import { z } from 'zod';
import { getSupabase } from './supabase/server';
import { ApiError } from './errors';
import { hashPassword, verifyPassword } from './auth';
import { generateUserSlug } from './slug';
import { clampPaging, safeKeyword, type Paged } from './articles';

export interface UserItem {
  id: string;
  email: string;
  name: string;
  slug: string;
  createdAt: string;
}

export async function listUsers(params: { name?: string; email?: string; pageIndex?: number; pageSize?: number }): Promise<Paged<UserItem>> {
  const { pageIndex, pageSize } = clampPaging(params.pageIndex, params.pageSize);
  const name = safeKeyword(params.name);
  const email = safeKeyword(params.email);
  let query = getSupabase().from('users').select('id, email, name, slug, created_at', { count: 'exact' });
  if (name) query = query.ilike('name', `%${name}%`);
  if (email) query = query.ilike('email', `%${email}%`);
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((pageIndex - 1) * pageSize, pageIndex * pageSize - 1);
  if (error) throw error;
  return {
    items: (data ?? []).map((u) => ({ id: u.id, email: u.email, name: u.name, slug: u.slug, createdAt: u.created_at })),
    totalCount: count ?? 0,
    pageIndex,
    pageSize
  };
}

const createAdminBody = z.object({
  email: z.string().trim().email('Email không hợp lệ'),
  name: z.string().trim().min(1, 'Tên không được để trống'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});

export async function createAdmin(input: unknown): Promise<void> {
  const parsed = createAdminBody.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApiError(400, issue.message, String(issue.path[0] ?? ''));
  }
  const body = parsed.data;
  const email = body.email.toLowerCase();
  const db = getSupabase();
  const exists = await db.from('users').select('id').ilike('email', email).limit(1).maybeSingle();
  if (exists.data) throw new ApiError(400, 'Email đã tồn tại', 'email');
  const { error } = await db.from('users').insert({
    email,
    name: body.name,
    password: await hashPassword(body.password),
    slug: generateUserSlug(body.name)
  });
  if (error) throw error;
}

const changePasswordBody = z.object({
  oldPassword: z.string().min(1, 'Vui lòng nhập mật khẩu cũ'),
  newPassword: z.string().min(6, 'Mật khẩu mới phải có ít nhất 6 ký tự')
});

/** Đổi mật khẩu: mọi phiên đăng nhập cũ (kể cả của người biết mật khẩu cũ) hết hiệu lực. */
export async function changePassword(userId: string, input: unknown): Promise<{ id: string; password: string }> {
  const parsed = changePasswordBody.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApiError(400, issue.message, String(issue.path[0] ?? ''));
  }
  const db = getSupabase();
  const { data: user } = await db.from('users').select('id, password').eq('id', userId).maybeSingle();
  if (!user) throw new ApiError(401, 'Tài khoản không tồn tại');
  if (!(await verifyPassword(parsed.data.oldPassword, user.password))) {
    throw new ApiError(400, 'Mật khẩu cũ không đúng', 'oldPassword');
  }
  const password = await hashPassword(parsed.data.newPassword);
  const { error } = await db.from('users').update({ password }).eq('id', userId);
  if (error) throw error;
  return { id: userId, password };
}
