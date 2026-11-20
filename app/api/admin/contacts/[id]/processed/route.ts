import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { setContactProcessed } from '@/lib/contacts';
import { fail, ok } from '@/lib/errors';
import { readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const body = (await readJson(req)) as { isProcessed?: boolean };
    await setContactProcessed((await params).id, body.isProcessed !== false);
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}
