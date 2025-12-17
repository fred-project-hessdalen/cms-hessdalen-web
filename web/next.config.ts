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
  // Force browsers to reload CSS and JS by setting proper cache headers
  async headers() {
    return [
      {
        // Apply to all static assets
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        // Cache static files with hash in filename for 1 year
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  // Redirect non-www to www to avoid caching issues
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'hessdalen.org',
          },
        ],
        destination: 'https://www.hessdalen.org/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
