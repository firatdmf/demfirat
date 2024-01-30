// import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
// import { NextResponse } from "next/server";

// export async function middleWare(req) {
//     const res = NextResponse.next();
//     const supabase = createMiddlewareClient({req,res})
//     await supabase.auth.getSession()
// }

// the above code is from way before that I did not make it work I guess



// below is from ethan to protect routes without having to protecting pages directly

export {default} from 'next-auth/middleware'
export const config = {matcher:[
    '/dashboard',
    '/app/:path*',
    // '/products/:path*',
]}

