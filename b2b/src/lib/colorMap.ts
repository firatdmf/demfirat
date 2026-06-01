/**
 * Renk İsimleri → HEX Kod Mapping
 * Tekstil sektöründe kullanılan özel renk isimleri
 */

export const COLOR_MAP: { [key: string]: string } = {
  // Beyaz tonları
  'ekru': '#F5F5DC',
  'ecru': '#F5F5DC',
  'kırık_beyaz': '#FAEBD7',
  'broken_white': '#FAEBD7',
  'off_white': '#FAF9F6',
  'krem': '#FFFDD0',
  'cream': '#FFFDD0',
  'fildişi': '#FFFFF0',
  'ivory': '#FFFFF0',
  'beyaz': '#FFFFFF',
  'white': '#FFFFFF',

  // Bej tonları
  'bej': '#F5F5DC',
  'beige': '#F5F5DC',
  'açık_bej': '#FAF0E6',
  'light_beige': '#FAF0E6',
  'koyu_bej': '#D2B48C',
  'dark_beige': '#D2B48C',
  'taş_rengi': '#E6E2D3',
  'stone': '#E6E2D3',
  'kum': '#C2B280',
  'sand': '#C2B280',

  // Gri tonları
  'gri': '#808080',
  'gray': '#808080',
  'grey': '#808080',
  'açık_gri': '#D3D3D3',
  'light_gray': '#D3D3D3',
  'light_grey': '#D3D3D3',
  'koyu_gri': '#4F4F4F',
  'dark_gray': '#4F4F4F',
  'dark_grey': '#4F4F4F',
  'antrasit': '#36454F',
  'anthracite': '#36454F',
  'gümüş': '#C0C0C0',
  'silver': '#C0C0C0',
  'smoke': '#738276',

  // Kahverengi tonları
  'kahverengi': '#A0522D',
  'brown': '#A0522D',
  'açık_kahve': '#D2691E',
  'light_brown': '#D2691E',
  'koyu_kahve': '#654321',
  'dark_brown': '#654321',
  'kestane': '#986960',
  'chestnut': '#986960',
  'mocha': '#967969',
  'mokka': '#967969',
  'cappuccino': '#A67B5B',
  'cappucino': '#A67B5B',
  'kapuçino': '#A67B5B',
  'kapucino': '#A67B5B',
  'vizon': '#8B7D6B',
  'mink': '#8B7D6B',

  // Altın/Bronz tonları
  'altın': '#D4AF37',
  'gold': '#D4AF37',
  'bronz': '#CD7F32',
  'bronze': '#CD7F32',
  'bakır': '#B87333',
  'copper': '#B87333',
  'şampanya': '#F7E7CE',
  'champagne': '#F7E7CE',

  // Mavi tonları
  'mavi': '#0000FF',
  'blue': '#0000FF',
  'açık_mavi': '#87CEEB',
  'light_blue': '#87CEEB',
  'koyu_mavi': '#00008B',
  'dark_blue': '#00008B',
  'lacivert': '#000080',
  'navy': '#000080',
  'navy_blue': '#000080',
  'turkuaz': '#40E0D0',
  'turquoise': '#40E0D0',
  'petrol': '#316879',
  'teal': '#008080',
  'indigo': '#4B0082',
  'baby_blue': '#89CFF0',

  // Yeşil tonları
  'yeşil': '#008000',
  'green': '#008000',
  'açık_yeşil': '#90EE90',
  'light_green': '#90EE90',
  'koyu_yeşil': '#006400',
  'dark_green': '#006400',
  'zeytin': '#808000',
  'olive': '#808000',
  'mint': '#98FF98',
  'nane': '#98FF98',
  'su_yeşili': '#00FF7F',
  'aqua': '#00FFFF',
  'çağla': '#A8D5BA',
  'sage': '#9DC183',

  // Sarı tonları
  'sarı': '#FFFF00',
  'yellow': '#FFFF00',
  'açık_sarı': '#FFFFE0',
  'light_yellow': '#FFFFE0',
  'koyu_sarı': '#FFD700',
  'dark_yellow': '#FFD700',
  'hardal': '#FFDB58',
  'mustard': '#FFDB58',
  'limon': '#FFF44F',
  'lemon': '#FFF44F',

  // Turuncu tonları
  'turuncu': '#FFA500',
  'orange': '#FFA500',
  'açık_turuncu': '#FFB347',
  'light_orange': '#FFB347',
  'koyu_turuncu': '#FF8C00',
  'dark_orange': '#FF8C00',
  'mercan': '#FF7F50',
  'coral': '#FF7F50',
  'somon': '#FA8072',
  'salmon': '#FA8072',
  'kayısı': '#FBCEB1',
  'apricot': '#FBCEB1',

  // Kırmızı/Pembe tonları
  'kırmızı': '#FF0000',
  'red': '#FF0000',
  'açık_kırmızı': '#FF6B6B',
  'light_red': '#FF6B6B',
  'koyu_kırmızı': '#8B0000',
  'dark_red': '#8B0000',
  'bordo': '#800020',
  'burgundy': '#800020',
  'maroon': '#800000',
  'pembe': '#FFC0CB',
  'pink': '#FFC0CB',
  'açık_pembe': '#FFB6C1',
  'light_pink': '#FFB6C1',
  'koyu_pembe': '#FF1493',
  'dark_pink': '#FF1493',
  'fuşya': '#FF00FF',
  'fuchsia': '#FF00FF',
  'magenta': '#FF00FF',
  'gül_kurusu': '#B76E79',
  'rose': '#FF007F',
  'pudra': '#F3CFC6',
  'powder': '#F3CFC6',

  // Mor tonları
  'mor': '#800080',
  'purple': '#800080',
  'açık_mor': '#DDA0DD',
  'light_purple': '#DDA0DD',
  'koyu_mor': '#4B0082',
  'dark_purple': '#4B0082',
  'leylak': '#C8A2C8',
  'lilac': '#C8A2C8',
  'lavanta': '#E6E6FA',
  'lavender': '#E6E6FA',
  'violet': '#8F00FF',

  // Siyah
  'siyah': '#000000',
  'black': '#000000',
  'jet_black': '#0A0A0A',

  // Multi/Pattern (gösterim için nötr renk)
  'çok_renkli': '#D3D3D3',
  'multicolor': '#D3D3D3',
  'multi': '#D3D3D3',
  'desenli': '#E0E0E0',
  'patterned': '#E0E0E0',
  'karışık': '#D3D3D3',
  'mixed': '#D3D3D3',
};

/**
 * Renk ismini HEX koda çevirir
 * @param colorName - Renk ismi (ör: "ekru", "kırık_beyaz", "ivory")
 * @returns HEX renk kodu (ör: "#F5F5DC")
 */
export const getColorCode = (colorName: string): string => {
  if (!colorName) return '#E0E0E0'; // Default gray

  const normalized = colorName.toLowerCase().trim();

  // Eğer zaten hex kod ise direkt dön
  if (normalized.startsWith('#')) {
    return normalized;
  }

  // Mapping'den bul
  const hexCode = COLOR_MAP[normalized];

  if (hexCode) {
    return hexCode;
  }

  // Eğer bulunamazsa, CSS standart renk ismi olabilir
  // Tarayıcı bunu tanıyabilir (ör: "red", "blue", "white")
  return normalized;
};

/**
 * Renk açık mı koyu mu kontrol eder (contrast için)
 * @param hexColor - HEX renk kodu
 * @returns true ise renk açık, false ise koyu
 */
export const isLightColor = (hexColor: string): boolean => {
  if (!hexColor.startsWith('#')) return true;

  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Luminance hesaplama
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5;
};

/**
 * Renk isminin iki renkli olup olmadığını kontrol eder
 * Ör: "White-Red", "Pink-DarkBlue" gibi
 * @param colorName - Renk ismi
 * @returns true ise iki renkli, false ise tek renk
 */
export const isTwoToneColor = (colorName: string): boolean => {
  if (!colorName) return false;
  return colorName.includes('-') || colorName.includes('_');
};

/**
 * İki renkli renk ismini ayrıştırıp her iki rengin HEX kodunu döndürür
 * @param colorName - Renk ismi (ör: "White-Red", "Pink-DarkBlue")
 * @returns { color1: string, color2: string } - HEX kodları
 */
export const splitTwoToneColor = (colorName: string): { color1: string; color2: string } => {
  if (!colorName) return { color1: '#E0E0E0', color2: '#E0E0E0' };

  // Ayıraç olarak '-' veya '_' kullanılabilir
  let colors: string[];
  if (colorName.includes('-')) {
    colors = colorName.split('-');
  } else if (colorName.includes('_')) {
    colors = colorName.split('_');
  } else {
    // Tek renk ise, aynı rengi iki kere döndür
    const singleColor = getColorCode(colorName);
    return { color1: singleColor, color2: singleColor };
  }

  // İlk iki rengi al
  const color1Name = colors[0]?.trim() || '';
  const color2Name = colors[1]?.trim() || '';

  return {
    color1: getColorCode(color1Name),
    color2: getColorCode(color2Name)
  };
};
