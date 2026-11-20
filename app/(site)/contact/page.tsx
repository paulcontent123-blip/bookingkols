import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PAGE_TITLES } from '@/lib/seo-defaults';
import { ContactInfo, MapBlock } from '@/components/contact/ContactParts';
import { ContactForm } from '@/components/contact/ContactForm';
import s from '@/components/contact/contact.module.scss';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/contact', title: PAGE_TITLES.contact });
}

export default function ContactPage() {
  return (
    <div className={s['contact-page']}>
      <div className={s['contact-grid']}>
        <div className={s['contact-col']}>
          <ContactInfo />
        </div>
        <div className={s['contact-col']}>
          <MapBlock />
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
