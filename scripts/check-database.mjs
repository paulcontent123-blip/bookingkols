// Kiểm tra kết nối Supabase và các bảng cần có. Chạy: npm run check:db
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key || url.includes('your-project') || key.includes('your-supabase')) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file .env');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });
const tables = ['bk_users', 'bk_articles', 'bk_seo_html_contents', 'bk_contact_requests', 'bk_kols'];
let failed = false;

for (const table of tables) {
  // Đọc thật 1 dòng (không dùng head: kiểu đó có thể không trả lỗi khi bảng không tồn tại).
  const { count, error: readError } = await db.from(table).select('id', { count: 'exact' }).limit(1);
  const error = readError ?? (count === null ? { code: 'PGRST205', message: 'không đếm được dòng (bảng chưa có hoặc khoá không đủ quyền)' } : null);
  if (error) {
    failed = true;
    const missing = error.code === '42P01' || error.code === 'PGRST205' || /does not exist|schema cache/i.test(error.message);
    console.log(`  LỖI  ${table}: ${missing ? 'chưa có bảng (chạy supabase/migrations/20261125000100_bookingkols_schema.sql trong SQL Editor hoặc npm run db:migrate)' : error.message}`);
  } else {
    console.log(`  OK   ${table}: ${count} dòng`);
  }
}

console.log(failed ? '\nCó lỗi, xem các dòng LỖI ở trên.' : '\nKết nối và cấu trúc database đều ổn.');
process.exit(failed ? 1 : 0);
