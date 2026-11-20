import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listUsers } from '@/lib/users';
import { fail, ok } from '@/lib/errors';
import { intParam } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const p = req.nextUrl.searchParams;
    return ok(
      await listUsers({
        name: p.get('name') ?? '',
        email: p.get('email') ?? '',
        pageIndex: intParam(p.get('pageIndex'), 1),
        pageSize: intParam(p.get('pageSize'), 10)
      })
    );
  } catch (error) {
    return fail(error);
  }
}
