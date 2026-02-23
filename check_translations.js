const fs = require('fs');

const langs = ['tr', 'en', 'ru', 'pl'];
const data = {};

// Load all JSON files safely
langs.forEach(lang => {
    try {
        data[lang] = JSON.parse(fs.readFileSync(`./messages/${lang}.json`, 'utf8'));
    } catch (e) {
        console.error(`Error parsing ${lang}.json:`, e.message);
        process.exit(1);
    }
});

// Helper to get all flat paths from an object
function getPaths(obj, prefix = '') {
    let paths = [];
    for (const [key, value] of Object.entries(obj)) {
        const currentPath = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            paths = paths.concat(getPaths(value, currentPath));
        } else {
            paths.push(currentPath);
        }
    }
    return paths;
}

const baseLang = 'tr';
const basePaths = new Set(getPaths(data[baseLang]));

console.log(`Starting analysis with base language: ${baseLang}`);
console.log(`Total keys in ${baseLang}: ${basePaths.size}\n`);

let hasDiscrepancy = false;

langs.forEach(lang => {
    if (lang === baseLang) return;
    const langPaths = new Set(getPaths(data[lang]));

    const missingInLang = [...basePaths].filter(p => !langPaths.has(p));
    const extraInLang = [...langPaths].filter(p => !basePaths.has(p));

    if (missingInLang.length > 0 || extraInLang.length > 0) {
        hasDiscrepancy = true;
        console.log(`--- Discrepancies in ${lang}.json ---`);
        if (missingInLang.length > 0) {
            console.log(`Missing keys (${missingInLang.length}):\n  ${missingInLang.slice(0, 10).join('\n  ')}${missingInLang.length > 10 ? '\n  ...and ' + (missingInLang.length - 10) + ' more' : ''}`);
        }
        if (extraInLang.length > 0) {
            console.log(`Extra keys (${extraInLang.length}):\n  ${extraInLang.slice(0, 10).join('\n  ')}${extraInLang.length > 10 ? '\n  ...and ' + (extraInLang.length - 10) + ' more' : ''}`);
        }
        console.log('');
    }
});

if (!hasDiscrepancy) {
    console.log("All translation files are perfectly synchronized with the same keys.");
}
