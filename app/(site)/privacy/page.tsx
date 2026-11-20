import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PAGE_TITLES } from '@/lib/seo-defaults';
import { PolicyView } from '@/components/policy/PolicyView';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/privacy', title: PAGE_TITLES.privacy });
}

export default function PrivacyPage() {
  return <PolicyView type="privacy" />;
}
