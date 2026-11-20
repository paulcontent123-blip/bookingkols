import type { Metadata } from 'next';
import { Fragment } from 'react';
import { listPublishedArticles } from '@/lib/articles';
import { cdnImage } from '@/lib/cdn';
import { getT } from '@/lib/i18n/server';
import { pageMetadata } from '@/lib/seo';
import { PAGE_TITLES } from '@/lib/seo-defaults';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { Empty } from '@/components/ui/Empty';
import { Pagination } from '@/components/ui/Pagination';
import { NewsItem } from '@/components/news/NewsItem';
import s from '@/components/news/news-list.module.scss';

export const dynamic = 'force-dynamic';

const PAGE_SIZE = 20;
type Props = { searchParams: Promise<{ page?: string }> };
const pageOf = (value?: string) => Math.max(1, Math.floor(Number(value)) || 1);

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const page = pageOf((await searchParams).page);
  return pageMetadata({ path: page > 1 ? `/news?page=${page}` : '/news', title: PAGE_TITLES.news });
}

export default async function NewsListPage({ searchParams }: Props) {
  const page = pageOf((await searchParams).page);
  const { t } = await getT();
  let data = { items: [] as Awaited<ReturnType<typeof listPublishedArticles>>['items'], totalCount: 0, pageIndex: page, pageSize: PAGE_SIZE };
  try {
    data = await listPublishedArticles({ pageIndex: page, pageSize: PAGE_SIZE });
  } catch (error) {
    console.error('[news] Không đọc được danh sách bài viết:', error);
  }

  return (
    <>
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: 'Tin tức' }]} />
      <div className={s['news-container']}>
        <div className={s.content}>
          <h1>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cdnImage('assets/icon/star.svg')} alt="" width={20} height={20} /> Kinh nghiệm từ hệ sinh thái
          </h1>
          <div className={s['list-news']}>
            {data.items.length === 0 && <Empty />}
            {data.items.map((item, i) => (
              <Fragment key={item.id}>
                <NewsItem article={item} typeLabel={t(`article_type.${item.type}`)} />
                {i < data.items.length - 1 && <hr className={s.divider} />}
              </Fragment>
            ))}
            {data.items.length > 0 && (
              <div className={s['pagination-wrap']}>
                <Pagination pageIndex={data.pageIndex} pageSize={data.pageSize} total={data.totalCount} basePath="/news" />
              </div>
            )}
          </div>
        </div>
        <div className={s.advertisements}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cdnImage('assets/images/news/advertisement.png')} alt="Siam advertisement" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cdnImage('assets/images/news/advertisement-2.png')} alt="Booking KOL" />
        </div>
      </div>
    </>
  );
}
