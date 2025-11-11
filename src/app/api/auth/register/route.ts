import { NextResponse } from 'next/server';

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

    return NextResponse.json(data, { status: djangoResponse.status });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
