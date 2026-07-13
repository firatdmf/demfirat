import classes from './TrustBand.module.css';

type TrustBandProps = {
    locale?: string;
};

// Slim certification band shown under the hero. These are the brand's real,
// verifiable certifications (they already live in the footer's small print) —
// surfaced here because NFPA 701 / OEKO-TEX carry real weight with US
// shoppers and were previously invisible.
export default function TrustBand({ locale = 'en' }: TrustBandProps) {
    const t = (key: string) => {
        const translations: Record<string, Record<string, string>> = {
            oekotex: {
                en: 'OEKO-TEX® Certified Fabrics',
                tr: 'OEKO-TEX® Sertifikalı Kumaşlar',
                ru: 'Ткани с сертификатом OEKO-TEX®',
                pl: 'Tkaniny z certyfikatem OEKO-TEX®',
            },
            nfpa: {
                en: 'NFPA 701 Flame Retardant',
                tr: 'NFPA 701 Güç Tutuşurluk',
                ru: 'Огнестойкость NFPA 701',
                pl: 'Trudnopalność NFPA 701',
            },
            heritage: {
                en: 'Handcrafted Since 1991',
                tr: "1991'den Beri El İşçiliği",
                ru: 'Ручная работа с 1991 года',
                pl: 'Rękodzieło od 1991 roku',
            },
            iso: {
                en: 'ISO 9001 Quality Management',
                tr: 'ISO 9001 Kalite Yönetimi',
                ru: 'Менеджмент качества ISO 9001',
                pl: 'Zarządzanie jakością ISO 9001',
            },
        };
        const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
        return translations[key]?.[lang] || translations[key]?.en || key;
    };

    const items = [
        {
            label: t('oekotex'),
            icon: (
                // leaf
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                </svg>
            ),
        },
        {
            label: t('nfpa'),
            icon: (
                // shield
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                </svg>
            ),
        },
        {
            label: t('heritage'),
            icon: (
                // needle & thread
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Z" />
                    <path d="M13.5 10.5 21 3m-7.5 7.5a15.995 15.995 0 0 1-1.622 3.395m1.622-3.395a15.996 15.996 0 0 1 4.649-4.763" />
                </svg>
            ),
        },
        {
            label: t('iso'),
            icon: (
                // ribbon / badge
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="9" r="6" />
                    <path d="m9 14.5-1.5 7L12 19l4.5 2.5L15 14.5" />
                </svg>
            ),
        },
    ];

    return (
        <div className={classes.trustBand}>
            <div className={classes.trustBandInner}>
                {items.map((item) => (
                    <div key={item.label} className={classes.trustItem}>
                        <span className={classes.trustIcon} aria-hidden="true">{item.icon}</span>
                        <span className={classes.trustLabel}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
