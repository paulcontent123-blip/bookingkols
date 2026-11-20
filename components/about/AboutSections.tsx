import Link from 'next/link';
import { cdnImage } from '@/lib/cdn';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import who from './who-booking.module.scss';
import story from './booking-story.module.scss';
import why from './why-choose-us.module.scss';
import tiktok from './follow-us-on-tiktok.module.scss';

/* eslint-disable @next/next/no-img-element */

export function WhoBooking() {
  return (
    <div className={who['who-booking']}>
      <Breadcrumb
        light
        items={[
          {
            label: 'Trang Chủ',
            href: '/'
          },
          { label: 'Về Chúng Tôi' }
        ]}
      />
      <div className={who.title}>
        <div className={who.who}>
          <h1>Who</h1>
        </div>
        <h1>is Booking KOL for?</h1>
      </div>
      <div className={who.descripttion}>
        <h5 className={who['row-1']}>Bất kỳ ai cần sử dụng BOOKING KOL đều là khách hàng của chúng tôi</h5>
        <h5 className={who['row-2']}>Chúng tôi đang xây dựng cầu nối để giúp mọi người tìm đến nhau và hợp tác một cách suôn sẻ</h5>
      </div>
      <div className={who['customer-types']}>
        <div className={who.customer}>
          <img src={cdnImage('assets/images/about-us/brands-sellers.svg')} alt="" />
          <h5>Brand/Seller</h5>
          <p>Bạn là doanh nhân và cần phát triển thương hiệu của riêng mình</p>
        </div>
        <div className={who.customer}>
          <img src={cdnImage('assets/images/about-us/tiktoker-celebes.svg')} alt="" />
          <h5>Tiktoker/Celebes</h5>
          <p>Bạn cần tìm một môi trường để phát triển tài năng của mình</p>
        </div>
        <div className={who.customer}>
          <img src={cdnImage('assets/images/about-us/someone.svg')} alt="" />
          <h5>Someone</h5>
          <p>Dù bạn là ai cũng không quan trọng</p>
        </div>
      </div>
    </div>
  );
}

export function BookingStory() {
  return (
    <div className={story['booking-story']}>
      <div className={story.content}>
        <div className={story['story-row']}>
          <div>
            <div className={story['left-container']}>
              <img src={cdnImage('assets/images/about-us/about-image-left.png')} alt="" />
            </div>
          </div>
          <div>
            <div className={story['right-container']}>
              <div className={story.title}>
                <div className={story['header-title']}>
                  <img src={cdnImage('assets/icon/star-gradient.svg')} alt="" />
                  <h2>The BOOKING KOL</h2>
                  <div className={story.story}>
                    <h2>Story</h2>
                  </div>
                </div>
                <h6>How it started</h6>
              </div>
              <div className={story.description}>
                <p className={story.row}>
                  Trong những năm đầu, BOOKING là một công ty xây dựng và phát triển các hệ thống kinh doanh và nền tảng trong lĩnh vực thương mại điện tử. Chúng tôi phải đối mặt với những vấn đề mà các công ty hiện nay đang gặp phải – làm thế nào để phát triển thương hiệu của họ – và họ không biết ai phù hợp với chiến lược marketing của công ty; liệu chi phí dữ liệu có quá cao; liệu chiến dịch này có kéo dài quá lâu hay không?
                </p>
                <p className={story.row}>
                  Vì chúng tôi đã từng trải qua những khó khăn đó và giờ đây có thể giúp bạn giải quyết vấn đề một cách nhanh chóng và hiệu quả nhất. Chúng tôi tạo ra một công cụ, một hệ sinh thái thú vị để giúp doanh nghiệp của bạn giải quyết những vấn đề đó.
                </p>
                <p className={story.row}>
                  Và đó là cách mà <span>BOOKING KOL</span> ra đời
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const WHY_ROWS = [
  { n: 1, title: 'Nghiên cứu', text: 'Bạn gặp khó khăn trong việc tìm kiếm gương mặt mới trên nền tảng vì bạn không chắc chắn về kiến thức nền tảng hoặc chuyên môn của họ trong lĩnh vực cụ thể' },
  { n: 2, title: 'Thông tin đối tác', text: 'Những người nổi tiếng thường có lịch trình bận rộn, khiến cho việc liên lạc trực tiếp hoặc đảm bảo sự sẵn sàng của họ cho các cuộc họp hoặc thảo luận trở nên khó khăn' },
  { n: 3, title: 'Thanh toán', text: 'Việc soạn thảo và hoàn tất các hợp đồng đáp ứng yêu cầu của cả hai bên có thể rất phức tạp' },
  { n: 4, title: 'Kỳ vọng', text: 'Đảm bảo sự hiểu biết và đồng thuận giữa các bên về phạm vi công việc, các sản phẩm bàn giao và thời gian hoàn thành là rất quan trọng' }
];

export function WhyChooseUs() {
  return (
    <div className={why['why-choose-us']}>
      <div className={why.header}>
        <div className={why['header-title']}>
          <img src={cdnImage('assets/icon/star-gradient.svg')} alt="" />
          <h2>Tại Sao</h2>
          <div className={why.choose}>
            <h2>CHỌN</h2>
          </div>
          <h2>Chúng Tôi</h2>
        </div>
        <h5 className={why['header-desc']}>Hãy để chúng tôi cho bạn biết cách BOOKING giúp bạn giải quyết khó khăn</h5>
      </div>
      <div className={why.content}>
        <div className={why['left-container']}>
          {WHY_ROWS.map((row) => (
            <div key={row.n} className={why.row}>
              <div className={why['header-row']}>
                <div className={why.number}>{row.n}</div>
                <h5>{row.title}</h5>
              </div>
              <p>{row.text}</p>
            </div>
          ))}
        </div>
        <div className={why['right-container']}>
          <img src={cdnImage('assets/images/about-us/why-chose-us.svg')} alt="" />
        </div>
      </div>
      <div className={why['get-started']}>
        <p>Bắt đầu trải nghiệm dịch vụ của chúng tôi ngay thôi</p>
        <div className={why.button}>
          <img src={cdnImage('assets/images/about-us/get-started-left.svg')} alt="" />
          <Link href="/contact">Bắt Đầu</Link>
          <img src={cdnImage('assets/images/about-us/get-started-right.svg')} alt="" />
        </div>
      </div>
    </div>
  );
}

const TIKTOK = ['7323991163697057042', '7327905477319347474', '7328753378903821570'];

export function FollowUsOnTiktok() {
  return (
    <div className={tiktok['follow-us-on-tiktok']}>
      <div className={tiktok.container}>
        <h3>Theo dõi chúng tôi trên TikTok</h3>
        <div className={tiktok['video-tiktok']}>
          {TIKTOK.map((id) => (
            <div key={id} className={tiktok['video-container']}>
              <iframe src={`https://www.tiktok.com/embed/${id}`} loading="lazy" title={`TikTok ${id}`} style={{ width: '100%', height: 733, border: 'none' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
