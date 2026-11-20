import 'server-only';
import nodemailer from 'nodemailer';
import { config } from './config';
import { escapeHtml } from './sanitize';

export interface ContactMail {
  name: string;
  phone: string;
  email?: string | null;
  message: string;
}

/** Gửi email thông báo có khách để lại liên hệ. Trả về false nếu chưa cấu hình SMTP (khi đó chỉ lưu database). */
export async function sendContactEmail(data: ContactMail): Promise<boolean> {
  const { host, user, password, receiver, port, from, displayName } = config.smtp;
  if (!host || !user || !password || !receiver) return false;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass: password }
  });
  await transporter.sendMail({
    from: `"${displayName}" <${from}>`,
    to: receiver,
    replyTo: data.email || undefined,
    subject: `Khách hàng mới liên hệ: ${data.name}`,
    html:
      `<h2>Yêu cầu liên hệ mới</h2>` +
      `<p><b>Họ tên:</b> ${escapeHtml(data.name)}</p>` +
      `<p><b>Số điện thoại:</b> ${escapeHtml(data.phone)}</p>` +
      `<p><b>Email:</b> ${escapeHtml(data.email || '—')}</p>` +
      `<p><b>Nội dung:</b><br>${escapeHtml(data.message).replace(/\n/g, '<br>')}</p>`
  });
  return true;
}
