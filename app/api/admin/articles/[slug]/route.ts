import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteArticle, getArticleAdmin, updateArticle } from '@/lib/articles';
import { ApiError, fail, ok } from '@/lib/errors';
import { readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    const article = await getArticleAdmin(decodeURIComponent((await params).slug));
    if (!article) throw new ApiError(404, 'Bài viết không tồn tại', 'article');
    return ok(article);
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    return ok(await updateArticle(decodeURIComponent((await params).slug), await readJson(req)));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await deleteArticle(decodeURIComponent((await params).slug));
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}
