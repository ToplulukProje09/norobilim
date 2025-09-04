/** @type {import('next').NextConfig} */
const nextConfig = {
  // ✅ Mevcut image konfigürasyonunu genişlet
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "**", // ✅ Diğer image hostları için
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },

  // ✅ Experimental features - Prisma için kritik
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
    // Prisma ile uyumluluk için ek ayar
    esmExternals: "loose",
  },

  // ✅ Webpack konfigürasyonu - server-side Prisma için
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (isServer) {
      config.externals.push("@prisma/client");
    }
    return config;
  },

  // ✅ API route'ları için cache control
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, max-age=0",
          },
        ],
      },
    ];
  },

  // ✅ Logging - debug için
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // ✅ Build optimizasyonları
  swcMinify: true,
};

module.exports = nextConfig;
