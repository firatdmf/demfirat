import { NextRequest, NextResponse, after } from 'next/server';
import { sendEmail } from '@/lib/email';
import { welcomeEmail } from '@/lib/welcomeEmail';
import { checkRecaptcha } from '@/lib/recaptcha';

const BACKEND_URL = process.env.NEXT_PUBLIC_NEJUM_API_URL || 'http://127.0.0.1:8000';

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

        const verdict = await checkRecaptcha(body.recaptchaToken);
        if (verdict !== 'ok') {
            return NextResponse.json(
                { success: false, error: messages[verdict === 'bot' ? 'bot' : 'unverified'][lang] },
                { status: 403 }
            );
        }

        // The footer form and the blog's subscribe box take one way to reach
        // the person: an email address or a phone number. No sign-up here
        // earns a discount code (the 15% pop-up is gone).
        const contact = String(body.contact ?? body.email ?? '').trim();
        const contactEmail = contact.includes('@') ? contact : '';
        const contactPhone = contactEmail ? '' : contact;
        const subscribeBody = { email: contactEmail, phone: contactPhone, skip_discount: true, language: body.locale };

        // Call Django backend to validate and create subscription. The key
        // proves the call comes from this server, after the reCAPTCHA check
        // above: the ERP refuses sign-ups without it.
        const response = await fetch(`${BACKEND_URL}/marketing/api/subscribe/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Storefront-Key': process.env.STOREFRONT_API_KEY ?? '',
            },
            body: JSON.stringify(subscribeBody),
        });

        const data = await response.json();

        // A short welcome; someone who left a phone number has no inbox to
        // welcome. The email goes out after the answer: talking to the mail
        // server takes seconds, and the visitor is waiting on "Subscribed".
        if (data.success) {
            if (contactEmail) {
                const welcome = welcomeEmail(contactEmail, body.locale, body.source === 'blog' ? 'blog' : 'footer');
                after(async () => {
                    const sent = await sendEmail(contactEmail, welcome.subject, welcome.html);
                    console.log('[Subscribe] Welcome email', sent.success ? 'sent to:' : 'failed for:', contactEmail);
                });
            }
            return NextResponse.json({ success: true });
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
