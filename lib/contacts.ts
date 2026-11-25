import 'server-only';
import { z } from 'zod';
import { getSupabase } from './supabase/server';
import { ApiError } from './errors';
import { sendContactEmail } from './mail';
import { clampPaging, safeKeyword, type Paged } from './articles';
import { TABLES } from './db-tables';

const MAX_PER_PHONE_PER_HOUR = 5;
const MAX_PER_HOUR = 100;

const contactBody = z.object({
  name: z.string().trim().min(1, 'Vui lòng nhập họ tên').max(200),
  phone: z.string().trim().regex(/^[0-9]{10,11}$/, 'Số điện thoại phải gồm 10 hoặc 11 chữ số'),
  email: z.string().trim().max(200).email('Email không hợp lệ').optional().or(z.literal('')),
  message: z.string().trim().min(1, 'Vui lòng nhập nội dung').max(4000),
  /** Ô ẩn chống bot: người thật không thấy nên không bao giờ điền. */
  hpField: z.string().max(500).optional()
});

/** Lưu liên hệ của khách. Giữ nguyên các lớp chống spam của backend cũ. */
export async function submitContact(input: unknown): Promise<void> {
  const parsed = contactBody.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new ApiError(400, issue.message, String(issue.path[0] ?? ''));
  }
  const body = parsed.data;

  // Bot điền cả ô ẩn: giả vờ thành công nhưng không lưu, không gửi email.
  if (body.hpField && body.hpField.trim()) return;

  const db = getSupabase();
  const now = Date.now();

  // Cùng số điện thoại + cùng nội dung trong 10 phút là gửi lặp (bấm nhiều lần): coi như đã nhận.
  const duplicate = await db
    .from(TABLES.contacts)
    .select('id', { count: 'exact', head: true })
    .eq('phone', body.phone)
    .eq('message', body.message)
    .gt('created_at', new Date(now - 10 * 60 * 1000).toISOString());
  if ((duplicate.count ?? 0) > 0) return;

  // Giới hạn chống dội thư rác, không phụ thuộc địa chỉ IP: mỗi số điện thoại 5 lần/giờ, toàn website 100 lần/giờ.
  const since = new Date(now - 60 * 60 * 1000).toISOString();
  const [perPhone, total] = await Promise.all([
    db.from(TABLES.contacts).select('id', { count: 'exact', head: true }).eq('phone', body.phone).gt('created_at', since),
    db.from(TABLES.contacts).select('id', { count: 'exact', head: true }).gt('created_at', since)
  ]);
  if ((perPhone.count ?? 0) >= MAX_PER_PHONE_PER_HOUR || (total.count ?? 0) >= MAX_PER_HOUR) {
    throw new ApiError(429, 'Bạn gửi quá nhiều yêu cầu, vui lòng thử lại sau');
  }

  // Lưu database trước để không mất thông tin khách kể cả khi gửi email lỗi.
  const { error } = await db.from(TABLES.contacts).insert({
    name: body.name,
    phone: body.phone,
    email: body.email ? body.email : null,
    message: body.message,
    is_processed: false
  });
  if (error) throw error;

  try {
    await sendContactEmail({ name: body.name, phone: body.phone, email: body.email || null, message: body.message });
  } catch (mailError) {
    console.error('[contact] Không gửi được email thông báo:', mailError);
  }
}

export interface ContactRequestItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  message: string;
  isProcessed: boolean;
  createdAt: string;
}

export async function listContacts(params: {
  keyword?: string;
  isProcessed?: boolean;
  pageIndex?: number;
  pageSize?: number;
}): Promise<Paged<ContactRequestItem>> {
  const { pageIndex, pageSize } = clampPaging(params.pageIndex, params.pageSize);
  const keyword = safeKeyword(params.keyword);
  let query = getSupabase()
    .from(TABLES.contacts)
    .select('id, name, phone, email, message, is_processed, created_at', { count: 'exact' });
  if (keyword) query = query.or(`name.ilike.%${keyword}%,phone.ilike.%${keyword}%,email.ilike.%${keyword}%`);
  if (typeof params.isProcessed === 'boolean') query = query.eq('is_processed', params.isProcessed);
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .range((pageIndex - 1) * pageSize, pageIndex * pageSize - 1);
  if (error) throw error;
  return {
    items: (data ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      phone: r.phone,
      email: r.email,
      message: r.message,
      isProcessed: r.is_processed,
      createdAt: r.created_at
    })),
    totalCount: count ?? 0,
    pageIndex,
    pageSize
  };
}

export async function setContactProcessed(id: string, isProcessed: boolean): Promise<void> {
  const { data, error } = await getSupabase()
    .from(TABLES.contacts)
    .update({ is_processed: isProcessed })
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data?.length) throw new ApiError(404, 'Không tìm thấy yêu cầu liên hệ');
}

export async function deleteContact(id: string): Promise<void> {
  const { data, error } = await getSupabase().from(TABLES.contacts).delete().eq('id', id).select('id');
  if (error) throw error;
  if (!data?.length) throw new ApiError(404, 'Không tìm thấy yêu cầu liên hệ');
}
