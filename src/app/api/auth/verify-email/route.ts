
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    console.log('Verify email API called');
    try {
        const { token } = await request.json();
        console.log('Token received:', token);

        if (!token) {
            return NextResponse.json({ error: 'Token is required' }, { status: 400 });
        }

        // Verify JWT token
        let decoded: any;
        try {
            decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret');
        } catch (err) {
            return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
        }

        if (decoded.type !== 'verify' || !decoded.email) {
            return NextResponse.json({ error: 'Invalid token type' }, { status: 400 });
        }

        console.log(`[VerifyEmail] Verifying email: ${decoded.email}`);

        // Call Django API to verify email
        const djangoResponse = await fetch(
            `${process.env.NEJUM_API_URL}/authentication/api/verify_email/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: decoded.email,
                }),
            }
        );

        if (!djangoResponse.ok) {
            const errorData = await djangoResponse.json();
            console.error('[VerifyEmail] Django API error:', errorData);
            return NextResponse.json({ error: errorData.error || 'Failed to verify email' }, { status: djangoResponse.status });
        }

        console.log('[VerifyEmail] Email verified successfully via Django API');

        return NextResponse.json({ message: 'Email verified successfully' });

    } catch (error) {
        console.error('Verify email error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({ message: 'Verify email API is working' });
}
