import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

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
