import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: process.env.NEXT_PUBLIC_API_URL?.replace("http://", "") || "5.35.98.122"
            }
        ]
    },
    // Добавим это для продакшена
    output: "standalone"
}

export default nextConfig
