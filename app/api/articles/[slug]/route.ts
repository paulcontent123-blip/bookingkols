import { NextRequest } from 'next/server';
import { getPublishedArticle } from '@/lib/articles';
import { ApiError, fail, ok } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const article = await getPublishedArticle(decodeURIComponent(slug));
    if (!article) throw new ApiError(404, 'Bài viết không tồn tại', 'article');
    return ok(article);
  } catch (error) {
    return fail(error);
  }
}
