// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import { NextResponse } from "next/server";

// export async function middleWare(req) {
//     const res = NextResponse.next();
//     const supabase = createMiddlewareClient({req,res})
//     await supabase.auth.getSession()
// }

// the above code is from way before that I did not make it work I guess

// import {i18nRouter} from 'next-i18n-router'
// import i18nConfig from './i18nConfig'

// below is from ethan to protect routes without having to protecting pages directly

export {default} from 'next-auth/middleware'
export const config  = {matcher:[
    '/dashboard',
    '/app/:path*',

    
    // '/products/:path*',

    // below is for locale, above is for next auth
    // '/((?!api|static|.*\\..*|_next).*)',
    // '/(id|en)/:path*'
]}

// const newConfig  = {matcher:'/((?!api|static|.*\\..*|_next).*)'
// }




// below takes the user preferred language from the browser and returns it. If it is a language we do not support, it will just return the default locale
// Takes it from the acceptLanguage header
// export function middleware(request:any){
//     return i18nRouter(request,i18nConfig)
// }
