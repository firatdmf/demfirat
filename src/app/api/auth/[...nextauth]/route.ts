import { prisma } from '@/lib/prisma'
import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcrypt'

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt'
    },
    providers: [
        CredentialsProvider({
            name: 'Demfirat',
            credentials: {
                // email: {
                //     label: 'Email',
                //     type: 'email',
                //     placeholder: 'hello@example.com',
                // },
                username:{
                    label:'Username',
                    type:'text',
                    placeholder:'Enter your username',
                },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                // handle auth
                // const user = { id: '1', name: 'Ethan', email: 'test@test.com' }
                // return user

                // if (!credentials?.email || !credentials.password) {
                if (!credentials?.username || !credentials.password) {
                    // null tells auth js that there was an invalid credential set
                    // not that we cannot connect to the database sort of error
                    return null
                }
                const user = await prisma.user.findUnique({
                    where: {
                        // email: credentials.email
                        username: credentials.username

                    }
                })
                if (!user) {
                    return null
                }

                const isPasswordValid = await compare(credentials.password, user.password)
                if (!isPasswordValid) {
                    return null
                }

                return {
                    // You need to store it as text
                    id: user.id + '',
                    email: user.email,
                    username:user.username,
                    name: user.name,
                    randomKey: 'Hey, cool'
                }
            }
        })
    ],
    secret:process.env.NEXTAUTH_SECRET,
    callbacks: {
        session: ({ session, token }) => {
            console.log('Session Callback', { session, token });
            return {
                ...session,
                user: {
                    // always remember this information is used as cookie, so you need to keep it small
                    ...session.user,
                    id: token.id,
                    ramdomKey: token.randomKey
                }
            }
            // return session

        },
        // this handles the creation and ma
        // this token will only show up the first time they login unlike the user info
        jwt: ({ token, user }) => {
            console.log('JWT Callback', { token, user });
            // below means the user has already logged in
            if (user) {
                const u = user as unknown as any
                return {
                    // below logs everything in the token as well as the props that you want to pass through
                    // so it will also assign random key to the token
                    ...token,
                    id: u.id,
                    randomKey: u.randomKey
                }
            }
            return token
        }
    }

}

// NextAuth exports one catch all route handler
const handler = NextAuth(authOptions)
// export handler as get and post function
export { handler as GET, handler as POST }