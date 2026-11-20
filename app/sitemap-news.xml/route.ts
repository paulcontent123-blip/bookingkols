import { buildNewsXml, getSitemapArticles, xmlResponse } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const articles = await getSitemapArticles();
    if (articles.length === 0) return new Response('Chưa có bài viết nào', { status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    return xmlResponse(buildNewsXml(articles));
  } catch (error) {
    console.error('[sitemap] Không tạo được sitemap bài viết:', error);
    // 503 để công cụ tìm kiếm thử lại sau thay vì ghi nhận sitemap rỗng.
    return new Response('Sitemap tạm thời chưa sẵn sàng', { status: 503, headers: { 'Retry-After': '600', 'Content-Type': 'text/plain; charset=utf-8' } });
  }
}
