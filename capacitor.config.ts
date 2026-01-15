import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.accountbook.app",
  appName: "AI 가계부",
  webDir: "out",
  server: {
    // 개발 중에는 로컬 서버 사용, 배포 후 Vercel URL로 변경
    // url: 'https://your-vercel-url.vercel.app/',
    // cleartext: true
  },
};

export default config;
