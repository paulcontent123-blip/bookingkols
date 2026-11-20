/** Ngày dạng dd/MM/yyyy theo giờ Việt Nam (giống pipe date của website cũ). */
export function formatDate(value: string | Date): string {
  return new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Ho_Chi_Minh' });
}

/** Thời gian dạng dd/MM/yyyy HH:mm theo giờ Việt Nam (dùng ở trang quản trị). */
export function formatDateTime(value: string | Date): string {
  return new Date(value).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Ho_Chi_Minh' });
}
