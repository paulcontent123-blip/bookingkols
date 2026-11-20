import { ArticleForm } from '@/components/admin/ArticleForm';

export const dynamic = 'force-dynamic';

export default async function UpdateArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ArticleForm slug={decodeURIComponent(slug)} />;
}
