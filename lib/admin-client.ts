// Phần gọi API quản trị chạy trên trình duyệt (không import 'server-only').

export class ApiClientError extends Error {
  constructor(
    message: string,
    public status: number,
    public field?: string
  ) {
    super(message);
  }
}

/** Gọi /api/admin/... : trả về `data`, ném ApiClientError khi lỗi. Phiên hết hạn (401) thì chuyển về trang đăng nhập. */
export async function adminFetch<T>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  const res = await fetch(path, {
    ...rest,
    headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
    body: json !== undefined ? JSON.stringify(json) : rest.body
  });
  let payload: { data?: T; message?: string; field?: string } = {};
  try {
    payload = await res.json();
  } catch {
    // phản hồi không phải JSON
  }
  if (res.status === 401 && !path.endsWith('/users/login') && typeof window !== 'undefined') {
    window.location.href = '/admin/login';
  }
  if (!res.ok) throw new ApiClientError(payload.message || 'Có lỗi xảy ra, vui lòng thử lại.', res.status, payload.field);
  return payload.data as T;
}

export function query(params: Record<string, string | number | boolean | undefined | null>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const text = search.toString();
  return text ? `?${text}` : '';
}
