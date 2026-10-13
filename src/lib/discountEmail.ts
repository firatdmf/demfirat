// The email the newsletter pop-up sends with its single-use discount code,
// in the language of the page the visitor signed up on.

import { welcomeLang } from '@/lib/welcomeEmail';

const SITE = 'https://www.demfirat.com';
// What the ERP gives a pop-up sign-up (marketing.views.newsletter_subscribe).
const PERCENT = 15;

const text = {
    subject: {
        en: `Welcome! Your ${PERCENT}% discount code`,
        tr: `Hoş geldiniz! %${PERCENT} indirim kodunuz`,
        ru: `Добро пожаловать! Ваш код на скидку ${PERCENT}%`,
        pl: `Witamy! Twój kod rabatowy ${PERCENT}%`,
    },
    heading: { en: 'Welcome!', tr: 'Hoş geldiniz!', ru: 'Добро пожаловать!', pl: 'Witamy!' },
    thanks: {
        en: 'Thank you for subscribing to the DEMFIRAT Karven Home Collection newsletter.',
        tr: 'DEMFIRAT Karven Home Collection bültenine abone olduğunuz için teşekkür ederiz.',
        ru: 'Спасибо, что подписались на рассылку DEMFIRAT Karven Home Collection.',
        pl: 'Dziękujemy za zapisanie się do newslettera DEMFIRAT Karven Home Collection.',
    },
    yourCode: {
        en: `Your personal ${PERCENT}% discount code:`,
        tr: `Size özel %${PERCENT} indirim kodunuz:`,
        ru: `Ваш персональный код на скидку ${PERCENT}%:`,
        pl: `Twój osobisty kod rabatowy ${PERCENT}%:`,
    },
    how: {
        en: `Enter this code at checkout to get <strong>${PERCENT}% off</strong> your first order.`,
        tr: `Bu kodu ödeme sayfasında kullanarak ilk siparişinizde <strong>%${PERCENT} indirim</strong> kazanabilirsiniz.`,
        ru: `Введите этот код при оформлении заказа и получите <strong>скидку ${PERCENT}%</strong> на первый заказ.`,
        pl: `Wpisz ten kod przy składaniu zamówienia, aby otrzymać <strong>${PERCENT}% rabatu</strong> na pierwsze zamówienie.`,
    },
    once: {
        en: 'This code can be used once.',
        tr: 'Bu kod tek kullanımlıktır.',
        ru: 'Код можно использовать один раз.',
        pl: 'Kod można wykorzystać jeden raz.',
    },
    shop: { en: 'Start shopping', tr: 'Alışverişe başla', ru: 'Перейти к покупкам', pl: 'Zacznij zakupy' },
    signoff: { en: 'Warm regards,', tr: 'Sevgilerle,', ru: 'С уважением,', pl: 'Pozdrawiamy,' },
    rights: {
        en: 'All rights reserved.',
        tr: 'Tüm hakları saklıdır.',
        ru: 'Все права защищены.',
        pl: 'Wszelkie prawa zastrzeżone.',
    },
    unsubscribe: { en: 'Unsubscribe', tr: 'Abonelikten çık', ru: 'Отписаться', pl: 'Wypisz się' },
};

export function discountEmail(email: string, locale: unknown, code: string) {
    const lang = welcomeLang(locale);
    // English is the site's default language and carries no prefix.
    const base = lang === 'en' ? SITE : `${SITE}/${lang}`;
    const sans = "'Montserrat',Arial,sans-serif";

    const html = `
<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:${sans};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:white;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:rgb(250,245,235);padding:28px 0;text-align:center;">
            <span style="font-family:'Jost',${sans};font-size:28px;font-weight:500;color:#944f05;letter-spacing:2px;">DEMFIRAT</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="color:#2c2c2c;text-align:center;font-family:'Jost',${sans};font-size:26px;margin:0 0 20px;">${text.heading[lang]}</h1>
            <p style="color:#666;font-size:15px;line-height:1.6;text-align:center;margin:0 0 24px;">${text.thanks[lang]}</p>
            <div style="background:linear-gradient(135deg,#c9a961 0%,#b8956a 100%);padding:30px;border-radius:12px;text-align:center;margin:0 0 24px;">
              <p style="color:white;margin:0 0 10px;font-size:14px;">${text.yourCode[lang]}</p>
              <p style="color:white;font-size:32px;font-weight:bold;margin:0;letter-spacing:3px;">${code}</p>
            </div>
            <p style="color:#666;font-size:14px;line-height:1.6;text-align:center;margin:0 0 8px;">${text.how[lang]}</p>
            <p style="color:#999;font-size:12px;text-align:center;margin:24px 0 0;">${text.once[lang]}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="${base}" style="display:inline-block;padding:14px 36px;background:#944f05;color:white;text-decoration:none;border-radius:6px;font-family:${sans};font-size:14px;font-weight:600;">${text.shop[lang]}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px;"><div style="height:1px;background:#e8e2d6;"></div></td>
        </tr>
        <tr>
          <td style="padding:20px 40px;text-align:center;">
            <p style="font-family:${sans};font-size:12px;color:#999;margin:0;">
              ${text.signoff[lang]}<br>
              <strong>DEMFIRAT | Karven Home Collection</strong><br>
              <a href="${SITE}" style="color:#944f05;text-decoration:none;">www.demfirat.com</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background:rgb(250,245,235);padding:14px 40px;text-align:center;">
            <p style="font-family:${sans};font-size:11px;color:#aaa;margin:0 0 8px;">&copy; ${new Date().getFullYear()} DEMFIRAT. ${text.rights[lang]}</p>
            <a href="${base}/unsubscribe?email=${encodeURIComponent(email)}" style="font-family:${sans};font-size:11px;color:#aaa;text-decoration:underline;">${text.unsubscribe[lang]}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    return { subject: text.subject[lang], html };
}
