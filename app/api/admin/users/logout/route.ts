import { clearSession } from '@/lib/auth';
import { ok } from '@/lib/errors';

export const dynamic = 'force-dynamic';

/** Đăng xuất: xoá cookie phiên đăng nhập. */
export async function DELETE() {
  await clearSession();
  return ok(null);
}
