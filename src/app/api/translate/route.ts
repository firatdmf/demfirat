import { NextRequest, NextResponse } from 'next/server';

// In-memory cache for translations
const translationCache: Map<string, Map<string, string>> = new Map();

// Google Cloud Translation API endpoint
const GOOGLE_TRANSLATE_URL = 'https://translation.googleapis.com/language/translate/v2';

// Language code mapping from our locale to Google
const localeToGoogle: { [key: string]: string } = {
    'en': 'en',
    'tr': 'tr',
    'ru': 'ru',
    'pl': 'pl',
    'de': 'de'
};

export async function POST(request: NextRequest) {
    try {
        const { text, targetLang, sourceLang = 'en' } = await request.json();

        if (!text || !targetLang) {
            return NextResponse.json(
                { error: 'Missing required fields: text, targetLang' },
                { status: 400 }
            );
        }

        // Check if this is English - no translation needed
        if (targetLang.toLowerCase() === 'en') {
            return NextResponse.json({ translatedText: text });
        }

        // Check cache first
        const cacheKey = `${sourceLang}-${targetLang}`;
        if (translationCache.has(cacheKey)) {
            const langCache = translationCache.get(cacheKey)!;
            if (langCache.has(text)) {
                return NextResponse.json({ translatedText: langCache.get(text), cached: true });
            }
        }

        // Get Google API key from environment
        const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
        console.log('[Translate API] API Key exists:', !!apiKey);

        if (!apiKey) {
            console.log('[Translate API] No API key found, returning fallback');
            // Fallback: return original text with proper formatting
            const formatted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace(/_/g, ' ');
            return NextResponse.json({ translatedText: formatted, fallback: true });
        }

        // Map locale to Google language code
        const googleTargetLang = localeToGoogle[targetLang.toLowerCase()] || targetLang;
        const googleSourceLang = localeToGoogle[sourceLang.toLowerCase()] || sourceLang;

        console.log('[Translate API] Calling Google with:', { text, googleTargetLang, googleSourceLang });

        // Call Google Translate API
        const response = await fetch(`${GOOGLE_TRANSLATE_URL}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                q: text,
                target: googleTargetLang,
                source: googleSourceLang,
                format: 'text'
            }),
        });

        console.log('[Translate API] Google response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[Translate API] Google error:', response.status, errorText);
            // Fallback on error
            const formatted = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase().replace(/_/g, ' ');
            return NextResponse.json({ translatedText: formatted, fallback: true, error: errorText });
        }

        const data = await response.json();
        const translatedText = data.data?.translations?.[0]?.translatedText || text;

        // Cache the result
        if (!translationCache.has(cacheKey)) {
            translationCache.set(cacheKey, new Map());
        }
        translationCache.get(cacheKey)!.set(text, translatedText);

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json(
            { error: 'Translation failed' },
            { status: 500 }
        );
    }
}
