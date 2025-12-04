'use client';

import { useTranslations } from 'next-intl';
import classes from './KVKK.module.css';

export default function KVKK() {
    const t = useTranslations('KVKK');

    // Helper to safely get array content
    const getList = (key: string) => {
        try {
            return t.raw(key) as string[];
        } catch (error) {
            return [];
        }
    };

    return (
        <div className={classes.container}>
            <h1>{t('title')}</h1>

            <div className={classes.lastUpdate}>
                {t('lastUpdate')}
            </div>

            {/* Section 1: Data Controller / Introduction */}
            <section className={classes.section}>
                <h2>{t('section1.title')}</h2>
                <p>{t('section1.text')}</p>
                <div className={classes.infoBox}>
                    {t.has('section1.companyName') && <p><strong>{t('section1.companyName')}:</strong> Dem Firat</p>}
                    {t.has('section1.address') && <p><strong>{t('section1.address')}:</strong> Vakıflar OSB Mah. D100 Cad. No:38, Ergene/Tekirdağ 59930, Türkiye</p>}
                    {t.has('section1.email') && <p><strong>{t('section1.email')}:</strong> info@demfirat.com</p>}
                    {t.has('section1.phone') && <p><strong>{t('section1.phone')}:</strong> +90 (501) 057-1884</p>}
                </div>
            </section>

            {/* Section 2: Data We Collect */}
            <section className={classes.section}>
                <h2>{t('section2.title')}</h2>
                <p>{t('section2.text')}</p>
                <ul>
                    {getList('section2.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </section>

            {/* Section 3: Purpose */}
            <section className={classes.section}>
                <h2>{t('section3.title')}</h2>
                <p>{t('section3.text')}</p>
                <ul>
                    {getList('section3.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </section>

            {/* Section 4: Data Sharing */}
            <section className={classes.section}>
                <h2>{t('section4.title')}</h2>
                <p>{t('section4.text')}</p>
                <ul>
                    {getList('section4.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
                {t.has('section4.note') && (
                    <p className={classes.note}>
                        {t('section4.note')}
                    </p>
                )}
            </section>

            {/* Section 5: Retention / Security */}
            <section className={classes.section}>
                <h2>{t('section5.title')}</h2>
                <p>{t('section5.text')}</p>
                <ul>
                    {getList('section5.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </section>

            {/* Section 6: Rights */}
            <section className={classes.section}>
                <h2>{t('section6.title')}</h2>
                <p>{t('section6.text')}</p>
                <ul>
                    {getList('section6.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </section>

            {/* Section 7: Exercising Rights / Cookies */}
            <section className={classes.section}>
                <h2>{t('section7.title')}</h2>
                <p>{t('section7.text')}</p>

                {t.has('section7.methodsTitle') && (
                    <div className={classes.contactMethod}>
                        <h3>{t('section7.methodsTitle')}</h3>
                        <ul>
                            {getList('section7.methods').map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                        {t.has('section7.note') && (
                            <p className={classes.note}>
                                {t('section7.note')}
                            </p>
                        )}
                    </div>
                )}
                {/* Fallback for International version which uses section 7 for Cookies */}
                {!t.has('section7.methodsTitle') && getList('section7.items').length > 0 && (
                    <ul>
                        {getList('section7.items').map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Section 8: Cookies / Retention (Intl) */}
            <section className={classes.section}>
                <h2>{t('section8.title')}</h2>
                <p>{t('section8.text')}</p>
                <ul>
                    {getList('section8.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
                {t.has('section8.note') && (
                    <p className={classes.note}>
                        {t('section8.note')}
                    </p>
                )}
            </section>

            {/* Section 9: Security / International Transfers */}
            <section className={classes.section}>
                <h2>{t('section9.title')}</h2>
                <p>{t('section9.text')}</p>
                <ul className={classes.securityList}>
                    {getList('section9.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </section>

            {/* Section 10: Contact */}
            <section className={classes.section}>
                <h2>{t('section10.title')}</h2>
                <p>{t('section10.text')}</p>
                <div className={classes.infoBox}>
                    <p><strong>{t('section10.email')}:</strong> info@demfirat.com</p>
                    <p><strong>{t('section10.phone')}:</strong> +90 (501) 057-1884</p>
                    <p><strong>{t('section10.address')}:</strong> Vakıflar OSB Mah. D100 Cad. No:38, Ergene/Tekirdağ 59930, Türkiye</p>
                </div>
            </section>

            <div className={classes.disclaimer}>
                <p>
                    {t('disclaimer')}
                </p>
            </div>
        </div>
    );
}
