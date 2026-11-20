// Chép dữ liệu từ database PostgreSQL cũ (hệ thống .NET) sang Supabase: người dùng (giữ nguyên mật khẩu băm),
// bài viết, cấu hình SEO, liên hệ. Giữ nguyên id và ngày tạo. Có thể chạy lại nhiều lần (ghi đè theo id).
// Chạy: OLD_DATABASE_URL="postgres://user:pass@host:5433/bookingkol" npm run import:old-db
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';

const oldUrl = process.env.OLD_DATABASE_URL;
const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!oldUrl) {
  console.error('Thiếu OLD_DATABASE_URL (chuỗi kết nối database PostgreSQL cũ).');
  process.exit(1);
}
if (!url || !key) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY trong file .env');
  process.exit(1);
}

const old = new pg.Client({ connectionString: oldUrl });
await old.connect();
const db = createClient(url, key, { auth: { persistSession: false } });

async function copy(label, sql, map, table, onConflict = 'id') {
  const { rows } = await old.query(sql);
  const items = rows.map(map);
  if (items.length === 0) {
    console.log(`  ${label}: không có dòng nào`);
    return;
  }
  for (let i = 0; i < items.length; i += 200) {
    const { error } = await db.from(table).upsert(items.slice(i, i + 200), { onConflict });
    if (error) throw new Error(`${label}: ${error.message}`);
  }
  console.log(`  ${label}: đã chép ${items.length} dòng`);
}

console.log('Đang chép dữ liệu...');
await copy(
  'users',
  'SELECT "Id","Email","Name","Password","Slug","CreatedAt","LastUpdatedAt" FROM "user"."User"',
  (r) => ({ id: r.Id, email: String(r.Email).toLowerCase(), name: r.Name ?? '', password: r.Password, slug: r.Slug ?? '', created_at: r.CreatedAt, updated_at: r.LastUpdatedAt }),
  'users'
);
await copy(
  'articles',
  'SELECT "Id","Title","Thumbnail","Slug","Description","Content","AuthorId","Type","Status","CreatedAt","LastUpdatedAt" FROM article."Article"',
  (r) => ({ id: r.Id, title: r.Title, thumbnail: r.Thumbnail ?? '', slug: r.Slug, description: r.Description ?? '', content: r.Content ?? '', author_id: r.AuthorId, type: r.Type, status: r.Status, created_at: r.CreatedAt, updated_at: r.LastUpdatedAt }),
  'articles'
);
await copy(
  'seo_html_contents',
  'SELECT "Id","Url","HtmlContent","CreatedAt","LastUpdatedAt" FROM config."SeoHtmlContent"',
  (r) => ({ id: r.Id, url: String(r.Url ?? '').replace(/^\/+|\/+$/g, ''), html_content: r.HtmlContent ?? '', created_at: r.CreatedAt, updated_at: r.LastUpdatedAt }),
  'seo_html_contents'
);
try {
  await copy(
    'contact_requests',
    'SELECT "Id","Name","Phone","Email","Message","IsProcessed","CreatedAt","LastUpdatedAt" FROM contact."ContactRequest"',
    (r) => ({ id: r.Id, name: r.Name, phone: r.Phone, email: r.Email, message: r.Message, is_processed: r.IsProcessed, created_at: r.CreatedAt, updated_at: r.LastUpdatedAt }),
    'contact_requests'
  );
} catch (error) {
  console.log('  contact_requests: bỏ qua (', error.message, ')');
}

await old.end();
console.log('Xong. Chạy "npm run check:db" để kiểm tra số dòng trên Supabase.');
