import Link from 'next/link';
import s from '@/components/ui/NotFound.module.scss';

/** Trang 404 (Next tự trả mã 404). Nội dung giữ như website cũ: "404 / Sorry, the page you visited does not exist." */
export default function NotFound() {
  return (
    <div className={s.result}>
      <div className={s.code}>404</div>
      <div className={s.title}>404</div>
      <div className={s.subtitle}>Sorry, the page you visited does not exist.</div>
      <div className={s.extra}>
        <Link href="/" className="ant-btn ant-btn-primary">
          Back Home
        </Link>
      </div>
    </div>
  );
}
