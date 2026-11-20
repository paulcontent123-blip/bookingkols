import 'server-only';
import { NextResponse } from 'next/server';
import { UnauthorizedError } from './auth';

/** Lỗi nghiệp vụ trả về cho người dùng (có mã HTTP, tên trường và thông báo tiếng Việt). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public field?: string
  ) {
    super(message);
  }
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

/** Chuyển mọi lỗi thành phản hồi JSON { message, field? } với mã HTTP phù hợp; lỗi lạ chỉ ghi log, không lộ chi tiết. */
export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message, field: error.field }, { status: error.status });
  }
  if (error instanceof UnauthorizedError) {
    return NextResponse.json({ message: 'Bạn chưa đăng nhập hoặc phiên đã hết hạn.' }, { status: 401 });
  }
  console.error('[api] Lỗi không mong đợi:', error);
  return NextResponse.json({ message: 'Máy chủ gặp lỗi, vui lòng thử lại sau.' }, { status: 500 });
}
