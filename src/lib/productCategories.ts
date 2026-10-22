// Single source of truth for product listing route keys (/product/<key>).
//
// Most keys are a real product category the API knows ('fabric', 'bed', ...).
// A few are *groups*: one listing page that pulls several categories together.
// Anything that needs to know "does this key cover more than one category?"
// asks here instead of testing for a specific key, so adding a group later
// means adding a row below rather than hunting down `=== 'curtain'` checks.

export type CategoryGroup = {
    /** Real API categories this listing fetches, in display order. */
    categories: string[];
    /** Localized listing title; falls back to the generic label. */
    names?: Record<string, string>;
    /** Show the tulle / rustic tabs above the grid. */
    curtainTabs?: boolean;
};

export const CATEGORY_GROUPS: Record<string, CategoryGroup> = {
    // The top-menu "Perdeler / Curtains" landing page.
    curtain: {
        categories: ['fabric', 'ready-made_curtain'],
        names: { tr: 'Perdeler', en: 'Curtains', ru: 'Шторы', pl: 'Zasłony' },
        curtainTabs: true,
    },
    // Site search results — same catalogue, filtered client-side by ?search=.
    search: {
        categories: ['fabric', 'ready-made_curtain'],
    },
};

/** Localized titles for single-category listings. */
export const CATEGORY_NAMES: Record<string, Record<string, string>> = {
    fabric: {
        tr: 'Kumaşlar & Tül Perdeler',
        en: 'Fabrics & Tulle Curtains',
        ru: 'Ткани и Тюлевые Шторы',
        pl: 'Tkaniny i Firany',
    },
    'ready-made_curtain': {
        tr: 'Hazır Perdeler',
        en: 'Ready Made Curtains',
        ru: 'Готовые Шторы',
        pl: 'Gotowe Zasłony',
    },
};

/** True when the key is a listing that mixes several categories. */
export function isCategoryGroup(key?: string | null): boolean {
    return !!key && key in CATEGORY_GROUPS;
}

/** The API categories a listing page should fetch for this key. */
export function resolveCategories(key: string): string[] {
    return CATEGORY_GROUPS[key]?.categories ?? [key];
}

/** Localized page title for a listing key. */
export function getCategoryName(key: string, locale: string): string {
    const names = CATEGORY_GROUPS[key]?.names ?? CATEGORY_NAMES[key];
    return names?.[locale] ?? names?.en ?? 'Products';
}

/** Whether the tulle / rustic tabs belong above this listing's grid. */
export function hasCurtainTabs(key?: string | null): boolean {
    return !!key && !!CATEGORY_GROUPS[key]?.curtainTabs;
}
