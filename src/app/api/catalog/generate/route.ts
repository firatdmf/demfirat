import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import sharp from 'sharp';
import { getColorCode, isTwoToneColor, splitTwoToneColor } from '@/lib/colorMap';
import { translateTextSync } from '@/lib/translate';

const USD_TO_TRY = 35.0;
const NEJUM_API_URL = process.env.NEXT_PUBLIC_NEJUM_API_URL || '';

// Font URLs (using Roboto which supports Turkish characters)
const FONT_URL_REGULAR = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf';
const FONT_URL_BOLD = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf';

function transformCloudinaryUrl(url: string): string {
    if (!url) return '';
    // AVIF desteklenmiyor, JPEG'e çevir ama kaliteyi yüksek tut
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', '/upload/f_jpg,q_90/');
    }
    return url;
}

// Load font as base64 string
async function loadFont(url: string): Promise<string | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer).toString('base64');
    } catch (error) {
        console.error('Font load error:', error);
        return null;
    }
}

async function loadImageAsBase64(url: string): Promise<string | null> {
    if (!url) return null;

    // Fix relative URL for Node.js fetch environment
    let targetUrl = url;
    if (url.startsWith('/')) {
        targetUrl = `${NEJUM_API_URL}${url}`;
    }

    const transformedUrl = transformCloudinaryUrl(targetUrl);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const response = await fetch(transformedUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) return null;

        const arrayBuffer = await response.arrayBuffer();
        const sourceBuffer = Buffer.from(arrayBuffer);

        try {
            // Guarantee image is JPEG with a white background (removes transparency rendering issues and WebP failures in jsPDF)
            const jpegBuffer = await sharp(sourceBuffer)
                .flatten({ background: { r: 255, g: 255, b: 255 } })
                .jpeg({ quality: 85 })
                .toBuffer();

            return `data:image/jpeg;base64,${jpegBuffer.toString('base64')}`;
        } catch (sharpError) {
            console.error('[PDF] Sharp processing error:', sharpError);
            return `data:image/jpeg;base64,${sourceBuffer.toString('base64')}`;
        }
    } catch (error) {
        console.error('[PDF] Fetch error:', error);
        return null;
    }
}

// Fetch exchange rate from API
async function fetchExchangeRate(): Promise<number> {
    try {
        const response = await fetch(
            `${NEJUM_API_URL}/authentication/api/get_exchange_rates/?t=${Date.now()}`
        );
        if (response.ok) {
            const data = await response.json();
            // API returns {success: true, rates: [{currency_code: 'TRY', rate: X}, ...]}
            if (data.success && data.rates && Array.isArray(data.rates)) {
                // USD to TRY rate - find TRY rate
                const tryRate = data.rates.find((r: any) => r.currency_code === 'TRY');
                if (tryRate?.rate) {
                    return parseFloat(tryRate.rate);
                }
            }
        }
    } catch (error) {
        console.error('Failed to fetch exchange rate:', error);
    }
    return 35.0; // Fallback
}

// Fetch full product details including variants with images
async function fetchProductDetails(sku: string, locale: string): Promise<{
    description: string | null;
    attributes: any[];
    variants: { sku: string; color: string; price: number | null; image: string | null }[];
}> {
    if (!sku || !NEJUM_API_URL) return { description: null, attributes: [], variants: [] };
    try {
        const response = await fetch(`${NEJUM_API_URL}/marketing/api/get_product?product_sku=${encodeURIComponent(sku)}`, {
            next: { revalidate: 300 }
        });
        if (!response.ok) return { description: null, attributes: [], variants: [] };

        const data = await response.json();

        // 1. Description
        let description = null;
        if (data.product?.description) {
            description = getLocalizedDescription(data.product.description, locale);
        }

        // 2. Attributes (Product Level)
        let attributes: any[] = [];
        if (data.product_attributes && Array.isArray(data.product_attributes)) {
            attributes = data.product_attributes.map((attr: any) => ({
                name: attr.attribute?.name || attr.name || 'Özellik',
                value: attr.attribute_value?.value || attr.value || ''
            })).filter((a: any) => a.value);
        }

        // 3. Variants with images
        let variants: { sku: string; color: string; price: number | null; image: string | null }[] = [];
        if (data.product_variants && Array.isArray(data.product_variants)) {
            const productFiles = data.product_files || [];
            const variantAttrValues = data.product_variant_attribute_values || [];

            for (const variant of data.product_variants) {
                // Find color attribute for this variant
                let colorName = '';
                if (variant.product_variant_attribute_values) {
                    for (const valId of variant.product_variant_attribute_values) {
                        const attrVal = variantAttrValues.find((v: any) => v.id === valId);
                        if (attrVal) {
                            const attrName = data.product_variant_attributes?.find(
                                (a: any) => a.id === attrVal.product_variant_attribute_id
                            )?.name?.toLowerCase();
                            if (attrName === 'color' || attrName === 'renk') {
                                colorName = attrVal.product_variant_attribute_value || '';
                            }
                        }
                    }
                }

                // Find image for this variant
                let variantImage = null;
                const variantFile = productFiles.find((f: any) => f.product_variant_id === variant.id);
                if (variantFile?.file_url) {
                    variantImage = variantFile.file_url;
                }

                if (colorName) {
                    variants.push({
                        sku: variant.variant_sku || '',
                        color: colorName,
                        price: variant.variant_price ? parseFloat(variant.variant_price) : null,
                        image: variantImage
                    });
                }
            }
        }

        return { description, attributes, variants };
    } catch (error) {
        console.error('Failed to fetch product details:', error);
        return { description: null, attributes: [], variants: [] };
    }
}

function getLocalizedDescription(description: string | null | undefined, locale: string): string | null {
    if (!description) return null;
    try {
        const parsed = JSON.parse(description);
        if (parsed.translations && typeof parsed.translations === 'object') {
            const localeData = parsed.translations[locale];
            if (localeData?.description) return localeData.description;
            if (parsed.translations['en']?.description) return parsed.translations['en'].description;
            const firstLocale = Object.keys(parsed.translations)[0];
            if (firstLocale && parsed.translations[firstLocale]?.description) {
                return parsed.translations[firstLocale].description;
            }
        }
        return description;
    } catch (e) {
        return description;
    }
}

interface CatalogProduct {
    sku: string;
    title: string;
    price: number | null;
    description?: string;
    primary_image?: string;
    colors?: string[];
    attributes?: { name: string; values: string[] }[];
    variants?: { sku: string; price: number | null }[];
}

const translations: { [key: string]: { [lang: string]: string } } = {
    colors: { en: 'Available Colors', tr: 'Mevcut Renkler', ru: 'Цвета', pl: 'Kolory' },
    attributes: { en: 'Features', tr: 'Özellikler', ru: 'Характеристики', pl: 'Cechy' },
    variants: { en: 'Variants', tr: 'Varyantlar', ru: 'Варианты', pl: 'Warianty' },
    description: { en: 'Description', tr: 'Açıklama', ru: 'Описание', pl: 'Opis' },
    perMeter: { en: '/m', tr: '/m', ru: '/м', pl: '/m' },
};

export async function POST(request: NextRequest) {
    try {
        const { products, locale = 'en' } = await request.json();

        if (!products || !Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ success: false, error: 'No products' }, { status: 400 });
        }

        const t = (key: string) => translations[key]?.[locale] || translations[key]?.['en'] || key;

        const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

        // Font loading
        try {
            const fontRegular = await loadFont(FONT_URL_REGULAR);
            const fontBold = await loadFont(FONT_URL_BOLD);
            if (fontRegular) {
                doc.addFileToVFS('Roboto-Regular.ttf', fontRegular);
                doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');
            }
            if (fontBold) {
                doc.addFileToVFS('Roboto-Bold.ttf', fontBold);
                doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');
            }
            doc.setFont('Roboto', 'normal');
        } catch (fontError) {
            console.error('Error loading custom fonts:', fontError);
        }

        const pageWidth = 210;
        const pageHeight = 297;
        const margin = 15;
        const contentWidth = pageWidth - (margin * 2);

        // Fetch real exchange rate from API
        const exchangeRate = await fetchExchangeRate();

        for (let i = 0; i < products.length; i++) {
            const product = products[i] as CatalogProduct;

            if (i > 0) doc.addPage();
            let yPos = margin;

            // Fetch deep details (Description + Attributes + Variants)
            let productDescription = product.description || '';
            let productAttributes = product.attributes || [];
            let productVariants: { sku: string; color: string; price: number | null; image: string | null }[] = [];

            if (product.sku) {
                const details = await fetchProductDetails(product.sku, locale);
                if (details.description) productDescription = details.description;
                productVariants = details.variants || [];

                if (details.attributes && details.attributes.length > 0) {
                    const extraAttrs = details.attributes.map(a => ({
                        name: a.name,
                        values: [a.value]
                    }));
                    const filteredExtra = extraAttrs.filter(a => a.name.toLowerCase() !== 'color' && a.name.toLowerCase() !== 'renk');
                    const existingNames = new Set(productAttributes.map(a => a.name.toLowerCase()));
                    for (const ea of filteredExtra) {
                        if (!existingNames.has(ea.name.toLowerCase())) {
                            productAttributes.push(ea);
                        }
                    }
                }
            }

            // Translate Attributes
            productAttributes = productAttributes.map(attr => ({
                name: translateTextSync(attr.name, locale),
                values: attr.values.map(v => translateTextSync(v, locale))
            }));

            // Translate Product Colors
            let localizedColors: string[] = [];
            if (product.colors && product.colors.length > 0) {
                localizedColors = product.colors.map(c => {
                    const translated = translateTextSync(c, locale);
                    // Explicit Fallback for uncached weird values
                    return translated === 'Loading' || translated === 'Loading...' ? c : translated;
                });
            }

            // ===== HEADER =====
            doc.setFillColor(201, 169, 97);
            doc.rect(0, 0, pageWidth, 20, 'F');
            doc.setFontSize(18);
            doc.setFont('Roboto', 'bold');
            doc.setTextColor(255, 255, 255);
            doc.text('DEMFIRAT', margin, 13);
            doc.setFontSize(8);
            doc.setFont('Roboto', 'normal');
            doc.text('Premium Home Textile', pageWidth - margin, 13, { align: 'right' });
            yPos = 28;

            // ===== PRODUCT IMAGE - Orijinal oran korunarak büyük göster =====
            const maxImageWidth = contentWidth * 0.95; // %95 genişlik
            const maxImageHeight = 140; // mm - maksimum yükseklik

            let actualImageHeight = maxImageHeight; // Varsayılan

            if (product.primary_image) {
                const imageData = await loadImageAsBase64(product.primary_image);
                if (imageData) {
                    try {
                        // jsPDF ile resim eklerken orijinal oranı koru
                        // Resmi mümkün olduğunca büyük göster
                        const imgProps = doc.getImageProperties(imageData);
                        const imgRatio = imgProps.width / imgProps.height;

                        let imgWidth = maxImageWidth;
                        let imgHeight = imgWidth / imgRatio;

                        // Eğer yükseklik maksimumu aşıyorsa, yükseklikten ölçekle
                        if (imgHeight > maxImageHeight) {
                            imgHeight = maxImageHeight;
                            imgWidth = imgHeight * imgRatio;
                        }

                        actualImageHeight = imgHeight;
                        const imgX = margin + (contentWidth - imgWidth) / 2;

                        // Arka plan kutusu
                        doc.setFillColor(252, 251, 249);
                        doc.roundedRect(margin, yPos, contentWidth, imgHeight + 8, 3, 3, 'F');

                        doc.addImage(imageData, 'JPEG', imgX, yPos + 4, imgWidth, imgHeight, undefined, 'FAST');
                    } catch (e) {
                        console.error('[jsPDF] Image generation failed', e);
                        doc.setFillColor(252, 251, 249);
                        doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');
                        actualImageHeight = 42;
                    }
                } else {
                    doc.setFillColor(252, 251, 249);
                    doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');
                    actualImageHeight = 42;
                }
            } else {
                doc.setFillColor(252, 251, 249);
                doc.roundedRect(margin, yPos, contentWidth, 50, 3, 3, 'F');
                actualImageHeight = 42;
            }
            yPos += actualImageHeight + 16;

            // ===== SKU =====
            doc.setFontSize(9);
            doc.setFont('Roboto', 'normal');
            doc.setTextColor(130, 130, 130);
            const skuText = product.sku ? product.sku.replace(/ı/g, 'i').replace(/İ/g, 'I') : '-';
            doc.text(`SKU: ${product.sku || '-'}`, margin, yPos);

            // ===== PRICE (Varyant fiyatından al) =====
            const firstVariantPrice = productVariants.length > 0 && productVariants[0].price
                ? productVariants[0].price
                : product.price;

            if (firstVariantPrice && firstVariantPrice > 0) {
                const usdPrice = firstVariantPrice;
                const tlPrice = usdPrice * exchangeRate;
                doc.setFontSize(14);
                doc.setFont('Roboto', 'bold');
                doc.setTextColor(201, 169, 97);
                doc.text(`${tlPrice.toFixed(2)} TL${t('perMeter')}`, pageWidth - margin, yPos - 2, { align: 'right' });
                doc.setFontSize(9);
                doc.setFont('Roboto', 'normal');
                doc.setTextColor(100, 100, 100);
                doc.text(`($${usdPrice.toFixed(2)}${t('perMeter')})`, pageWidth - margin, yPos + 4, { align: 'right' });
            }
            yPos += 8;

            // ===== PRODUCT NAME =====
            doc.setFontSize(16);
            doc.setFont('Roboto', 'bold');
            doc.setTextColor(44, 44, 44);
            doc.text(product.title || 'Urun', margin, yPos);
            yPos += 8;

            // ===== DESCRIPTION =====
            if (productDescription && productDescription.length > 0) {
                yPos += 2; // Azaltılmış üst boşluk
                doc.setFillColor(201, 169, 97);
                doc.rect(margin, yPos, 3, 5, 'F');
                doc.setFontSize(9);
                doc.setFont('Roboto', 'bold');
                doc.setTextColor(44, 44, 44);
                doc.text(t('description'), margin + 6, yPos + 4);
                yPos += 8;

                doc.setFontSize(8);
                doc.setFont('Roboto', 'normal');
                doc.setTextColor(70, 70, 70);
                const descLines = doc.splitTextToSize(productDescription, contentWidth);
                doc.text(descLines.slice(0, 8), margin, yPos); // Max 8 satır - tam açıklama
                yPos += Math.min(descLines.length, 8) * 3.5 + 4;
            }

            const sectionStartY = yPos;
            let attrEndY = yPos;
            let colorsEndY = yPos;

            // ===== ATTRIBUTES (Includes fetch details) =====
            if (productAttributes && productAttributes.length > 0) {
                let currentY = sectionStartY + 2; // Azaltılmış üst boşluk
                doc.setFillColor(201, 169, 97);
                doc.rect(margin, currentY, 3, 5, 'F');
                doc.setFontSize(9);
                doc.setFont('Roboto', 'bold');
                doc.setTextColor(44, 44, 44);
                doc.text(t('attributes'), margin + 6, currentY + 4);
                currentY += 8;

                // Display up to 5 attributes
                for (const attr of productAttributes.slice(0, 5)) {
                    doc.setFontSize(8);
                    doc.setFont('Roboto', 'bold');
                    doc.setTextColor(80, 80, 80);
                    const attrName = typeof attr.name === 'string' ? attr.name : 'Ozellik';
                    doc.text(`${attrName}:`, margin, currentY);

                    doc.setFont('Roboto', 'normal');
                    doc.setTextColor(60, 60, 60);
                    const valStr = Array.isArray(attr.values) ? attr.values.join(', ') : String(attr.values || '');
                    doc.text(valStr, margin + 35, currentY);
                    currentY += 4;
                }
                attrEndY = currentY + 2;
            }

            // ===== COLORS (Moved to the Right Side) =====
            if (localizedColors.length > 0) {
                const rightColumnX = margin + 95; // X koordinatını kolon olarak sağa aldık
                let currentY = sectionStartY + 2;

                if (currentY > pageHeight - 40) {
                    doc.addPage();
                    currentY = margin;
                }

                doc.setFillColor(201, 169, 97);
                doc.rect(rightColumnX, currentY, 2, 6, 'F');
                doc.setFontSize(9);
                doc.setFont('Roboto', 'bold');
                doc.setTextColor(44, 44, 44);
                // Increased spacing
                doc.text(t('colors'), rightColumnX + 5, currentY + 4);
                currentY += 10;

                const colorBoxSize = 10; // Daha küçük kutular
                const colorBoxSpacing = 5; // Kutular arası mesafe azaltıldı
                let cX = rightColumnX;
                let cY = currentY;

                for (let c = 0; c < product.colors!.length; c++) { // Iterate over raw colors for colorMap
                    const colorVal = product.colors![c];
                    const localizedColorName = localizedColors[c];

                    if (cX + colorBoxSize > pageWidth - margin) {
                        cX = rightColumnX;
                        cY += colorBoxSize + 14; // Alt satır boşluğu da azaltıldı

                        if (cY > pageHeight - 35) {
                            doc.addPage();
                            cY = margin + 10;
                            cX = margin; // Yeni sayfada soldan başlasın
                        }
                    }

                    // Shadow/border effect for better visibility
                    doc.setDrawColor(220, 220, 220);
                    doc.setLineWidth(0.3);

                    const parseColorToRgbTuple = (colorName: string): [number, number, number] => {
                        const code = getColorCode(colorName);
                        if (Array.isArray(code)) return [code[0], code[1], code[2]];
                        if (typeof code === 'string' && code.startsWith('#')) {
                            return [
                                parseInt(code.slice(1, 3), 16) || 200,
                                parseInt(code.slice(3, 5), 16) || 200,
                                parseInt(code.slice(5, 7), 16) || 200
                            ];
                        }
                        return [200, 200, 200];
                    };

                    if (isTwoToneColor(colorVal)) {
                        const { color1, color2 } = splitTwoToneColor(colorVal);

                        const rgb1 = parseColorToRgbTuple(color1);
                        const rgb2 = parseColorToRgbTuple(color2);

                        // İki renkli kutuyu çiz (üçgen şeklinde böl)
                        doc.setFillColor(rgb1[0], rgb1[1], rgb1[2]);
                        doc.triangle(cX, cY, cX + colorBoxSize, cY, cX, cY + colorBoxSize, 'F');

                        doc.setFillColor(rgb2[0], rgb2[1], rgb2[2]);
                        doc.triangle(cX + colorBoxSize, cY, cX, cY + colorBoxSize, cX + colorBoxSize, cY + colorBoxSize, 'F');

                        doc.roundedRect(cX, cY, colorBoxSize, colorBoxSize, 2, 2, 'S');
                    } else {
                        const rgb = parseColorToRgbTuple(colorVal);

                        if (rgb[0] > 240 && rgb[1] > 240 && rgb[2] > 240) {
                            doc.setDrawColor(200, 200, 200);
                            doc.setFillColor(255, 255, 255);
                        } else {
                            doc.setFillColor(rgb[0], rgb[1], rgb[2]);
                        }
                        doc.roundedRect(cX, cY, colorBoxSize, colorBoxSize, 2, 2, 'FD');
                    }

                    // Renk adını kutunun altına yaz (ortalayarak)
                    doc.setFontSize(6); // Daha okunaklı font
                    doc.setFont('Roboto', 'normal');
                    doc.setTextColor(120, 120, 120);

                    const colorNameDisplay = localizedColorName.length > 13 ? localizedColorName.substring(0, 12) + '..' : localizedColorName;

                    const textWidth = doc.getTextWidth(colorNameDisplay);
                    const textX = cX + (colorBoxSize / 2) - (textWidth / 2);
                    doc.text(colorNameDisplay.toLowerCase(), textX, cY + colorBoxSize + 4.5);

                    cX += colorBoxSize + colorBoxSpacing;
                }

                colorsEndY = cY + colorBoxSize + 12; // Varyantlar vs için yPos güncellendi
            }

            yPos = Math.max(attrEndY, colorsEndY);

            // ===== VARIANTS =====
            if (product.variants && product.variants.length > 0 && yPos < pageHeight - 50) {
                yPos += 14; // Renk kutularından sonra mesafe bırak, isimlerin üstüne binmesin
                // ... variants logic ...
                doc.setFillColor(201, 169, 97);
                doc.rect(margin, yPos, 2, 6, 'F');
                doc.setFontSize(9);
                doc.setFont('Roboto', 'bold');
                doc.setTextColor(44, 44, 44);
                // Increased spacing
                doc.text(t('variants'), margin + 15, yPos + 4.5);
                yPos += 10;

                for (const variant of product.variants.slice(0, 4)) {
                    doc.setFillColor(248, 248, 248);
                    doc.roundedRect(margin, yPos, contentWidth, 8, 1, 1, 'F');

                    doc.setFontSize(7);
                    doc.setFont('Roboto', 'normal');
                    doc.setTextColor(60, 60, 60);
                    doc.text(variant.sku || '-', margin + 2, yPos + 5);

                    if (variant.price && variant.price > 0) {
                        const vTL = (variant.price * exchangeRate).toFixed(2);
                        doc.setFont('Roboto', 'bold');
                        doc.setTextColor(201, 169, 97);
                        doc.text(`${vTL} TL ($${variant.price.toFixed(2)})`, pageWidth - margin - 2, yPos + 5, { align: 'right' });
                    }
                    yPos += 9;
                }
            }

            // ... footer for main product page ...
            const footerY = pageHeight - 8;
            doc.setFillColor(44, 44, 44);
            doc.rect(0, footerY - 3, pageWidth, 12, 'F');
            doc.setFontSize(7);
            doc.setFont('Roboto', 'normal');
            doc.setTextColor(255, 255, 255);
            doc.text('www.demfirat.com | info@demfirat.com', margin, footerY + 2);
            doc.setFontSize(8);
            doc.setFont('Roboto', 'bold');
            doc.text(`${i + 1} / ${products.length}`, pageWidth - margin, footerY + 2, { align: 'right' });

            // ===== VARIANT PAGES - Her varyant için ayrı sayfa =====
            if (productVariants && productVariants.length > 0) {
                for (const variant of productVariants) {
                    if (!variant.image) continue; // Resmi olmayan varyantları atla

                    doc.addPage();
                    let vYPos = margin;

                    // Header
                    doc.setFillColor(201, 169, 97);
                    doc.rect(0, 0, pageWidth, 20, 'F');
                    doc.setFontSize(18);
                    doc.setFont('Roboto', 'bold');
                    doc.setTextColor(255, 255, 255);
                    doc.text('DEMFIRAT', margin, 13);
                    doc.setFontSize(8);
                    doc.setFont('Roboto', 'normal');
                    doc.text('Premium Home Textile', pageWidth - margin, 13, { align: 'right' });
                    vYPos = 28;

                    // Variant image - büyük göster
                    const variantImageData = await loadImageAsBase64(variant.image);
                    if (variantImageData) {
                        try {
                            const imgProps = doc.getImageProperties(variantImageData);
                            const imgRatio = imgProps.width / imgProps.height;

                            const vMaxWidth = contentWidth * 0.95;
                            const vMaxHeight = 110; // Azaltılmış maksimum yükseklik varyant sayfası için

                            let vImgWidth = vMaxWidth;
                            let vImgHeight = vImgWidth / imgRatio;

                            if (vImgHeight > vMaxHeight) {
                                vImgHeight = vMaxHeight;
                                vImgWidth = vImgHeight * imgRatio;
                            }

                            const imgX = margin + (contentWidth - vImgWidth) / 2;

                            doc.setFillColor(252, 251, 249);
                            doc.roundedRect(margin, vYPos, contentWidth, vImgHeight + 8, 3, 3, 'F');
                            doc.addImage(variantImageData, 'JPEG', imgX, vYPos + 4, vImgWidth, vImgHeight, undefined, 'FAST');

                            vYPos += vImgHeight + 16;
                        } catch (e) {
                            console.error('[jsPDF Variant] Image generation failed', e);
                            doc.setFillColor(252, 251, 249);
                            doc.roundedRect(margin, vYPos, contentWidth, 50, 3, 3, 'F');
                            vYPos += 50 + 16;
                        }
                    }

                    // Variant info
                    doc.setFontSize(9);
                    doc.setFont('Roboto', 'normal');
                    doc.setTextColor(130, 130, 130);
                    doc.text(`SKU: ${variant.sku || product.sku || '-'}`, margin, vYPos);
                    vYPos += 6;

                    // Color name as title (Translated)
                    const rawColorTranslateVariant = translateTextSync(variant.color, locale);
                    const translatedVariantColor = rawColorTranslateVariant === 'Loading' ? variant.color : rawColorTranslateVariant;

                    doc.setFontSize(16);
                    doc.setFont('Roboto', 'bold');
                    doc.setTextColor(44, 44, 44);
                    doc.text(`${product.title || 'Ürün'} - ${translatedVariantColor}`, margin, vYPos);
                    vYPos += 10;

                    // Price
                    const variantPrice = variant.price || product.price;
                    if (variantPrice && variantPrice > 0) {
                        const tlPrice = variantPrice * exchangeRate;
                        doc.setFontSize(18);
                        doc.setFont('Roboto', 'bold');
                        doc.setTextColor(201, 169, 97);
                        doc.text(`${tlPrice.toFixed(2)} TL/m`, margin, vYPos);
                        doc.setFontSize(10);
                        doc.setFont('Roboto', 'normal');
                        doc.setTextColor(100, 100, 100);
                        doc.text(`($${variantPrice.toFixed(2)}/m)`, margin + 70, vYPos);
                    }

                    // Variant footer
                    doc.setFillColor(44, 44, 44);
                    doc.rect(0, footerY - 3, pageWidth, 12, 'F');
                    doc.setFontSize(7);
                    doc.setFont('Roboto', 'normal');
                    doc.setTextColor(255, 255, 255);
                    doc.text('www.demfirat.com | info@demfirat.com', margin, footerY + 2);
                    doc.setFontSize(8);
                    const rawFooterVariantColor = translateTextSync(variant.color, locale);
                    const footerTranslatedColor = rawFooterVariantColor === 'Loading' ? variant.color : rawFooterVariantColor;

                    doc.setFont('Roboto', 'bold');
                    doc.text(footerTranslatedColor, pageWidth - margin, footerY + 2, { align: 'right' });
                }
            }
        } // End of products loop

        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        return new NextResponse(pdfBuffer, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="demfirat-catalog-${Date.now()}.pdf"`,
            },
        });
    } catch (error) {
        console.error('PDF error:', error);
        return NextResponse.json({ success: false, error: 'PDF oluşturulamadı' }, { status: 500 });
    }
}
