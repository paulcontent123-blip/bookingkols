import type { Metadata } from 'next';
import { cdnImage } from '@/lib/cdn';
import { KOL_PAGE_SIZE, listFeaturedKols, listPublishedKols } from '@/lib/kols';
import { pageMetadata } from '@/lib/seo';
import { PAGE_TITLES } from '@/lib/seo-defaults';
import { Pagination } from '@/components/ui/Pagination';
import { PopularList } from '@/components/home/PopularList';
import { ListBrand } from '@/components/home/ListBrand';
import { TopProfile } from '@/components/home/TopProfile';
import { OurPartner } from '@/components/home/OurPartner';
import { Faq } from '@/components/home/Faq';
import { OurCustomer } from '@/components/home/OurCustomer';
import s from '@/components/home/home.module.scss';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ page?: string }> };
const pageOf = (value?: string) => Math.max(1, Math.floor(Number(value)) || 1);

// Canonical của trang chủ luôn là "/": Next.js cắt phần ?page=N khỏi canonical của trang gốc nên các trang KOL 2, 3... dùng chung.
export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/', title: PAGE_TITLES.home });
}

export default async function HomePage({ searchParams }: Props) {
  const page = pageOf((await searchParams).page);
  const [kols, featured] = await Promise.all([listPublishedKols({ pageIndex: page, pageSize: KOL_PAGE_SIZE }), listFeaturedKols()]);
  return (
    <div className={s['home-page']}>
      <div className={s['main-content']}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={`${s.banner} ${s.desktop}`} src={cdnImage('assets/images/home-page/lodigital.png')} alt="lodigital" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={`${s.banner} ${s.mobile}`} src={cdnImage('assets/images/home-page/lodigital-mobile.png')} alt="lodigital" />
        <PopularList kols={kols.items} pager={<Pagination pageIndex={kols.pageIndex} pageSize={kols.pageSize} total={kols.totalCount} basePath="/" hash="kol-list" dark />} />
        <ListBrand />
        <TopProfile profiles={featured} />
        <OurPartner />
        <Faq />
        <OurCustomer />
      </div>
    </div>
  );
}
