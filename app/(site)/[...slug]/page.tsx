import { notFound } from 'next/navigation';

// Mọi địa chỉ không khớp trang nào: trả 404 nhưng vẫn giữ header/footer của website.
export default function CatchAll() {
  notFound();
}
