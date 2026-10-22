import { getSession, signOut } from 'next-auth/react';

/*
 * fetch for the ERP's customer endpoints — every /authentication/api/
 * route that names the customer by id. Django answers them only with
 * the token login_web_client (or create_google_client) signed for that
 * id, which authOptions keeps on the session as user.erpToken.
 *
 * A 401 means the token is missing (a session from before tokens),
 * expired or not this customer's, so the customer is signed out and
 * sent to /login to get a fresh one.
 */

let token: string | null = null;
let signingOut = false;

async function erpToken(): Promise<string | null> {
  // Only a token is remembered: a page that asked before sign-in must
  // still find the one the session carries afterwards.
  if (token) return token;
  try {
    const session = await getSession();
    token = (session?.user as { erpToken?: string } | undefined)?.erpToken ?? null;
  } catch {
    token = null;
  }
  return token;
}

export async function erpFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  const bearer = await erpToken();
  if (bearer) headers.set('Authorization', `Bearer ${bearer}`);
  const res = await fetch(url, { ...init, headers });
  if (res.status === 401 && !signingOut) {
    signingOut = true;
    token = null;
    signOut({ callbackUrl: '/login' });
  }
  return res;
}
