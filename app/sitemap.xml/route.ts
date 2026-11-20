import { buildIndexXml, getSitemapArticles, xmlResponse } from '@/lib/sitemap';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const articles = await getSitemapArticles();
    return xmlResponse(buildIndexXml(articles.length > 0));
  } catch (error) {
    // Database lỗi và chưa có bản đệm: vẫn trả mục lục có các trang cố định, hạn đệm ngắn để thử lại sớm.
    console.error('[sitemap] Không lấy được bài viết cho mục lục:', error);
    return xmlResponse(buildIndexXml(false), 300);
  }
}
