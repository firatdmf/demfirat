import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const variant_sku = searchParams.get('variant_sku');
  const product_sku = searchParams.get('product_sku');

  if (!variant_sku || !product_sku) {
    return NextResponse.json(
      { error: 'Both variant_sku and product_sku are required' },
      { status: 400 }
    );
  }

  try {
    // get_product endpoint tüm bilgiyi içeriyor (variants, files, etc.)
    const productResponse = await fetch(
      `${process.env.NEJUM_API_URL}/marketing/api/get_product?product_sku=${product_sku}`,
      {
        next: { revalidate: 300 },
      }
    );

    if (!productResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch product from backend' },
        { status: productResponse.status }
      );
    }

    const productData = await productResponse.json();
    const product = productData.product;
    const productVariants = productData.product_variants || [];
    const productFiles = productData.product_files || [];
    const productVariantAttributes = productData.product_variant_attributes || [];
    const productVariantAttributeValues = productData.product_variant_attribute_values || [];
    
    // Variant SKU'ya göre variant'ı bul
    const variant = productVariants.find(
      (v: any) => v.variant_sku === variant_sku
    );
    
    if (!variant) {
      // Variant bulunamadı, product'ın kendi resmini dön
      return NextResponse.json({
        product,
        variant: null,
        primary_image: product?.primary_image || null,
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      });
    }
    
    // Variant'a ait resimleri filtrele (product_variant_id'ye göre)
    const variantImages = productFiles.filter(
      (file: any) => String(file.product_variant_id) === String(variant.id)
    );
    
    // Sequence'e göre sırala
    variantImages.sort((a: any, b: any) => {
      const seqA = a.sequence ?? Number.MAX_SAFE_INTEGER;
      const seqB = b.sequence ?? Number.MAX_SAFE_INTEGER;
      return seqA - seqB;
    });
    
    // Primary image: varyantın ilk resmi veya product'ın primary_image
    const primaryImage = variantImages.length > 0
      ? variantImages[0].file
      : product?.primary_image || null;
    
    // Variant'ın attribute'larını bul (Color: Ecru, Size: M gibi)
    const variantAttributeValueIds = variant.product_variant_attribute_values || [];
    const variantAttributesFormatted: { [key: string]: string } = {};
    
    variantAttributeValueIds.forEach((valueId: any) => {
      // Bu value ID'ye sahip attribute value'ı bul
      const attrValue = productVariantAttributeValues.find(
        (av: any) => String(av.id) === String(valueId)
      );
      
      if (attrValue) {
        // Bu attribute value'ın attribute'ını bul
        const attr = productVariantAttributes.find(
          (a: any) => String(a.id) === String(attrValue.product_variant_attribute_id)
        );
        
        if (attr && attr.name) {
          variantAttributesFormatted[attr.name] = attrValue.product_variant_attribute_value;
        }
      }
    });
    
    return NextResponse.json({
      product,
      variant,
      variant_attributes: variantAttributesFormatted,
      primary_image: primaryImage,
      all_images: variantImages,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching variant:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
