// below is added for language localizations
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
/** @type {import('next').NextConfig} */

// console.log('HELLO' + process.env.NODE_PATH);
const nextConfig = {
  // below is added for language localizations
  // basePath:process.env.NODE_PATH || '',
  reactStrictMode: true,
  // -----

  // Performance optimizations
  poweredByHeader: false,
  compress: true,

  // I added these below myself. These prisma and bcrpyt are two libraries that we do not want to add
  // to our client bundle at all. Do not show them on the browser (no client side, only server side)
  serverExternalPackages: ["@prisma/client", "bcrypt", "iyzipay"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'app.nejum.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'demfiratkarven.b-cdn.net',
        port: '',
        pathname: '/**',
      },
    ],
    // Image optimization settings
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
};

// module.exports = nextConfig
module.exports = withNextIntl(nextConfig);
