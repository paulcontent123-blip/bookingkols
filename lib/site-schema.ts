// Dữ liệu có cấu trúc (JSON-LD) của tổ chức và website, giữ nguyên từ website cũ.
export const SITE_SCHEMAS: object[] = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Dịch vụ Booking Kols",
    "alternateName": "Dịch vụ Booking Kols",
    "url": "https://bookingkols.com.vn/",
    "logo": "https://res.cloudinary.com/sqhqa17e/image/upload/bookingkol/site-assets/web/images/logo/booking_KOLS-logo-white.svg",
    "contactPoint": [
      {
        "@type": "ContactPoint",
        "telephone": "0767977415",
        "contactType": "customer service",
        "contactOption": "TollFree",
        "areaServed": "VI"
      }
    ],
    "sameAs": [
      "https://twitter.com/bookingkols",
      "https://www.instagram.com/bookingkols415/",
      "http://www.youtube.com/@Booking_KOLS",
      "https://www.linkedin.com/in/booking-kols"
    ]
  },
  {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": [
          "Organization",
          "AdvertisingAgency"
        ],
        "@id": "https://bookingkols.com.vn/#organization",
        "name": "Công ty Cổ phần Thương mại - Đào tạo - Truyền thông HP",
        "alternateName": "Booking KOLs",
        "url": "https://bookingkols.com.vn/",
        "logo": {
          "@type": "ImageObject",
          "url": "https://res.cloudinary.com/sqhqa17e/image/upload/bookingkol/site-assets/web/images/logo/booking_KOLS-logo-white.svg",
          "width": "600",
          "height": "60"
        },
        "image": "https://res.cloudinary.com/sqhqa17e/image/upload/bookingkol/site-assets/web/images/logo/booking_KOLS-logo-white.svg",
        "description": "Booking KOLs là hệ sinh thái kiến tạo toàn diện chiến dịch truyền thông và kinh doanh, kết nối thương hiệu với các cá nhân có sức ảnh hưởng hàng đầu Việt Nam.",
        "telephone": "+84767977415",
        "priceRange": "$$",
        "taxID": "0318157933",
        "vatID": "0318157933",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "235 Nguyễn Thượng Hiền, Phường 6, Quận Bình Thạnh",
          "addressLocality": "Hồ Chí Minh",
          "postalCode": "700000",
          "addressCountry": "VN"
        },
        "geo": {
          "@type": "GeoCoordinates",
          "latitude": 10.8064035,
          "longitude": 106.6847353
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "00:00",
          "closes": "23:59"
        },
        "sameAs": [
          "https://www.facebook.com/profile.php?id=61560108418581",
          "https://www.tiktok.com/@bookingkols",
          "https://www.linkedin.com/in/booking-kols",
          "http://www.youtube.com/@Booking_KOLS",
          "https://www.instagram.com/bookingkols415/",
          "https://twitter.com/bookingkols",
          "https://zalo.me/0767977415"
        ],
        "contactPoint": {
          "@type": "ContactPoint",
          "telephone": "+84767977415",
          "contactType": "customer service",
          "areaServed": "VN",
          "availableLanguage": "Vietnamese"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://bookingkols.com.vn/#website",
        "url": "https://bookingkols.com.vn/",
        "name": "Booking KOLs",
        "alternateName": [
          "BookingKOLs",
          "Hệ sinh thái Booking KOLs"
        ],
        "publisher": {
          "@id": "https://bookingkols.com.vn/#organization"
        },
        "inLanguage": "vi-VN",
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": "https://bookingkols.com.vn/search?q={search_term_string}"
          },
          "query-input": "required name=search_term_string"
        }
      }
    ]
  }
];
