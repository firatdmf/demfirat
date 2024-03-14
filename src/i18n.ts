import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server"

// I am getting the file names in messages folder to identify which languages I have available
const fs = require('fs')
const dir = './messages/'
const locales = fs.readdirSync(dir) //['en.json', 'id.json','ru.json','pl.json']

// below locale is from the url: for example /en
export default getRequestConfig(async ({ locale }) => {
    if (!locales.includes((locale + '.json') as any))
        notFound();
    return {
        messages: (await import(`../messages/${locale}.json`)).default
    };
});
