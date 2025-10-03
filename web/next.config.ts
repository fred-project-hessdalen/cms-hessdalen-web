import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }, // stricter
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
    ],
    // Optional: tune sizes (defaults are fine)
    // deviceSizes: [640, 768, 1024, 1280, 1536],
    // imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
