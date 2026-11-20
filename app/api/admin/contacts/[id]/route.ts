import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { deleteContact } from '@/lib/contacts';
import { fail, ok } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    await deleteContact((await params).id);
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}
