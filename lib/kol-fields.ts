// Danh sách lĩnh vực của KOL, dùng chung cho máy chủ (kiểm tra dữ liệu) và trang quản trị (ô chọn).
// Khoá khớp với "field.*" trong lib/i18n; nhãn tiếng Việt dưới đây chỉ dùng trong trang quản trị.
export const KOL_FIELDS = [
  { value: 'fashion', label: 'Thời trang' },
  { value: 'sport', label: 'Thể thao' },
  { value: 'event', label: 'Sự kiện' },
  { value: 'realEstate', label: 'Bất động sản' },
  { value: 'health', label: 'Sức khỏe' },
  { value: 'businessmen', label: 'Doanh nhân' },
  { value: 'beauty', label: 'Thẩm mỹ' },
  { value: 'travel', label: 'Du lịch' },
  { value: 'cuisine', label: 'Ẩm thực' },
  { value: 'tech', label: 'Công nghệ' },
  { value: 'education', label: 'Giáo dục' },
  { value: 'dentalClinic', label: 'Nha khoa' },
  { value: 'streamingAndModel', label: 'Livestream/Mẫu ảnh' },
  { value: 'other', label: 'Khác' }
] as const;

export const KOL_FIELD_KEYS = KOL_FIELDS.map((f) => f.value) as [string, ...string[]];

/** Tỉnh/thành gợi ý trong ô nhập (vẫn cho gõ tự do). */
export const PROVINCE_SUGGESTIONS = [
  'Thành phố Hà Nội',
  'Thành phố Hồ Chí Minh',
  'Thành phố Đà Nẵng',
  'Thành phố Hải Phòng',
  'Thành phố Cần Thơ',
  'Thành phố Huế',
  'Tỉnh Thái Nguyên',
  'Tỉnh Khánh Hòa',
  'Tỉnh Lâm Đồng',
  'Tỉnh Quảng Ninh',
  'Tỉnh Bình Dương',
  'Tỉnh Đồng Nai'
];
