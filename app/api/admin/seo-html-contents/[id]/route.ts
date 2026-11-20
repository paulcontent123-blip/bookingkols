import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteSeoHtml, getSeoHtmlById, updateSeoHtml } from '@/lib/seo-html';
import { ApiError, fail, ok } from '@/lib/errors';
import { readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    const item = await getSeoHtmlById((await params).id);
    if (!item) throw new ApiError(404, 'Không tìm thấy cấu hình SEO');
    return ok(item);
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await updateSeoHtml((await params).id, await readJson(req));
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await deleteSeoHtml((await params).id);
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}
