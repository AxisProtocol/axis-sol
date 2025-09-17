import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Initialize OpenNext for Cloudflare compatibility
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ⬇︎ トップレベル。プロトコル無しの「ホスト名」だけを書く
  allowedDevOrigins: [
    '0351cfe3887d.ngrok-free.app',
  ],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com',
        port: '',
        pathname: '/coins/images/**',
      },
    ],
  },

  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      // fs モジュールをクライアント側で解決しない
      config.resolve ??= {};
      config.resolve.fallback ??= {};
      config.resolve.fallback.fs = false;
      // walletconnect -> pino -> pino-pretty is optional; stub it out
      config.resolve.alias ??= {};
      config.resolve.alias['pino-pretty'] = false;
    }
    return config;
  },
}

export default nextConfig
