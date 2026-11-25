// Tạo (hoặc đặt lại mật khẩu cho) tài khoản quản trị.
// Chạy: npm run create:admin -- email@domain.com "Tên hiển thị" "mat-khau-moi"
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';

const [email, name, password] = process.argv.slice(2);
if (!email || !name || !password) {
  console.error('Cách dùng: npm run create:admin -- <email> "<tên>" "<mật khẩu (từ 6 ký tự)>"');
  process.exit(1);
}
if (password.length < 6) {
  console.error('Mật khẩu phải có ít nhất 6 ký tự.');
  process.exit(1);
}
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file .env');
  process.exit(1);
}

const removeDiacritics = (text) => text.replace(/đ/g, 'd').replace(/Đ/g, 'D').normalize('NFD').replace(/[̀-ͯ]/g, '');
const db = createClient(url, key, { auth: { persistSession: false } });
const normalized = email.trim().toLowerCase();
const hash = await bcrypt.hash(password, 10);

const { data: existing, error: findError } = await db.from('bk_users').select('id').ilike('email', normalized).maybeSingle();
if (findError) {
  console.error('Không đọc được bảng bk_users:', findError.message);
  process.exit(1);
}

if (existing) {
  const { error } = await db.from('bk_users').update({ password: hash, name }).eq('id', existing.id);
  if (error) throw error;
  console.log(`Đã đặt lại mật khẩu cho ${normalized}.`);
} else {
  const slug = `${removeDiacritics(name).replace(/[^\w-]+/g, '-').toLowerCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const { error } = await db.from('bk_users').insert({ email: normalized, name, password: hash, slug });
  if (error) throw error;
  console.log(`Đã tạo tài khoản quản trị ${normalized}.`);
}
