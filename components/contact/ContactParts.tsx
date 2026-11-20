import Link from 'next/link';
import { cls } from '@/lib/cls';
import s from './contact.module.scss';

/* eslint-disable @next/next/no-img-element */
// File sinh bởi scratchpad/gen-contact.mjs từ trang Liên hệ Angular cũ; sửa tay được.

export function ContactInfo() {
  return (
    <>
      
      <div className={cls(s, 'contact-block')}>
        <div className={cls(s, 'block-label')}>Thông tin công ty</div>
        <div className={cls(s, 'brand-name')}>Công ty Cổ phần VEA Group</div>
        <p className={cls(s, 'desc-text')}>
          Booking KOLs kết nối thương hiệu với KOL/KOC, triển khai chiến dịch
          Marketing hiệu quả. Giúp thương hiệu lan tỏa rộng rãi nhờ sức ảnh
          hưởng của <strong>KOLs Marketing</strong>.
        </p>
        <ul className={cls(s, 'addr-list')}>
          <li>
            <span className={cls(s, 'addr-dot')}></span>
            <div>
              <span className={cls(s, 'addr-tag')}>Địa chỉ</span>
              162B Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh
            </div>
          </li>
          <li>
            <span className={cls(s, 'addr-dot')}></span>
            <div>
              <span className={cls(s, 'addr-tag')}>SĐT</span>
              <a href="tel:0767977415">0767 977 415</a>
            </div>
          </li>
          <li>
            <span className={cls(s, 'addr-dot')}></span>
            <div>
              <span className={cls(s, 'addr-tag')}>Email</span>
              <a href="mailto:phongnguyen@veagroup.global">phongnguyen@veagroup.global</a>
            </div>
          </li>
          <li>
            <span className={cls(s, 'addr-dot')}></span>
            <div>
              <span className={cls(s, 'addr-tag')}>MST</span>
              0318157933
            </div>
          </li>
        </ul>
      </div>

      <div className={cls(s, 'contact-block')}>
        <div className={cls(s, 'block-label')}>Dịch vụ tại Booking KOLs</div>
        <div className={cls(s, 'services-list')}>
          <Link href="/our-service" className={cls(s, 'svc-item')} target="_blank" rel="noopener noreferrer">
            <div className={cls(s, 'svc-icon p')}>
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                width="16"
                height="16">
                <circle cx="6" cy="5" r="2.5" />
                <path d="M1 13c0-2.76 2.24-5 5-5s5 2.24 5 5" />
                <circle cx="12" cy="5" r="2" />
                <path d="M12 9c1.66 0 3 1.34 3 3" />
              </svg>
            </div>
            Booking KOL/KOC <span className={cls(s, 'svc-arrow')}>›</span>
          </Link>
          <Link href="/our-service" className={cls(s, 'svc-item')} target="_blank" rel="noopener noreferrer">
            <div className={cls(s, 'svc-icon o')}>
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                width="16"
                height="16">
                <path
                  d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 12A5 5 0 118 3a5 5 0 010 10z"
                />
                <path d="M8 5v3l2 2" />
              </svg>
            </div>
            Marketing tích hợp <span className={cls(s, 'svc-arrow')}>›</span>
          </Link>
          <Link href="/our-service" className={cls(s, 'svc-item')} target="_blank" rel="noopener noreferrer">
            <div className={cls(s, 'svc-icon t')}>
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                width="16"
                height="16">
                <path d="M2 2h12v2H2zM2 7h8v2H2zM2 12h5v2H2z" />
                <path d="M12 9l3 3-3 3" />
              </svg>
            </div>
            Thương mại điện tử <span className={cls(s, 'svc-arrow')}>›</span>
          </Link>
          <Link href="/our-service" className={cls(s, 'svc-item')} target="_blank" rel="noopener noreferrer">
            <div className={cls(s, 'svc-icon r')}>
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                width="16"
                height="16">
                <rect x="1" y="4" width="14" height="9" rx="1" />
                <path d="M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
              </svg>
            </div>
            Media Booking <span className={cls(s, 'svc-arrow')}>›</span>
          </Link>
        </div>
      </div>
    
    </>
  );
}

export function MapBlock() {
  return (
    <div className={cls(s, 'map-block')}>
      <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.8!2d106.6821!3d10.8064!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529077dd29673%3A0x1f12610da44e809b!2zSOG7hyBzaW5oIHRow6FpIEJvb2tpbmcgS09Mcw!5e0!3m2!1svi!2svn!4v1712700000000"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"></iframe>
        <div className={cls(s, 'social-strip')}>
          <span>Theo dõi</span>
          <a
            className={cls(s, 'soc-btn')}
            href="https://www.tiktok.com/@bookingkols"
            target="_blank" rel="noopener noreferrer"
            title="TikTok">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
              <path
                d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.84 1.56V6.81a4.85 4.85 0 01-1.07-.12z"
              />
            </svg>
          </a>
          <a
            className={cls(s, 'soc-btn')}
            href="https://www.facebook.com/profile.php?id=61560108418581"
            target="_blank" rel="noopener noreferrer"
            title="Facebook">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#1877f2">
              <path
                d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.88v2.27h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07z"
              />
            </svg>
          </a>
          <a
            className={cls(s, 'soc-btn')}
            href="https://www.linkedin.com/in/booking-kols"
            target="_blank" rel="noopener noreferrer"
            title="LinkedIn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#0a66c2">
              <path
                d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.37V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.44v6.3zM5.34 7.43a2.06 2.06 0 01-2.06-2.06 2.06 2.06 0 012.06-2.06 2.06 2.06 0 012.06 2.06 2.06 2.06 0 01-2.06 2.06zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
              />
            </svg>
          </a>
          <a
            className={cls(s, 'soc-btn')}
            href="http://www.youtube.com/@Booking_KOLS"
            target="_blank" rel="noopener noreferrer"
            title="YouTube">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#ff0000">
              <path
                d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.54 3.5 12 3.5 12 3.5s-7.54 0-9.38.55A3.02 3.02 0 00.5 6.19C0 8.05 0 12 0 12s0 3.95.5 5.81a3.02 3.02 0 002.12 2.14C4.46 20.5 12 20.5 12 20.5s7.54 0 9.38-.55a3.02 3.02 0 002.12-2.14C24 15.95 24 12 24 12s0-3.95-.5-5.81zM9.75 15.52V8.48L15.5 12l-5.75 3.52z"
              />
            </svg>
          </a>
          <a
            className={cls(s, 'soc-btn')}
            href="https://www.instagram.com/bookingkols415/"
            target="_blank" rel="noopener noreferrer"
            title="Instagram">
            <svg width="15" height="15" viewBox="0 0 24 24">
              <defs>
                <linearGradient id="ig2" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f09433" />
                  <stop offset="50%" stopColor="#dc2743" />
                  <stop offset="100%" stopColor="#bc1888" />
                </linearGradient>
              </defs>
              <rect width="24" height="24" rx="5" fill="url(#ig2)" />
              <rect
                x="6"
                y="6"
                width="12"
                height="12"
                rx="3"
                fill="none"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <circle
                cx="12"
                cy="12"
                r="3"
                fill="none"
                stroke="#fff"
                strokeWidth="1.5"
              />
              <circle cx="16.5" cy="7.5" r="1" fill="#fff" />
            </svg>
          </a>
          <a
            className={cls(s, 'soc-btn')}
            href="https://twitter.com/bookingkols"
            target="_blank" rel="noopener noreferrer"
            title="X (Twitter)">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="#fff">
              <path
                d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              />
            </svg>
          </a>
        </div>
      </div>
  );
}
