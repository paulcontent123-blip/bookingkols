'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { useI18n } from '@/components/I18nProvider';
import { useToast } from '@/components/ui/Toast';
import { SpinnerIcon } from '@/components/ui/icons';
import { useContactSubmit, validateContact, type FieldErrors } from '@/components/useContactSubmit';
import s from './Footer.module.scss';

const FOOTER_MENU = [
  { url: '/about-us', title: 'footer.menu.about_us' },
  { url: '/policy', title: 'footer.menu.policy' },
  { url: '/privacy', title: 'footer.menu.privacy' },
  { url: '/security', title: 'footer.menu.security' }
];

const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.9!2d106.6847353!3d10.8064035!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529077dd29673%3A0x1f12610da44e809b!2zSOG7hyBzaW5oIHRow6FpIEJvb2tpbmcgS09Mcw!5e0!3m2!1svi!2svn!4v1';

const EMPTY = { name: '', phone: '', email: '', message: '' };

export function Footer() {
  const { t } = useI18n();
  const toast = useToast();
  const { submit, submitting } = useContactSubmit();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [key]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      toast.warning('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    if (await submit(values)) {
      toast.success('Cảm ơn bạn đã đăng ký. Chúng tôi sẽ liên hệ trong 24h!');
      setValues(EMPTY);
      setErrors({});
    } else {
      toast.error('Hệ thống đang gặp sự cố. Vui lòng thử lại sau.');
    }
  }

  return (
    <footer className={s['bk-footer']}>
      <div className={s['bk-top']}>
        <div className={s['bk-col']}>
          <h4>Giới Thiệu Booking KOLs</h4>
          <p className={s['bk-about-text']}>
            Booking KOLs kết nối thương hiệu với KOL/KOC, triển khai chiến dịch Marketing hiệu quả — giúp thương hiệu lan tỏa rộng rãi qua sức ảnh hưởng của những cá nhân nổi tiếng. Hệ sinh thái kiến tạo toàn diện chiến lược truyền thông &amp; kinh doanh.
          </p>
          <p className={s['bk-company']}>Công ty Cổ phần VEA Group</p>
          <div className={s['bk-info-item']}>
            <span className={s.icon}>📍</span>
            <span>162B Điện Biên Phủ, Phường Xuân Hòa, TP. Hồ Chí Minh</span>
          </div>
          <div className={s['bk-info-item']}>
            <span className={s.icon}>📞</span>
            <a href="tel:0767977415">0767 977 415</a>
          </div>
          <div className={s['bk-info-item']}>
            <span className={s.icon}>✉️</span>
            <a href="mailto:phongnguyen@veagroup.global">phongnguyen@veagroup.global</a>
          </div>
          <div className={s['bk-info-item']}>
            <span className={s.icon}>🏢</span>
            <span>MST: 0318157933</span>
          </div>
        </div>

        <div className={s['bk-col']}>
          <h4>Dịch Vụ</h4>
          <ul className={s['bk-links']}>
            {['Booking KOL/KOC', 'Marketing tích hợp', 'Thương mại điện tử', 'Media Booking'].map((label) => (
              <li key={label}>
                <Link href="/our-service" target="_blank">{label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className={s['bk-col']}>
          <h4>Đăng Ký Tư Vấn</h4>
          <form onSubmit={onSubmit} noValidate>
            <input className={s['bk-input']} value={values.name} onChange={set('name')} placeholder="Họ và Tên *" aria-invalid={!!errors.name} />
            <input className={s['bk-input']} value={values.phone} onChange={set('phone')} placeholder="Số điện thoại *" type="tel" aria-invalid={!!errors.phone} />
            <input className={s['bk-input']} value={values.email} onChange={set('email')} placeholder="Email *" type="text" inputMode="email" aria-invalid={!!errors.email} />
            <textarea className={s['bk-input']} value={values.message} onChange={set('message')} placeholder="Yêu cầu cụ thể *" rows={4} aria-invalid={!!errors.message} />
            <button className={s['bk-btn']} type="submit" disabled={submitting}>
              {submitting && <SpinnerIcon className="spin" />}
              Nhận tư vấn ngay
            </button>
          </form>
          <p className={s['bk-note']}>Chúng tôi sẽ liên hệ trong 24h</p>
        </div>

        <div className={s['bk-col']}>
          <h4>Theo Dõi Chúng Tôi</h4>
          <div className={s['bk-socials']}>
            <a href="https://www.facebook.com/profile.php?id=61560108418581" target="_blank" rel="noopener noreferrer" className={s['bk-soc']} title="Facebook">
              <svg viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </a>
            <a href="https://www.tiktok.com/@bookingkols" target="_blank" rel="noopener noreferrer" className={s['bk-soc']} title="TikTok">
              <svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34v-7a8.16 8.16 0 0 0 4.77 1.52V6.4a4.85 4.85 0 0 1-1-.29z" /></svg>
            </a>
            <a href="http://www.youtube.com/@Booking_KOLS" target="_blank" rel="noopener noreferrer" className={s['bk-soc']} title="YouTube">
              <svg viewBox="0 0 24 24">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.54C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#0a0612" />
              </svg>
            </a>
            <a href="https://www.instagram.com/bookingkols415/" target="_blank" rel="noopener noreferrer" className={s['bk-soc']} title="Instagram">
              <svg viewBox="0 0 24 24" fill="none">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#bbb" strokeWidth="2" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#bbb" strokeWidth="2" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="#bbb" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/booking-kols" target="_blank" rel="noopener noreferrer" className={s['bk-soc']} title="LinkedIn">
              <svg viewBox="0 0 24 24">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="https://twitter.com/bookingkols" target="_blank" rel="noopener noreferrer" className={s['bk-soc']} title="X / Twitter">
              <svg viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            </a>
          </div>
          <div className={s['bk-map-wrap']}>
            <iframe src={MAP_SRC} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Bản đồ Booking KOLs" />
          </div>
        </div>
      </div>

      <div className={s['bk-divider']} />

      <div className={s['bk-bottom']}>
        <span className={s['bk-copy']}>© 2024 Booking KOLs. Bản quyền thuộc về Booking KOLs.</span>
        <div className={s['bk-bottom-links']}>
          {FOOTER_MENU.map((item) => (
            <Link key={item.url} href={item.url}>{t(item.title)}</Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
