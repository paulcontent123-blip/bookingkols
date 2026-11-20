import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PAGE_TITLES } from '@/lib/seo-defaults';
import { CartIcon, GlobeIcon, LineChartIcon, TeamIcon } from '@/components/ui/icons';
import { ServiceCta } from '@/components/service/ServiceCta';
import s from '@/components/service/our-service.module.scss';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/our-service', title: PAGE_TITLES.ourService });
}

const SERVICES = [
  {
    id: 1,
    Icon: TeamIcon,
    title: 'Booking KOL/KOC',
    description: 'Dịch vụ booking KOL/KOC chuyên nghiệp cho mọi lĩnh vực và quy mô chiến dịch',
    features: ['Booking theo chỉ định của nhãn hàng', 'Đề xuất danh sách phù hợp từ VEA Group', 'Booking KOC freecast/minicast cho TikTok Shop & Shopee', 'Quản lý và điều phối KOL/KOC toàn diện']
  },
  {
    id: 2,
    Icon: LineChartIcon,
    title: 'Chiến dịch Marketing tích hợp',
    description: 'Tư vấn và triển khai các chiến dịch truyền thông tích hợp (IMC Campaign)',
    features: ['Lập kế hoạch chiến dịch chi tiết', 'Sản xuất nội dung sáng tạo', 'Triển khai đa kênh (Social, Digital, PR)', 'Báo cáo và đánh giá hiệu quả']
  },
  {
    id: 3,
    Icon: CartIcon,
    title: 'Thương mại điện tử',
    description: 'Giải pháp vận hành và phát triển kinh doanh trên các sàn TMĐT',
    features: ['Vận hành gian hàng TikTok Shop, Shopee, Lazada', 'Quản lý quảng cáo performance', 'Livestream bán hàng chuyên nghiệp', 'Tối ưu chuyển đổi và doanh thu']
  },
  {
    id: 4,
    Icon: GlobeIcon,
    title: 'Media Booking',
    description: 'Booking các kênh truyền thông và vị trí quảng cáo',
    features: ['Booking Fanpage & Social Group', 'Booking báo chí và trang tin tức', 'Quảng cáo ngoài trời (OOH)', 'Tối ưu chi phí và độ phủ']
  }
];

const PROCESS_STEPS = [
  { id: 1, title: 'Tư vấn & Brief', description: 'Tìm hiểu nhu cầu, mục tiêu và ngân sách của nhãn hàng. Xây dựng brief chiến dịch chi tiết.' },
  { id: 2, title: 'Đề xuất giải pháp', description: 'Lên kế hoạch chi tiết, đề xuất danh sách KOL/KOC phù hợp kèm báo giá và KPIs cam kết.' },
  { id: 3, title: 'Ký kết & Triển khai', description: 'Ký hợp đồng/đơn hàng (có VAT). Điều phối KOL/KOC và triển khai chiến dịch theo timeline.' },
  { id: 4, title: 'Báo cáo & Đánh giá', description: 'Theo dõi real-time, báo cáo chi tiết về độ phủ, engagement, conversion và ROI.' }
];

const BENEFITS = [
  { title: 'Mạng lưới KOL/KOC rộng khắp', description: 'Kết nối với hàng nghìn KOL/KOC uy tín trong mọi lĩnh vực từ beauty, fashion đến tech, F&B' },
  { title: 'Quy trình chuyên nghiệp', description: 'Từ tư vấn, booking đến triển khai và báo cáo - tất cả được quản lý chặt chẽ, minh bạch' },
  { title: 'Cam kết KPIs rõ ràng', description: 'Thông báo KPIs trước khi ký kết, đảm bảo quyền lợi và hiệu quả cho nhãn hàng' },
  { title: 'Hóa đơn VAT đầy đủ', description: 'Xuất hóa đơn VAT hợp lệ cho mọi giao dịch, đảm bảo minh bạch về mặt pháp lý' }
];

export default function OurServicePage() {
  return (
    <div className={s['our-service-page']}>
      <section className={s['hero-section']}>
        <div className={s['hero-content']}>
          <h1>Dịch vụ của VEA Group</h1>
          <p className={s['hero-subtitle']}>Giải pháp truyền thông tích hợp toàn diện - từ Booking KOL/KOC đến triển khai chiến dịch marketing đa nền tảng</p>
        </div>
      </section>

      <section className={s['services-section']}>
        <div className={s.container}>
          <h2 className={s['section-title']}>Dịch vụ chính</h2>
          <div className={s['services-grid']}>
            {SERVICES.map(({ id, Icon, title, description, features }) => (
              <div key={id} className={s['service-card']}>
                <div className={s['service-icon']}>
                  <Icon />
                </div>
                <h3>{title}</h3>
                <p>{description}</p>
                <ul className={s['service-features']}>
                  {features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s['process-section']}>
        <div className={s.container}>
          <h2 className={s['section-title']}>Quy trình làm việc</h2>
          <div className={s['process-steps']}>
            {PROCESS_STEPS.map((step) => (
              <div key={step.id} className={s['process-step']}>
                <div className={s['step-number']}>{step.id}</div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s['why-choose-section']}>
        <div className={s.container}>
          <h2 className={s['section-title']}>Tại sao chọn VEA Group?</h2>
          <div className={s['benefits-grid']}>
            {BENEFITS.map((benefit) => (
              <div key={benefit.title} className={s['benefit-card']}>
                <div className={s['benefit-icon']}>✓</div>
                <h3>{benefit.title}</h3>
                <p>{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={s['cta-section']}>
        <div className={s['cta-content']}>
          <h2>Bắt đầu chiến dịch của bạn ngay hôm nay</h2>
          <p>Liên hệ với chúng tôi để được tư vấn miễn phí về chiến lược marketing phù hợp với thương hiệu</p>
          <ServiceCta className={s['cta-button']} />
        </div>
      </section>
    </div>
  );
}
