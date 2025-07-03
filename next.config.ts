import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    cssChunking: true, // default
  },
  output: 'standalone',
  // For now...
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
