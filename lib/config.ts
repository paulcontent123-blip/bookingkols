import 'server-only';

export const config = {
  appUrl: (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, ''),
  // Mã công khai của website hiện tại; có sẵn mặc định để thiếu .env cũng không làm mất theo dõi GA/GSC.
  gtmId: (process.env.GTM_ID ?? 'GTM-KP2KXTQB').trim(),
  googleSiteVerification: (process.env.GOOGLE_SITE_VERIFICATION ?? '9qDCBzEZ36xZWpacyClnjvGMmqYnMK36Fa6mzAKlMb8').trim(),
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    // Thư mục chứa ảnh tải lên từ trang quản trị. Ảnh giao diện nằm ở thư mục khác (bookingkol/site-assets).
    folder: (process.env.CLOUDINARY_FOLDER || 'bookingkol/images').replace(/^\/+|\/+$/g, '')
  },
  jwtSecret: process.env.JWT_SECRET || '',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    from: process.env.MAIL_FROM || 'no-reply@example.com',
    displayName: process.env.MAIL_DISPLAY_NAME || 'Booking KOLs',
    receiver: (process.env.CONTACT_RECEIVER || '').trim()
  }
};

export const hasSupabase = Boolean(
  config.supabaseUrl &&
    config.supabaseServiceRoleKey &&
    !config.supabaseUrl.includes('your-project.supabase.co') &&
    !config.supabaseServiceRoleKey.includes('your-supabase')
);

export const hasCloudinary = Boolean(
  config.cloudinary.cloudName &&
    config.cloudinary.apiKey &&
    config.cloudinary.apiSecret &&
    !config.cloudinary.cloudName.includes('your-')
);

/**
 * Database giả trong bộ nhớ, CHỈ để kiểm thử cục bộ (BOOKINGKOLS_FAKE_DB=1). Bị chặn hoàn toàn ở môi trường chạy thật
 * để không bao giờ vô tình dùng dữ liệu giả cho website thật.
 */
export const useFakeDb = process.env.BOOKINGKOLS_FAKE_DB === "1";
if (useFakeDb && process.env.NODE_ENV === "production" && process.env.BOOKINGKOLS_ALLOW_FAKE_IN_PROD !== "i-know-this-is-a-test") {
  throw new Error("BOOKINGKOLS_FAKE_DB không được bật ở môi trường chạy thật.");
}
