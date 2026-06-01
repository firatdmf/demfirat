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

  // Skip the b2b/ workspace — it's a separate Next.js project that
  // ships independently to b2b.demfirat.com. Without this, Next picks
  // it up via tsconfig's broad include and fails on @/-aliased imports
  // that resolve relative to the b2b/ src tree, not this one.
  webpack: (config) => {
    config.watchOptions = {
      ...(config.watchOptions || {}),
      ignored: ['**/node_modules', '**/b2b/**'],
    };
    return config;
  },

  // I added these below myself. These prisma and bcrpyt are two libraries that we do not want to add
  // to our client bundle at all. Do not show them on the browser (no client side, only server side)
  serverExternalPackages: ["@prisma/client", "bcrypt", "iyzipay"],

  // Cache headers for static assets
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif|mp4|webm|woff|woff2|ttf|eot)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, s-maxage=300, stale-while-revalidate=600' },
        ],
      },
    ];
  },
  images: {
    // unoptimized: true prevents Next.js from proxying images through Railway
    // This eliminates DOUBLE EGRESS (CDN→Railway→Client) and serves directly from CDN
    // BunnyCDN already serves optimized avif/webp images
    unoptimized: true,
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 604800,
  },
};

// module.exports = nextConfig
module.exports = withNextIntl(nextConfig);
