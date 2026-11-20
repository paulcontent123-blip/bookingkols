// Biến kết quả `next build` (output: 'standalone') thành thư mục chạy độc lập rồi nén thành deploy/bookingkols.zip.
// Tải file zip lên hosting, giải nén, tạo file .env và chạy bằng `node server.js` (xem DEPLOY-VIETNIX.md).
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const standalone = path.join(root, '.next', 'standalone');
if (!fs.existsSync(path.join(standalone, 'server.js'))) {
  throw new Error('Thiếu .next/standalone/server.js. Hãy chạy `next build` (output: "standalone") trước.');
}

// public/ và .next/static/ không nằm sẵn trong bản standalone nên phải chép thêm.
fs.cpSync(path.join(root, 'public'), path.join(standalone, 'public'), { recursive: true });
fs.cpSync(path.join(root, '.next', 'static'), path.join(standalone, '.next', 'static'), { recursive: true });

// Khoá bí mật không bao giờ vào gói: hosting có file .env riêng.
for (const file of ['.env', '.env.local', '.env.production']) fs.rmSync(path.join(standalone, file), { force: true });
fs.copyFileSync(path.join(root, '.env.example'), path.join(standalone, '.env.example'));

const out = path.join(root, 'deploy');
fs.mkdirSync(out, { recursive: true });
const zip = path.join(out, 'bookingkols.zip');
fs.rmSync(zip, { force: true });
if (process.platform === 'win32') {
  // bsdtar (có sẵn trên Windows 10+) ghi dấu "/" trong đường dẫn; Compress-Archive của PowerShell 5.1 có thể ghi "\" gây lỗi trên Linux.
  execFileSync(path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'tar.exe'), ['-a', '-c', '-f', zip, '.'], { cwd: standalone, stdio: 'inherit' });
} else {
  execFileSync('zip', ['-qr', zip, '.'], { cwd: standalone, stdio: 'inherit' });
}
console.log(`Sẵn sàng: ${path.relative(root, standalone)} (chạy thử: node server.js)\nGói deploy: ${path.relative(root, zip)} (${(fs.statSync(zip).size / 1024 / 1024).toFixed(1)} MB)`);
