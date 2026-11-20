import Link from 'next/link';
import type { Article } from '@/lib/articles';
import { formatDate } from '@/lib/format';
import s from './news-item.module.scss';

export function NewsItem({ article, typeLabel }: { article: Article; typeLabel: string }) {
  return (
    <Link href={`/news/${article.slug}`} className={s.news} style={{ color: 'inherit' }}>
      <div className={s.thumbnail}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={article.thumbnail} alt={article.title} loading="lazy" />
      </div>
      <div className={s.content}>
        <h3>{article.title}</h3>
        <div className={s.subtitle}>
          {formatDate(article.createdAt)} - Đề xuất <span className={s['article-type']}>{typeLabel}</span>
        </div>
        <p className={s.description}>{article.description}</p>
      </div>
    </Link>
  );
}
