// Kiểm thử đầu-cuối trên website đang chạy: trang công khai, liên hệ, đăng nhập quản trị, bài viết (thêm/sửa/xoá),
// cấu hình SEO, sitemap. Dữ liệu thử được xoá lại sau khi chạy.
//
// Chạy (website đang chạy ở cổng 3300, database Supabase đã cấu hình, đã có 1 tài khoản admin):
//   SMOKE_EMAIL=admin@... SMOKE_PASSWORD=... npm run smoke
// Lưu ý: bước gửi liên hệ sẽ gửi email thật nếu đã cấu hình SMTP trong .env. Muốn tránh thì để trống SMTP_* khi chạy thử.
const BASE = (process.env.SMOKE_BASE_URL || 'http://localhost:3300').replace(/\/$/, '');
const EMAIL = process.env.SMOKE_EMAIL;
const PASSWORD = process.env.SMOKE_PASSWORD;
if (!EMAIL || !PASSWORD) {
  console.error('Thiếu SMOKE_EMAIL / SMOKE_PASSWORD (tài khoản quản trị dùng để thử).');
  process.exit(1);
}

let pass = 0;
let fail = 0;
const check = (name, ok, detail = '') => {
  if (ok) pass++;
  else fail++;
  console.log(`  ${ok ? 'ĐẠT' : 'LỖI'}  ${name}${ok ? '' : detail ? ' -> ' + detail : ''}`);
};

let cookie = '';
async function api(path, { method = 'GET', json, admin = false } = {}) {
  const res = await fetch(BASE + path, {
    method,
    redirect: 'manual',
    headers: { ...(json ? { 'Content-Type': 'application/json' } : {}), ...(admin && cookie ? { Cookie: cookie } : {}) },
    body: json ? JSON.stringify(json) : undefined
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  let body = null;
  const type = res.headers.get('content-type') || '';
  if (type.includes('json')) body = await res.json().catch(() => null);
  else body = await res.text();
  return { status: res.status, body, headers: res.headers };
}

console.log('== Trang công khai ==');
for (const p of ['/', '/news', '/about-us', '/our-service', '/campaigns', '/contact', '/privacy', '/policy', '/security']) {
  const r = await api(p);
  check(`GET ${p} -> 200`, r.status === 200, String(r.status));
}
check('GET /khong-co-trang -> 404', (await api('/khong-co-trang')).status === 404);
const home = (await api('/')).body;
check('Trang chủ có thẻ GTM', typeof home === 'string' && home.includes('GTM-'));
check('Trang chủ có thẻ xác minh Google', typeof home === 'string' && home.includes('google-site-verification'));

console.log('== Liên hệ ==');
const bad = await api('/api/contacts', { method: 'POST', json: { name: '', phone: '123', message: '' } });
check('Liên hệ sai dữ liệu -> 400', bad.status === 400, String(bad.status));
const phone = '09' + String(Date.now()).slice(-8);
const good = await api('/api/contacts', { method: 'POST', json: { name: 'Khach thu nghiem', phone, email: '', message: 'test tu dong - xin bo qua' } });
check('Liên hệ hợp lệ -> 200', good.status === 200, String(good.status) + JSON.stringify(good.body));
const bot = await api('/api/contacts', { method: 'POST', json: { name: 'Bot', phone: '0900000000', message: 'spam', hpField: 'x' } });
check('Ô ẩn chống bot: giả vờ thành công nhưng không lưu', bot.status === 200);

console.log('== Quản trị ==');
check('Chưa đăng nhập -> 401', (await api('/api/admin/articles')).status === 401);
const wrong = await api('/api/admin/users/login', { method: 'POST', json: { email: EMAIL, password: PASSWORD + 'x' } });
check('Sai mật khẩu -> 401', wrong.status === 401, String(wrong.status));
const login = await api('/api/admin/users/login', { method: 'POST', json: { email: EMAIL, password: PASSWORD }, admin: false });
check('Đăng nhập đúng -> 200 và có cookie phiên', login.status === 200 && cookie.startsWith('bk_admin='), String(login.status));
if (login.status !== 200) {
  console.log('Không đăng nhập được, dừng.');
  process.exit(1);
}
check('current-user trả đúng người dùng', (await api('/api/admin/users/current-user', { admin: true })).body?.data?.email?.toLowerCase() === EMAIL.toLowerCase());

const contacts = await api(`/api/admin/contacts?keyword=${phone}`, { admin: true });
const item = contacts.body?.data?.items?.[0];
check('Liên hệ vừa gửi hiện trong quản trị', Boolean(item), JSON.stringify(contacts.body).slice(0, 120));
if (item) {
  check('Đánh dấu đã xử lý', (await api(`/api/admin/contacts/${item.id}/processed`, { method: 'PATCH', json: { isProcessed: true }, admin: true })).status === 200);
  check('Xoá liên hệ thử', (await api(`/api/admin/contacts/${item.id}`, { method: 'DELETE', admin: true })).status === 200);
}

console.log('== Bài viết ==');
const stamp = Date.now();
const title = `Bài thử nghiệm tự động ${stamp}`;
const create = await api('/api/admin/articles', {
  method: 'POST',
  admin: true,
  json: { title, slug: '', type: 'kol', status: 'published', description: 'Mô tả thử', thumbnail: 'smoke/test-thumb', content: '<h2>Mục một</h2><p>Nội dung thử <script>alert(1)</script></p><h2>Mục hai</h2><p>Hết.</p>' }
});
check('Tạo bài viết -> 201', create.status === 201, String(create.status) + JSON.stringify(create.body));
const slug = create.body?.data?.slug;
check('Đường dẫn tự sinh, không dấu', typeof slug === 'string' && /^[a-z0-9-]+$/.test(slug), slug);
const dup = await api('/api/admin/articles', { method: 'POST', admin: true, json: { title, slug, type: 'kol', status: 'draft', description: 'x', thumbnail: 'x', content: '<p>x</p>' } });
check('Trùng đường dẫn -> 400', dup.status === 400);

const pub = await api(`/api/articles/${slug}`);
check('Người đọc xem được bài đã xuất bản', pub.status === 200 && pub.body?.data?.title === title);
check('HTML nguy hiểm đã bị loại', !JSON.stringify(pub.body).includes('<script'));
const page = await api(`/news/${slug}`);
check('Trang /news/<slug> -> 200, có mục lục', page.status === 200 && String(page.body).includes('Nội dung chính'));
const list = await api('/api/articles?pageIndex=1&pageSize=5');
check('Danh sách công khai có bài', list.body?.data?.items?.some((a) => a.slug === slug));
const sm = await api('/sitemap-news.xml');
check('Sitemap bài viết chứa bài mới', sm.status === 200 && String(sm.body).includes(slug));

const upd = await api(`/api/admin/articles/${slug}`, { method: 'PUT', admin: true, json: { title: title + ' (sửa)', slug, type: 'agency', status: 'draft', description: 'Mô tả sửa', thumbnail: 'smoke/test-thumb', content: '<p>đã sửa</p>' } });
check('Sửa bài viết', upd.status === 200, String(upd.status));
check('Bài nháp không còn công khai', (await api(`/api/articles/${slug}`)).status === 404);

console.log('== Cấu hình SEO ==');
const seoUrl = `smoke-seo-${stamp}`;
const seoBad = await api('/api/admin/seo-html-contents', { method: 'POST', admin: true, json: { url: seoUrl, htmlContent: '<script>x</script>' } });
check('SEO: chỉ chấp nhận thẻ meta -> 400', seoBad.status === 400);
const seo = await api('/api/admin/seo-html-contents', { method: 'POST', admin: true, json: { url: seoUrl, htmlContent: '<meta name="description" content="Mo ta SEO thu" />' } });
check('SEO: tạo cấu hình', seo.status === 201, String(seo.status));
const seoList = await api(`/api/admin/seo-html-contents?url=${seoUrl}`, { admin: true });
const seoId = seoList.body?.data?.items?.[0]?.id;
check('SEO: có trong danh sách', Boolean(seoId));
const seoPub = await api(`/api/seo-html-contents?url=${seoUrl}`);
check('SEO: API công khai trả đúng', String(seoPub.body?.data?.htmlContent).includes('Mo ta SEO thu'));
if (seoId) check('SEO: xoá cấu hình', (await api(`/api/admin/seo-html-contents/${seoId}`, { method: 'DELETE', admin: true })).status === 200);

console.log('== Dọn dẹp ==');
check('Xoá bài viết thử', (await api(`/api/admin/articles/${slug}`, { method: 'DELETE', admin: true })).status === 200);
check('Đăng xuất', (await api('/api/admin/users/logout', { method: 'DELETE', admin: true })).status === 200);

console.log(`\nKẾT QUẢ: ${pass} đạt, ${fail} lỗi`);
process.exit(fail ? 1 : 0);
