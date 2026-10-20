import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';
import { VISITOR_COUNTRY_COOKIE } from '@/lib/visitorCountry';
// below is not added in this, I wonder if that would cause any problems in future but so far no problem.
// export {default} from 'next-auth/middleware'

const withLocale = createMiddleware({
    // A list of all locales that are supported
    locales: ['en','tr','ru'],

    // Used when no locale matches
    defaultLocale: 'en',
    localePrefix:'as-needed'

});

// Cloudflare names the visitor's country on every request. It is kept in a
// cookie the browser can read, so a page can show a US visitor inches.
export default function middleware(request: NextRequest) {
    const response = withLocale(request);
    const country = (request.headers.get('cf-ipcountry') || '').toUpperCase();
    if (/^[A-Z]{2}$/.test(country) && request.cookies.get(VISITOR_COUNTRY_COOKIE)?.value !== country) {
        response.cookies.set(VISITOR_COUNTRY_COOKIE, country, { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' });
    }
    return response;
}



export const config  = {matcher:[
    '/dashboard',
    '/app/:path*',
    
    '/products/:path*',
    
    // below is for locale, above is for next auth
    '/((?!api|static|.*\\..*|_next).*)',
    '/(tr|en|ru)/:path*'
]}
