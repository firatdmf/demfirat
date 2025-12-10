'use client';

import { useTranslations } from 'next-intl';
import classes from './IadeSartlari.module.css';

export default function IadeSartlari() {
    const t = useTranslations('ReturnPolicy');

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

            {/* Delivery Section */}
            <section className={classes.section}>
                <h2>{t('delivery.title')}</h2>
                <p>{t('delivery.intro')}</p>
                <div className={classes.deliveryInfo}>
                    <div className={classes.deliveryBox}>
                        <h3>{t('delivery.standardTitle')}</h3>
                        <p className={classes.deliveryTime}>{t('delivery.standardTime')}</p>
                        <p>{t('delivery.standardText')}</p>
                    </div>
                    <div className={classes.deliveryBox}>
                        <h3>{t('delivery.customTitle')}</h3>
                        <p className={classes.deliveryTime}>{t('delivery.customTime')}</p>
                        <p>{t('delivery.customText')}</p>
                    </div>
                </div>
            </section>

            {/* Section 1: General Info */}
            <section className={classes.section}>
                <h2>{t('section1.title')}</h2>
                <p>{t('section1.text')}</p>
            </section>

            {/* Section 2: Withdrawal Period */}
            <section className={classes.section}>
                <h2>{t('section2.title')}</h2>
                <div className={classes.important}>
                    <p><strong>{t('section2.days')}</strong></p>
                    <p>{t('section2.text')}</p>
                </div>
                <ul>
                    {getList('section2.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>
            </section>

            {/* Section 3: How to Exercise */}
            <section className={classes.section}>
                <h2>{t('section3.title')}</h2>
                <p>{t('section3.text')}</p>

                <div className={classes.methodBox}>
                    <h3>{t('section3.methodsTitle')}</h3>
                    <ul>
                        {getList('section3.methods').map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className={classes.note}>
                    {t('section3.note')}
                </div>
            </section>

            {/* Section 4: Returning Product */}
            <section className={classes.section}>
                <h2>{t('section4.title')}</h2>
                <p>{t('section4.text')}</p>
                <ol>
                    {getList('section4.steps').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ol>

                <div className={classes.packagingGuide}>
                    <h3>{t('section4.packagingTitle')}</h3>
                    <ul>
                        {getList('section4.packagingItems').map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* Section 5: Shipping Fees */}
            <section className={classes.section}>
                <h2>{t('section5.title')}</h2>
                <div className={classes.shippingInfo}>
                    <h3>{t('section5.infoTitle')}</h3>
                    <ul>
                        {getList('section5.infoItems').map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className={classes.cargoAddress}>
                    <h3>{t('section5.addressTitle')}</h3>
                    {getList('section5.addressLines').map((line, index) => (
                        <p key={index}>{index === 0 ? <strong>{line}</strong> : line}</p>
                    ))}
                </div>
            </section>

            {/* Section 6: Refunds */}
            <section className={classes.section}>
                <h2>{t('section6.title')}</h2>
                <div className={classes.refundProcess}>
                    <p>{t('section6.text')}</p>

                    <h3>{t('section6.processTitle')}</h3>
                    <ol className={classes.timeline}>
                        {getList('section6.processSteps').map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ol>

                    <h3>{t('section6.methodTitle')}</h3>
                    <ul>
                        {getList('section6.methodItems').map((item, index) => (
                            <li key={index}>{item}</li>
                        ))}
                    </ul>
                </div>

                <div className={classes.note}>
                    {t('section6.note')}
                </div>
            </section>

            {/* Section 7: Exceptions */}
            <section className={classes.section}>
                <h2>{t('section7.title')}</h2>
                <p>{t('section7.text')}</p>
                <ul className={classes.exceptionList}>
                    {getList('section7.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ul>

                <div className={classes.warning}>
                    {t('section7.warning')}
                </div>
            </section>

            {/* Section 8: Defective Products */}
            <section className={classes.section}>
                <h2>{t('section8.title')}</h2>
                <p>{t('section8.text')}</p>
                <ol>
                    {getList('section8.items').map((item, index) => (
                        <li key={index}>{item}</li>
                    ))}
                </ol>

                <div className={classes.warrantyInfo}>
                    <p>{t('section8.info')}</p>
                </div>
            </section>

            {/* Section 9: Exchanges */}
            <section className={classes.section}>
                <h2>{t('section9.title')}</h2>
                <p>{t('section9.text')}</p>
                <div className={classes.note}>
                    {t('section9.note')}
                </div>
            </section>

            {/* Section 10: Contact */}
            <section className={classes.section}>
                <h2>{t('section10.title')}</h2>
                <p>{t('section10.text')}</p>
                <div className={classes.contactBox}>
                    {getList('section10.contactBox').map((item, index) => (
                        <p key={index}>{item}</p>
                    ))}
                </div>
            </section>

            <div className={classes.disclaimer}>
                <p>{t('disclaimer')}</p>
            </div>
        </div>
    );
}
