import type { NextConfig } from "next";
import { STORE_ALIASES } from './src/lib/store-aliases';

const nextConfig: NextConfig = {
  async redirects() {
    const aliCampaignRedirects = ['04', '08', '13', '19', '28', '45'].map(tier => ({
      source: `/store/aliexpress/coupon/coupon-aliexpress-nov2026-ltik${tier}`,
      destination: '/store/aliexpress/coupon/coupon-aliexpress-nov2026-1111',
      statusCode: 301 as const,
    }));
    return [...aliCampaignRedirects, ...Object.entries(STORE_ALIASES).map(([oldId, id]) => ({
      source: `/store/${encodeURIComponent(oldId)}/:path*`,
      destination: `/store/${id}/:path*`,
      permanent: true,
    }))];
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
