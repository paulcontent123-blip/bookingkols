import { cleanHtml, escapeHtml } from './sanitize';

/** <oembed url="..."> của trình soạn thảo -> <iframe>. Link YouTube dạng xem video được đổi sang dạng nhúng. */
export function oembedToIframe(html: string): string {
  return html.replace(/<oembed\s+url="([^"]+)"[^>]*>(?:<\/oembed>)?/gi, (_m, rawUrl: string) => {
    let url = rawUrl;
    const yt = rawUrl.match(/(?:youtube\.com\/watch\?(?:[^"#]*&)?v=|youtu\.be\/)([\w-]{6,})/i);
    if (yt) url = `https://www.youtube.com/embed/${yt[1]}`;
    if (!/^https:\/\//i.test(url)) return '';
    return `<iframe src="${escapeHtml(url)}" frameborder="0" allowfullscreen></iframe>`;
  });
}

const stripTags = (value: string) => value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();

/**
 * Mục lục "Nội dung chính": lấy các thẻ h2 (nếu bài không có h2 thì lấy h3), gắn id link-0, link-1...
 * Làm trên máy chủ nên Google thấy mục lục ngay trong HTML.
 */
export function addTableOfContents(html: string): string {
  const tag = /<h2\b/i.test(html) ? 'h2' : /<h3\b/i.test(html) ? 'h3' : '';
  if (!tag) return html;
  const items: string[] = [];
  const pattern = new RegExp(`<${tag}\\b([^>]*)>([\\s\\S]*?)</${tag}>`, 'gi');
  let index = 0;
  const body = html.replace(pattern, (_m, attrs: string, inner: string) => {
    const id = `link-${index++}`;
    items.push(`<li><a style="cursor: pointer" data-link="${id}">${escapeHtml(stripTags(inner))}</a></li>`);
    const cleaned = attrs.replace(/\s+id\s*=\s*"[^"]*"/i, '');
    return `<${tag}${cleaned} id="${id}">${inner}</${tag}>`;
  });
  if (items.length === 0) return html;
  return `<div class="toc"><h4>Nội dung chính:</h4><ol>${items.join('')}</ol></div>${body}`;
}

/** Nội dung bài viết sẵn sàng hiển thị: mục lục + nhúng video + làm sạch lần cuối. */
export function renderArticleContent(html: string): string {
  return cleanHtml(addTableOfContents(oembedToIframe(html)));
}
