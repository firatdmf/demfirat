
import { Product } from "./interfaces";

/**
 * Helper to get localized field (title or description) from JSON format in product description
 * Format: {"translations": {"tr": {"title": "...", "description": "..."}, "en": {...}}}
 * 
 * @param product The product object
 * @param field The field to retrieve ('title' or 'description')
 * @param locale The current locale
 * @returns The localized string or the default/original value
 */
export const getLocalizedProductField = (product: Product, field: 'title' | 'description', locale: string = 'en'): string => {
    const description = product.description;
    const defaultTitle = product.title;
    const defaultDescription = product.description || "";

    // If no description, return default values
    if (!description) {
        return field === 'title' ? defaultTitle : defaultDescription;
    }

    try {
        // Check if it looks like JSON before parsing to avoid unnecessary errors
        if (!description.trim().startsWith('{')) {
            return field === 'title' ? defaultTitle : defaultDescription;
        }

        const parsed = JSON.parse(description);

        // Check for translations object
        if (parsed.translations && typeof parsed.translations === 'object') {
            // 1. Try to get the field for current locale
            const localeData = parsed.translations[locale];
            if (localeData && localeData[field]) {
                return localeData[field];
            }

            // 2. Fallback to English if current locale not found
            if (parsed.translations['en'] && parsed.translations['en'][field]) {
                return parsed.translations['en'][field];
            }

            // 3. Fallback to first available translation
            const firstLocale = Object.keys(parsed.translations)[0];
            if (firstLocale && parsed.translations[firstLocale][field]) {
                return parsed.translations[firstLocale][field];
            }
        }

        // If parsed but field not found in translations (or translations missing), 
        // check if the top-level keys exist (e.g. if json is just flat key-value wrapper, though uncommon for this specific requirement)
        // For now, adhere to the specific structure: { ... "translations": { ... } }

        // If we are looking for description and it was JSON but we didn't find a translation, 
        // we might want to return the original description ONLY if it wasn't purely a JSON container.
        // However, if the description field IS the JSON container, returning it as is (raw JSON) is usually bad for UI.
        // So if parsing succeeded but no translation found, we might want to return empty string for description to avoid showing JSON code, 
        // OR return defaultTitle for title.

        // BUT, existing logic suggests if it's not in the expected format, return as is.
        // Let's stick to the behavior: if it parsed as JSON but didn't have what we wanted, 
        // it effectively "consumed" the description.

        // If the valid JSON doesn't have the translations we need, we should probably fall back to defaultTitle for title.
        // For description, if it is JSON, we shouldn't show raw JSON.

        return field === 'title' ? defaultTitle : defaultDescription;

    } catch (e) {
        // Not JSON format, return default for title, or as-is for description
        return field === 'title' ? defaultTitle : defaultDescription;
    }
};
