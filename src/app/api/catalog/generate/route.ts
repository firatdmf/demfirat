import { NextRequest, NextResponse } from 'next/server';
import jsPDF from 'jspdf';
import { getColorCode, isTwoToneColor, splitTwoToneColor } from '@/lib/colorMap';

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
    const transformedUrl = transformCloudinaryUrl(url);
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 12000);
        const response = await fetch(transformedUrl, { signal: controller.signal });
        clearTimeout(timeout);
        if (!response.ok) return null;
        const arrayBuffer = await response.arrayBuffer();
        return `data:image/jpeg;base64,${Buffer.from(arrayBuffer).toString('base64')}`;
    } catch (error) {
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
                        doc.setFillColor(252, 251, 249);
                        doc.roundedRect(margin, yPos, contentWidth, maxImageHeight + 8, 3, 3, 'F');
                    }
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

            // ===== ATTRIBUTES (Includes fetch details) =====
            if (productAttributes && productAttributes.length > 0) {
                yPos += 2; // Azaltılmış üst boşluk
                doc.setFillColor(201, 169, 97);
                doc.rect(margin, yPos, 3, 5, 'F');
                doc.setFontSize(9);
                doc.setFont('Roboto', 'bold');
                doc.setTextColor(44, 44, 44);
                doc.text(t('attributes'), margin + 6, yPos + 4);
                yPos += 8;

                // Display up to 4 attributes (reduced)
                for (const attr of productAttributes.slice(0, 4)) {
                    doc.setFontSize(8);
                    doc.setFont('Roboto', 'bold');
                    doc.setTextColor(80, 80, 80);
                    const attrName = typeof attr.name === 'string' ? attr.name : 'Ozellik';
                    doc.text(`${attrName}:`, margin, yPos);

                    doc.setFont('Roboto', 'normal');
                    doc.setTextColor(60, 60, 60);
                    const valStr = Array.isArray(attr.values) ? attr.values.join(', ') : String(attr.values || '');
                    doc.text(valStr, margin + 35, yPos);
                    yPos += 4;
                }
                yPos += 2;
            }

            // ===== COLORS (unchanged logic) =====
            if (product.colors && product.colors.length > 0) {
                doc.setFillColor(201, 169, 97);
                doc.rect(margin, yPos, 2, 6, 'F');
                doc.setFontSize(9);
                doc.setFont('Roboto', 'bold');
                doc.setTextColor(44, 44, 44);
                // Increased spacing
                doc.text(t('colors'), margin + 15, yPos + 4.5);
                yPos += 10;

                let xPos = margin;
                const swatchSize = 14;
                const swatchGap = 6;

                for (const colorName of product.colors.slice(0, 12)) {
                    if (isTwoToneColor(colorName)) {
                        const { color1, color2 } = splitTwoToneColor(colorName);
                        const parseHex = (hex: string) => {
                            if (!hex.startsWith('#')) return { r: 200, g: 200, b: 200 };
                            return {
                                r: parseInt(hex.slice(1, 3), 16) || 200,
                                g: parseInt(hex.slice(3, 5), 16) || 200,
                                b: parseInt(hex.slice(5, 7), 16) || 200
                            };
                        };
                        const c1 = parseHex(color1);
                        const c2 = parseHex(color2);
                        doc.setFillColor(c1.r, c1.g, c1.b);
                        doc.triangle(xPos, yPos, xPos + swatchSize, yPos, xPos, yPos + swatchSize, 'F');
                        doc.setFillColor(c2.r, c2.g, c2.b);
                        doc.triangle(xPos + swatchSize, yPos, xPos + swatchSize, yPos + swatchSize, xPos, yPos + swatchSize, 'F');
                        doc.setDrawColor(180, 180, 180);
                        doc.roundedRect(xPos, yPos, swatchSize, swatchSize, 2, 2, 'S');
                    } else {
                        const hexColor = getColorCode(colorName);
                        let r = 200, g = 200, b = 200;
                        if (hexColor.startsWith('#')) {
                            r = parseInt(hexColor.slice(1, 3), 16) || 200;
                            g = parseInt(hexColor.slice(3, 5), 16) || 200;
                            b = parseInt(hexColor.slice(5, 7), 16) || 200;
                        }

                        doc.setFillColor(r, g, b);
                        doc.setDrawColor(150, 150, 150);
                        doc.roundedRect(xPos, yPos, swatchSize, swatchSize, 2, 2, 'FD');

                        if (r > 240 && g > 240 && b > 240) {
                            doc.setDrawColor(180, 180, 180);
                            doc.roundedRect(xPos + 0.5, yPos + 0.5, swatchSize - 1, swatchSize - 1, 1.5, 1.5, 'S');
                        }
                    }

                    doc.setFontSize(5);
                    doc.setFont('Roboto', 'normal');
                    doc.setTextColor(100, 100, 100);
                    const label = colorName.length > 7 ? colorName.substring(0, 6) + '..' : colorName;
                    doc.text(label, xPos + swatchSize / 2, yPos + swatchSize + 3, { align: 'center' });

                    xPos += swatchSize + swatchGap;
                    if (xPos + swatchSize > pageWidth - margin) {
                        xPos = margin;
                        yPos += swatchSize + 7;
                    }
                }
                yPos += swatchSize + 8;
            }

            // ===== VARIANTS =====
            if (product.variants && product.variants.length > 0 && yPos < pageHeight - 50) {
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
                            const vMaxHeight = 140;

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

                            vYPos += vImgHeight + 20;
                        } catch (e) {
                            vYPos += 50;
                        }
                    }

                    // Variant info
                    doc.setFontSize(9);
                    doc.setFont('Roboto', 'normal');
                    doc.setTextColor(130, 130, 130);
                    doc.text(`SKU: ${variant.sku || product.sku || '-'}`, margin, vYPos);
                    vYPos += 6;

                    // Color name as title
                    doc.setFontSize(16);
                    doc.setFont('Roboto', 'bold');
                    doc.setTextColor(44, 44, 44);
                    doc.text(`${product.title || 'Ürün'} - ${variant.color}`, margin, vYPos);
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
                    doc.setFont('Roboto', 'bold');
                    doc.text(variant.color, pageWidth - margin, footerY + 2, { align: 'right' });
                }
            }
        }

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
