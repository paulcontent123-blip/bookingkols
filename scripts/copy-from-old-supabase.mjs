// Chép dữ liệu BookingKols từ database Supabase CŨ (bảng tên cũ: users, articles, seo_html_contents, contact_requests, kols)
// sang database MỚI (bảng có tiền tố bk_: bk_users, bk_articles, ...). Dùng khi đổi sang Supabase dùng chung với dự án khác.
//
// Cách dùng:
//   1. Đổi SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env sang database MỚI, rồi chạy migration:  npm run db:migrate
//   2. Đặt khoá database CŨ vào biến môi trường (không ghi vào .env) và chạy thử (mặc định chỉ ĐẾM, không ghi gì):
//        $env:OLD_SUPABASE_URL="https://xxxx.supabase.co"; $env:OLD_SUPABASE_SERVICE_ROLE_KEY="..."; npm run copy:old-supabase
//   3. Số liệu đúng thì chạy thật:  npm run copy:old-supabase -- --apply
//
// Giữ nguyên id, mật khẩu băm và ngày tạo. Chỉ ĐỌC database cũ, không sửa gì ở đó. Chạy lại nhiều lần an toàn (ghi đè theo id).
import { createClient } from '@supabase/supabase-js';

const apply = process.argv.includes('--apply');
const { OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
if (!OLD_SUPABASE_URL || !OLD_SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Thiếu OLD_SUPABASE_URL / OLD_SUPABASE_SERVICE_ROLE_KEY (khoá database CŨ). Xem hướng dẫn ở đầu file scripts/copy-from-old-supabase.mjs.');
  process.exit(1);
}
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Thiếu SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (database MỚI) trong .env');
  process.exit(1);
}

const src = createClient(OLD_SUPABASE_URL, OLD_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const dst = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
console.log(`Nguồn (CŨ):  ${new URL(OLD_SUPABASE_URL).host}`);
console.log(`Đích (MỚI):  ${new URL(SUPABASE_URL).host}`);
console.log(apply ? 'Chế độ: GHI THẬT (--apply)\n' : 'Chế độ: CHẠY THỬ (chỉ đếm, không ghi gì)\n');

// Thứ tự quan trọng: bk_articles tham chiếu bk_users.
const PLAN = [
  { from: 'users', to: 'bk_users', key: 'email', normalize: (v) => String(v ?? '').toLowerCase(), cols: ['id', 'email', 'name', 'password', 'slug', 'created_at', 'updated_at'] },
  {
    from: 'articles',
    to: 'bk_articles',
    key: 'slug',
    cols: ['id', 'title', 'thumbnail', 'slug', 'description', 'content', 'author_id', 'type', 'status', 'created_at', 'updated_at']
  },
  { from: 'seo_html_contents', to: 'bk_seo_html_contents', key: 'url', cols: ['id', 'url', 'html_content', 'created_at', 'updated_at'] },
  { from: 'contact_requests', to: 'bk_contact_requests', key: null, cols: ['id', 'name', 'phone', 'email', 'message', 'is_processed', 'created_at', 'updated_at'] },
  {
    from: 'kols',
    to: 'bk_kols',
    key: 'slug',
    cols: [
      'id', 'slug', 'name', 'nickname', 'avatar', 'province', 'fields', 'tiktok_url', 'tiktok_followers', 'facebook_url', 'facebook_followers',
      'youtube_url', 'youtube_followers', 'instagram_url', 'instagram_followers', 'sort_order', 'is_published', 'is_featured', 'created_at', 'updated_at'
    ],
    defaults: { is_featured: false }
  }
];

async function readAll(table) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await src.from(table).select('*').order('created_at', { ascending: true }).range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) break;
  }
  return rows;
}

let problems = 0;
for (const step of PLAN) {
  let rows;
  try {
    rows = await readAll(step.from);
  } catch (error) {
    console.log(`  BỎ QUA  ${step.from}: không đọc được ở database cũ (${error.message})`);
    continue;
  }
  const items = rows.map((r) => {
    const out = {};
    for (const c of step.cols) if (r[c] !== undefined) out[c] = r[c];
    for (const [k, v] of Object.entries(step.defaults ?? {})) if (out[k] === undefined) out[k] = v;
    if (step.key === 'email') out.email = String(out.email ?? '').toLowerCase();
    return out;
  });

  const { count: before, error: countError } = await dst.from(step.to).select('id', { count: 'exact', head: true });
  if (countError) {
    problems++;
    console.log(`  LỖI  ${step.to}: bảng chưa có ở database mới? Hãy chạy "npm run db:migrate" trước. (${countError.message})`);
    continue;
  }

  // Dòng đã có ở đích nhưng khác id mà trùng khoá tự nhiên (email / slug / url) sẽ vướng chỉ mục duy nhất:
  // đó là cùng một thứ (ví dụ KOL nạp sẵn bởi migration, tài khoản admin tạo tay), nên thay bằng bản từ database cũ.
  let clashes = [];
  if (step.key && items.length > 0) {
    const keys = new Set(items.map((i) => i[step.key]));
    const ids = new Set(items.map((i) => i.id));
    // Đọc khoá của cả bảng đích (nhỏ) thay vì dùng .in(): .in() không khớp được chuỗi rỗng (cấu hình SEO của trang chủ có url = '').
    const { data, error } = await dst.from(step.to).select(`id, ${step.key}`).range(0, 9999);
    if (error) throw new Error(`${step.to}: ${error.message}`);
    const norm = (v) => (step.key === 'email' ? String(v ?? '').toLowerCase() : v);
    clashes = data.filter((d) => keys.has(norm(d[step.key])) && !ids.has(d.id));
  }

  console.log(`  ${step.from.padEnd(20)} -> ${step.to.padEnd(22)} nguồn ${String(items.length).padStart(4)} dòng, đích đang có ${before}, trùng khoá khác id: ${clashes.length}`);
  if (!apply || items.length === 0) continue;

  for (const c of clashes) {
    const { error } = await dst.from(step.to).delete().eq('id', c.id);
    if (error) throw new Error(`${step.to}: không xoá được dòng trùng ${c[step.key]}: ${error.message}`);
  }
  for (let i = 0; i < items.length; i += 200) {
    const { error } = await dst.from(step.to).upsert(items.slice(i, i + 200), { onConflict: 'id' });
    if (error) throw new Error(`${step.to}: ${error.message}`);
  }
  const { count: after } = await dst.from(step.to).select('id', { count: 'exact', head: true });
  console.log(`      đã chép xong, ${step.to} hiện có ${after} dòng`);
}

console.log(problems ? '\nCó lỗi, xem các dòng LỖI ở trên.' : apply ? '\nXong. Chạy "npm run check:db" để kiểm tra.' : '\nChạy thử xong. Số liệu đúng thì chạy lại kèm --apply để ghi thật.');
process.exit(problems ? 1 : 0);
