import { NextRequest } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createAdmin } from '@/lib/users';
import { fail, ok } from '@/lib/errors';
import { readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await createAdmin(await readJson(req));
    return ok(null, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
