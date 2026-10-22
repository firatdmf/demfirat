// Shapes raw catalogue data into the product payload the PDF generator expects.
// Shared by the product grid's "Download catalog" button (which sends whatever
// the shopper has filtered down to) and the homepage catalog band (which sends
// the whole curtain range), so both produce the same PDF.

export type CatalogProduct = {
    sku: string;
    title: string;
    price: number | null;
    description: string;
    primary_image: string;
    colors: string[];
    attributes: { name: string; values: string[] }[];
    variants: { sku: string; price: number | null }[];
};

export function buildCatalogProducts(
    products: any[],
    product_variants: any[],
    product_variant_attributes: any[],
    product_variant_attribute_values: any[],
): CatalogProduct[] {
    return products.map((product) => {
        const productVars = product_variants.filter((v) => v.product_id === product.id);
        const colors = new Set<string>();
        const attributes = new Map<string, Set<string>>();

        productVars.forEach((variant) => {
            variant.product_variant_attribute_values.forEach((avId: any) => {
                const av = product_variant_attribute_values.find((v) => v.id === avId);
                if (av) {
                    const attr = product_variant_attributes.find((a) => a.id === av.product_variant_attribute_id);
                    if (attr?.name) {
                        const attrName = attr.name.toLowerCase();
                        if (attrName === 'color') {
                            colors.add(av.product_variant_attribute_value);
                        } else {
                            if (!attributes.has(attr.name)) {
                                attributes.set(attr.name, new Set());
                            }
                            attributes.get(attr.name)?.add(av.product_variant_attribute_value);
                        }
                    }
                }
            });
        });

        const attributesArray = Array.from(attributes.entries()).map(([name, values]) => ({
            name,
            values: Array.from(values).slice(0, 5),
        }));

        return {
            sku: product.sku || '',
            title: product.title || '',
            price: product.price ? Number(product.price) : null,
            description: product.description ? String(product.description) : '',
            primary_image: product.primary_image || '',
            colors: Array.from(colors),
            attributes: attributesArray,
            variants: productVars.slice(0, 8).map((v) => ({
                sku: v.variant_sku,
                price: v.variant_price ? Number(v.variant_price) : null,
            })),
        };
    });
}
