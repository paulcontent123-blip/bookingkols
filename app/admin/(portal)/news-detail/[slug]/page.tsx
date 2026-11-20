import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getArticleAdmin } from '@/lib/articles';
import { renderArticleContent } from '@/lib/article-html';
import { formatDateTime } from '@/lib/format';
import s from '@/components/admin/admin.module.scss';

export const dynamic = 'force-dynamic';

/** Xem trước bài viết (cả bài nháp) trong trang quản trị. */
export default async function AdminNewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleAdmin(decodeURIComponent(slug));
  if (!article) notFound();
  return (
    <div className={s['detail-page']}>
      <div className={s['btn-group']} style={{ marginBottom: 16 }}>
        <Link href="/admin/news-management" className={s.btn}>
          ← Quay lại
        </Link>
        <Link href={`/admin/news-management/update/${encodeURIComponent(article.slug)}`} className={`${s.btn} ${s.primary}`}>
          Cập nhật
        </Link>
      </div>
      <h1>{article.title}</h1>
      <p>
        <strong>{article.author.name}</strong> - {formatDateTime(article.createdAt)} ·{' '}
        <span className={`${s['status-tag']} ${article.status === 'published' ? s.published : s.draft}`}>{article.status === 'published' ? 'Xuất bản' : 'Nháp'}</span>
      </p>
      <p>
        <strong>{article.description}</strong>
      </p>
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.thumbnail} alt={article.title} />
      </div>
      <div className="ckeditor-content" dangerouslySetInnerHTML={{ __html: renderArticleContent(article.content) }} />
    </div>
  );
}
