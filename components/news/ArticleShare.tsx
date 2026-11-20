'use client';

import { useToast } from '@/components/ui/Toast';
import { cdnImage } from '@/lib/cdn';
import s from './news-detail.module.scss';

/** Nút chia sẻ bài viết lên Facebook, LinkedIn, X (Twitter) và sao chép liên kết. */
export function ArticleShare({ title }: { title: string }) {
  const toast = useToast();
  const open = (url: string) => window.open(url, '_blank');
  const href = () => encodeURIComponent(window.location.href);

  return (
    <div className="social-icons-wrap" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button type="button" className={s['share-btn']} aria-label="Chia sẻ Facebook" onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${href()}`)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cdnImage('assets/icon/facebook-white.svg')} alt="Facebook" width={20} height={20} />
      </button>
      <button type="button" className={s['share-btn']} aria-label="Chia sẻ LinkedIn" onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${href()}`)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cdnImage('assets/icon/linkedin.svg')} alt="LinkedIn" width={20} height={20} />
      </button>
      <button
        type="button"
        className={s['share-btn']}
        aria-label="Chia sẻ X"
        onClick={() => open(`https://twitter.com/intent/tweet?url=${href()}&text=${encodeURIComponent(title)}&hashtags=${encodeURIComponent('booking KOLs')}`)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cdnImage('assets/icon/twitter.svg')} alt="X" width={20} height={20} />
      </button>
      <button
        type="button"
        className={s['share-btn']}
        aria-label="Sao chép liên kết"
        onClick={() => navigator.clipboard.writeText(window.location.href).then(() => toast.success('Liên kết đã được sao chép'))}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      </button>
    </div>
  );
}
