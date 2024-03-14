import createMiddleware from 'next-intl/middleware';
// below is not added in this, I wonder if that would cause any problems in future but so far no problem.
// export {default} from 'next-auth/middleware'

export default createMiddleware({
    // A list of all locales that are supported
    locales: ['en', 'id','ru','pl','tr'],

    // Used when no locale matches
    defaultLocale: 'en',
    localePrefix:'as-needed'

});
// export const config = {
//     // Match only internationalized pathnames
//     matcher: ['/','/dashboard',
//         '/app/:path*', '/(id|en)/:path*']
// };
export const config  = {matcher:[
    '/dashboard',
    '/app/:path*',

    
    // '/products/:path*',

    // below is for locale, above is for next auth
    '/((?!api|static|.*\\..*|_next).*)',
    '/(id|en|ru)/:path*'
]}
