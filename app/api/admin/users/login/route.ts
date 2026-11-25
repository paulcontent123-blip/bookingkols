import { NextRequest } from 'next/server';
import { clearLoginFailures, isLoginBlocked, recordLoginFailure, setSession, verifyPassword } from '@/lib/auth';
import { ApiError, fail, ok } from '@/lib/errors';
import { clientIp, readJson } from '@/lib/api';
import { getSupabase } from '@/lib/supabase/server';
import { TABLES } from '@/lib/db-tables';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = (await readJson(req)) as { email?: string; password?: string };
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');
    const key = `${clientIp(req)}|${email}`;
    if (isLoginBlocked(key)) throw new ApiError(429, 'Đăng nhập sai quá nhiều lần, vui lòng thử lại sau 15 phút');
    if (!email || !password) throw new ApiError(400, 'Vui lòng nhập email và mật khẩu');

    const { data: user } = await getSupabase()
      .from(TABLES.users)
      .select('id, email, name, slug, password')
      .ilike('email', email)
      .limit(1)
      .maybeSingle();
    if (!user) {
      recordLoginFailure(key);
      throw new ApiError(401, 'Email không tồn tại', 'email');
    }
    if (!(await verifyPassword(password, user.password))) {
      recordLoginFailure(key);
      throw new ApiError(401, 'Mật khẩu không đúng', 'password');
    }
    clearLoginFailures(key);
    await setSession(user);
    return ok({ id: user.id, email: user.email, name: user.name, slug: user.slug });
  } catch (error) {
    return fail(error);
  }
}
