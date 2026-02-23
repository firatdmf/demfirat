// Translation utility with local cache and Google Translate API integration

// Local cache to avoid repeated API calls in the same session
const localCache: Map<string, string> = new Map();

// Manual translations for common terms (fallback when API is not available)
const manualTranslations: { [key: string]: { [key: string]: string } } = {
    // Attribute Names
    'color': { 'tr': 'Renk', 'ru': 'Цвет', 'pl': 'Kolor', 'en': 'Color' },
    'width': { 'tr': 'Genişlik', 'ru': 'Ширина', 'pl': 'Szerokość', 'en': 'Width' },
    'height': { 'tr': 'Yükseklik', 'ru': 'Высота', 'pl': 'Wysokość', 'en': 'Height' },
    'fabric': { 'tr': 'Kumaş', 'ru': 'Ткань', 'pl': 'Tkanina', 'en': 'Fabric' },
    'fabric_type': { 'tr': 'Kumaş Tipi', 'ru': 'Тип ткани', 'pl': 'Rodzaj tkaniny', 'en': 'Fabric Type' },
    'size': { 'tr': 'Boyut', 'ru': 'Размер', 'pl': 'Rozmiar', 'en': 'Size' },
    'material': { 'tr': 'Malzeme', 'ru': 'Материал', 'pl': 'Materiał', 'en': 'Material' },
    'pattern': { 'tr': 'Desen', 'ru': 'Узор', 'pl': 'Wzór', 'en': 'Pattern' },
    'style': { 'tr': 'Stil', 'ru': 'Стиль', 'pl': 'Styl', 'en': 'Style' },
    'type': { 'tr': 'Tip', 'ru': 'Тип', 'pl': 'Typ', 'en': 'Type' },
    'category': { 'tr': 'Kategori', 'ru': 'Категория', 'pl': 'Kategoria', 'en': 'Category' },
    'collection': { 'tr': 'Koleksiyon', 'ru': 'Коллекция', 'pl': 'Kolekcja', 'en': 'Collection' },
    'opacity': { 'tr': 'Opaklık', 'ru': 'Непрозрачность', 'pl': 'Przezroczystość', 'en': 'Opacity' },
    'weight': { 'tr': 'Ağırlık', 'ru': 'Вес', 'pl': 'Waga', 'en': 'Weight' },
    'cristal': { 'tr': 'Kristal', 'ru': 'Кристалл', 'pl': 'Kryształ', 'en': 'Crystal' },
    'pearl': { 'tr': 'İnci Detaylı', 'ru': 'С жемчугом', 'pl': 'Z perłami', 'en': 'Pearl' },

    // Categories
    'curtain': { 'tr': 'Perde', 'ru': 'Штора', 'pl': 'Zasłona', 'en': 'Curtain' },
    'ready-made_curtain': { 'tr': 'Hazır Perde', 'ru': 'Готовые шторы', 'pl': 'Gotowe zasłony', 'en': 'Ready-Made Curtain' },

    // Fabric Type Values
    'solid': { 'tr': 'Düz', 'ru': 'Однотонный', 'pl': 'Jednolity', 'en': 'Solid' },
    'embroidery': { 'tr': 'Nakışlı', 'ru': 'Вышивка', 'pl': 'Haft', 'en': 'Embroidery' },
    'patterned': { 'tr': 'Desenli', 'ru': 'Узорчатый', 'pl': 'Wzorzysty', 'en': 'Patterned' },

    // Yes/No Values
    'yes': { 'tr': 'Evet', 'ru': 'Да', 'pl': 'Tak', 'en': 'Yes' },
    'no': { 'tr': 'Hayır', 'ru': 'Нет', 'pl': 'Nie', 'en': 'No' },
    'true': { 'tr': 'Evet', 'ru': 'Да', 'pl': 'Tak', 'en': 'Yes' },
    'false': { 'tr': 'Hayır', 'ru': 'Нет', 'pl': 'Nie', 'en': 'No' },

    // Basic Colors
    'ecru': { 'tr': 'Ekru', 'ru': 'Экрю', 'pl': 'Ecru', 'en': 'Ecru' },
    'whitesmoke': { 'tr': 'Duman Beyazı', 'ru': 'Дымчато-белый', 'pl': 'Biały dymny', 'en': 'White Smoke' },
    'white': { 'tr': 'Beyaz', 'ru': 'Белый', 'pl': 'Biały', 'en': 'White' },
    'black': { 'tr': 'Siyah', 'ru': 'Черный', 'pl': 'Czarny', 'en': 'Black' },
    'beige': { 'tr': 'Bej', 'ru': 'Бежевый', 'pl': 'Beżowy', 'en': 'Beige' },
    'cream': { 'tr': 'Krem', 'ru': 'Кремовый', 'pl': 'Kremowy', 'en': 'Cream' },
    'grey': { 'tr': 'Gri', 'ru': 'Серый', 'pl': 'Szary', 'en': 'Grey' },
    'gray': { 'tr': 'Gri', 'ru': 'Серый', 'pl': 'Szary', 'en': 'Gray' },
    'brown': { 'tr': 'Kahverengi', 'ru': 'Коричневый', 'pl': 'Brązowy', 'en': 'Brown' },
    'red': { 'tr': 'Kırmızı', 'ru': 'Красный', 'pl': 'Czerwony', 'en': 'Red' },
    'blue': { 'tr': 'Mavi', 'ru': 'Синий', 'pl': 'Niebieski', 'en': 'Blue' },
    'green': { 'tr': 'Yeşil', 'ru': 'Зеленый', 'pl': 'Zielony', 'en': 'Green' },
    'yellow': { 'tr': 'Sarı', 'ru': 'Желтый', 'pl': 'Żółty', 'en': 'Yellow' },
    'orange': { 'tr': 'Turuncu', 'ru': 'Оранжевый', 'pl': 'Pomarańczowy', 'en': 'Orange' },
    'pink': { 'tr': 'Pembe', 'ru': 'Розовый', 'pl': 'Różowy', 'en': 'Pink' },
    'purple': { 'tr': 'Mor', 'ru': 'Фиолетовый', 'pl': 'Fioletowy', 'en': 'Purple' },
    'gold': { 'tr': 'Altın', 'ru': 'Золотой', 'pl': 'Złoty', 'en': 'Gold' },
    'silver': { 'tr': 'Gümüş', 'ru': 'Серебряный', 'pl': 'Srebrny', 'en': 'Silver' },
    'navy': { 'tr': 'Lacivert', 'ru': 'Темно-синий', 'pl': 'Granatowy', 'en': 'Navy' },
    'ivory': { 'tr': 'Fildişi', 'ru': 'Слоновая кость', 'pl': 'Kość słoniowa', 'en': 'Ivory' },
    'wheat': { 'tr': 'Buğday', 'ru': 'Пшеничный', 'pl': 'Pszeniczny', 'en': 'Wheat' },
    'mint': { 'tr': 'Nane', 'ru': 'Мятный', 'pl': 'Miętowy', 'en': 'Mint' },
    'deeppink': { 'tr': 'Koyu Pembe', 'ru': 'Темно-розовый', 'pl': 'Głęboki róż', 'en': 'Deep Pink' },

    // Two-tone Colors
    'grey-white': { 'tr': 'Gri-Beyaz', 'ru': 'Серо-белый', 'pl': 'Szaro-biały', 'en': 'Grey-White' },
    'grey-ecru': { 'tr': 'Gri-Ekru', 'ru': 'Серо-экрю', 'pl': 'Szaro-ecru', 'en': 'Grey-Ecru' },
    'gold-beige': { 'tr': 'Altın-Bej', 'ru': 'Золотисто-бежевый', 'pl': 'Złoto-beżowy', 'en': 'Gold-Beige' },
    'gold-silver': { 'tr': 'Altın-Gümüş', 'ru': 'Золотисто-серебряный', 'pl': 'Złoto-srebrny', 'en': 'Gold-Silver' },
    'pink-white': { 'tr': 'Pembe-Beyaz', 'ru': 'Розово-белый', 'pl': 'Różowo-biały', 'en': 'Pink-White' },
    'pink-ecru': { 'tr': 'Pembe-Ekru', 'ru': 'Розово-экрю', 'pl': 'Różowo-ecru', 'en': 'Pink-Ecru' },
    'navy-gold': { 'tr': 'Lacivert-Altın', 'ru': 'Темно-сине-золотой', 'pl': 'Granatowo-złoty', 'en': 'Navy-Gold' },
    'gold-white': { 'tr': 'Altın-Beyaz', 'ru': 'Золотисто-белый', 'pl': 'Złoto-biały', 'en': 'Gold-White' },
    'gold-ecru': { 'tr': 'Altın-Ekru', 'ru': 'Золотисто-экрю', 'pl': 'Złoto-ecru', 'en': 'Gold-Ecru' },
    'teal': { 'tr': 'Çam Yeşili', 'ru': 'Бирюзовый', 'pl': 'Morski', 'en': 'Teal' },
    'off-white': { 'tr': 'Kırık Beyaz', 'ru': 'Молочно-белый', 'pl': 'Złamana biel', 'en': 'Off-White' },
    'offwhite': { 'tr': 'Kırık Beyaz', 'ru': 'Молочно-белый', 'pl': 'Złamana biel', 'en': 'Off-White' },
    'ecru-gold': { 'tr': 'Ekru-Altın', 'ru': 'Экрю-золотой', 'pl': 'Ecru-złoty', 'en': 'Ecru-Gold' },
    'silver-gold': { 'tr': 'Gümüş-Altın', 'ru': 'Серебристо-золотой', 'pl': 'Srebrno-złoty', 'en': 'Silver-Gold' },
    'cream-gold': { 'tr': 'Krem-Altın', 'ru': 'Кремово-золотой', 'pl': 'Kremowo-złoty', 'en': 'Cream-Gold' },
    'silver-white': { 'tr': 'Gümüş-Beyaz', 'ru': 'Серебристо-белый', 'pl': 'Srebrno-biały', 'en': 'Silver-White' },
    'cream-white': { 'tr': 'Krem-Beyaz', 'ru': 'Кремово-белый', 'pl': 'Kremowo-biały', 'en': 'Cream-White' },
    'mink': { 'tr': 'Vizon', 'ru': 'Норковый', 'pl': 'Norkowy', 'en': 'Mink' },
    'cappucino': { 'tr': 'Kapuçino', 'ru': 'Капучино', 'pl': 'Cappuccino', 'en': 'Cappuccino' },
    'cappuccino': { 'tr': 'Kapuçino', 'ru': 'Капучино', 'pl': 'Cappuccino', 'en': 'Cappuccino' },

    // Curtain Styles
    'header': { 'tr': 'Başlık', 'ru': 'Верхняя часть', 'pl': 'Główka', 'en': 'Header' },
    'rod_pocket': { 'tr': 'Büzgülü', 'ru': 'Карман для карниза', 'pl': 'Tunelowy', 'en': 'Rod Pocket' },
    'rod pocket': { 'tr': 'Büzgülü', 'ru': 'Карман для карниза', 'pl': 'Tunelowy', 'en': 'Rod Pocket' },
    'grommet': { 'tr': 'Halkalı', 'ru': 'С люверсами', 'pl': 'Z oczkami', 'en': 'Grommet' },

    // Additional Attributes
    'high gsm': { 'tr': 'Ağır Gramajlı', 'ru': 'Высокая плотность', 'pl': 'Wysoka gramatura', 'en': 'High GSM' },
    'high_gsm': { 'tr': 'Ağır Gramajlı', 'ru': 'Высокая плотность', 'pl': 'Wysoka gramatura', 'en': 'High GSM' },
    'none iron': { 'tr': 'Ütü İstemez', 'ru': 'Не требует глажки', 'pl': 'Bez prasowania', 'en': 'None Iron' },
    'none-iron': { 'tr': 'Ütü İstemez', 'ru': 'Не требует глажки', 'pl': 'Bez prasowania', 'en': 'None Iron' },
    'texture': { 'tr': 'Doku', 'ru': 'Текстура', 'pl': 'Tekstura', 'en': 'Texture' },
    'sheerness': { 'tr': 'Işık geçirgenliği', 'ru': 'Прозрачность', 'pl': 'Przezroczystość', 'en': 'Sheerness' },
    'sheerness level': { 'tr': 'Işık geçirgenliği', 'ru': 'Уровень прозрачности', 'pl': 'Poziom przezroczystości', 'en': 'Sheerness Level' },
    'sheerness_level': { 'tr': 'Işık geçirgenliği', 'ru': 'Уровень прозрачности', 'pl': 'Poziom przezroczystości', 'en': 'Sheerness Level' },
    'sherness level': { 'tr': 'Işık geçirgenliği', 'ru': 'Уровень прозрачности', 'pl': 'Poziom przezroczystości', 'en': 'Sheerness Level' }, // fix typo in DB
    'sherness_level': { 'tr': 'Işık geçirgenliği', 'ru': 'Уровень прозрачности', 'pl': 'Poziom przezroczystości', 'en': 'Sheerness Level' },
    'semi sheer': { 'tr': 'Yarı Geçirgen', 'ru': 'Полупрозрачный', 'pl': 'Półprzezroczysty', 'en': 'Semi Sheer' },
    'care': { 'tr': 'Bakım', 'ru': 'Уход', 'pl': 'Pielęgnacja', 'en': 'Care' },
    'property': { 'tr': 'Özellik', 'ru': 'Свойство', 'pl': 'Właściwość', 'en': 'Property' },
    'gold glitter': { 'tr': 'Altın Simli', 'ru': 'Золотые блестки', 'pl': 'Złoty brokat', 'en': 'Gold Glitter' },
    'gold_glitter': { 'tr': 'Altın Simli', 'ru': 'Золотые блестки', 'pl': 'Złoty brokat', 'en': 'Gold Glitter' },

    // UI Text
    'loading': { 'tr': 'Yükleniyor', 'ru': 'Загрузка', 'pl': 'Ładowanie', 'en': 'Loading' },
    'loading...': { 'tr': 'Yükleniyor...', 'ru': 'Загрузка...', 'pl': 'Ładowanie...', 'en': 'Loading...' },
};

/**
 * Synchronous translation - checks manual translations only (API disabled)
 */
export function translateTextSync(text: string, targetLang: string): string {
    if (!text) return '';

    // If target is English, just format and return
    if (targetLang.toLowerCase() === 'en') {
        return text.charAt(0).toUpperCase() + text.slice(1).replace(/_/g, ' ');
    }

    const cacheKey = `${text.toLowerCase()}_${targetLang}`;

    // Check local cache first
    if (localCache.has(cacheKey)) {
        return localCache.get(cacheKey)!;
    }

    // Check manual translations
    const lowerText = text.toLowerCase();
    if (manualTranslations[lowerText]?.[targetLang]) {
        const translated = manualTranslations[lowerText][targetLang];
        localCache.set(cacheKey, translated);
        return translated;
    }

    // Fallback text (no API call - it's blocked and causes lag)
    const fallback = text.charAt(0).toUpperCase() + text.slice(1).replace(/_/g, ' ');
    localCache.set(cacheKey, fallback);
    return fallback;
}

/**
 * Async translation - uses manual translations only (API disabled)
 */
export async function translateText(text: string, targetLang: string): Promise<string> {
    if (!text) return '';

    if (targetLang.toLowerCase() === 'en') {
        return text.charAt(0).toUpperCase() + text.slice(1).replace(/_/g, ' ');
    }

    const cacheKey = `${text.toLowerCase()}_${targetLang}`;

    if (localCache.has(cacheKey)) {
        return localCache.get(cacheKey)!;
    }

    const lowerText = text.toLowerCase();
    if (manualTranslations[lowerText]?.[targetLang]) {
        const result = manualTranslations[lowerText][targetLang];
        localCache.set(cacheKey, result);
        return result;
    }

    // Fallback text (no API call - it's blocked and causes lag)
    const fallback = text.charAt(0).toUpperCase() + text.slice(1).replace(/_/g, ' ');
    localCache.set(cacheKey, fallback);
    return fallback;
}

export function addManualTranslation(key: string, translations: { [lang: string]: string }) {
    manualTranslations[key.toLowerCase()] = { ...manualTranslations[key.toLowerCase()], ...translations };
}

export function clearTranslationCache() {
    localCache.clear();
}
