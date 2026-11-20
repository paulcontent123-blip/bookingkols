import { NextRequest } from 'next/server';
import { getSeoHtmlByUrl } from '@/lib/seo-html';
import { fail, ok } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const html = await getSeoHtmlByUrl(req.nextUrl.searchParams.get('url') ?? '');
    return ok(html ? { htmlContent: html } : null);
  } catch (error) {
    return fail(error);
  }
}
