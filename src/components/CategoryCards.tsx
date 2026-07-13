import Link from 'next/link';
import Image from 'next/image';
import classes from './CategoryCards.module.css';

type CategoryCardsProps = {
    locale?: string;
};

// Big visual category entry points right under the hero — US e-commerce
// convention is one click from the homepage into a category. Images reuse
// the mega-menu category art so the two stay consistent.
export default function CategoryCards({ locale = 'en' }: CategoryCardsProps) {
    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            heading: { en: 'Shop by Category', tr: 'Kategorilere Göz Atın', ru: 'Категории', pl: 'Kategorie' },
            tulle: { en: 'Sheer & Tulle', tr: 'Tül Perdeler', ru: 'Тюль', pl: 'Firany' },
            embroidered: { en: 'Embroidered', tr: 'Nakışlı Perdeler', ru: 'С вышивкой', pl: 'Haftowane' },
            blackout: { en: 'Blackout', tr: 'Fon Perdeler', ru: 'Блэкаут', pl: 'Zaciemniające' },
            readyMade: { en: 'Ready-Made Curtains', tr: 'Hazır Perdeler', ru: 'Готовые шторы', pl: 'Zasłony gotowe' },
            bedroom: { en: 'Bedroom', tr: 'Yatak Odası', ru: 'Спальня', pl: 'Sypialnia' },
            shopNow: { en: 'Shop now', tr: 'İncele', ru: 'Смотреть', pl: 'Zobacz' },
        };
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || translations[key]?.en || key;
    };

    const categories = [
        {
            key: 'readyMade',
            href: `/${locale}/product/ready-made_curtain`,
            image: '/media/header_pictures/curtain_ready_made.avif',
        },
        {
            key: 'embroidered',
            href: `/${locale}/product/fabric?intent=custom_curtain&fabric_type=embroidery`,
            image: 'https://demfiratkarven.b-cdn.net/media/product_images/product_RK72010/rk72010gw-08-white-sheer-floral-dandelion-embroidered-curtain-grommet-header-installation-top.avif',
        },
        {
            key: 'tulle',
            href: `/${locale}/product/fabric?intent=custom_curtain`,
            image: '/media/header_pictures/curtain_solid.avif',
        },
        {
            key: 'blackout',
            href: `/${locale}/product/fabric?intent=custom_curtain&fabric_type=blackout`,
            image: '/media/header_pictures/curtain_blackout.avif',
        },
        {
            key: 'bedroom',
            href: `/${locale}/product/bed`,
            image: 'https://demfiratkarven.b-cdn.net/media/product_images/product_RADOLF/Gemini_Generated_Image_aaqs7saaqs7saaqs.avif',
        },
    ];

    return (
        <section className={classes.section}>
            <div className={classes.container}>
                <h2 className={classes.heading}>{t('heading')}</h2>
                <div className={classes.grid}>
                    {categories.map((category) => (
                        <Link key={category.key} href={category.href} className={classes.card}>
                            <div className={classes.imageWrap}>
                                <Image
                                    src={category.image}
                                    alt={t(category.key)}
                                    fill
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    className={classes.image}
                                />
                            </div>
                            <div className={classes.label}>
                                <span className={classes.labelTitle}>{t(category.key)}</span>
                                <span className={classes.labelCta}>
                                    {t('shopNow')}
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
