import { NextRequest } from 'next/server';
import { submitContact } from '@/lib/contacts';
import { fail, ok } from '@/lib/errors';
import { readJson } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    await submitContact(await readJson(req));
    return ok(null);
  } catch (error) {
    return fail(error);
  }
}
