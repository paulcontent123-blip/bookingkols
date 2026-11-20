import type { Metadata } from 'next';
import Script from 'next/script';
import type { ReactNode } from 'react';
import { config } from '@/lib/config';
import { getDict } from '@/lib/i18n';
import { getLang } from '@/lib/i18n/server';
import { SITE_SCHEMAS } from '@/lib/site-schema';
import { I18nProvider } from '@/components/I18nProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { BookingModalProvider } from '@/components/layout/BookingModal';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { FloatingActionBar } from '@/components/layout/FloatingActionBar';

export function generateMetadata(): Metadata {
  return {
    metadataBase: new URL(config.appUrl),
    title: { default: 'Booking KOLs', template: '%s' },
    icons: { icon: '/favicon.ico' },
    verification: config.googleSiteVerification ? { google: config.googleSiteVerification } : undefined
  };
}

const json = (value: object) => JSON.stringify(value).replace(/</g, '\\u003c');

export default async function SiteLayout({ children }: { children: ReactNode }) {
  const lang = await getLang();
  const gtm = config.gtmId;
  return (
    <>
      {SITE_SCHEMAS.map((schema, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(schema) }} />
      ))}
      {gtm && (
        <>
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtm}');`}
          </Script>
          <noscript>
            <iframe src={`https://www.googletagmanager.com/ns.html?id=${gtm}`} height="0" width="0" style={{ display: 'none', visibility: 'hidden' }} />
          </noscript>
        </>
      )}
      <I18nProvider lang={lang} dict={getDict(lang)}>
        <ToastProvider>
          <BookingModalProvider>
            <Header />
            <div className="content-wrapper container">{children}</div>
            <Footer />
            <FloatingActionBar />
          </BookingModalProvider>
        </ToastProvider>
      </I18nProvider>
    </>
  );
}
