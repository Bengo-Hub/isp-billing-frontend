import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

// PWA / offline-shell + update detection. Uniform across the Codevertex fleet
// (library-ui / pos-ui). IMPORTANT: next-pwa only runs under the WEBPACK builder
// (`next build --webpack`) — Turbopack silently skips it, so sw.js would never
// regenerate and clients would stay stuck on stale buy-page JS (the legacy
// /gateways caller). With this + the shared OfflineBar's PwaUpdater banner, a new
// deploy is detected and the user is prompted to reload.
const withPWA = withPWAInit({
  dest: "public",
  // Enabled for production builds (next build --webpack regenerates sw.js);
  // disabled in dev to avoid stale service-worker caching while iterating.
  disable: process.env.NODE_ENV === "development",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    skipWaiting: false,
    clientsClaim: true,
  },
});

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
    NEXT_PUBLIC_WS_BASE_URL:
      process.env.NEXT_PUBLIC_WS_BASE_URL || "ws://localhost:8000",
    NEXT_PUBLIC_APP_NAME:
      process.env.NEXT_PUBLIC_APP_NAME || "Codevertex ISP Billing",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://ispbilling.codevertexitsolutions.com",
    NEXT_PUBLIC_NOTIFICATIONS_URL:
      process.env.NEXT_PUBLIC_NOTIFICATIONS_URL || "https://notificationsapi.codevertexitsolutions.com",
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

export default withPWA(nextConfig);
