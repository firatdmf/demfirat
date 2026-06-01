import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.NEJUM_API_URL ?? '';

/*
 * POST /api/subscribe — proxies the Belino footer's newsletter form
 * to Django's marketing/api/subscribe/.
 *
 * The Django endpoint currently requires an email AND a phone (>=10
 * digits). The Belino footer only collects email, so we pass a
 * sentinel phone "0000000000" with skip_discount=true. If you later
 * want real B2B contact data, add a phone field to the footer form
 * or relax phone validation in Django newsletter_subscribe.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = (body.email ?? '').trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ success: false, error: 'E-posta gerekli.' }, { status: 400 });
    }
    if (!API_URL) {
      // No backend wired — pretend success so the demo UI still flows.
      return NextResponse.json({ success: true, message: 'Subscribed (mock).' });
    }
    const res = await fetch(`${API_URL}/marketing/api/subscribe/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        phone: body.phone ?? '0000000000',
        skip_discount: true,
      }),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.ok ? 200 : 400 });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: 'Ağ hatası — tekrar deneyin.' },
      { status: 500 },
    );
  }
}
