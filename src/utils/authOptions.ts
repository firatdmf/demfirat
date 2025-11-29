
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

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
                username: {
                    label: 'Username',
                    type: 'text',
                    placeholder: 'Enter your username',
                },
                password: { label: 'Password', type: 'password' }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials.password) {
                    return null;
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
                        return null;
                    }

                    const data = await response.json();
                    console.log('Full Django Login Response:', JSON.stringify(data, null, 2));

                    // Try to find the user object. 
                    // User mentioned "web_client is actually user", so check for that too.
                    const user = data.user || data.web_client || data;

                    // Check if user is active (email verified)
                    if (user && typeof user.is_active !== 'undefined') {
                        if (user.is_active === false) {
                            console.log('User is not active (from Django), blocking login');
                            throw new Error('Please verify your email address.');
                        }
                    } else {
                        console.warn('Django API did not return is_active field. Allowing login.');
                    }

                    return {
                        id: user.id + '',
                        email: user.email,
                        username: user.username,
                        name: user.name,
                    };
                } catch (error: any) {
                    console.error('Login error:', error);
                    throw new Error(error.message || 'Login failed');
                }
            }
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
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
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id,
                    randomKey: token.randomKey
                }
            };
        },
        jwt: ({ token, user }) => {
            if (user) {
                const u = user as unknown as any;
                return {
                    ...token,
                    id: u.id,
                    randomKey: u.randomKey
                };
            }
            return token;
        }
    }
};