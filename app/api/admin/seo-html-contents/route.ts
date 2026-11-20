import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createSeoHtml, listSeoHtml } from '@/lib/seo-html';
import { fail, ok } from '@/lib/errors';
import { intParam, readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const p = req.nextUrl.searchParams;
    return ok(
      await listSeoHtml({
        url: p.get('url') ?? '',
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
    await createSeoHtml(await readJson(req));
    return ok(null, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
