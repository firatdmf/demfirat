import { NextRequest, NextResponse } from 'next/server';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// Türkçe karakterleri ASCII'ye çevir
function replaceTurkishChars(text: string): string {
  return text
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'I')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'G')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'U')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 'S')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'O')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C');
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sku = searchParams.get('sku');
    const title = searchParams.get('title');
    const image = searchParams.get('image');

    if (!sku) {
      return new NextResponse('SKU is required', { status: 400 });
    }

    // API'den ürün bilgilerini çek
    let productData: any = null;
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/get_product?product_sku=${sku}`;
      const apiResponse = await fetch(apiUrl);
      if (apiResponse.ok) {
        productData = await apiResponse.json();
      }
    } catch (error) {
      console.log('API\'den ürün bilgisi alınamadı:', error);
    }

    // Yeni PDF dokümanı oluştur
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595, 842]); // A4 boyutu
    
    // Fontları yükle
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    
    // Renkler
    const goldColor = rgb(0.788, 0.663, 0.38); // #c9a961
    const darkColor = rgb(0.172, 0.172, 0.172); // #2c2c2c
    const grayColor = rgb(0.4, 0.4, 0.4); // #666666
    
    const { width, height } = page.getSize();
    let yPosition = height - 80;
    
    // Header - Logo
    page.drawText('KARVEN', {
      x: width / 2 - 70,
      y: yPosition,
      size: 32,
      font: helveticaBold,
      color: goldColor,
    });
    
    yPosition -= 40;
    
    // Başlık
    page.drawText('Product Information', {
      x: width / 2 - 80,
      y: yPosition,
      size: 20,
      font: helvetica,
      color: darkColor,
    });
    
    yPosition -= 25;
    
    // Alt başlık
    page.drawText('Premium Textile Collection', {
      x: width / 2 - 85,
      y: yPosition,
      size: 12,
      font: helvetica,
      color: goldColor,
    });
    
    yPosition -= 30;
    
    // Alt çizgi
    page.drawLine({
      start: { x: 50, y: yPosition },
      end: { x: width - 50, y: yPosition },
      thickness: 2,
      color: goldColor,
    });
    
    yPosition -= 40;
    
    // Resim varsa ekle
    if (image) {
      try {
        const imageResponse = await fetch(image);
        if (imageResponse.ok) {
          const imageBytes = await imageResponse.arrayBuffer();
          let embeddedImage;
          
          if (image.toLowerCase().includes('.png')) {
            embeddedImage = await pdfDoc.embedPng(imageBytes);
          } else {
            embeddedImage = await pdfDoc.embedJpg(imageBytes);
          }
          
          // Resmi daha küçük yap - maksimum 200x200
          const imgWidth = embeddedImage.width;
          const imgHeight = embeddedImage.height;
          const maxSize = 200;
          
          let scaledWidth = imgWidth;
          let scaledHeight = imgHeight;
          
          if (imgWidth > imgHeight) {
            scaledWidth = maxSize;
            scaledHeight = (imgHeight / imgWidth) * maxSize;
          } else {
            scaledHeight = maxSize;
            scaledWidth = (imgWidth / imgHeight) * maxSize;
          }
          
          const imageX = (width - scaledWidth) / 2;
          
          page.drawImage(embeddedImage, {
            x: imageX,
            y: yPosition - scaledHeight,
            width: scaledWidth,
            height: scaledHeight,
          });
          
          yPosition -= scaledHeight + 30;
        }
      } catch (error) {
        console.log('Resim yüklenemedi:', error);
        yPosition -= 20;
      }
    }
    
    // Ürün bilgileri
    const addInfoRow = (label: string, value: string) => {
      page.drawText(label + ':', {
        x: 70,
        y: yPosition,
        size: 11,
        font: helveticaBold,
        color: goldColor,
      });
      
      page.drawText(value, {
        x: 220,
        y: yPosition,
        size: 11,
        font: helvetica,
        color: darkColor,
      });
      
      yPosition -= 15;
      
      // Alt çizgi
      page.drawLine({
        start: { x: 70, y: yPosition },
        end: { x: width - 70, y: yPosition },
        thickness: 0.5,
        color: rgb(0.878, 0.863, 0.824), // #e0dcd2
      });
      
      yPosition -= 20;
    };
    
    // Ürün bilgileri - API'den gelen data varsa onu kullan
    const product = productData?.product;
    const productTitle = product?.title || title || 'N/A';
    const productCategory = productData?.product_category || 'Premium Fabric';
    const productDescription = product?.description || 'High-quality textile product crafted with precision and care.';
    const productVariants = productData?.product_variants || [];
    const productVariantAttributes = productData?.product_variant_attributes || [];
    const productVariantAttributeValues = productData?.product_variant_attribute_values || [];
    
    // Temel bilgiler
    addInfoRow('Product Title', replaceTurkishChars(productTitle));
    addInfoRow('SKU', sku);
    addInfoRow('Category', replaceTurkishChars(productCategory));
    
    // Ekstra ürün detayları
    if (product?.barcode) {
      addInfoRow('Barcode', product.barcode);
    }
    if (product?.type) {
      addInfoRow('Type', replaceTurkishChars(product.type));
    }
    if (product?.weight) {
      addInfoRow('Weight', `${product.weight} ${product.unit_of_weight || 'kg'}`);
    }
    if (product?.unit_of_measurement) {
      addInfoRow('Unit', replaceTurkishChars(product.unit_of_measurement));
    }
    if (product?.tags && product.tags.length > 0) {
      addInfoRow('Tags', replaceTurkishChars(product.tags.join(', ')));
    }
    
    yPosition -= 10;
    
    // Açıklama - metnin uzunluğuna göre satırlara böl
    page.drawText('Description:', {
      x: 70,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: goldColor,
    });
    
    yPosition -= 20;
    
    // Açıklamayı satırlara böl (maksimum 70 karakter per satır)
    const descText = replaceTurkishChars(productDescription);
    const maxCharsPerLine = 70;
    const words = descText.split(' ');
    let currentLine = '';
    const lines: string[] = [];
    
    for (const word of words) {
      if ((currentLine + ' ' + word).length <= maxCharsPerLine) {
        currentLine += (currentLine ? ' ' : '') + word;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) lines.push(currentLine);
    
    // Tüm satırları çiz - sayfa biterse yeni sayfa ekle
    for (let i = 0; i < lines.length; i++) {
      // Eğer sayfa bitti ise yeni sayfa ekle
      if (yPosition < 150) {
        const newPage = pdfDoc.addPage([595, 842]);
        page = newPage as any;
        yPosition = height - 80;
      }
      
      page.drawText(lines[i], {
        x: 70,
        y: yPosition,
        size: 10,
        font: helvetica,
        color: darkColor,
      });
      yPosition -= 15;
    }
    
    yPosition -= 20;
    
    // Product Features/Technical Details
    if (yPosition < 200) {
      const newPage = pdfDoc.addPage([595, 842]);
      page = newPage as any;
      yPosition = height - 80;
    }
    
    page.drawText('Product Details:', {
      x: 70,
      y: yPosition,
      size: 11,
      font: helveticaBold,
      color: goldColor,
    });
    
    yPosition -= 20;
    
    const productDetails: string[] = [];
    
    if (product?.quantity) {
      productDetails.push(`Available Quantity: ${product.quantity}`);
    }
    if (product?.price) {
      productDetails.push(`Price: $${product.price}`);
    }
    if (product?.featured) {
      productDetails.push('Featured Product: Yes');
    }
    if (product?.selling_while_out_of_stock !== undefined) {
      productDetails.push(`Sell Out of Stock: ${product.selling_while_out_of_stock ? 'Yes' : 'No'}`);
    }
    if (product?.datasheet_url) {
      productDetails.push(`Datasheet: ${product.datasheet_url}`);
    }
    if (product?.minimum_inventory_level) {
      productDetails.push(`Min Inventory Level: ${product.minimum_inventory_level}`);
    }
    
    // Tüm detayları çiz
    for (const detail of productDetails) {
      if (yPosition < 120) {
        const newPage = pdfDoc.addPage([595, 842]);
        page = newPage as any;
        yPosition = height - 80;
      }
      
      page.drawText(replaceTurkishChars(detail), {
        x: 80,
        y: yPosition,
        size: 9,
        font: helvetica,
        color: darkColor,
      });
      yPosition -= 15;
    }
    
    yPosition -= 20;
    
    // Product Variants - TÜM varyantları göster
    if (productVariants && productVariants.length > 0) {
      // Yeni sayfa gerekirse ekle
      if (yPosition < 200) {
        const newPage = pdfDoc.addPage([595, 842]);
        page = newPage as any;
        yPosition = height - 80;
      }
      
      page.drawText('Available Variants:', {
        x: 70,
        y: yPosition,
        size: 11,
        font: helveticaBold,
        color: goldColor,
      });
      
      yPosition -= 20;
      
      // TÜM variantları göster
      for (let i = 0; i < productVariants.length; i++) {
        // Sayfa biterse yeni sayfa
        if (yPosition < 120) {
          const newPage = pdfDoc.addPage([595, 842]);
          page = newPage as any;
          yPosition = height - 80;
        }
        
        const variant = productVariants[i];
        
        // Variant numarasını göster
        page.drawText(`Variant ${i + 1}:`, {
          x: 80,
          y: yPosition,
          size: 10,
          font: helveticaBold,
          color: goldColor,
        });
        yPosition -= 15;
        
        // SKU
        page.drawText(`  SKU: ${variant.variant_sku || 'N/A'}`, {
          x: 85,
          y: yPosition,
          size: 9,
          font: helvetica,
          color: darkColor,
        });
        yPosition -= 12;
        
        // Variant attributesını bul ve her birini ayrı satırda göster
        if (variant.product_variant_attribute_values) {
          variant.product_variant_attribute_values.forEach((attrValId: any) => {
            const attrVal = productVariantAttributeValues.find((av: any) => String(av.id) === String(attrValId));
            if (attrVal) {
              const attr = productVariantAttributes.find((a: any) => String(a.id) === String(attrVal.product_variant_attribute_id));
              if (attr && attr.name) {
                // Sayfa biterse yeni sayfa
                if (yPosition < 100) {
                  const newPage = pdfDoc.addPage([595, 842]);
                  page = newPage as any;
                  yPosition = height - 80;
                }
                
                page.drawText(`  ${attr.name}: ${attrVal.product_variant_attribute_value}`, {
                  x: 85,
                  y: yPosition,
                  size: 9,
                  font: helvetica,
                  color: darkColor,
                });
                yPosition -= 12;
              }
            }
          });
        }
        
        // Diğer variant bilgileri
        if (variant.variant_barcode) {
          if (yPosition < 100) {
            const newPage = pdfDoc.addPage([595, 842]);
            page = newPage as any;
            yPosition = height - 80;
          }
          page.drawText(`  Barcode: ${variant.variant_barcode}`, {
            x: 85,
            y: yPosition,
            size: 9,
            font: helvetica,
            color: darkColor,
          });
          yPosition -= 12;
        }
        
        if (variant.variant_quantity !== undefined && variant.variant_quantity !== null) {
          if (yPosition < 100) {
            const newPage = pdfDoc.addPage([595, 842]);
            page = newPage as any;
            yPosition = height - 80;
          }
          page.drawText(`  Quantity: ${variant.variant_quantity}`, {
            x: 85,
            y: yPosition,
            size: 9,
            font: helvetica,
            color: darkColor,
          });
          yPosition -= 12;
        }
        
        if (variant.variant_price) {
          if (yPosition < 100) {
            const newPage = pdfDoc.addPage([595, 842]);
            page = newPage as any;
            yPosition = height - 80;
          }
          page.drawText(`  Price: $${variant.variant_price}`, {
            x: 85,
            y: yPosition,
            size: 9,
            font: helvetica,
            color: darkColor,
          });
          yPosition -= 12;
        }
        
        // Varyantlar arası boşluk
        yPosition -= 8;
      }
      
      yPosition -= 10;
    }
    
    // Footer - Son sayfanın altına ekle
    const pages = pdfDoc.getPages();
    const lastPage = pages[pages.length - 1];
    const { width: lastWidth } = lastPage.getSize();
    const footerY = 100;
    
    lastPage.drawText('Karven Tekstil', {
      x: lastWidth / 2 - 50,
      y: footerY,
      size: 10,
      font: helveticaBold,
      color: darkColor,
    });
    
    lastPage.drawText('Vakiflar OSB Mah D100 Cad No 38, Ergene, Tekirdag 59930, Turkiye', {
      x: lastWidth / 2 - 180,
      y: footerY - 15,
      size: 9,
      font: helvetica,
      color: grayColor,
    });
    
    lastPage.drawText('Email: info@demfirat.com | Phone: +90 (282) 675-1552', {
      x: lastWidth / 2 - 150,
      y: footerY - 30,
      size: 9,
      font: helvetica,
      color: grayColor,
    });
    
    lastPage.drawText('www.karvenhome.com', {
      x: lastWidth / 2 - 60,
      y: footerY - 50,
      size: 9,
      font: helvetica,
      color: goldColor,
    });
    
    // PDF'i kaydet
    const pdfBytes = await pdfDoc.save();
    
    // PDF dosyası olarak döndür
    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="product-${sku}.pdf"`,
      },
    });

  } catch (error) {
    console.error('PDF generation error:', error);
    return new NextResponse('Error generating PDF', { status: 500 });
  }
}
