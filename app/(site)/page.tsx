import type { Metadata } from 'next';
import { cdnImage } from '@/lib/cdn';
import { pageMetadata } from '@/lib/seo';
import { PAGE_TITLES } from '@/lib/seo-defaults';
import { PopularList } from '@/components/home/PopularList';
import { ListBrand } from '@/components/home/ListBrand';
import { TopProfile } from '@/components/home/TopProfile';
import { OurPartner } from '@/components/home/OurPartner';
import { Faq } from '@/components/home/Faq';
import { OurCustomer } from '@/components/home/OurCustomer';
import s from '@/components/home/home.module.scss';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/', title: PAGE_TITLES.home });
}

export default function HomePage() {
  return (
    <div className={s['home-page']}>
      <div className={s['main-content']}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={`${s.banner} ${s.desktop}`} src={cdnImage('assets/images/home-page/lodigital.png')} alt="lodigital" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={`${s.banner} ${s.mobile}`} src={cdnImage('assets/images/home-page/lodigital-mobile.png')} alt="lodigital" />
        <PopularList />
        <ListBrand />
        <TopProfile />
        <OurPartner />
        <Faq />
        <OurCustomer />
      </div>
    </div>
  );
}
