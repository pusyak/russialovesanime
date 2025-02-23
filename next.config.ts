import type { NextConfig } from "next"

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "http",
                hostname: process.env.NEXT_PUBLIC_API_URL?.replace("https://", "").replace("http://", "") || ""
            }
        ]
    },
    // Добавим это для продакшена
    output: "standalone"
}

export default nextConfig
