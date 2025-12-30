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
    if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
        return url.replace('/upload/', '/upload/f_jpg,q_auto,w_400/');
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

// Fetch full product details (description + attributes) from backend API
async function fetchProductDetails(sku: string, locale: string): Promise<{ description: string | null; attributes: any[] }> {
    if (!sku || !NEJUM_API_URL) return { description: null, attributes: [] };
    try {
        const response = await fetch(`${NEJUM_API_URL}/marketing/api/get_product?product_sku=${encodeURIComponent(sku)}`, {
            next: { revalidate: 300 }
        });
        if (!response.ok) return { description: null, attributes: [] };

        const data = await response.json();

        // 1. Description
        let description = null;
        if (data.product?.description) {
            description = getLocalizedDescription(data.product.description, locale);
        }

        // 2. Attributes (Product Level)
        // Ensure we get "Features" like Fabric Type, Pattern, etc.
        let attributes: any[] = [];
        if (data.product_attributes && Array.isArray(data.product_attributes)) {
            attributes = data.product_attributes.map((attr: any) => ({
                name: attr.attribute?.name || attr.name || 'Özellik',
                value: attr.attribute_value?.value || attr.value || ''
            })).filter((a: any) => a.value);
        }

        return { description, attributes };
    } catch (error) {
        console.error('Failed to fetch product details:', error);
        return { description: null, attributes: [] };
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

        for (let i = 0; i < products.length; i++) {
            const product = products[i] as CatalogProduct;

            if (i > 0) doc.addPage();
            let yPos = margin;

            // Fetch deep details (Description + Attributes)
            let productDescription = product.description || '';
            let productAttributes = product.attributes || [];

            if (product.sku) {
                const details = await fetchProductDetails(product.sku, locale);
                if (details.description) productDescription = details.description;

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

            // ===== PRODUCT IMAGE =====
            const maxImageHeight = 70;
            doc.setFillColor(252, 251, 249);
            doc.roundedRect(margin, yPos, contentWidth, maxImageHeight + 8, 3, 3, 'F');

            if (product.primary_image) {
                const imageData = await loadImageAsBase64(product.primary_image);
                if (imageData) {
                    try {
                        const imgWidth = contentWidth * 0.5;
                        const imgHeight = maxImageHeight - 5;
                        const imgX = margin + (contentWidth - imgWidth) / 2;
                        doc.addImage(imageData, 'JPEG', imgX, yPos + 4, imgWidth, imgHeight, undefined, 'FAST');
                    } catch (e) { }
                }
            }
            yPos += maxImageHeight + 12;

            // ===== SKU =====
            doc.setFontSize(9);
            doc.setFont('Roboto', 'normal');
            doc.setTextColor(130, 130, 130);
            const skuText = product.sku ? product.sku.replace(/ı/g, 'i').replace(/İ/g, 'I') : '-';
            doc.text(`SKU: ${product.sku || '-'}`, margin, yPos);

            // ===== PRICE =====
            if (product.price && product.price > 0) {
                const usdPrice = product.price;
                const tlPrice = usdPrice * USD_TO_TRY;
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
                doc.setFillColor(201, 169, 97);
                doc.rect(margin, yPos, 2, 6, 'F');
                doc.setFontSize(9);
                doc.setFont('Roboto', 'bold');
                doc.setTextColor(44, 44, 44);
                // Increased spacing quite a bit: margin + 15
                doc.text(t('description'), margin + 15, yPos + 4.5);
                yPos += 8;

                doc.setFontSize(8);
                doc.setFont('Roboto', 'normal');
                doc.setTextColor(70, 70, 70);
                const descLines = doc.splitTextToSize(productDescription, contentWidth);
                doc.text(descLines.slice(0, 5), margin, yPos);
                yPos += Math.min(descLines.length, 5) * 3.5 + 5;
            }

            // ===== ATTRIBUTES (Includes fetch details) =====
            if (productAttributes && productAttributes.length > 0) {
                doc.setFillColor(201, 169, 97);
                doc.rect(margin, yPos, 2, 6, 'F');
                doc.setFontSize(9);
                doc.setFont('Roboto', 'bold');
                doc.setTextColor(44, 44, 44);
                // Increased spacing
                doc.text(t('attributes'), margin + 15, yPos + 4.5);
                yPos += 8;

                // Display up to 6 attributes
                for (const attr of productAttributes.slice(0, 6)) {
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
                yPos += 3;
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
                        const vTL = (variant.price * USD_TO_TRY).toFixed(2);
                        doc.setFont('Roboto', 'bold');
                        doc.setTextColor(201, 169, 97);
                        doc.text(`${vTL} TL ($${variant.price.toFixed(2)})`, pageWidth - margin - 2, yPos + 5, { align: 'right' });
                    }
                    yPos += 9;
                }
            }

            // ... footer ...
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
