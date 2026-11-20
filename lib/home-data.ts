// DỮ LIỆU TRANG CHỦ: trích nguyên từ website Angular cũ (các danh sách đang được gõ cứng trong mã).
import { cdnImage } from './cdn';

export interface KolProfile {
  userId: string;
  slug: string;
  name: string;
  nickname: string;
  fields: string[];
  province: string;
  avatar: string;
  socialNetworkInfo: {
    facebookUrl: string | null;
    facebookFollowerCount: string | null;
    youtubeUrl: string | null;
    youtubeFollowerCount: string | null;
    tiktokUrl: string | null;
    tiktokFollowerCount: string | null;
    instagramUrl: string | null;
    instagramFollowerCount: string | null;
  };
}

export const POPULAR_KOLS: KolProfile[] = [
  {
    userId: 'eb052937-df1a-40cf-88e7-d4caaf1aa221',
    slug: 'khoa-pug--6858',
    name: 'Khoa Pug ',
    fields: ['travel', 'beauty'],
    province: 'Thành phố Hà Nội',
    avatar: 'https://bookingkols.com.vn/images/736f3277-8008-4a5e-bb7a-8a75f2a3ee20-11.jpg',
    socialNetworkInfo: {
      facebookUrl: '',
      facebookFollowerCount: '',
      youtubeUrl: 'https://www.youtube.com/@KhoaPug_TV/community',
      youtubeFollowerCount: '4,66 Tr',
      tiktokUrl: 'https://www.tiktok.com/@khoapug.1102',
      tiktokFollowerCount: '399.4K',
      instagramUrl: '',
      instagramFollowerCount: '',
    },
    nickname: 'Khoa Pug ',
  },
  {
    userId: '7ae9f79e-2373-4e88-a0f4-2265148773e4',
    slug: 'phuong-đoan-ri-viu-vo1P',
    name: 'Phương Đoàn Rì Viu',
    fields: ['fashion', 'beauty'],
    province: 'Thành phố Hồ Chí Minh',
    avatar: 'https://bookingkols.com.vn/images/addb581d-c44c-4faa-a503-0d4905191d94-asd.jpg',
    socialNetworkInfo: {
      facebookUrl: null,
      facebookFollowerCount: null,
      youtubeUrl: null,
      youtubeFollowerCount: null,
      tiktokUrl: null,
      tiktokFollowerCount: '231,7K',
      instagramUrl: null,
      instagramFollowerCount: null,
    },
    nickname: 'Phương Đoàn review',
  },
  {
    userId: '6593c90f-534b-4d72-98d1-b49b38417064',
    slug: '-quan-khong-go-5mTL',
    name: ' Quan không gờ',
    fields: ['fashion', 'beauty'],
    province: 'Thành phố Hồ Chí Minh',
    avatar: 'https://bookingkols.com.vn/images/1f95cb76-9dd7-4756-8c6c-7a9bbb991af0-io.jpg',
    socialNetworkInfo: {
      facebookUrl: '',
      facebookFollowerCount: null,
      youtubeUrl: null,
      youtubeFollowerCount: null,
      tiktokUrl: 'https://www.tiktok.com/@quankhonggo?lang=vi-VN',
      tiktokFollowerCount: '4,6M',
      instagramUrl: null,
      instagramFollowerCount: null,
    },
    nickname: 'Quan Không Gờ',
  },
  {
    userId: '6134b592-c015-4083-a602-f31b619fcc00',
    slug: 'đoan-kim-anh-qkzF',
    name: 'Đoàn Kim Anh',
    fields: ['fashion', 'beauty'],
    province: 'Thành phố Đà Nẵng',
    avatar: 'https://bookingkols.com.vn/images/9efa7e53-1933-49eb-a437-1de57bf4ae82-dsabdsdsb.png',
    socialNetworkInfo: {
      facebookUrl: null,
      facebookFollowerCount: null,
      youtubeUrl: null,
      youtubeFollowerCount: null,
      tiktokUrl: null,
      tiktokFollowerCount: '62,5K',
      instagramUrl: null,
      instagramFollowerCount: null,
    },
    nickname: 'Kazinh',
  },
  {
    userId: '5b41ccdb-bf7f-44d7-91f8-392ac491239d',
    slug: 'ngoc-eng-ozSV',
    name: 'Ngọc Éng',
    fields: ['fashion', 'beauty', 'education'],
    province: 'Thành phố Hồ Chí Minh',
    avatar: 'https://bookingkols.com.vn/images/a3751539-d21c-4d15-8ae2-713c30423d7a-avssav.jpg',
    socialNetworkInfo: {
      facebookUrl: null,
      facebookFollowerCount: null,
      youtubeUrl: null,
      youtubeFollowerCount: null,
      tiktokUrl: 'ngoc.eng',
      tiktokFollowerCount: '6,4M',
      instagramUrl: null,
      instagramFollowerCount: null,
    },
    nickname: 'Ngọc Éng',
  },
  {
    userId: 'f03447f0-1c57-4230-b08b-32da5e73ed1c',
    slug: 'am-thuc-me-lam-0499',
    name: 'Ẩm Thực Mẹ Làm',
    fields: ['cuisine'],
    province: 'Tỉnh Thái Nguyên',
    avatar: 'https://bookingkols.com.vn/images/0e49ff2a-8556-430c-ac19-41c61583f708-2.jpg',
    socialNetworkInfo: {
      facebookUrl: 'https://www.facebook.com/AmThucMeLam.Official',
      facebookFollowerCount: '',
      youtubeUrl: '',
      youtubeFollowerCount: '',
      tiktokUrl: 'https://www.tiktok.com/@amthucmelam.official',
      tiktokFollowerCount: '286,5K',
      instagramUrl: '',
      instagramFollowerCount: '',
    },
    nickname: 'Ẩm Thực Mẹ Làm',
  },
  {
    userId: 'e7e1ddb3-87a6-430c-9b0f-ffbebf6fac30',
    slug: 'gia-đinh-tihi--7035',
    name: 'Gia Đình TiHi ',
    fields: ['cuisine', 'travel', 'fashion'],
    province: 'Thành phố Hồ Chí Minh',
    avatar:
      'https://bookingkols.com.vn/images/d87a835a-5c67-4b83-890b-b17d36f17564-405322816_122140236110029005_5851156927071506520_n.jpg 1.jpg',
    socialNetworkInfo: {
      facebookUrl: '',
      facebookFollowerCount: '',
      youtubeUrl: '',
      youtubeFollowerCount: '',
      tiktokUrl: 'https://www.tiktok.com/@giadinhtihi',
      tiktokFollowerCount: '112,2K',
      instagramUrl: '',
      instagramFollowerCount: '',
    },
    nickname: 'Gia Đình TiHi ',
  },
  {
    userId: 'e2f3e3da-4b96-4eeb-b21a-35f88f941c5b',
    slug: 'tasee_tasee-9810',
    name: 'tasee_tasee',
    fields: ['beauty', 'other'],
    province: 'Thành phố Hồ Chí Minh',
    avatar: 'https://bookingkols.com.vn/images/68af1b11-5861-41d5-90cc-73134b6916d1-1.jpg',
    socialNetworkInfo: {
      facebookUrl: '',
      facebookFollowerCount: '',
      youtubeUrl: '',
      youtubeFollowerCount: '',
      tiktokUrl: 'https://www.tiktok.com/@tasee_tasee',
      tiktokFollowerCount: '380,4K',
      instagramUrl: '',
      instagramFollowerCount: '',
    },
    nickname: 'tasee_tasee',
  },
];

export interface TopProfile {
  id: string;
  slug: string;
  name: string;
  fields: string[];
  province: string;
  role: string;
  avatar: string;
  totalJob: number;
}

export const TOP_PROFILES: TopProfile[] = [
    {
      id: '17168ccc-7b98-454b-b0d6-085f7d8b1f1c',
      slug: 'huynh-khanh-đong-5220',
      name: 'Huỳnh Khánh Đông',
      fields: ['fashion', 'streamingAndModel', 'beauty'],
      province: 'Thành phố Hồ Chí Minh',
      role: 'KOL',
      avatar:
        'https://bookingkols.com.vn/images/36c2f1d0-14b6-4162-8223-623a37b0bce1-14.jpg',
      totalJob: 0,
    },
    {
      id: '23ce9f19-218d-4af2-ab51-e6b20ef0ea07',
      slug: 'khoa-pug--6858',
      name: 'Khoa Pug ',
      fields: ['travel', 'beauty'],
      province: 'Thành phố Hà Nội',
      role: 'KOL',
      avatar:
        'https://bookingkols.com.vn/images/736f3277-8008-4a5e-bb7a-8a75f2a3ee20-11.jpg',
      totalJob: 0,
    },
    {
      id: '33e54916-1cf2-4e08-b02c-fde1f6146626',
      slug: '-quan-khong-go-5mTL',
      name: ' Quan không gờ',
      fields: ['fashion', 'beauty'],
      province: 'Thành phố Hồ Chí Minh',
      role: 'KOL',
      avatar:
        'https://bookingkols.com.vn/images/1f95cb76-9dd7-4756-8c6c-7a9bbb991af0-io.jpg',
      totalJob: 0,
    },
  ];

export interface ExclusiveKol {
  name: string;
  avatar: string;
  fields: string[];
  description: string;
  platforms: { name: 'tiktok' | 'facebook' | 'youtube' | 'instagram'; total: string }[];
}

export const EXCLUSIVE_KOLS: ExclusiveKol[] = [
    {
      name: 'Khoa Pug',
      avatar: cdnImage('assets/images/home-page/exclusive_koc4.png'),
      fields: ['travel', 'other'],
      platforms: [
        {
          name: 'facebook',
          total: '351K',
        },
        {
          name: 'youtube',
          total: '4.66M',
        },
      ],
      description:
        'Là youtuber đình đám với danh xưng "Youtuber giàu nhất Việt Nam", Khoa Pug nổi tiếng qua các series khám phá du lịch và ẩm thực với phong cách review "chất - thật", hóm hỉnh nhưng cũng sâu sắc với kinh nghiệm sống phong phú. Các video của chàng youtuber tài năng này luôn mang đến năng lượng tươi mới, tích cực và hào hứng đến những khán giả của mình. Hiện nay kênh Youtube của Khoa Pug có hơn 4,5 triệu lượt theo dõi, nằm trong top các kênh Youtube lớn nhất Việt Nam.',
    },
    {
      name: 'Ngọc Thu Hằng',
      avatar: cdnImage('assets/images/home-page/exclusive_koc1.png'),
      fields: ['beauty', 'cuisine'],
      platforms: [
        {
          name: 'tiktok',
          total: '480K',
        },
        {
          name: 'facebook',
          total: '7.5K',
        },
      ],
      description:
        'Là một trong những creator & stream-er nổi tiếng và được yêu mến nhất hiện nay. Với sự đáng yêu, hài hước nhưng không kém phần duyên dáng. Cô nàng luôn truyền tải năng lượng tích cực cho người xem.\n\nDaisy Thu Hằng chủ yếu tập trung chia sẻ về các tiểu phẩm về thế giới xung quanh, bênh cạnh những câu chuyện truyền cảm hứng về hành trình đạt đến thành công khi được xướng tên trong Top 20 nhà sáng tạo nội dung năm 2023 của TikTok.\n\nBên cạnh đó, Thu Hằng cũng là một mẫu live đa tài với không ít những sản phẩm đều trở thành “Top-Seller” sau những phiên live với chỉ số GMV cao ngất ngưởn.',
    },
    {
      name: 'Bùi Thị Ngọc Trâm',
      avatar: cdnImage('assets/images/home-page/exclusive_koc2.png'),
      fields: ['beauty'],
      platforms: [
        {
          name: 'facebook',
          total: '110K',
        },
      ],
      description:
        'Là người mẫu ảnh kiêm diễn viên tự do tài năng sở hữu gương mặt khả ái và và nụ cười quyến rũ, cô nàng thu hút cho mình hàng nghìn lượt theo dõi trên Facebook. Những MV ca nhạc triệu view đã khắc ghi dấu ấn của Ngọc Trâm là: Anh thương em còn non dại, Quên một người từng yêu,… tất cả các MV này đều được khán giả đón nhận và khen ngợi.\n\nNgọc Trâm không ngại thử thách và luôn tìm kiếm những cơ hội mới trong sự nghiệp, như bắt đầu tham gia vào các dự án phát triển branding & stream của Hệ sinh thái Booking KOLs',
    },
    {
      name: 'Phạm Mỹ Linh',
      avatar: cdnImage('assets/images/home-page/exclusive_koc3.png'),
      fields: ['beauty'],
      platforms: [
        {
          name: 'tiktok',
          total: '143K',
        },
        {
          name: 'facebook',
          total: '227K',
        },
      ],
      description:
        '“Hot Vlogger Cần Thơ” là biệt danh mà mọi người yêu mến Mỹ Linh đặt cho cô nàng, khi kênh TikTok và Youtube của cô nàng như giới thiệu cho người dân trên khắp cả nước Việt Nam biết thêm những điều thú vị, độc đáo chỉ có ở Cần Thơ. Bật mí là, những video review này đã liên tục đạt được các chỉ số “khủng” gây bão mạng nhờ sự duyên dáng, chân thật và tính cách dễ thương của mình.\n\nTin chắc rằng, những video đời thường nhưng không kém phần lôi cuốn từ Mỹ Linh sẽ giúp cô nàng tiếp tục “công phá” số người theo dõi hiện tại ở cả 02 nền tảng Youtube (143.000 sub) và TikTok (227.000 follow) của mình, tiến gần hơn đến mục tiêu: “Chia sẻ những hình ảnh tốt đẹp nhất về Cần Thơ” của bản thân.',
    },
  ];

export interface CustomerReview {
  name: string;
  avatar: string;
  comment: string;
}

export const CUSTOMER_REVIEWS: CustomerReview[] = [
    {
      name: 'Anh Sang - Xmars Agency',
      avatar: cdnImage('assets/images/home-page/customer-1.jpg'),
      comment:
        'Chiến lược KOLs marketing của Hệ sinh thái BookingKOLs thực sự rất ấn tượng, giúp Xmars Agency hỗ trợ và phục vụ chu toàn cho các đối tác mong muốn chuyển đổi việc truyền thông & kinh doanh trên sàn thương mại điện tử. Kết quả đạt trên cả mức kỳ vọng mà chúng tôi mong muốn',
    },
    {
      name: 'Havin',
      avatar: cdnImage('assets/images/home-page/customer-2.jpg'),
      comment:
        'Tôi đã hợp tác với Booking KOLs trong việc tìm kiếm các mẫu live & review-er cho sản phẩm balo, túi xách thương hiệu Havin của mình. Tôi đánh giá cao sự sáng tạo, kỷ luật và chuyên nghiệp mà đội ngũ talent KOC của hệ thống mang đến khi sử dụng dịch vụ.',
    },
    {
      name: 'Anh Quân – Founder Trung tâm y khoa Tuệ An',
      avatar: cdnImage('assets/images/home-page/customer-3.jpg'),
      comment:
        'Với đội ngũ talent KOC nhiệt huyết và có nhiều kỹ năng tốt, tôi thay mặt Công ty gửi lời cảm ơn đến những bạn đã cộng tác khi giúp thương hiệu của tôi được lan tỏa nhiều hơn nhờ những video chia sẻ, trải nghiệm chân thật từ các bạn.',
    },
  ];

export interface CooperateBrand {
  name: string;
  file: string;
  background?: string;
}

export const COOPERATE_BRANDS: CooperateBrand[] = [
  { name: 'AEON Mall', file: 'AEON Mall.png' },
  { name: 'Asus', file: 'Asus.png' },
  { name: 'ATG', file: 'ATG.png' },
  { name: 'BV Mắt', file: 'BV Mắt.png' },
  { name: 'BXV', file: 'BXV.jpg' },
  { name: 'Chợ Tốt', file: 'chotot.png' },
  { name: 'Dược phẩm Hoa Linh', file: 'DPHL.png' },
  { name: 'MU Vĩnh Hằng', file: 'Gaming.jpg' },
  { name: 'Gona', file: 'Gona.png' },
  { name: 'KLD', file: 'KLD.png' },
  { name: 'KulDoctor', file: 'KulDoctor.png' },
  { name: 'SGC Dental', file: 'SGC Dental.png' },
  { name: 'She Chocolate', file: 'She Chocolate.jpg' },
  { name: 'Shiseido', file: 'Shiseido.jpg' },
  { name: 'SIAM', file: 'SIAM.png' },
  { name: 'TAD', file: 'TAD.png' },
  { name: 'TST', file: 'TST.png' },
  { name: 'Wellous', file: 'wellous.png' },
  { name: 'WeWine', file: 'wewine.png' },
  { name: 'Á Âu', file: 'Á Âu.jpg' },
];

export interface Partner {
  name: string;
  logo: string;
  description?: string;
  activityImages: string[];
}

/** Ba chiến dịch tiêu biểu hiển thị ở trang chủ và trang chiến dịch. */
export const PARTNER_SHOWCASE: Partner[] = [
    {
      name: 'Siam ThaiLan',
      logo: cdnImage('assets/images/home-page/partner1-logo.png'),
      description: 'Sự kiện khai trương Bệnh viện thẩm mỹ Siam ThaiLand',
      activityImages: [
        cdnImage('assets/images/home-page/partner1-image1.jpg'),
        cdnImage('assets/images/home-page/partner1-image2.jpg'),
        cdnImage('assets/images/home-page/partner1-image3.jpg'),
        cdnImage('assets/images/home-page/partner1-image4.jpg'),
      ],
      },
    {
      name: 'Bệnh viên Á Âu',
      logo: cdnImage('assets/images/home-page/partner2-logo.png'),
      description: 'Review Campaign - Bệnh viện thẩm mỹ Á Âu',
      activityImages: [
        cdnImage('assets/images/home-page/partner2-image1.jpg'),
        cdnImage('assets/images/home-page/partner2-image2.jpg'),
        cdnImage('assets/images/home-page/partner2-image3.jpg'),
        cdnImage('assets/images/home-page/partner2-image4.jpg'),
      ],
      },
    {
      name: 'ASUS Project',
      logo: cdnImage('assets/images/home-page/partner3-logo.png'),
      description: 'Branding & Affiliate Campaign: ASUS Project',
      activityImages: [
        cdnImage('assets/images/home-page/partner3-image1.jpg'),
        cdnImage('assets/images/home-page/partner3-image2.jpg'),
        cdnImage('assets/images/home-page/partner3-image3.jpg'),
        cdnImage('assets/images/home-page/partner3-image4.jpg'),
      ],
      },
  ];
