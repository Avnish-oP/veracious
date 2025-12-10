import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all for now, or specify supabase project url
      },
    ],
  },
};

export default nextConfig;
