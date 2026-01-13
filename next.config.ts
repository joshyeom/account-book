import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Capacitor를 위한 static export 설정 (필요시 활성화)
  // output: 'export',

  // 이미지 최적화 설정
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
