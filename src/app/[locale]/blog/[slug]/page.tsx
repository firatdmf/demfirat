import Link from 'next/link';
import { notFound } from 'next/navigation';
import classes from './page.module.css';

// Blog posts content
const blogPostsContent: { [key: string]: any } = {
    'dogru-olcu-nasil-alinir': {
        title: {
            tr: 'Mükemmel Perdeler İçin Rehber: Doğru Perde Ölçüsü Nasıl Alınır?',
            en: 'Guide to Perfect Curtains: How to Measure Correctly?',
            ru: 'Руководство по идеальным шторам: Как правильно измерить?',
            pl: 'Przewodnik po idealnych zasłonach: Jak prawidłowo mierzyć?'
        },
        heroImage: '/media/blog/olcu-alma-hero.jpg',
        date: '2025-12-23',
        author: 'Karven Home Collection',
        content: {
            tr: `
## Giriş

Evinizin dekorasyonunu tamamlayan en önemli unsurlardan biri şüphesiz perdelerdir. Odaya sıcaklık katar, mahremiyet sağlar ve tarzınızı yansıtır. Ancak, dünyanın en güzel kumaşını da seçseniz, yanlış alınmış bir ölçü tüm büyüyü bozabilir. "Kısa pantolon" gibi duran veya yerde gereksiz kalabalık yapan perdelerle karşılaşmak istemezsiniz, değil mi?

Endişelenmeyin! Perde ölçüsü almak düşündüğünüz kadar karmaşık bir matematik problemi değildir. Sadece doğru adımları takip etmeniz ve birkaç püf noktasına dikkat etmeniz gerekiyor.

İşte hayalinizdeki perdelere kavuşmanız için adım adım ölçü alma rehberi:

## Hazırlık Aşaması: İhtiyacınız Olanlar

Başlamadan önce şu basit araçları yanınıza alın:

- **Çelik Metre:** Kumaş mezuralar esneyebilir ve yanlış sonuç verebilir, bu yüzden mutlaka metal şerit metre kullanın.
- **Merdiven veya Tabure:** Yüksek noktalara güvenle ulaşmak için.
- **Kağıt ve Kalem:** Ölçüleri anında not almak için (hafızanıza güvenmeyin!).

## Adım 1: Altın Kural – Önce Korniş veya Rustik!

Yapılan en büyük hata, sadece pencere camını ölçmektir. Perde pencereye değil, kornişe veya rustik borusuna asılır.

**Eğer kornişiniz/rustiğiniz zaten takılıysa:** İşiniz daha kolay, doğrudan onu ölçerek başlayacağız.

**Eğer henüz takılı değilse:** Önce kornişin nerede duracağına karar vermelisiniz. İdeal bir görünüm için, kornişi pencere çerçevesinin yaklaşık **10-20 cm üzerine** ve her iki yanından da **15-25 cm taşacak** şekilde monte etmeniz önerilir. Bu, pencerenizi daha büyük gösterir ve perdeler açıldığında camın tamamen kapanmamasını sağlar.

## Adım 2: Genişlik Ölçüsü (En) Nasıl Alınır?

Perdenizin eni, sadece pencerenizin genişliği değildir. Burada "pile payı" devreye girer.

### Mevcut Kornişi Ölçün
Kornişin veya rustik borusunun bir ucundan diğer ucuna kadar olan mesafeyi ölçün. (Rustik kullanıyorsanız, sadece perdelerin hareket edeceği alanı ölçün, dekoratif başlıkları hariç tutun).

**Bu Sizin "Ham" Ölçünüzdür:** Örneğin, kornişiniz 200 cm çıktı.

### Pile Payını (Büzgü) Ekleyin
Dümdüz duran bir perde, çarşaf asmışsınız gibi görünür. Perdenin dökümlü ve zengin durması için bu ham ölçüyü çarpmalısınız.

**Seyrek Pile (Modern/Spor Görünüm):** Korniş ölçüsü x 1.5 veya x 2 (Örn: 200 cm x 2 = 400 cm kumaş eni gerekir)

**Normal/Sık Pile (Klasik/Zengin Görünüm):** Korniş ölçüsü x 2.5 veya x 3 (Örn: 200 cm x 3 = 600 cm kumaş eni gerekir)

**Not:** Hazır perde alıyorsanız, paketin üzerindeki ölçü genellikle perdenin dümdüz, pilesiz halidir. Bu yüzden pencereniz için genellikle iki kanat almanız gerekir.

## Adım 3: Yükseklik Ölçüsü (Boy) Nasıl Alınır?

Perdenizin boyu, odanın tarzını belirleyen en kritik faktördür. Nereden başlayıp nerede biteceğine karar vermelisiniz.

### Nereden Başlamalı?

- **Korniş (Raylı Sistem):** Metrenin ucunu tavandaki korniş rayının iç kısmına yerleştirerek aşağı doğru ölçün.
- **Rustik (Halkalı Sistem):** Ölçüyü halkanın alt kısmından (perdenin asılacağı kancanın takıldığı yerden) başlatın.

### Nerede Bitmeli? (Stil Seçimi)

| Stil | Açıklama | Uygun Mekanlar |
|------|----------|----------------|
| **Mermer Hizası (Kısa)** | Pencere denizliğinin 1-2 cm üzerinde biter | Mutfak, Banyo |
| **Yere Kadar (İdeal)** | Yerden 1-2 cm yukarıda biter | Salon, Yatak Odası |
| **Yerde Biriken (Dramatik)** | Yerde 5-15 cm havuzlanır | Yatak Odası, Klasik Salonlar |

## Hayat Kurtaran Püf Noktaları

### ✅ İki Kez Ölç, Bir Kez Al
Hata payını sıfırlamak için her ölçüyü mutlaka iki kez kontrol edin.

### ✅ Engelleri Unutmayın
Pencerenin altında kalorifer peteği varsa ve perdeyi yere kadar istiyorsanız, perdenin peteğe temas etmemesi için tavandan değil, duvardan montaj yapmanız gerekebilir veya perdeyi peteğin hemen üzerinde bitirmelisiniz.

### ✅ Zemin Eğimi
Özellikle eski binalarda tavan veya zemin her noktada eşit olmayabilir. Pencerenin sağından, solundan ve ortasından olmak üzere **üç farklı noktadan** yükseklik ölçüsü alın. Eğer arada fark varsa, en kısa olan ölçüyü baz alarak perdenizin yere sürtünmesini engelleyin.

## Sık Yapılan Hatalar

❌ Kumaş mezura kullanmak (esner ve yanlış ölçü verir)
❌ Sadece pencere camını ölçmek
❌ Pile payını hesaplamamak
❌ Kalorifer peteklerini unutmak
❌ Zemin eğimini kontrol etmemek

## Sonuç

Gördüğünüz gibi, doğru perde ölçüsü almak biraz dikkat ve planlama gerektirse de, sonuç kesinlikle buna değecektir. Kendi ölçülerinizi doğru bir şekilde aldığınızda, ister hazır perde alın ister özel dikim yaptırın, evinizin pencereleri profesyonel bir el değmiş gibi görünecek.

**Şimdi mezuranızı kapın ve işe koyulun! Evinizin yeni görünümünün tadını çıkarın.**
            `,
            en: `
## Introduction

Curtains are undoubtedly one of the most important elements that complete your home decor. They add warmth to the room, provide privacy, and reflect your style. However, even if you choose the most beautiful fabric in the world, a wrong measurement can break all the magic. You don't want to end up with curtains that look like "short pants" or create unnecessary clutter on the floor, do you?

Don't worry! Taking curtain measurements isn't as complicated as you might think. You just need to follow the right steps and pay attention to a few tips.

Here's a step-by-step measurement guide to help you get the curtains of your dreams:

## Preparation Stage: What You Need

Before you start, gather these simple tools:

- **Steel Tape Measure:** Fabric tapes can stretch and give wrong results, so make sure to use a metal tape measure.
- **Ladder or Step Stool:** To safely reach high points.
- **Paper and Pen:** To note measurements immediately (don't trust your memory!).

## Step 1: Golden Rule – First the Rod!

The biggest mistake made is measuring only the window glass. The curtain hangs on the rod, not the window.

**If your rod is already installed:** Your job is easier, we'll start by measuring it directly.

**If it's not installed yet:** First, you need to decide where the rod will be placed. For an ideal look, it's recommended to mount the rod about **10-20 cm above** the window frame and **15-25 cm extending** on each side. This makes your window look bigger and ensures the glass isn't completely blocked when the curtains are open.

## Step 2: How to Measure Width?

Your curtain's width isn't just the width of your window. This is where "fullness ratio" comes in.

### Measure the Existing Rod
Measure the distance from one end of the rod to the other. (If using a decorative rod, measure only the area where curtains will move, excluding decorative finials).

**This is Your "Raw" Measurement:** For example, your rod measured 200 cm.

### Add Fullness (Gathering)
A flat curtain looks like you've hung a bedsheet. To make the curtain look draped and rich, you need to multiply this raw measurement.

| Pleat Type | Multiplier | Example (200 cm rod) |
|------------|-----------|----------------------|
| Light Pleat (Modern) | x 1.5 or x 2 | 400 cm fabric |
| Full Pleat (Classic) | x 2.5 or x 3 | 600 cm fabric |

## Step 3: How to Measure Height?

Your curtain height is the most critical factor that defines the room's style.

### Where to Start?

- **Rail System:** Place the end of the tape on the inside of the ceiling rail and measure down.
- **Decorative Rod (Ring System):** Start the measurement from the bottom of the ring (where the hook attaches).

### Where Should It End? (Style Choice)

| Style | Description | Suitable Spaces |
|-------|-------------|-----------------|
| **Sill Length (Short)** | Ends 1-2 cm above windowsill | Kitchen, Bathroom |
| **Floor Length (Ideal)** | Ends 1-2 cm above floor | Living Room, Bedroom |
| **Puddled (Dramatic)** | Pools 5-15 cm on floor | Bedroom, Classic Living Rooms |

## Conclusion

As you can see, taking correct curtain measurements requires some attention and planning, but the result is definitely worth it. When you take your own measurements correctly, whether you buy ready-made curtains or have them custom made, your home's windows will look like they've been touched by a professional.

**Now grab your tape measure and get to work! Enjoy the new look of your home.**
            `,
            ru: `
## Введение

Шторы — один из важнейших элементов, дополняющих интерьер вашего дома. Они добавляют тепла комнате, обеспечивают уединение и отражают ваш стиль.

## Подготовка

- Металлическая рулетка
- Стремянка
- Бумага и ручка

## Шаг 1: Измерьте карниз

Штора вешается на карниз, а не на окно. Измерьте длину карниза от края до края.

## Шаг 2: Измерение ширины

Добавьте коэффициент сборки: умножьте ширину карниза на 2-2.5 для классического вида.

## Шаг 3: Измерение высоты

Измерьте от карниза до желаемой точки: пола, подоконника или с напуском.

## Заключение

Правильные замеры гарантируют красивые шторы в вашем доме.
            `,
            pl: `
## Wstęp

Zasłony są niewątpliwie jednym z najważniejszych elementów uzupełniających wystrój domu. Dodają ciepła do pomieszczenia, zapewniają prywatność i odzwierciedlają Twój styl.

## Przygotowanie

- Metalowa taśma miernicza
- Drabina
- Papier i długopis

## Krok 1: Zmierz karnisz

Zasłona wisi na karniszu, nie na oknie. Zmierz długość karnisza od końca do końca.

## Krok 2: Pomiar szerokości

Dodaj współczynnik marszczenia: pomnóż szerokość karnisza przez 2-2.5 dla klasycznego wyglądu.

## Krok 3: Pomiar wysokości

Zmierz od karnisza do pożądanego punktu: podłogi, parapetu lub z opadaniem.

## Podsumowanie

Prawidłowe pomiary gwarantują piękne zasłony w Twoim domu.
            `
        }
    },
    'ozel-dikim-perde-siparisi': {
        title: {
            tr: 'Özel Dikim Perde Siparişi Nasıl Yapılır?',
            en: 'How to Order Custom Curtains?',
            ru: 'Как заказать пошив штор?',
            pl: 'Jak zamówić szycie zasłon na miarę?'
        },
        heroImage: '/media/blog/ozel-dikim-hero.jpg',
        date: '2025-12-23',
        author: 'Karven Home Collection',
        content: {
            tr: `
## Giriş

Özel dikim perde siparişi vermek, hazır perdelere kıyasla çok daha kişiselleştirilmiş ve mükemmel uyumlu sonuçlar elde etmenizi sağlar. Bu rehberde, Karven Home Collection'dan özel dikim perde siparişi verme sürecini adım adım açıklıyoruz.

## Neden Özel Dikim Perde?

- **Mükemmel Uyum:** Pencerenize özel ölçülerde dikilir
- **Kumaş Seçimi:** Yüzlerce kumaş arasından seçim yapabilirsiniz
- **Pile Tipi:** İstediğiniz pile yoğunluğunu belirleyebilirsiniz
- **Kalite:** Profesyonel dikişle uzun ömürlü kullanım

## Adım 1: Kumaş Seçimi

Web sitemizde **Kumaşlar** bölümüne giderek kumaş koleksiyonumuzu inceleyebilirsiniz.

**Düz Kumaşlar:** Modern ve sade görünüm için ideal
**Nakışlı Kumaşlar:** Klasik ve şık mekanlar için mükemmel

Beğendiğiniz kumaşın ürün sayfasına gidin.

## Adım 2: Ölçülerinizi Girin

Ürün sayfasında **"Özel Dikim Perde"** seçeneğini göreceksiniz. Buradan:

**Genişlik (cm):** Perdenizin toplam genişliğini girin
**Yükseklik (cm):** Perdenizin boyunu girin

**İpucu:** Ölçü almayı bilmiyorsanız, [Doğru Ölçü Nasıl Alınır?](/tr/blog/dogru-olcu-nasil-alinir) rehberimizi okuyun.

## Adım 3: Pile Tipini Seçin

Pile yoğunluğu, perdenizin görünümünü belirler:

**1x2 Pile:** Seyrek pile, modern görünüm
**1x2.5 Pile:** Orta yoğunluk, en çok tercih edilen
**1x3 Pile:** Sık pile, klasik ve zengin görünüm

Sistem otomatik olarak gereken kumaş miktarını hesaplar.

## Adım 4: Kanat Seçimi

**Tek Kanat:** Pencereyi tek parça perde ile kapatmak için
**Çift Kanat:** Ortadan açılır tarz için (ölçü ikiye bölünür)

## Adım 5: Sepete Ekle ve Sipariş Ver

Tüm seçimlerinizi yaptıktan sonra:

1. **Sepete Ekle** butonuna tıklayın
2. Sepetinizi kontrol edin
3. Ödeme sayfasına ilerleyin
4. Teslimat bilgilerinizi girin
5. Ödemenizi tamamlayın

## Üretim ve Teslimat Süreci

**Üretim Süresi:** 5-7 iş günü
**Kargo:** Türkiye geneli ücretsiz kargo (2000 TL üzeri)
**Paketleme:** Özel koruyucu ambalaj ile gönderim

## Sık Sorulan Sorular

**Siparişimi iptal edebilir miyim?**
Özel dikim ürünler size özel üretildiği için üretime başlandıktan sonra iptal yapılamamaktadır.

**İade yapabilir miyim?**
Özel dikim ürünlerde üretim hatası dışında iade kabul edilmemektedir.

**Numune kumaş alabilir miyim?**
Evet, kumaş numunesi talep edebilirsiniz. Bizimle iletişime geçin.

## Sonuç

Özel dikim perde siparişi vermek sandığınız kadar zor değil! Doğru ölçüyü alın, kumaşınızı seçin ve siparişinizi verin. Biz gerisini halledelim!

**Sorularınız için:** info@demfirat.com veya WhatsApp: +90 501 057 1884
            `,
            en: `
## Introduction

Ordering custom curtains allows you to get much more personalized and perfectly fitting results compared to ready-made curtains. In this guide, we explain step by step how to order custom curtains from Karven Home Collection.

## Why Custom Curtains?

- **Perfect Fit:** Tailored to your window measurements
- **Fabric Choice:** Choose from hundreds of fabrics
- **Pleat Type:** Determine your preferred pleat density
- **Quality:** Professional stitching for long-lasting use

## Step 1: Choose Your Fabric

Browse our fabric collection in the **Fabrics** section on our website.

**Solid Fabrics:** Ideal for modern and simple looks
**Embroidered Fabrics:** Perfect for classic and elegant spaces

## Step 2: Enter Your Measurements

On the product page, you'll see the **"Custom Curtain"** option:

**Width (cm):** Enter the total width of your curtain
**Height (cm):** Enter the height of your curtain

## Step 3: Select Pleat Type

**1x2 Pleat:** Light pleat, modern look
**1x2.5 Pleat:** Medium density, most preferred
**1x3 Pleat:** Dense pleat, classic and rich look

## Step 4: Add to Cart and Order

1. Click **Add to Cart**
2. Review your cart
3. Proceed to checkout
4. Enter delivery information
5. Complete payment

## Conclusion

Ordering custom curtains is not as difficult as you think! Take the right measurements, choose your fabric, and place your order.
            `,
            ru: `
## Введение

Заказ штор на заказ позволяет получить гораздо более персонализированные и идеально подходящие результаты.

## Почему шторы на заказ?

- Идеальная посадка
- Выбор ткани
- Тип складки
- Качество

## Шаг 1: Выберите ткань

## Шаг 2: Введите размеры

## Шаг 3: Выберите тип складки

## Заключение

Заказать шторы на заказ не так сложно, как вы думаете!
            `,
            pl: `
## Wstęp

Zamawianie zasłon na miarę pozwala uzyskać znacznie bardziej spersonalizowane i idealnie dopasowane rezultaty.

## Dlaczego zasłony na miarę?

- Idealne dopasowanie
- Wybór tkaniny
- Typ zakładki
- Jakość

## Krok 1: Wybierz tkaninę

## Krok 2: Wprowadź wymiary

## Krok 3: Wybierz typ zakładki

## Podsumowanie

Zamawianie zasłon na miarę nie jest tak trudne, jak myślisz!
            `
        }
    }
};

interface BlogPostPageProps {
    params: Promise<{ locale: string; slug: string }>;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
    const { locale, slug } = await params;
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';

    const post = blogPostsContent[slug];

    if (!post) {
        notFound();
    }

    const t = {
        backToBlog: {
            tr: '← Blog\'a Dön',
            en: '← Back to Blog',
            ru: '← Назад в блог',
            pl: '← Powrót do bloga'
        },
        share: {
            tr: 'Paylaş',
            en: 'Share',
            ru: 'Поделиться',
            pl: 'Udostępnij'
        }
    };

    return (
        <main className={classes.blogPost}>
            {/* Hero Image */}
            <div className={classes.heroImage}>
                <img
                    src={post.heroImage}
                    alt={post.title[lang]}
                />
                <div className={classes.heroOverlay}></div>
                <div className={classes.heroContent}>
                    <h1>{post.title[lang]}</h1>
                    <div className={classes.meta}>
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>
                            {new Date(post.date).toLocaleDateString(locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : locale === 'pl' ? 'pl-PL' : 'en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <article className={classes.article}>
                <div className={classes.container}>
                    <Link href={`/${locale}/blog`} className={classes.backLink}>
                        {t.backToBlog[lang]}
                    </Link>

                    <div
                        className={classes.content}
                        dangerouslySetInnerHTML={{ __html: formatMarkdown(post.content[lang]) }}
                    />
                </div>
            </article>
        </main>
    );
}

// Simple markdown to HTML converter
function formatMarkdown(markdown: string): string {
    return markdown
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/✅/g, '<span class="success">✅</span>')
        .replace(/❌/g, '<span class="error">❌</span>')
        .replace(/\|(.+)\|/g, (match) => {
            const cells = match.split('|').filter(c => c.trim());
            if (cells.some(c => c.includes('---'))) return '';
            return '<tr>' + cells.map(c => `<td>${c.trim()}</td>`).join('') + '</tr>';
        })
        .replace(/\n\n/g, '</p><p>');
}
