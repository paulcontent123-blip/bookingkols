import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteKol, getKolAdmin, updateKol } from '@/lib/kols';
import { ApiError, fail, ok } from '@/lib/errors';
import { readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';
type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    const item = await getKolAdmin((await params).id);
    if (!item) throw new ApiError(404, 'Không tìm thấy KOL');
    return ok(item);
  } catch (error) {
    return fail(error);
  }
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    return ok(await updateKol((await params).id, await readJson(req)));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    await requireAdmin();
    await deleteKol((await params).id);
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}
