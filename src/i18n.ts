import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales = ['en.json', 'ru.json', 'tr.json', 'pl.json']

export default getRequestConfig(async ({ locale }) => {
    console.log('i18n request config locale:', locale);
    if (!locales.includes((locale + '.json') as any)) {
        console.log('i18n locale not found, triggering notFound()');
        notFound();
    }
    const currentLocale = locale as string;
    return {
        locale: currentLocale,
        messages: (await import(`../messages/${currentLocale}.json`)).default
    };
});
