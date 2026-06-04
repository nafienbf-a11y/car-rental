import { en } from 'file:///C:/Users/NAFIE/Desktop/Personal/projects/car-rental/src/locales/en.js';
import { fr } from 'file:///C:/Users/NAFIE/Desktop/Personal/projects/car-rental/src/locales/fr.js';
import { es } from 'file:///C:/Users/NAFIE/Desktop/Personal/projects/car-rental/src/locales/es.js';
import { ar } from 'file:///C:/Users/NAFIE/Desktop/Personal/projects/car-rental/src/locales/ar.js';

function getKeys(obj, prefix = '') {
    let keys = [];
    for (let key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
            keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
        } else {
            keys.push(prefix + key);
        }
    }
    return keys;
}

const enKeys = getKeys(en);
const locales = { fr, es, ar };

for (let lang in locales) {
    const langKeys = new Set(getKeys(locales[lang]));
    const missing = enKeys.filter(k => !langKeys.has(k));
    console.log(`\n=== Missing keys in ${lang} (${missing.length}) ===`);
    if (missing.length > 0) {
        console.log(missing.join('\n'));
    }
}
