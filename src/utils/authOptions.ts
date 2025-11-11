import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'

export const authOptions: NextAuthOptions = {
    session: {
        strategy: 'jwt'
    },
    pages: {
        signIn: '/login',
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
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
                if (!credentials?.username || !credentials.password) {
                    return null
                }

                try {
                    // Call Django ERP login API
                    const response = await fetch(
                        `${process.env.NEJUM_API_URL}/authentication/api/login_web_client/`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                username: credentials.username,
                                password: credentials.password,
                            }),
                        }
                    );

                    if (!response.ok) {
                        return null
                    }

                    const data = await response.json();
                    const user = data.user;

                    return {
                        id: user.id + '',
                        email: user.email,
                        username: user.username,
                        name: user.name,
                    }
                } catch (error) {
                    console.error('Login error:', error);
                    return null
                }
            }
        })
    ],
    secret:process.env.NEXTAUTH_SECRET,
    callbacks: {
        async signIn({ user, account, profile }) {
            // Google OAuth sign in
            if (account?.provider === 'google' && profile?.email) {
                try {
                    // Call Django API to create/check Google user
                    const response = await fetch(
                        `${process.env.NEJUM_API_URL}/authentication/api/create_google_client/`,
                        {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                email: profile.email,
                                name: profile.name || 'Google User',
                            }),
                        }
                    );

                    if (!response.ok) {
                        console.error('Error creating Google user');
                        return false;
                    }
                } catch (error) {
                    console.error('Error creating Google user:', error);
                    return false;
                }
            }
            return true;
        },
        session: ({ session, token }) => {
            // console.log('Session Callback', { session, token });
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
            // console.log('JWT Callback', { token, user });
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