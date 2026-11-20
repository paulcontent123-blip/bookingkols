import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { listContacts } from '@/lib/contacts';
import { fail, ok } from '@/lib/errors';
import { intParam } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const p = req.nextUrl.searchParams;
    const processed = p.get('isProcessed');
    return ok(
      await listContacts({
        keyword: p.get('keyword') ?? '',
        isProcessed: processed === 'true' ? true : processed === 'false' ? false : undefined,
        pageIndex: intParam(p.get('pageIndex'), 1),
        pageSize: intParam(p.get('pageSize'), 10)
      })
    );
  } catch (error) {
    return fail(error);
  }
}
