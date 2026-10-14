import { NextRequest, NextResponse, after } from 'next/server';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/welcomeEmail';
import { discountEmail } from '@/lib/discountEmail';

const BACKEND_URL = process.env.NEJUM_API_URL || 'http://127.0.0.1:8000';

// What this route says itself, in the language of the page that called it.
const messages = {
    bot: {
        en: 'This looked like automated activity. Please try again.',
        tr: 'Bot aktivitesi tespit edildi. Lütfen tekrar deneyin.',
        ru: 'Запрос похож на автоматический. Пожалуйста, попробуйте ещё раз.',
    },
    unverified: {
        en: 'We could not verify the request. Please refresh the page and try again.',
        tr: 'Doğrulama başarısız. Sayfayı yenileyip tekrar deneyin.',
        ru: 'Не удалось проверить запрос. Обновите страницу и попробуйте ещё раз.',
    },
    server: {
        en: 'Something went wrong on our side. Please try again.',
        tr: 'Sunucu hatası. Lütfen tekrar deneyin.',
        ru: 'Произошла ошибка на нашей стороне. Пожалуйста, попробуйте ещё раз.',
    },
};

function langOf(locale: unknown): 'en' | 'tr' | 'ru' {
    return locale === 'tr' || locale === 'ru' ? locale : 'en';
}

export async function POST(request: NextRequest) {
    let lang: 'en' | 'tr' | 'ru' = 'en';
    try {
        const body = await request.json();
        lang = langOf(body.locale);

        // Verify reCAPTCHA v3 token
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        if (recaptchaSecret && body.recaptchaToken) {
            const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=${recaptchaSecret}&response=${body.recaptchaToken}`,
            });
            const recaptchaData = await recaptchaRes.json();

            if (!recaptchaData.success || recaptchaData.score < 0.3) {
                console.log('[Subscribe] reCAPTCHA failed:', recaptchaData);
                return NextResponse.json(
                    { success: false, error: messages.bot[lang] },
                    { status: 403 }
                );
            }
            console.log('[Subscribe] reCAPTCHA score:', recaptchaData.score);
        } else if (recaptchaSecret && !body.recaptchaToken) {
            return NextResponse.json(
                { success: false, error: messages.unverified[lang] },
                { status: 403 }
            );
        }

        // The footer form and the blog's subscribe box take one way to reach
        // the person: an email address or a phone number.
        const isFooter = body.source === 'footer' || body.source === 'blog';
        const contact = String(body.contact ?? body.email ?? '').trim();
        const contactEmail = contact.includes('@') ? contact : '';
        const contactPhone = contactEmail ? '' : contact;

        // The pop-up asks for an email, and for a phone on the Turkish site.
        const subscribeBody = isFooter
            ? { email: contactEmail, phone: contactPhone, skip_discount: true, language: body.locale }
            : { email: body.email, phone: body.phone, language: body.locale };

        // Call Django backend to validate and create subscription
        const response = await fetch(`${BACKEND_URL}/marketing/api/subscribe/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscribeBody),
        });

        const data = await response.json();

        // Footer and blog subscriptions: no discount code, a short welcome.
        if (isFooter && data.success) {
            // Someone who left a phone number has no inbox to welcome.
            // The email goes out after the answer: talking to the mail
            // server takes seconds, and the visitor is waiting on "Subscribed".
            if (contactEmail) {
                const welcome = welcomeEmail(contactEmail, body.locale, body.source === 'blog' ? 'blog' : 'footer');
                after(async () => {
                    const sent = await sendEmail(contactEmail, welcome.subject, welcome.html);
                    console.log('[Subscribe] Welcome email', sent.success ? 'sent to:' : 'failed for:', contactEmail);
                });
            }
            return NextResponse.json({ success: true });
        }

        // Popup subscriptions: send discount code email
        if (data.success && data.code) {
            const discountCode = data.code;
            const email = body.email;

            const message = discountEmail(email, body.locale, discountCode);

            // Sent after the answer, like the welcome email above.
            after(async () => {
                const sent = await sendEmail(email, message.subject, message.html);
                console.log('[Subscribe] Discount email', sent.success ? 'sent to:' : 'failed for:', email);
            });
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[Subscribe API] Error:', error);
        return NextResponse.json(
            { success: false, error: messages.server[lang] },
            { status: 500 }
        );
    }
}
