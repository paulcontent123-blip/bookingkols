import Link from 'next/link';
import { cdnImage } from '@/lib/cdn';
import { getT } from '@/lib/i18n/server';
import { POLICY_PAGES, type PolicyType } from '@/lib/policy-content';
import { Breadcrumb } from '@/components/ui/Breadcrumb';
import { PolicyFaq } from './PolicyFaq';
import s from './policy.module.scss';

const FOOTER_MENU = [
  { url: '/about-us', key: 'about_us' },
  { url: '/policy', key: 'policy' },
  { url: '/privacy', key: 'privacy' },
  { url: '/security', key: 'security' }
];

/** Khung chung của ba trang chính sách: nội dung bên trái, danh sách bài liên quan bên phải. */
export async function PolicyView({ type }: { type: PolicyType }) {
  const { t } = await getT();
  const page = POLICY_PAGES[type];
  const current = FOOTER_MENU.find((item) => item.key === type)!;
  const related = FOOTER_MENU.filter((item) => item.key !== type);

  return (
    <>
      <Breadcrumb items={[{ label: 'Trang chủ', href: '/' }, { label: t(`footer.menu.${type}`) }]} />
      <div className={s.container}>
        <div className={s['main-content']}>
          <h1 className={s.title}>{page.title}</h1>
          <div className="ckeditor-content" dangerouslySetInnerHTML={{ __html: page.html }} />
          {type === 'policy' && <PolicyFaq />}
        </div>
        <div className={s.menu}>
          <div className={s['reading-article']}>
            <p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdnImage('assets/icon/star.svg')} alt="" width={20} height={20} /> Bạn đang xem
            </p>
            <div className={s['menu-item-card']}>{t(`footer.menu.${current.key}`)}</div>
          </div>
          <div className={s['related-articles']}>
            <p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cdnImage('assets/icon/star.svg')} alt="" width={20} height={20} /> Bài viết liên quan
            </p>
            <div className={s['list-menu-item']}>
              {related.map((item) => (
                <Link key={item.url} href={item.url} className={s['menu-item-card']} style={{ color: 'inherit' }}>
                  {t(`footer.menu.${item.key}`)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
