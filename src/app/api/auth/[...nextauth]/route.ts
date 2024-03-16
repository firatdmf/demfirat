import { authOptions } from '@/utils/authOptions'
// import NextAuth from 'next-auth/next'
import NextAuth from 'next-auth'


// NextAuth exports one catch all route handler
const handler = NextAuth(authOptions);
// export handler as get and post function
export { handler as GET, handler as POST };

