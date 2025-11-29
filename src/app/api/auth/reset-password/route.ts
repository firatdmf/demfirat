
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json();

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 });
        }

        // Verify JWT token
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret');
        } catch (err) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        if (decoded.type !== 'reset' || !decoded.email) {
            return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });
        }

        console.log(`[ResetPassword] Resetting password for email: ${decoded.email}`);

        // Call Django API to reset password
        const djangoResponse = await fetch(
            `${process.env.NEJUM_API_URL}/authentication/api/reset_password/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: decoded.email,
                    new_password: password,
                }),
            }
        );

        if (!djangoResponse.ok) {
            const errorData = await djangoResponse.json();
            console.error('[ResetPassword] Django API error:', errorData);
            return NextResponse.json({ error: errorData.error || 'Failed to reset password' }, { status: djangoResponse.status });
        }

        console.log('[ResetPassword] Password reset successful via Django API');

        return NextResponse.json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
