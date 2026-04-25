import type { NextConfig } from "next";

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error(
    '[Layer0 Studio] NEXT_PUBLIC_SITE_URL is required for production builds. ' +
    'Without it, sitemap, robots.txt, and OG tags will reference http://localhost:3000.'
  );
}

const nextConfig: NextConfig = {
  // TODO: add images.remotePatterns (Supabase CDN + Unsplash) when migrating <img> to next/image
};

export default nextConfig;
