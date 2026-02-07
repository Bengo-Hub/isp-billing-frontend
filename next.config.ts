import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Required for Docker standalone builds (reduces image size significantly)
  output: "standalone",

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
  },

  // Environment variables available on client
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  },

  // Security headers for production
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },

  // Experimental features
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-icons",
      "recharts",
    ],
  },

  // Turbopack configuration (Next.js 16+ default bundler)
  turbopack: {},

  // TypeScript configuration
  typescript: {
    // Recommended: enable during development
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
