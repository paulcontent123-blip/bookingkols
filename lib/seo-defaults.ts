import { cdnShareImage } from './cdn';

export interface MetaTag {
  name?: string;
  property?: string;
  content: string;
}

const HOME_DESC =
  'Booking KOLs là nền tảng giúp bạn dễ dàng booking KOL, booking KOC trong mọi lĩnh vực cho chiến dịch quảng cáo. Liên hệ với chúng tôi qua hotline 0773 737 747 để được tư vấn ngay!';
const NEWS_DESC =
  'Chuyên trang tin tức chuyên chia sẻ các thông tin hữu ích về các KOLs và KOC nổi tiếng và các kiến thức Marketing mà bạn không nên bỏ qua! Xem ngay!';
const CAMPAIGNS_DESC =
  'Khám phá các chiến dịch marketing thành công mà VEA Group đã triển khai cùng các đối tác. Booking KOL/KOC chuyên nghiệp, hiệu quả cao cho thương hiệu của bạn.';

const HOME_TITLE = 'Booking KOLs - Nền tảng cung cấp dịch vụ Kols Marketing hàng đầu';
const NEWS_TITLE = 'Chia sẻ thông tin về KOLs nổi tiếng và kiến thức Marketing thú vị';
const ABOUT_TITLE = 'Giới thiệu về BookingKols.vn - Nền tảng kết nối KOLs & Doanh nghiệp';
const CAMPAIGNS_TITLE = 'Chiến dịch đã triển khai - BookingKols.vn';

export const PAGE_TITLES = {
  home: HOME_TITLE,
  news: NEWS_TITLE,
  aboutUs: ABOUT_TITLE,
  campaigns: CAMPAIGNS_TITLE,
  ourService: 'Dịch vụ hợp tác tại Booking KOLs - Nền tảng KOLs Marketing',
  contact: 'Liên hệ - Booking KOLs',
  privacy: 'Chính sách về quyền riêng tư - BookingKols.vn',
  policy: 'Chính sách chung - BookingKols.vn',
  security: 'Chính sách bảo mật - BookingKols.vn'
} as const;

const homeImage = () => cdnShareImage('assets/images/home-page/lodigital.png');

/** Thẻ meta mặc định của từng trang (dùng khi trang đó chưa có cấu hình SEO riêng trong trang quản trị). */
export const DEFAULT_SEO: Record<string, MetaTag[]> = {
  '': [
    { name: 'description', content: HOME_DESC },
    { name: 'keywords', content: 'Booking KOLs, KOLs, Key Opinion Leaders, Quảng cáo, Marketing ảnh hưởng' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: HOME_TITLE },
    { property: 'og:description', content: HOME_DESC },
    { property: 'og:image', content: homeImage() },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: HOME_TITLE },
    { name: 'twitter:description', content: HOME_DESC },
    { name: 'twitter:image', content: homeImage() },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  news: [
    { name: 'description', content: NEWS_DESC },
    { name: 'keywords', content: 'tin tức, sự kiện, xu hướng, quảng cáo, KOL, Booking KOLs' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: NEWS_TITLE },
    { property: 'og:description', content: NEWS_DESC },
    { property: 'og:image', content: homeImage() },
    { property: 'og:type', content: 'article' },
    { name: 'twitter:title', content: NEWS_TITLE },
    { name: 'twitter:description', content: NEWS_DESC },
    { name: 'twitter:image', content: homeImage() },
    { name: 'twitter:card', content: 'summary_large_image' }
  ],
  'about-us': [
    {
      name: 'description',
      content: 'Tìm hiểu về Booking KOLs - Nền tảng hàng đầu kết nối doanh nghiệp và KOL, KOC uy tín, giúp tối ưu hiệu quả marketing với giải pháp KOLs Marketing chuyên nghiệp.'
    },
    { property: 'og:title', content: ABOUT_TITLE }
  ],
  campaigns: [
    { name: 'description', content: CAMPAIGNS_DESC },
    { name: 'keywords', content: 'Chiến dịch marketing, Case study, KOL campaign, Booking KOLs, Affiliate marketing, Branding campaign' },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: CAMPAIGNS_TITLE },
    { property: 'og:description', content: CAMPAIGNS_DESC },
    { property: 'og:image', content: cdnShareImage('assets/images/home-page/partner1-image1.jpg') },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:title', content: CAMPAIGNS_TITLE },
    { name: 'twitter:description', content: CAMPAIGNS_DESC },
    { name: 'twitter:image', content: cdnShareImage('assets/images/home-page/partner1-image1.jpg') },
    { name: 'twitter:card', content: 'summary_large_image' }
  ]
};
