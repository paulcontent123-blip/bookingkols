import type { Metadata } from 'next';
import { cdnImage } from '@/lib/cdn';
import { pageMetadata } from '@/lib/seo';
import { PAGE_TITLES } from '@/lib/seo-defaults';
import { BookingStory, FollowUsOnTiktok, WhoBooking, WhyChooseUs } from '@/components/about/AboutSections';
import { OurPartnerShowCase } from '@/components/home/OurPartnerShowCase';
import s from '@/components/about/about-us.module.scss';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/about-us', title: PAGE_TITLES.aboutUs });
}

export default function AboutUsPage() {
  return (
    <div className={s['about-us']}>
      <WhoBooking />
      <div className={s.container}>
        <BookingStory />
      </div>
      <div className={s.container}>
        <WhyChooseUs />
      </div>
      <div className={s['brand-convinent']}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} style={{ display: 'contents' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cdnImage('assets/icon/star-gradient.svg')} className={s.icon} alt="Convinent" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cdnImage('assets/images/about-us/convinent.svg')} alt="Convinent" />
          </span>
        ))}
      </div>
      <div className={s['our-patner']}>
        <div className={s['title-our-patner']}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cdnImage('assets/icon/star-gradient.svg')} alt="" />
          <h3>Xem thêm về các dịch vụ khác của chúng tôi</h3>
        </div>
        <OurPartnerShowCase />
      </div>
      <FollowUsOnTiktok />
    </div>
  );
}
