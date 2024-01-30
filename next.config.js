/** @type {import('next').NextConfig} */
const nextConfig = {
    // I added these below myself. These prisma and bcrpyt are two libraries that we do not want to add
    // to our client bundle at all. Do not show them on the browser (no client side, only server side)
    experimental:{
        appDir:true,
        serverComponentsExternalPackages:['@prisma/client','bcrypt']
    },
}

module.exports = nextConfig
