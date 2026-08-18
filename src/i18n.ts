import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";

const locales = ['en.json', 'tr.json']

export default getRequestConfig(async ({ locale }) => {
    // No logging in here. This callback runs once per request for every
    // localized route, and the notFound() branch fires for every bot probing a
    // bad URL — together they flooded stdout hard enough that Railway started
    // dropping messages and the log backpressure stalled the event loop.
    if (!locales.includes((locale + '.json') as any)) {
        notFound();
    }
    const currentLocale = locale as string;
    return {
        locale: currentLocale,
        messages: (await import(`../messages/${currentLocale}.json`)).default,
        timeZone: 'Europe/Istanbul'
    };
});
