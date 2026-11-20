import { NextRequest } from 'next/server';
import { getRelatedArticles } from '@/lib/articles';
import { fail, ok } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    return ok(await getRelatedArticles(decodeURIComponent(slug)));
  } catch (error) {
    return fail(error);
  }
}
