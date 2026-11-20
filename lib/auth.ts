import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { config } from './config';
import { getSupabase } from './supabase/server';

export const SESSION_COOKIE = 'bk_admin';
const SESSION_HOURS = 12;

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  slug: string;
}

function secretKey(): Uint8Array {
  if (config.jwtSecret.length < 16) {
    throw new Error('JWT_SECRET chưa được cấu hình (cần chuỗi bí mật dài, ngẫu nhiên, ít nhất 16 ký tự).');
  }
  return new TextEncoder().encode(config.jwtSecret);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Tương thích với mật khẩu băm bcrypt của hệ thống .NET cũ ($2a$ / $2b$). */
export async function verifyPassword(plain: string, hashed: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hashed);
  } catch {
    return false;
  }
}

// "pv" = dấu vân tay của mật khẩu: đổi mật khẩu thì mọi phiên đăng nhập cũ hết hiệu lực.
const fingerprint = (passwordHash: string) => passwordHash.slice(-12);

export async function setSession(user: { id: string; password: string }) {
  const token = await new SignJWT({ pv: fingerprint(user.password) })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(secretKey());
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_HOURS * 3600
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

/** Người đang đăng nhập (đối chiếu lại database mỗi lần), hoặc null. */
export async function getSession(): Promise<AdminUser | null> {
  try {
    const token = (await cookies()).get(SESSION_COOKIE)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub) return null;
    const { data } = await getSupabase()
      .from('users')
      .select('id, email, name, slug, password')
      .eq('id', payload.sub)
      .maybeSingle();
    if (!data || fingerprint(data.password) !== payload.pv) return null;
    return { id: data.id, email: data.email, name: data.name, slug: data.slug };
  } catch {
    return null;
  }
}

export class UnauthorizedError extends Error {
  constructor() {
    super('UNAUTHORIZED');
  }
}

export async function requireAdmin(): Promise<AdminUser> {
  const user = await getSession();
  if (!user) throw new UnauthorizedError();
  return user;
}

// Giới hạn đăng nhập sai (trong bộ nhớ của tiến trình): 8 lần / 15 phút cho mỗi email + địa chỉ IP.
const attempts = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function isLoginBlocked(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.first > WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordLoginFailure(key: string) {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.first > WINDOW_MS) attempts.set(key, { count: 1, first: Date.now() });
  else entry.count += 1;
}

export function clearLoginFailures(key: string) {
  attempts.delete(key);
}
