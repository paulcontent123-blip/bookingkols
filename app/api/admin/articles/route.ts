import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createArticle, listArticlesAdmin } from '@/lib/articles';
import { fail, ok } from '@/lib/errors';
import { intParam, readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const p = req.nextUrl.searchParams;
    return ok(
      await listArticlesAdmin({
        title: p.get('title') ?? '',
        author: p.get('author') ?? '',
        type: p.get('type') ?? '',
        status: p.get('status') ?? '',
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
    const user = await requireAdmin();
    return ok(await createArticle(await readJson(req), user.id), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
