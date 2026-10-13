// The email a new subscriber gets from the blog's subscribe box or the
// footer form. (The pop-up sends its own, with a discount code.)

type Lang = 'en' | 'tr' | 'ru' | 'pl';
export type WelcomeSource = 'blog' | 'footer';

const SITE = 'https://www.demfirat.com';

const text = {
    blog: {
        subject: {
            en: "You're subscribed to the Demfirat blog",
            tr: 'Demfirat blog aboneliğiniz tamamlandı',
            ru: 'Вы подписались на блог Demfirat',
            pl: 'Subskrybujesz blog Demfirat',
        },
        heading: {
            en: 'Welcome to the Demfirat blog',
            tr: 'Demfirat bloguna hoş geldiniz',
            ru: 'Добро пожаловать в блог Demfirat',
            pl: 'Witamy na blogu Demfirat',
        },
        body: {
            en: "We've been making home textiles since 1991, and the blog is where we share what that has taught us: how to choose a fabric, how it is made and how to make it last. We'll only email you when a new post is out.",
            tr: "1991'den beri ev tekstili üretiyoruz. Blog, bu yılların bize öğrettiklerini paylaştığımız yer: kumaş nasıl seçilir, nasıl üretilir ve nasıl uzun ömürlü olur. Size yalnızca yeni bir yazı yayınlandığında e-posta göndereceğiz.",
            ru: 'Мы производим домашний текстиль с 1991 года, и в блоге делимся тем, чему нас научили эти годы: как выбрать ткань, как её делают и как продлить ей жизнь. Мы будем писать вам, только когда выйдет новая статья.',
            pl: 'Produkujemy tekstylia domowe od 1991 roku, a na blogu dzielimy się tym, czego nas to nauczyło: jak wybrać tkaninę, jak powstaje i jak sprawić, by służyła długo. Napiszemy tylko wtedy, gdy pojawi się nowy wpis.',
        },
        button: { en: 'Read the blog', tr: 'Blogu oku', ru: 'Читать блог', pl: 'Czytaj blog' },
        path: '/blog',
    },
    footer: {
        subject: {
            en: "You're on the Demfirat list",
            tr: 'Demfirat listesine katıldınız',
            ru: 'Вы подписались на новости Demfirat',
            pl: 'Jesteś na liście Demfirat',
        },
        heading: {
            en: 'Welcome to Demfirat',
            tr: "Demfirat'a hoş geldiniz",
            ru: 'Добро пожаловать в Demfirat',
            pl: 'Witamy w Demfirat',
        },
        body: {
            en: "We've been making home textiles since 1991. We'll write to you when there is a new collection to see or a new post on our blog, and not otherwise.",
            tr: "1991'den beri ev tekstili üretiyoruz. Size yalnızca görülecek yeni bir koleksiyon ya da blogumuzda yeni bir yazı olduğunda yazacağız.",
            ru: 'Мы производим домашний текстиль с 1991 года. Мы будем писать вам, только когда появится новая коллекция или новая статья в нашем блоге.',
            pl: 'Produkujemy tekstylia domowe od 1991 roku. Napiszemy tylko wtedy, gdy pojawi się nowa kolekcja lub nowy wpis na blogu.',
        },
        button: { en: 'See our products', tr: 'Ürünleri gör', ru: 'Смотреть товары', pl: 'Zobacz produkty' },
        path: '/product',
    },
    signoff: { en: 'Warm regards,', tr: 'Sevgilerle,', ru: 'С уважением,', pl: 'Pozdrawiamy,' },
    why: {
        en: 'You are receiving this because this address was entered at demfirat.com. If that was not you, unsubscribe below.',
        tr: 'Bu e-postayı, bu adres demfirat.com üzerinde girildiği için alıyorsunuz. Siz girmediyseniz aşağıdan abonelikten çıkabilirsiniz.',
        ru: 'Вы получили это письмо, потому что этот адрес был указан на demfirat.com. Если это были не вы, отпишитесь по ссылке ниже.',
        pl: 'Otrzymujesz tę wiadomość, ponieważ ten adres podano na demfirat.com. Jeśli to nie Ty, wypisz się poniżej.',
    },
    unsubscribe: { en: 'Unsubscribe', tr: 'Abonelikten çık', ru: 'Отписаться', pl: 'Wypisz się' },
    rights: {
        en: 'All rights reserved.',
        tr: 'Tüm hakları saklıdır.',
        ru: 'Все права защищены.',
        pl: 'Wszelkie prawa zastrzeżone.',
    },
};

export function welcomeLang(locale: unknown): Lang {
    return locale === 'tr' || locale === 'ru' || locale === 'pl' ? locale : 'en';
}

export function welcomeEmail(email: string, locale: unknown, source: WelcomeSource) {
    const lang = welcomeLang(locale);
    const copy = text[source];
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
          <td style="padding:40px 40px 28px;">
            <h1 style="color:#2c2c2c;text-align:center;font-family:'Jost',${sans};font-size:24px;margin:0 0 18px;">${copy.heading[lang]}</h1>
            <p style="color:#555;font-size:15px;line-height:1.6;text-align:center;margin:0;">${copy.body[lang]}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px 36px;text-align:center;">
            <a href="${base}${copy.path}" style="display:inline-block;padding:13px 32px;background:#944f05;color:white;text-decoration:none;border-radius:6px;font-family:${sans};font-size:14px;font-weight:600;">${copy.button[lang]}</a>
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
          <td style="background:rgb(250,245,235);padding:16px 40px;text-align:center;">
            <p style="font-family:${sans};font-size:11px;line-height:1.5;color:#999;margin:0 0 8px;">${text.why[lang]}</p>
            <a href="${base}/unsubscribe?email=${encodeURIComponent(email)}" style="font-family:${sans};font-size:11px;color:#999;text-decoration:underline;">${text.unsubscribe[lang]}</a>
            <p style="font-family:${sans};font-size:11px;color:#aaa;margin:8px 0 0;">&copy; ${new Date().getFullYear()} DEMFIRAT. ${text.rights[lang]}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    return { subject: copy.subject[lang], html };
}
