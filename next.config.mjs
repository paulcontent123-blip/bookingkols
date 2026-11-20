/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cho phép chạy một máy chủ thử song song (thư mục riêng) mà không làm hỏng .next của máy chủ chính.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  reactStrictMode: true,
  // Thư mục .next/standalone chạy độc lập trên hosting (Vietnix): xem DEPLOY-VIETNIX.md.
  output: 'standalone',
  poweredByHeader: false,
  // Dùng thẻ <img> thường (ảnh đã nằm trên Cloudinary), không cần bộ tối ưu ảnh của Next trên hosting.
  images: { unoptimized: true },
  experimental: { serverActions: { bodySizeLimit: '10mb' } },
  // Header bảo mật an toàn cho mọi trang; trang quản trị không được lưu đệm.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Bản chạy thử trên Vercel không được lên Google (tránh trùng nội dung với website thật trên Vietnix).
          ...(process.env.VERCEL ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : [])
        ]
      },
      { source: '/admin/:path*', headers: [{ key: 'Cache-Control', value: 'no-store' }] }
    ];
  },
  async redirects() {
    return [
      // Các sitemap cũ đã gửi lên Google Search Console.
      { source: '/sitemap_index.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap-kol.xml', destination: '/sitemap.xml', permanent: true },
      { source: '/sitemap-news-content.xml', destination: '/sitemap.xml', permanent: true }
    ];
  }
};

export default nextConfig;
