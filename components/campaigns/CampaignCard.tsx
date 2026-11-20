import Link from 'next/link';
import type { Article } from '@/lib/articles';
import s from './campaign-card.module.scss';

export function CampaignCard({ campaign }: { campaign: Article }) {
  return (
    <div className={s['campaign-card']}>
      <div className={s['campaign-image']}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={campaign.thumbnail} alt={campaign.title} loading="lazy" />
      </div>
      <div className={s.title}>
        <h3>{campaign.title}</h3>
      </div>
      <div className={s.button}>
        <Link href={`/news/${campaign.slug}`} className={`ant-btn ant-btn-primary`}>
          View Case
        </Link>
      </div>
    </div>
  );
}
