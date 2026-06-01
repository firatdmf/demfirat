import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEJUM_API_URL ?? '';

/*
 * POST /api/auth/login — proxy to Django's login_web_client.
 * Body: { username, password }
 * On success returns { user: {id, username, email, name} }.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = (body.username ?? '').trim();
    const password = body.password ?? '';
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Kullanıcı adı ve şifre gerekli.' },
        { status: 400 },
      );
    }
    if (!API_URL) {
      return NextResponse.json(
        { error: 'Backend bağlı değil.' },
        { status: 503 },
      );
    }
    const res = await fetch(`${API_URL}/authentication/api/login_web_client/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { error: 'Ağ hatası — tekrar deneyin.' },
      { status: 500 },
    );
  }
}
