import 'server-only';
import bcrypt from 'bcryptjs';

/**
 * DATABASE GIẢ TRONG BỘ NHỚ — CHỈ ĐỂ KIỂM THỬ CỤC BỘ khi chưa có Supabase (đặt BOOKINGKOLS_FAKE_DB=1).
 * Mô phỏng phần nhỏ của supabase-js mà ứng dụng dùng: from/select/insert/update/delete, eq/neq/gt/ilike/or,
 * order/range/limit/single/maybeSingle, count, và quan hệ articles.author -> users.
 * Dữ liệu mất khi tắt máy chủ. KHÔNG bao giờ được bật ở môi trường chạy thật (file server.ts chặn).
 */

type Row = Record<string, unknown>;
type Filter = (row: Row) => boolean;
interface Result {
  data: unknown;
  error: { code?: string; message: string } | null;
  count?: number | null;
}

// Lưu trên globalThis: chế độ dev của Next có thể nạp module nhiều lần (mỗi route một bản).
const g = globalThis as unknown as { __bookingkolsFakeDb?: Record<string, Row[]> };
const tables: Record<string, Row[]> = (g.__bookingkolsFakeDb ??= { users: [], articles: [], seo_html_contents: [], contact_requests: [] });

// Có thể gieo sẵn một tài khoản quản trị để thử đăng nhập (FAKE_ADMIN_EMAIL / FAKE_ADMIN_PASSWORD).
if (process.env.FAKE_ADMIN_EMAIL && process.env.FAKE_ADMIN_PASSWORD && tables.users.length === 0) {
  const now = new Date().toISOString();
  tables.users.push({
    id: crypto.randomUUID(),
    email: process.env.FAKE_ADMIN_EMAIL.toLowerCase(),
    name: "Admin thu",
    slug: "admin-thu-0001",
    password: bcrypt.hashSync(process.env.FAKE_ADMIN_PASSWORD, 10),
    created_at: now,
    updated_at: now
  });
}
const uniques: Record<string, (row: Row) => string | null> = {
  users: (r) => String(r.email ?? '').toLowerCase(),
  articles: (r) => String(r.slug ?? ''),
  seo_html_contents: (r) => String(r.url ?? '')
};

const get = (row: Row, path: string): unknown => {
  if (path.includes('.')) {
    const [rel, col] = path.split('.');
    const nested = row[rel] as Row | null | undefined;
    return nested ? nested[col] : undefined;
  }
  return row[path];
};
const like = (value: unknown, pattern: string) => {
  const re = new RegExp('^' + pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*') + '$', 'i');
  return re.test(String(value ?? ''));
};

class Query implements PromiseLike<Result> {
  private op: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private filters: Filter[] = [];
  private orderBy: { col: string; asc: boolean } | null = null;
  private from = 0;
  private to = Infinity;
  private mode: 'many' | 'single' | 'maybe' = 'many';
  private countExact = false;
  private head = false;
  private payload: Row | Row[] | null = null;
  private joinUsers = false;
  private innerJoin = false;
  private returning = false;

  constructor(private table: string) {}

  select(cols?: string, opts?: { count?: 'exact'; head?: boolean }) {
    if (this.op === 'select') {
      this.joinUsers = Boolean(cols && /users/.test(cols));
      this.innerJoin = Boolean(cols && /users!inner/.test(cols));
    } else this.returning = true;
    this.countExact = opts?.count === 'exact';
    this.head = Boolean(opts?.head);
    return this;
  }
  insert(rows: Row | Row[]) {
    this.op = 'insert';
    this.payload = rows;
    return this;
  }
  update(values: Row) {
    this.op = 'update';
    this.payload = values;
    return this;
  }
  delete() {
    this.op = 'delete';
    return this;
  }
  eq(col: string, val: unknown) {
    this.filters.push((r) => get(r, col) === val);
    return this;
  }
  neq(col: string, val: unknown) {
    this.filters.push((r) => get(r, col) !== val);
    return this;
  }
  gt(col: string, val: unknown) {
    this.filters.push((r) => String(get(r, col)) > String(val));
    return this;
  }
  ilike(col: string, pattern: string) {
    this.filters.push((r) => like(get(r, col), pattern));
    return this;
  }
  or(expr: string) {
    const parts = expr.split(',').map((p) => {
      const [col, op, ...rest] = p.split('.');
      return { col, op, value: rest.join('.') };
    });
    this.filters.push((r) => parts.some((p) => (p.op === 'ilike' ? like(get(r, p.col), p.value) : false)));
    return this;
  }
  order(col: string, opts?: { ascending?: boolean }) {
    this.orderBy = { col, asc: opts?.ascending !== false };
    return this;
  }
  range(from: number, to: number) {
    this.from = from;
    this.to = to;
    return this;
  }
  limit(n: number) {
    this.to = this.from + n - 1;
    return this;
  }
  single() {
    this.mode = 'single';
    return this;
  }
  maybeSingle() {
    this.mode = 'maybe';
    return this;
  }

  private withRelations(row: Row): Row {
    if (!this.joinUsers || this.table !== 'articles') return row;
    const author = tables.users.find((u) => u.id === row.author_id);
    return { ...row, author: author ? { name: author.name, slug: author.slug, email: author.email } : null };
  }

  private run(): Result {
    const rows = tables[this.table];
    if (!rows) return { data: null, error: { message: `Không có bảng ${this.table}` } };
    const now = new Date().toISOString();

    if (this.op === 'insert') {
      const created: Row[] = [];
      for (const raw of Array.isArray(this.payload) ? this.payload : [this.payload as Row]) {
        const row: Row = { id: crypto.randomUUID(), created_at: now, updated_at: now, ...raw };
        if (this.table === 'contact_requests') row.is_processed ??= false;
        const key = uniques[this.table]?.(row);
        if (key !== undefined && key !== null && rows.some((r) => uniques[this.table](r) === key)) {
          return { data: null, error: { code: '23505', message: 'duplicate key value violates unique constraint' } };
        }
        rows.push(row);
        created.push(row);
      }
      return this.finish(this.returning ? created : []);
    }

    const matched = rows.filter((r) => this.filters.every((f) => f(this.withRelations(r)))).filter((r) => !this.innerJoin || this.withRelations(r).author);

    if (this.op === 'update') {
      for (const row of matched) Object.assign(row, this.payload, { updated_at: now });
      return this.finish(this.returning ? matched : []);
    }
    if (this.op === 'delete') {
      for (const row of matched) rows.splice(rows.indexOf(row), 1);
      return this.finish(this.returning ? matched : []);
    }

    const total = matched.length;
    let out = matched.map((r) => this.withRelations(r));
    if (this.orderBy) {
      const { col, asc } = this.orderBy;
      out = [...out].sort((a, b) => (String(a[col]) < String(b[col]) ? -1 : String(a[col]) > String(b[col]) ? 1 : 0) * (asc ? 1 : -1));
    }
    out = out.slice(this.from, this.to === Infinity ? undefined : this.to + 1);
    const result = this.finish(out);
    result.count = this.countExact ? total : null;
    if (this.head) result.data = null;
    return result;
  }

  private finish(data: Row[]): Result {
    if (this.mode === 'single') {
      return data.length === 1 ? { data: data[0], error: null } : { data: null, error: { code: 'PGRST116', message: 'JSON object requested, multiple (or no) rows returned' } };
    }
    if (this.mode === 'maybe') return { data: data[0] ?? null, error: null };
    return { data, error: null };
  }

  then<R1 = Result, R2 = never>(onfulfilled?: ((value: Result) => R1 | PromiseLike<R1>) | null, onrejected?: ((reason: unknown) => R2 | PromiseLike<R2>) | null): PromiseLike<R1 | R2> {
    return Promise.resolve().then(() => this.run()).then(onfulfilled, onrejected);
  }
}

export const fakeClient = { from: (table: string) => new Query(table) };
