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
