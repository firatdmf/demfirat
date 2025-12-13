'use client';

import { useParams } from 'next/navigation';
import InstagramFeed from '@/components/InstagramFeed';
import classes from './page.module.css';

export default function FollowUsPage() {
    const params = useParams();
    const locale = params.locale as string;

    // Translations
    const translations: Record<string, Record<string, string>> = {
        pageTitle: {
            en: 'Follow Us',
            tr: 'Bizi Takip Edin',
            ru: 'Подписывайтесь на нас',
            pl: 'Obserwuj nas',
        },
        pageSubtitle: {
            en: 'Stay connected with Karven on social media',
            tr: 'Sosyal medyada Karven ile bağlantıda kalın',
            ru: 'Оставайтесь на связи с Karven в социальных сетях',
            pl: 'Bądź na bieżąco z Karven w mediach społecznościowych',
        },
    };

    const t = (key: string): string => {
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || translations[key]?.['en'] || key;
    };

    return (
        <div className={classes.followUsPage}>
            {/* Hero Section */}
            <div className={classes.hero}>
                <h1>{t('pageTitle')}</h1>
                <p>{t('pageSubtitle')}</p>
            </div>

            {/* Instagram Feed */}
            <InstagramFeed locale={locale} />
        </div>
    );
}
