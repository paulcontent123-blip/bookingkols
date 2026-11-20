import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import { PAGE_TITLES } from '@/lib/seo-defaults';
import { PolicyView } from '@/components/policy/PolicyView';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ path: '/security', title: PAGE_TITLES.security });
}

export default function SecurityPage() {
  return <PolicyView type="security" />;
}
