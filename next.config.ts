import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '5.35.98.122', // твой IP
      },
    ],
  },
  // Добавим это для продакшена
  output: 'standalone',
};

export default nextConfig;