import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedArticle, getRelatedArticles, type Article } from '@/lib/articles';
import { renderArticleContent } from '@/lib/article-html';
import { cdnImage } from '@/lib/cdn';
import { config } from '@/lib/config';
import { formatDate } from '@/lib/format';
import { pageMetadata } from '@/lib/seo';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { ArticleShare } from '@/components/news/ArticleShare';
import { TocLinks } from '@/components/news/TocLinks';
import s from '@/components/news/news-detail.module.scss';

export const dynamic = 'force-dynamic';
type Props = { params: Promise<{ slug: string }> };

async function loadArticle(slug: string): Promise<Article | null> {
  try {
    return await getPublishedArticle(decodeURIComponent(slug));
  } catch (error) {
    console.error('[news] Không đọc được bài viết:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await loadArticle((await params).slug);
  if (!article) return { title: 'Không tìm thấy bài viết', robots: { index: false } };
  const defaults = [
    { name: 'description', content: article.description },
    { property: 'og:title', content: article.title },
    { property: 'og:description', content: article.description },
    { property: 'og:image', content: article.thumbnail },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: article.title },
    { name: 'twitter:description', content: article.description },
    { name: 'twitter:image', content: article.thumbnail },
    { name: 'twitter:card', content: 'summary_large_image' }
  ];
  return pageMetadata({ path: `/news/${article.slug}`, title: `${article.title} - Booking KOLs`, defaults });
}

/** Giờ dạng hh:mm:ss (12 giờ, không có AM/PM) theo giờ Việt Nam, giống pipe date của website cũ. */
function formatTime12(value: string): string {
  return new Date(value)
    .toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true, timeZone: 'Asia/Ho_Chi_Minh' })
    .replace(/\s?(AM|PM)$/i, '');
}

function formatLongDate(value: string): string {
  const [day, month, year] = formatDate(value).split('/');
  return `${day} tháng ${month} năm ${year}`;
}

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await loadArticle(slug);
  if (!article) notFound();
  const related = await getRelatedArticles(article.slug).catch(() => [] as Article[]);
  const url = `${config.appUrl}/news/${article.slug}`;

  const schemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      image: article.thumbnail,
      author: { '@type': 'person', name: article.author.name },
      publisher: {
        '@type': 'Organization',
        name: 'Dịch vụ Booking Kols',
        logo: { '@type': 'ImageObject', url: cdnImage('assets/images/logo/booking KOLS-logo-white.svg') }
      },
      datePublished: article.lastUpdatedAt.slice(0, 10)
    },
    {
      '@context': 'https://schema.org/',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: { '@id': `${config.appUrl}/`, name: 'Trang chủ' } },
        { '@type': 'ListItem', position: 2, name: article.title, item: { '@id': url, name: article.title } }
      ]
    }
  ];

  return (
    <>
      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />
      ))}
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: article.title }]} />
      <div className={s['article-container']}>
        <h1>{article.title}</h1>
        <div className={s.description}>
          <p>{article.description}</p>
        </div>
        <div className={s.banner}>
          <div className={s.header}>
            <div className={s['article-info']}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={s.star} src={cdnImage('assets/icon/star.svg')} alt="" />
              <p>{article.author.name}</p>
              <span className={s.vdivider} />
              <p>{formatLongDate(article.createdAt)}</p>
              <span className={s.vdivider} />
              <p>{formatTime12(article.createdAt)}</p>
            </div>
            <div className={s.shared}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={s.star} src={cdnImage('assets/icon/star.svg')} alt="" />
              <p>Share</p>
              <span className={s.vdivider} />
              <ArticleShare title={article.title} />
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={article.thumbnail} alt={`banner ${article.title}`} />
        </div>
        <div className={s['content-container']}>
          <div className={s.header}>
            <div className={s.tag}>
              <span className={s.label}>#Tag</span>
              <span className={s.type}>Đề xuất với {article.type.toUpperCase()}</span>
            </div>
          </div>
          <div className={s.content}>
            <TocLinks className="ckeditor-content">
              <div dangerouslySetInnerHTML={{ __html: renderArticleContent(article.content) }} />
            </TocLinks>
          </div>
        </div>
      </div>
      <div className={s['related-articles-container']}>
        <h1>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={s.star} src={cdnImage('assets/icon/star.svg')} alt="" /> Gợi ý danh sách tương tự
        </h1>
        <div className={s['list-article']}>
          {related.map((item) => (
            <Link key={item.id} href={`/news/${item.slug}`} className={s['related-article-item']} style={{ color: 'inherit' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.thumbnail} alt={`thumbnail ${item.title}`} loading="lazy" />
              <p className={s.title}>{item.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
