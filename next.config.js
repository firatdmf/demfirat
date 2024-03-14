// below is added for language localizations
const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin();
// const { i18n } = require('./next-i18next.config')
// ----------
/** @type {import('next').NextConfig} */
const nextConfig = {
  // below is added for language localizations
  // in18n,
  reactStrictMode: true,
  // -----

  // I added these below myself. These prisma and bcrpyt are two libraries that we do not want to add
  // to our client bundle at all. Do not show them on the browser (no client side, only server side)
  experimental: {
    // I guess I do not need appDir anymore because I upgraded to Next 14
    // appDir:true,
    serverComponentsExternalPackages: ["@prisma/client", "bcrypt"],
  },
};

// module.exports = nextConfig
module.exports = withNextIntl(nextConfig);
