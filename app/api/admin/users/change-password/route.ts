import { NextRequest } from 'next/server';
import { requireAdmin, setSession } from '@/lib/auth';
import { changePassword } from '@/lib/users';
import { fail, ok } from '@/lib/errors';
import { readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin();
    const updated = await changePassword(user.id, await readJson(req));
    // Phiên cũ hết hiệu lực; cấp phiên mới cho chính người vừa đổi mật khẩu để họ không bị đăng xuất.
    await setSession(updated);
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}
