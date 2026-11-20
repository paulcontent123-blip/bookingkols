import sanitizeHtml from 'sanitize-html';

/** Làm sạch HTML bài viết từ trình soạn thảo: giữ định dạng, bỏ script và thuộc tính nguy hiểm. */
export function cleanHtml(value: string): string {
  return sanitizeHtml(value || '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'figure', 'figcaption', 'iframe', 'h1', 'h2', 'h3', 'h4', 'u', 's', 'span', 'oembed', 'video', 'source'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'id', 'style'],
      a: ['href', 'name', 'target', 'rel', 'data-link'],
      img: ['src', 'alt', 'width', 'height', 'loading'],
      iframe: ['src', 'width', 'height', 'allow', 'allowfullscreen', 'frameborder'],
      oembed: ['url'],
      video: ['src', 'controls', 'width', 'height', 'poster'],
      source: ['src', 'type'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan']
    },
    allowedIframeHostnames: [
      'www.youtube.com', 'www.youtube-nocookie.com', 'youtube.com', 'player.vimeo.com',
      'www.tiktok.com', 'www.facebook.com', 'facebook.com'
    ],
    allowedStyles: {
      '*': {
        'text-align': [/^(left|center|right|justify)$/],
        width: [/^\d{1,3}(\.\d+)?(%|px)$/],
        height: [/^\d{1,4}(\.\d+)?(%|px)$/],
        'border-collapse': [/^collapse$/],
        border: [/^[\w\s#.,()-]{1,40}$/],
        padding: [/^[\d\s.px%]{1,30}$/],
        float: [/^(left|right|none)$/],
        margin: [/^[\d\s.px%auto-]{1,30}$/]
      }
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    // Ảnh trong bài có thể là mã Cloudinary (không có http), nên cho phép đường dẫn tương đối.
    allowProtocolRelative: false
  });
}

export function stripHtml(value: string): string {
  return sanitizeHtml(value || '', { allowedTags: [], allowedAttributes: {} });
}

export function escapeHtml(value: string): string {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
