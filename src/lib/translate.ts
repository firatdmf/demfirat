// How catalog terms — attribute names, their values, product group names —
// read in each language.
//
// The wordings are kept in the ERP (Marketing → Attribute wording) and asked
// for here; this file used to carry them as a hand-written table, which meant
// a new colour read in English on the Turkish site until somebody edited the
// code. A term nobody has worded is shown from its stored English key
// ("dark_cream" → "Dark cream").

export type ErpWordings = {
    names?: { [attribute: string]: { [lang: string]: string } };
    // values[""] holds the values worded for any attribute ("yes").
    values?: { [attribute: string]: { [value: string]: { [lang: string]: string } } };
    groups?: { [group: string]: { [lang: string]: string } };
};

type ByLanguage = { [lang: string]: string };

let wordings: { [term: string]: ByLanguage } = {};

/** A term as the ERP spells it for matching: lower case, underscores as
 *  spaces, single spaces. */
function termKey(text: string): string {
    return text.toLowerCase().replace(/_/g, ' ').split(/\s+/).filter(Boolean).join(' ');
}

/** Take the ERP's answer. A term is looked up by its own word alone here, so
 *  where two attributes word the same value differently the first is kept;
 *  a value worded under its own attribute wins over one worded for any, and
 *  a name or a group over both. */
export function setErpWordings(data: ErpWordings | null | undefined) {
    const flat: { [term: string]: ByLanguage } = {};
    if (data) {
        const values = data.values || {};
        const scopes = Object.keys(values).sort((a, b) => (a === '' ? 1 : 0) - (b === '' ? 1 : 0));
        for (const scope of scopes) {
            for (const [value, byLang] of Object.entries(values[scope])) {
                const key = termKey(value);
                if (!flat[key]) flat[key] = byLang;
            }
        }
        for (const [name, byLang] of Object.entries(data.groups || {})) {
            flat[termKey(name)] = byLang;
        }
        for (const [name, byLang] of Object.entries(data.names || {})) {
            flat[termKey(name)] = byLang;
        }
    }
    wordings = flat;
}

/** Ask the ERP for its wordings. Server side only; kept for five minutes.
 *  Any failure answers null, and terms read from their keys. */
export async function fetchErpWordings(): Promise<ErpWordings | null> {
    const base = process.env.NEJUM_API_URL || process.env.NEXT_PUBLIC_NEJUM_API_URL;
    if (!base) return null;
    try {
        const response = await fetch(`${base}/marketing/api/attribute_translations/`, {
            next: { revalidate: 300 },
        });
        if (!response.ok) return null;
        return (await response.json()) as ErpWordings;
    } catch {
        return null;
    }
}

/** How a term reads in `targetLang`: its wording, else its key tidied up. */
export function translateTextSync(text: string, targetLang: string): string {
    if (!text) return '';
    const worded = wordings[termKey(text)]?.[targetLang.toLowerCase()];
    if (worded) return worded;
    return text.charAt(0).toUpperCase() + text.slice(1).replace(/_/g, ' ');
}

/** The same answer for callers that await it. */
export async function translateText(text: string, targetLang: string): Promise<string> {
    return translateTextSync(text, targetLang);
}
