'use client';

import { useState, type FormEvent } from 'react';
import { adminFetch, ApiClientError } from '@/lib/admin-client';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { Pager, useDebounced, usePagedList } from './adminUi';
import s from './admin.module.scss';

interface UserItem {
  id: string;
  email: string;
  name: string;
}

function CreateAdminForm({ onDone }: { onDone: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState({ email: '', name: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    try {
      await adminFetch('/api/admin/users/register-admin', { method: 'POST', json: values });
      toast.success('Tạo admin thành công');
      onDone();
    } catch (error) {
      if (error instanceof ApiClientError && error.field) setErrors({ [error.field]: error.message });
      else toast.error(error instanceof Error ? error.message : 'Không tạo được admin');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} style={{ padding: 32, minWidth: 0 }} noValidate>
      <h3 style={{ marginTop: 0 }}>Tạo Admin</h3>
      {(['email', 'name', 'password'] as const).map((key) => (
        <div key={key} className={s.field}>
          <label data-required>{key === 'email' ? 'Email' : key === 'name' ? 'Tên' : 'Mật khẩu'}</label>
          <input className={`${s.input} ${errors[key] ? s.invalid : ''}`} type={key === 'password' ? 'password' : 'text'} value={values[key]} onChange={set(key)} autoComplete="off" />
          {errors[key] && <div className={s.error}>{errors[key]}</div>}
        </div>
      ))}
      <div className={s['btn-group']} style={{ justifyContent: 'flex-end' }}>
        <button type="button" className={s.btn} onClick={onDone}>
          Hủy
        </button>
        <button type="submit" className={`${s.btn} ${s.primary}`} disabled={busy}>
          Xác nhận
        </button>
      </div>
    </form>
  );
}

export function UsersAdmin() {
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const debouncedName = useDebounced(name);
  const list = usePagedList<UserItem>('/api/admin/users', { name: debouncedName });

  return (
    <>
      <div className={s.toolbar}>
        <div>
          <label>User:</label>
          <input className={s.input} placeholder="Nhập tên user" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button type="button" className={`${s.btn} ${s.primary}`} onClick={() => setCreating(true)}>
          Tạo Admin
        </button>
      </div>
      {list.error && <div className={s.error}>{list.error}</div>}
      <div className={`${s['table-wrap']} ${list.loading ? s.loading : ''}`}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Id</th>
              <th>Email</th>
              <th>Tên</th>
            </tr>
          </thead>
          <tbody>
            {list.data?.items.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.email}</td>
                <td>{u.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {list.data?.items.length === 0 && <div className={s.empty}>Không có dữ liệu</div>}
      </div>
      {list.data && <Pager pageIndex={list.pageIndex} pageSize={list.data.pageSize} total={list.data.totalCount} onChange={list.setPageIndex} />}
      <Modal open={creating} onClose={() => setCreating(false)} width={480}>
        <CreateAdminForm
          onDone={() => {
            setCreating(false);
            void list.reload();
          }}
        />
      </Modal>
    </>
  );
}
