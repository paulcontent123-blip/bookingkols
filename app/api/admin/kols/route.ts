import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createKol, listKolsAdmin } from '@/lib/kols';
import { fail, ok } from '@/lib/errors';
import { intParam, readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const p = req.nextUrl.searchParams;
    return ok(
      await listKolsAdmin({
        name: p.get('name') ?? '',
        pageIndex: intParam(p.get('pageIndex'), 1),
        pageSize: intParam(p.get('pageSize'), 10)
      })
    );
  } catch (error) {
    return fail(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    return ok(await createKol(await readJson(req)), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
