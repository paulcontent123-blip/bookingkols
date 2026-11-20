// Tạo các bảng trên Supabase bằng dòng lệnh (thay cho việc dán SQL vào SQL Editor).
// Cần SUPABASE_DB_URL trong .env: chuỗi kết nối PostgreSQL của project (Supabase -> Connect -> Session pooler -> URI).
// Chạy: npm run db:migrate   (an toàn khi chạy lại: dùng "if not exists"; mọi thay đổi nằm trong một giao dịch)
import fs from 'node:fs';
import path from 'node:path';
import pg from 'pg';

const url = process.env.SUPABASE_DB_URL;
if (!url || /\[YOUR-PASSWORD\]|your-/i.test(url)) {
  console.error('Thiếu SUPABASE_DB_URL trong .env (hoặc còn chữ [YOUR-PASSWORD]). Xem hướng dẫn trong README.md.');
  process.exit(1);
}

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const client = new pg.Client({ connectionString: url, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  for (const file of files) {
    process.stdout.write(`  ${file} ... `);
    await client.query('BEGIN');
    try {
      await client.query(fs.readFileSync(path.join(dir, file), 'utf8'));
      await client.query('COMMIT');
      console.log('xong');
    } catch (error) {
      await client.query('ROLLBACK');
      // Chạy lại khi trigger đã tồn tại: coi như đã áp dụng trước đó.
      if (error.code === '42710') console.log('đã có từ trước, bỏ qua');
      else throw error;
    }
  }
  // Báo cho PostgREST nạp lại danh sách bảng để API thấy ngay.
  await client.query("NOTIFY pgrst, 'reload schema'");
  console.log('\nHoàn tất. Chạy "npm run check:db" để xác nhận.');
} catch (error) {
  console.error('\nLỖI:', error.message);
  if (/ENOTFOUND|ETIMEDOUT|ENETUNREACH/.test(String(error.code ?? error.message))) {
    console.error('Gợi ý: dùng chuỗi "Session pooler" (hỗ trợ IPv4) thay vì "Direct connection".');
  }
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
