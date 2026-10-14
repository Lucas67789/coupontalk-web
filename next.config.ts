import type { NextConfig } from "next";
import { STORE_ALIASES } from './src/lib/store-aliases';

const nextConfig: NextConfig = {
  async redirects() {
    return Object.entries(STORE_ALIASES).map(([oldId, id]) => ({
      source: `/store/${encodeURIComponent(oldId)}/:path*`,
      destination: `/store/${id}/:path*`,
      permanent: true,
    }));
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'" },
    ] }];
  },
};

export default nextConfig;
