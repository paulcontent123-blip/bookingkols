import 'server-only';
import { NextRequest } from 'next/server';
import { ApiError } from './errors';

/** Đọc JSON của yêu cầu; lỗi cú pháp trả về 400 thay vì 500. */
export async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ApiError(400, 'Dữ liệu gửi lên không hợp lệ');
  }
}

export function clientIp(req: NextRequest): string {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

export function intParam(value: string | null, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback;
}
