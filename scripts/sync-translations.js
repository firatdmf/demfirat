const fs = require('fs');
const path = require('path');

const MESSAGES_DIR = path.join(__dirname, '../messages');
const BASE_LANG = 'tr';
const OTHER_LANGS = ['en', 'ru', 'pl'];
const PREFIX = '[TRANSLATE] ';

// Sort object keys alphabetically recursively
function sortObjectKeys(obj) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
        return obj;
    }

    return Object.keys(obj).sort().reduce((acc, key) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
    }, {});
}

// Deep clone object
function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Sync target object with source object structure
function syncObjects(source, target) {
    const result = {};

    for (const key in source) {
        if (typeof source[key] === 'object' && source[key] !== null) {
            // It's a nested object
            if (!target[key] || typeof target[key] !== 'object') {
                // Target doesn't have it or it's not an object, create new
                result[key] = syncObjects(source[key], {});
            } else {
                // Target has it, recursion
                result[key] = syncObjects(source[key], target[key]);
            }
        } else {
            // It's a string value
            if (target[key] !== undefined && target[key] !== null && target[key] !== '') {
                // Keep existing translation
                result[key] = target[key];
            } else {
                // Missing translation, copy from source and add prefix
                let newVal = source[key];
                // Only prefix if it's not empty and doesn't already have the prefix
                if (typeof newVal === 'string' && newVal.trim() !== '' && !newVal.startsWith(PREFIX)) {
                    newVal = PREFIX + newVal;
                }
                result[key] = newVal;
            }
        }
    }

    return result;
}

try {
    // 1. Read Base File
    const basePath = path.join(MESSAGES_DIR, `${BASE_LANG}.json`);
    const baseData = JSON.parse(fs.readFileSync(basePath, 'utf8'));

    // 2. Sort base file locally to ensure source of truth is clean
    const sortedBaseData = sortObjectKeys(baseData);
    fs.writeFileSync(basePath, JSON.stringify(sortedBaseData, null, 2) + '\n');
    console.log(`✅ Sorted and formatted ${BASE_LANG}.json`);

    // 3. Sync other languages
    let totalMissingAdded = 0;

    OTHER_LANGS.forEach(lang => {
        const langPath = path.join(MESSAGES_DIR, `${lang}.json`);
        let langData = {};

        if (fs.existsSync(langPath)) {
            langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
        }

        // Sync with base
        const syncedData = syncObjects(sortedBaseData, langData);

        // Sort synced data
        const sortedSyncedData = sortObjectKeys(syncedData);

        // Write back
        fs.writeFileSync(langPath, JSON.stringify(sortedSyncedData, null, 2) + '\n');
        console.log(`✅ Synced and formatted ${lang}.json`);
    });

    console.log('\n✅ Translation sync complete!');
    console.log(`Search for "${PREFIX}" in your editor to find newly added texts that need manual translation.`);

} catch (error) {
    console.error('❌ Error syncing translations:', error);
    process.exit(1);
}
