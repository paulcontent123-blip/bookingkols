// Máy chủ thử chạy song song với npm run dev (cổng 3300, thư mục riêng .next-preview).
import { spawn } from "node:child_process";
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "-p", "3300"], {
  stdio: "inherit",
  env: { ...process.env, NEXT_DIST_DIR: ".next-preview" }
});
child.on("exit", (code) => process.exit(code ?? 0));
