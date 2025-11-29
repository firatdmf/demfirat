
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { name, email, username, password } = await request.json();

    // Basic validation
    if (!name || !email || !username || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Forward to Django ERP API
    const djangoResponse = await fetch(
      `${process.env.NEJUM_API_URL}/authentication/api/create_web_client/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          username,
          password,
        }),
      }
    );

    const data = await djangoResponse.json();

    if (!djangoResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Registration failed' },
        { status: djangoResponse.status }
      );
    }

    // User is created as inactive by Django API default (modified)
    console.log(`[Register] User created via Django API. Email verification required.`);

    // Generate JWT verification token
    const token = jwt.sign(
      { email, type: 'verify' },
      process.env.NEXTAUTH_SECRET || 'secret',
      { expiresIn: '24h' }
    );

    // Send verification email
    const verifyUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${token}`;

    await sendEmail(
      email,
      'Verify Your Email',
      `
        <h1>Welcome to Demfirat Karven!</h1>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 24 hours.</p>
      `
    );

    return NextResponse.json({
      message: 'Registration successful. Please check your email to verify your account.',
      user: data
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
