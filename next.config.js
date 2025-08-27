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

  // I added these below myself. These prisma and bcrpyt are two libraries that we do not want to add
  // to our client bundle at all. Do not show them on the browser (no client side, only server side)
  serverExternalPackages: ["@prisma/client", "bcrypt"],
  // images: {
  //   domains: ['127.0.0.1', 'localhost', 'app.nejum.com'],
  // }
};

// module.exports = nextConfig
module.exports = withNextIntl(nextConfig);
