// below is added for language localizations
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');
/** @type {import('next').NextConfig} */

// console.log('HELLO' + process.env.NODE_PATH);
const nextConfig = {
  // below is added for language localizations
  // basePath:process.env.NODE_PATH || '',
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
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

  // Cache headers.
  //
  // The catch-all HTML rule must NOT match static assets. Next applies every
  // matching rule, so a bare '/:path*' catch-all folded its s-maxage=300 into
  // the asset rules as well. That capped Cloudflare's edge TTL at 5 minutes and
  // made every PoP re-pull the full media payload from the origin twelve times
  // an hour. The negative lookahead keeps the two classes apart.
  async headers() {
    const ASSET_EXT = 'svg|jpg|jpeg|png|gif|ico|webp|avif|mp4|webm|woff|woff2|ttf|eot';
    const HTML_CACHE = 'public, max-age=0, s-maxage=300, stale-while-revalidate=600';
    return [
      {
        // Files under public/ keep stable names across deploys, so they are
        // cached long but not 'immutable' — replacing one still takes effect
        // after a Cloudflare purge, which 'immutable' would ignore for a year.
        source: `/:all*(${ASSET_EXT})`,
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, s-maxage=2592000, stale-while-revalidate=86400' },
        ],
      },
      {
        // Content-hashed by the build — safe to pin forever.
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        // The bare root, which the parameterised pattern below cannot match.
        source: '/',
        headers: [{ key: 'Cache-Control', value: HTML_CACHE }],
      },
      {
        source: `/:path((?!_next/static/)(?!.*\\.(?:${ASSET_EXT})$).*)`,
        headers: [{ key: 'Cache-Control', value: HTML_CACHE }],
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
