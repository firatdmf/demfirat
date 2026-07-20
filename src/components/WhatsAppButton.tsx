'use client';

import { useLocale } from 'next-intl';
import { FaWhatsapp } from 'react-icons/fa';
import classes from './WhatsAppButton.module.css';

const WHATSAPP_NUMBER = '905010571884';

// Fixed bottom-right entry point to WhatsApp — the primary contact channel
// now that checkout has no online payment (see checkout/page.tsx notice).
export default function WhatsAppButton() {
    const locale = useLocale();

    const message = locale === 'tr'
        ? 'Merhaba, bir siparişle ilgili bilgi almak istiyorum.'
        : 'Hello, I would like some information about placing an order.';

    const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    const label = locale === 'tr' ? "WhatsApp'tan yazın" : 'Chat on WhatsApp';

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={classes.button}
            aria-label={label}
            title={label}
        >
            <FaWhatsapp className={classes.icon} />
        </a>
    );
}
