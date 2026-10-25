/*
 * reCAPTCHA v3: the browser asks Google for a token, the server checks it.
 * The script loads in the layout with NEXT_PUBLIC_RECAPTCHA_SITE_KEY; the
 * check uses RECAPTCHA_SECRET_KEY. With no secret set (local development)
 * every request passes.
 */

/** A token for `action`, or '' when reCAPTCHA isn't loaded. Browser only. */
export async function recaptchaToken(action: string): Promise<string> {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const grecaptcha = typeof window !== 'undefined' ? (window as any).grecaptcha : undefined;
  if (!siteKey || !grecaptcha) return '';
  try {
    return await grecaptcha.execute(siteKey, { action });
  } catch (err) {
    console.warn('reCAPTCHA failed:', err);
    return '';
  }
}

/** Google's verdict on a token: 'ok', 'missing' (none sent) or 'bot'
 *  (rejected, or scored below 0.3). Server only. */
export async function checkRecaptcha(token: unknown): Promise<'ok' | 'missing' | 'bot'> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) return 'ok';
  if (!token || typeof token !== 'string') return 'missing';
  const res = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token }),
  });
  const data = await res.json();
  if (!data.success || data.score < 0.3) {
    console.log('[reCAPTCHA] failed:', data);
    return 'bot';
  }
  return 'ok';
}
