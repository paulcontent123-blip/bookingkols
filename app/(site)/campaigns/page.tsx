import type { Metadata } from 'next';
import { listPublishedArticles } from '@/lib/articles';
import { pageMetadata } from '@/lib/seo';
import { PAGE_TITLES } from '@/lib/seo-defaults';
import { Empty } from '@/components/ui/Empty';
import { CampaignCard } from '@/components/campaigns/CampaignCard';
import s from '@/components/campaigns/campaigns.module.scss';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/campaigns', title: PAGE_TITLES.campaigns });
}

export default async function CampaignsPage() {
  let items: Awaited<ReturnType<typeof listPublishedArticles>>['items'] = [];
  try {
    items = (await listPublishedArticles({ pageIndex: 1, pageSize: 20, isProject: true })).items;
  } catch (error) {
    console.error('[campaigns] Không đọc được danh sách chiến dịch:', error);
  }

  return (
    <div className={s['campaigns-container']}>
      <div className={s['campaigns-header']}>
        <h1>Chiến dịch đã triển khai</h1>
        <p className={s.subtitle}>Các chiến dịch marketing thành công mà chúng tôi đã thực hiện cùng đối tác</p>
      </div>
      <div className={s['campaigns-content']}>
        <div className={s.grid}>
          {items.length === 0 && <Empty text="Không tìm thấy chiến dịch phù hợp" />}
          {items.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </div>
    </div>
  );
}
