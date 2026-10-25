import { NextRequest, NextResponse } from 'next/server';
import { checkRecaptcha } from '@/lib/recaptcha';

const BACKEND_URL = process.env.NEXT_PUBLIC_NEJUM_API_URL || 'http://127.0.0.1:8000';

// Photos past this are left out, as the old upload route refused them.
const MAX_PHOTO_BYTES = 20 * 1024 * 1024;

const messages = {
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

// A guest review and its photos, as one form from the review page. After the
// reCAPTCHA check it goes on to the ERP with this server's key; the ERP makes
// the photos AVIF and stores them on Bunny, so the storefront holds no Bunny
// credentials.
export async function POST(request: NextRequest) {
    let lang: 'en' | 'tr' | 'ru' = 'en';
    try {
        const form = await request.formData();
        const locale = form.get('locale');
        lang = locale === 'tr' || locale === 'ru' ? locale : 'en';

        if (await checkRecaptcha(form.get('recaptchaToken')) !== 'ok') {
            return NextResponse.json({ success: false, error: messages.unverified[lang] }, { status: 403 });
        }

        const review = new FormData();
        for (const [name, value] of form.entries()) {
            if (name === 'recaptchaToken' || name === 'locale') continue;
            if (name === 'images' && (typeof value === 'string' || value.size > MAX_PHOTO_BYTES)) continue;
            review.append(name, value);
        }

        const response = await fetch(`${BACKEND_URL}/marketing/api/guest_review/`, {
            method: 'POST',
            headers: { 'X-Storefront-Key': process.env.STOREFRONT_API_KEY ?? '' },
            body: review,
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[Review API] Error:', error);
        return NextResponse.json({ success: false, error: messages.server[lang] }, { status: 500 });
    }
}
