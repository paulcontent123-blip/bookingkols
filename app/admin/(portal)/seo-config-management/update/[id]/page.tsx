import { SeoForm } from '@/components/admin/SeoForm';

export const dynamic = 'force-dynamic';

export default async function UpdateSeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <SeoForm id={id} />;
}
