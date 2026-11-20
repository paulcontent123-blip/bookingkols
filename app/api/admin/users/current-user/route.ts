import { requireAdmin } from '@/lib/auth';
import { fail, ok } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return ok(await requireAdmin());
  } catch (error) {
    return fail(error);
  }
}
