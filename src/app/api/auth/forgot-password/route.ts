
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        console.log(`[ForgotPassword] Request received for email: ${email}`);

        // Check if user exists in Django DB via API
        const djangoResponse = await fetch(
            `${process.env.NEJUM_API_URL}/authentication/api/check_web_client_email/`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            }
        );

        if (!djangoResponse.ok) {
            console.error('[ForgotPassword] Django API error:', await djangoResponse.text());
            // Return success to prevent enumeration if API fails
            return NextResponse.json({ message: 'If an account exists, an email has been sent.' });
        }

        const data = await djangoResponse.json();

        if (!data.exists) {
            console.log(`[ForgotPassword] User not found for email: ${email}`);
            return NextResponse.json({ message: 'If an account exists, an email has been sent.' });
        }

        const user = data.user;
        console.log(`[ForgotPassword] User found: ${user.id}`);

        // Generate JWT token
        const token = jwt.sign(
            { email: user.email, type: 'reset' },
            process.env.NEXTAUTH_SECRET || 'secret',
            { expiresIn: '1h' }
        );

        // Send email
        const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;
        console.log(`[ForgotPassword] Sending reset email to: ${user.email}`);

        const emailResult = await sendEmail(
            user.email,
            'Reset Your Password',
            `
        <p>Hello <strong>${user.name || user.email.split('@')[0]}</strong>,</p>
        <p>You requested a password reset.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `
        );

        console.log('[ForgotPassword] Email send result:', emailResult);

        if (!emailResult.success) {
            console.error('[ForgotPassword] Failed to send email:', emailResult.error);
            return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Password reset link sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json(
            { error: 'An error occurred' },
            { status: 500 }
        );
    }
}
