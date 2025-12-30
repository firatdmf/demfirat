import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet } from '@react-pdf/renderer';

// Styles for PDF - using default fonts to avoid network issues
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 2,
        borderBottomColor: '#c9a961',
        borderBottomStyle: 'solid',
        paddingBottom: 15,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2c2c2c',
        letterSpacing: 2,
    },
    productContainer: {
        flex: 1,
        flexDirection: 'column',
    },
    imageContainer: {
        width: '100%',
        height: 280,
        marginBottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#faf8f3',
        borderRadius: 8,
    },
    productImage: {
        maxWidth: '100%',
        maxHeight: 260,
        objectFit: 'contain',
    },
    productInfo: {
        flexDirection: 'column',
    },
    skuRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    sku: {
        fontSize: 11,
        color: '#888888',
    },
    price: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#c9a961',
    },
    productName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#2c2c2c',
        marginBottom: 10,
    },
    description: {
        fontSize: 10,
        color: '#555555',
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#2c2c2c',
        marginBottom: 8,
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e0dcd2',
        borderBottomStyle: 'solid',
        paddingBottom: 4,
    },
    colorsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 15,
    },
    colorItem: {
        alignItems: 'center',
        marginRight: 10,
        marginBottom: 5,
    },
    colorSwatch: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#e0dcd2',
        borderStyle: 'solid',
    },
    colorLabel: {
        fontSize: 7,
        color: '#666666',
        marginTop: 2,
    },
    variantsContainer: {
        marginTop: 10,
    },
    variantItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 6,
        backgroundColor: '#faf8f3',
        borderRadius: 4,
        marginBottom: 4,
    },
    variantSku: {
        fontSize: 9,
        color: '#2c2c2c',
    },
    variantPrice: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#c9a961',
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e0dcd2',
        borderTopStyle: 'solid',
        paddingTop: 10,
    },
    footerText: {
        fontSize: 8,
        color: '#888888',
    },
    pageNumber: {
        fontSize: 8,
        color: '#888888',
    },
    noImage: {
        fontSize: 12,
        color: '#999999',
        textAlign: 'center',
    },
});

// Color name to hex mapping
const colorMap: { [key: string]: string } = {
    'white': '#ffffff',
    'black': '#000000',
    'red': '#e74c3c',
    'blue': '#3498db',
    'green': '#27ae60',
    'yellow': '#f1c40f',
    'gold': '#c9a961',
    'silver': '#c0c0c0',
    'beige': '#f5f5dc',
    'brown': '#8b4513',
    'grey': '#808080',
    'gray': '#808080',
    'pink': '#ffc0cb',
    'purple': '#9b59b6',
    'orange': '#e67e22',
    'cream': '#fffdd0',
    'ecru': '#cdb891',
    'ivory': '#fffff0',
    'navy': '#001f3f',
    'burgundy': '#800020',
};

function getColorHex(colorName: string): string {
    if (!colorName) return '#cccccc';
    const normalized = colorName.toLowerCase().replace(/[_-]/g, '');
    return colorMap[normalized] || '#cccccc';
}

interface CatalogProduct {
    sku: string;
    title: string;
    price: number | null;
    description?: string;
    primary_image?: string;
    colors?: string[];
    variants?: { sku: string; price: number | null }[];
}

interface CatalogPDFProps {
    products: CatalogProduct[];
    locale?: string;
}

const translations: { [key: string]: { [lang: string]: string } } = {
    colors: { en: 'Colors', tr: 'Renkler', ru: 'Цвета', pl: 'Kolory' },
    variants: { en: 'Variants', tr: 'Varyantlar', ru: 'Варианты', pl: 'Warianty' },
    contactForPrice: { en: 'Contact', tr: 'Arayın', ru: 'Узнать', pl: 'Zapytaj' },
    noImage: { en: 'No Image', tr: 'Resim Yok', ru: 'Нет фото', pl: 'Brak zdjęcia' },
};

export const CatalogPDF: React.FC<CatalogPDFProps> = ({ products, locale = 'en' }) => {
    const t = (key: string) => translations[key]?.[locale] || translations[key]?.['en'] || key;

    return (
        <Document>
            {products.map((product, index) => (
                <Page key={product.sku || `product-${index}`} size="A4" style={styles.page}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.logoText}>DEMFIRAT</Text>
                    </View>

                    {/* Product Content */}
                    <View style={styles.productContainer}>
                        {/* Product Image */}
                        <View style={styles.imageContainer}>
                            {product.primary_image ? (
                                <Image src={product.primary_image} style={styles.productImage} />
                            ) : (
                                <Text style={styles.noImage}>{t('noImage')}</Text>
                            )}
                        </View>

                        {/* Product Info */}
                        <View style={styles.productInfo}>
                            {/* SKU and Price Row */}
                            <View style={styles.skuRow}>
                                <Text style={styles.sku}>SKU: {product.sku || '-'}</Text>
                                <Text style={styles.price}>
                                    {product.price ? `$${product.price.toFixed(2)}` : t('contactForPrice')}
                                </Text>
                            </View>

                            {/* Product Name */}
                            <Text style={styles.productName}>{product.title || 'Product'}</Text>

                            {/* Description */}
                            {product.description && (
                                <Text style={styles.description}>
                                    {product.description.substring(0, 300)}
                                    {product.description.length > 300 ? '...' : ''}
                                </Text>
                            )}

                            {/* Colors */}
                            {product.colors && product.colors.length > 0 && (
                                <View>
                                    <Text style={styles.sectionTitle}>{t('colors')}</Text>
                                    <View style={styles.colorsContainer}>
                                        {product.colors.slice(0, 10).map((color, i) => (
                                            <View key={`color-${i}`} style={styles.colorItem}>
                                                <View style={[styles.colorSwatch, { backgroundColor: getColorHex(color) }]} />
                                                <Text style={styles.colorLabel}>{color}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}

                            {/* Variants */}
                            {product.variants && product.variants.length > 0 && (
                                <View>
                                    <Text style={styles.sectionTitle}>{t('variants')}</Text>
                                    <View style={styles.variantsContainer}>
                                        {product.variants.slice(0, 6).map((variant, i) => (
                                            <View key={`variant-${i}`} style={styles.variantItem}>
                                                <Text style={styles.variantSku}>{variant.sku || '-'}</Text>
                                                <Text style={styles.variantPrice}>
                                                    {variant.price ? `$${variant.price.toFixed(2)}` : '-'}
                                                </Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>www.demfirat.com</Text>
                        <Text style={styles.pageNumber}>{index + 1} / {products.length}</Text>
                    </View>
                </Page>
            ))}
        </Document>
    );
};

export default CatalogPDF;
