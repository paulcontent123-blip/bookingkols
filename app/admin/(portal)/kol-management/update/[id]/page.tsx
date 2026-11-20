import { KolForm } from '@/components/admin/KolForm';

export const dynamic = 'force-dynamic';

export default async function UpdateKolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <KolForm id={id} />;
}
