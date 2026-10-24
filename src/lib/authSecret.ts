/**
 * The secret that signs website sessions and the email-verification and
 * password-reset links. There is no fallback: these routes used to sign
 * with the word 'secret' when it was missing, and anyone knowing that could
 * forge a link to verify or take over any account. A missing secret now
 * fails the request instead. Read per request, not at import, so a build
 * without it still succeeds.
 */
export function authSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error('NEXTAUTH_SECRET is not set');
  return secret;
}
