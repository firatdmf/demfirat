import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      paymentData,
      cartItems,
      deliveryAddress,
      billingAddress,
      exchangeRate,
      originalCurrency,
      originalPrice
    } = body;

    console.log('===== CREATE ORDER =====');
    console.log('User ID:', userId);
    console.log('Payment ID:', paymentData?.paymentId);
    console.log('Cart Items:', cartItems?.length);

    // Prepare order data for Django backend
    const orderData = {
      web_client_id: userId,

      // Payment info
      payment_id: paymentData?.paymentId,
      payment_status: 'success',
      payment_method: 'iyzico_card',

      // Pricing info
      original_currency: originalCurrency || 'USD',
      original_price: originalPrice,
      paid_currency: paymentData?.currency || 'TRY',
      paid_amount: paymentData?.paidPrice,
      exchange_rate: exchangeRate,

      // Card details
      card_type: paymentData?.cardType,
      card_association: paymentData?.cardAssociation,
      card_last_four: paymentData?.lastFourDigits,

      // Delivery Address (flat structure)
      delivery_address_title: deliveryAddress?.title,
      delivery_address: deliveryAddress?.address,
      delivery_city: deliveryAddress?.city,
      delivery_country: deliveryAddress?.country,
      delivery_phone: deliveryAddress?.phone,

      // Billing Address (flat structure)
      billing_address_title: billingAddress?.title,
      billing_address: billingAddress?.address,
      billing_city: billingAddress?.city,
      billing_country: billingAddress?.country,
      billing_phone: billingAddress?.phone,

      // Order items
      items: cartItems?.map((item: any) => {
        // Determine if custom and compute fabric usage (meters)
        let isCustom = !!item.is_custom_curtain;
        let fabricMeters = 0;
        let quantity = parseFloat(item.quantity);
        let price = item.product?.price;

        if (isCustom && item.custom_attributes) {
          const width = parseFloat(item.custom_attributes.width) || 0;
          const pleatDensity = item.custom_attributes.pleatDensity || '1x2';
          const wingType = item.custom_attributes.wingType || 'single';
          let densityMultiplier = 1;
          if (pleatDensity !== '0') {
            const parts = pleatDensity.split('x');
            if (parts.length === 2) {
              densityMultiplier = parseFloat(parts[1]);
            }
          }
          const widthMeters = width / 100;
          fabricMeters = widthMeters * densityMultiplier * (wingType === 'double' ? 2 : 1);
          quantity = fabricMeters; // reflect meters as quantity for custom curtain
          price = item.custom_price ?? price;
        }

        return {
          product_sku: item.product_sku,
          product_variant_sku: item.variant_sku,
          quantity,
          price,
          is_custom_curtain: isCustom,
          custom_fabric_used_meters: fabricMeters > 0 ? Number(fabricMeters.toFixed(2)) : undefined,
          custom_attributes: item.custom_attributes || undefined
        };
      }),

      // Order metadata
      status: 'pending',
      notes: `Web order - Payment via iyzico. Exchange rate: ${exchangeRate} USD/TRY`
    };

    console.log('Order data prepared:', orderData);

    // Send to Django backend
    const djangoUrl = `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/operating/orders/create/`;

    const response = await fetch(djangoUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Django backend error:', errorText);
      throw new Error(`Django backend returned ${response.status}`);
    }

    const result = await response.json();

    console.log('===== ORDER CREATED =====');
    console.log('Order ID:', result.order_id || result.id);

    // ===== UPDATE STOCK QUANTITIES =====
    console.log('===== UPDATING STOCK =====');
    try {
      for (const item of cartItems) {
        let quantityToDeduct = 0;

        if (item.is_custom_curtain && item.custom_attributes) {
          // Custom curtain: Calculate required fabric in METERS and deduct that amount only
          const width = parseFloat(item.custom_attributes.width) || 0;
          const pleatDensity = item.custom_attributes.pleatDensity || '1x2';
          const wingType = item.custom_attributes.wingType || 'single';

          // Parse pile multiplier
          let densityMultiplier = 1;
          if (pleatDensity !== '0') {
            const parts = pleatDensity.split('x');
            if (parts.length === 2) {
              densityMultiplier = parseFloat(parts[1]);
            }
          }

          // Calculate fabric needed in meters
          const widthMeters = width / 100;
          let fabricNeeded = widthMeters * densityMultiplier;

          if (wingType === 'double') {
            fabricNeeded *= 2;
          }

          // Deduct in meters; backend handles units
          quantityToDeduct = Number(fabricNeeded.toFixed(2));

          console.log(`Custom curtain ${item.product_sku}: ${width}cm × ${pleatDensity} × ${wingType} = ${fabricNeeded.toFixed(2)}m (deduct meters)`);
        } else {
          // Regular product: use quantity directly (units)
          quantityToDeduct = parseFloat(item.quantity);
          console.log(`Regular product ${item.product_sku}: ${quantityToDeduct} units`);
        }

        // Update stock in Django backend
        const stockUpdateUrl = `${process.env.NEXT_PUBLIC_NEJUM_API_URL}/marketing/api/update_product_stock/`;

        const stockUpdateResponse = await fetch(stockUpdateUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_sku: item.product_sku,
            variant_sku: item.variant_sku || null,  // Pass variant_sku if available
            quantity_change: -quantityToDeduct  // Negative to decrease stock
          })
        });

        if (!stockUpdateResponse.ok) {
          console.error(`Failed to update stock for ${item.product_sku}:`, await stockUpdateResponse.text());
          // Continue with other items even if one fails
        } else {
          console.log(`✅ Stock updated for ${item.product_sku}: -${quantityToDeduct}`);
        }
      }
    } catch (stockError: any) {
      console.error('Stock update error:', stockError);
      // Don't fail the whole order if stock update fails
      // Order is already created successfully
    }

    // ===== E-ARŞİV FATURA OLUŞTUR =====
    console.log('===== E-ARŞİV FATURA OLUŞTURMA =====');
    let invoiceData = null;
    
    try {
      // Fatura oluşturma API'sini çağır
      const invoiceResponse = await fetch(`${request.nextUrl.origin}/api/invoice/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: result.order_id || result.id,
          orderData: {
            orderDate: new Date().toISOString().split('T')[0],
            firstName: deliveryAddress?.first_name || 'Müşteri',
            lastName: deliveryAddress?.last_name || 'Adı',
            taxNumber: '11111111111', // Test için - Gerçekte müşteriden alınmalı
            email: paymentData?.email || 'musteri@email.com',
            phone: deliveryAddress?.phone || '',
            deliveryAddress: {
              address: deliveryAddress?.address || '',
              city: deliveryAddress?.city || '',
              district: deliveryAddress?.district,
              postal_code: deliveryAddress?.postal_code
            },
            items: cartItems?.map((item: any) => ({
              product_sku: item.product_sku,
              name: item.product?.title || 'Ürün',
              quantity: item.quantity,
              price: parseFloat(item.product?.price || item.custom_price || 0) * exchangeRate // TRY'ye çevir
            })),
            paymentMethod: 'iyzico_card',
            exchangeRate: exchangeRate,
            originalCurrency: originalCurrency
          }
        })
      });

      if (invoiceResponse.ok) {
        invoiceData = await invoiceResponse.json();
        console.log('✅ E-Arşiv fatura oluşturuldu:', invoiceData.invoice);
      } else {
        const errorData = await invoiceResponse.json();
        console.error('⚠️ E-Arşiv fatura oluşturulamadı:', errorData.error);
        // Sipariş oluşturuldu ama fatura oluşturulamadı - devam et
      }
    } catch (invoiceError: any) {
      console.error('⚠️ E-Arşiv fatura hatası:', invoiceError.message);
      // Fatura oluşturulamazsa sipariş yine de geçerli
    }

    return NextResponse.json({
      success: true,
      order: result,
      invoice: invoiceData?.invoice || null
    });

  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create order',
        details: error.message
      },
      { status: 500 }
    );
  }
}
