import { NextRequest } from 'next/server';
import { listPublishedArticles } from '@/lib/articles';
import { fail, ok } from '@/lib/errors';
import { intParam } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const p = req.nextUrl.searchParams;
    return ok(
      await listPublishedArticles({
        pageIndex: intParam(p.get('pageIndex'), 1),
        pageSize: intParam(p.get('pageSize'), 10),
        isProject: p.get('isProject') === 'true'
      })
    );
  } catch (error) {
    return fail(error);
  }
}
