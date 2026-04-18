import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      isGuestCheckout,
      guestInfo,
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
    console.log('Is Guest Checkout:', isGuestCheckout);
    console.log('Guest Info:', guestInfo);
    console.log('Payment ID:', paymentData?.paymentId);
    console.log('Cart Items:', cartItems?.length);

    // Prepare order data for Django backend
    const orderData = {
      // For guest checkout, web_client_id is null
      web_client_id: isGuestCheckout ? null : userId,

      // Guest information (for orders without registered user)
      is_guest_order: isGuestCheckout || false,
      guest_email: guestInfo?.email || null,
      guest_phone: guestInfo?.phone || null,
      guest_first_name: guestInfo?.firstName || null,
      guest_last_name: guestInfo?.lastName || null,

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
          // Calculate fabric for 1 curtain
          let fabricPerCurtain = widthMeters * densityMultiplier * (wingType === 'double' ? 2 : 1);
          // Total fabric = fabric per curtain * quantity (number of curtains)
          fabricMeters = fabricPerCurtain * quantity;
          // Keep the actual quantity from cart (number of curtains ordered)
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

    // ===== SİPARİŞ ONAY MAİLİ (fire-and-forget) =====
    try {
      const customerEmail = guestInfo?.email || paymentData?.email;
      const customerName = `${deliveryAddress?.first_name || guestInfo?.firstName || ''} ${deliveryAddress?.last_name || guestInfo?.lastName || ''}`.trim() || 'Değerli Müşterimiz';
      const orderId = result.order_id || result.id;
      const totalTRY = parseFloat(paymentData?.paidPrice) || 0;
      const currency = paymentData?.currency || 'TRY';

      if (customerEmail) {
        const itemsHtml = (cartItems || []).map((item: any) => {
          const title = item.product?.title || item.product_sku || 'Ürün';
          const qty = item.quantity || 1;
          const isCustom = item.is_custom_curtain;
          const attrs = item.custom_attributes;
          let details = '';
          if (isCustom && attrs) {
            details = `<br><span style="font-size:12px;color:#888;">Özel Dikim: ${attrs.width || ''}×${attrs.height || ''}cm, ${attrs.pleatDensity || ''}, ${attrs.wingType === 'double' ? 'Çift Kanat' : 'Tek Kanat'}</span>`;
          }
          return `
            <tr>
              <td style="padding:10px 12px;border-bottom:1px solid #f0ece3;font-family:'Montserrat',Arial,sans-serif;font-size:14px;color:#333;">${title}${details}</td>
              <td style="padding:10px 12px;border-bottom:1px solid #f0ece3;font-family:'Montserrat',Arial,sans-serif;font-size:14px;color:#333;text-align:center;">${qty}</td>
            </tr>`;
        }).join('');

        const emailHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f2ec;font-family:'Montserrat',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f2ec;padding:30px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

        <!-- Header with Logo -->
        <tr>
          <td style="background:rgb(250,245,235);padding:28px 0;text-align:center;">
            <span style="font-family:'Jost','Montserrat',Arial,sans-serif;font-size:28px;font-weight:500;color:#944f05;letter-spacing:2px;">DEMFIRAT</span>
          </td>
        </tr>

        <!-- Success Icon -->
        <tr>
          <td style="padding:30px 40px 10px;text-align:center;">
            <div style="width:64px;height:64px;background:linear-gradient(135deg,#27ae60,#2ecc71);border-radius:50%;display:inline-flex;align-items:center;justify-content:center;">
              <span style="color:white;font-size:32px;">✓</span>
            </div>
          </td>
        </tr>

        <!-- Title -->
        <tr>
          <td style="padding:16px 40px 8px;text-align:center;">
            <h1 style="font-family:'Jost','Montserrat',Arial,sans-serif;font-size:24px;font-weight:600;color:#1a1a1a;margin:0;">Siparişiniz Alındı!</h1>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:0 40px 24px;text-align:center;">
            <p style="font-family:'Montserrat',Arial,sans-serif;font-size:14px;color:#777;margin:0;">Merhaba ${customerName}, siparişiniz başarıyla oluşturuldu.</p>
          </td>
        </tr>

        <!-- Order Info Box -->
        <tr>
          <td style="padding:0 40px 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f3;border-radius:8px;padding:16px;">
              <tr>
                <td style="padding:12px 16px;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="font-family:'Montserrat',Arial,sans-serif;font-size:13px;color:#888;padding-bottom:6px;">Sipariş No</td>
                      <td style="font-family:'Montserrat',Arial,sans-serif;font-size:13px;color:#888;padding-bottom:6px;text-align:right;">Toplam Tutar</td>
                    </tr>
                    <tr>
                      <td style="font-family:'Montserrat',Arial,sans-serif;font-size:18px;font-weight:700;color:#1a1a1a;">#${orderId}</td>
                      <td style="font-family:'Montserrat',Arial,sans-serif;font-size:18px;font-weight:700;color:#c9a961;text-align:right;">${totalTRY.toFixed(2)} ${currency}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Items Table -->
        <tr>
          <td style="padding:0 40px 24px;">
            <h3 style="font-family:'Montserrat',Arial,sans-serif;font-size:14px;font-weight:600;color:#333;margin:0 0 12px;">Sipariş Edilen Ürünler</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0ece3;border-radius:8px;overflow:hidden;">
              <tr style="background:#faf8f3;">
                <td style="padding:10px 12px;font-family:'Montserrat',Arial,sans-serif;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;">Ürün</td>
                <td style="padding:10px 12px;font-family:'Montserrat',Arial,sans-serif;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;text-align:center;">Adet</td>
              </tr>
              ${itemsHtml}
            </table>
          </td>
        </tr>

        <!-- Delivery Address -->
        <tr>
          <td style="padding:0 40px 24px;">
            <h3 style="font-family:'Montserrat',Arial,sans-serif;font-size:14px;font-weight:600;color:#333;margin:0 0 8px;">Teslimat Adresi</h3>
            <p style="font-family:'Montserrat',Arial,sans-serif;font-size:13px;color:#555;margin:0;line-height:1.6;">
              ${deliveryAddress?.first_name || ''} ${deliveryAddress?.last_name || ''}<br>
              ${deliveryAddress?.address || ''}<br>
              ${deliveryAddress?.city || ''} ${deliveryAddress?.country || ''}<br>
              ${deliveryAddress?.phone || ''}
            </p>
          </td>
        </tr>

        <!-- Divider -->
        <tr>
          <td style="padding:0 40px;">
            <div style="height:1px;background:linear-gradient(90deg,transparent,#c9a961,transparent);"></div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px 30px;text-align:center;">
            <p style="font-family:'Montserrat',Arial,sans-serif;font-size:13px;color:#888;margin:0 0 16px;">Siparişiniz en kısa sürede kargoya verilecektir.</p>
            <a href="https://www.demfirat.com" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#c9a961,#b8956a);color:white;text-decoration:none;border-radius:30px;font-family:'Montserrat',Arial,sans-serif;font-size:14px;font-weight:600;">Alışverişe Devam Et</a>
          </td>
        </tr>

        <!-- Bottom Bar -->
        <tr>
          <td style="background:rgb(250,245,235);padding:16px 40px;text-align:center;">
            <p style="font-family:'Montserrat',Arial,sans-serif;font-size:11px;color:#aaa;margin:0;">© ${new Date().getFullYear()} Demfirat Karven. Tüm hakları saklıdır.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        sendEmail(customerEmail, `Siparişiniz Alındı - #${orderId}`, emailHtml)
          .then(r => { if (r.success) console.log('✅ Sipariş onay maili gönderildi:', customerEmail); else console.warn('⚠️ Mail gönderilemedi:', r.error); })
          .catch(e => console.error('⚠️ Mail hatası:', e.message));

        // Admin bilgilendirme maili
        sendEmail('firat@nejum.com', `Yeni Sipariş - #${orderId} | ${customerName}`, emailHtml)
          .then(r => { if (r.success) console.log('✅ Admin bilgi maili gönderildi'); })
          .catch(() => {});
      }
    } catch (e) {
      // ignore - mail gönderemezse sipariş yine geçerli
    }

    // ===== FACEBOOK CONVERSIONS API - PURCHASE EVENT (fire-and-forget) =====
    // Don't await — send in background, don't block the response
    try {
      const totalAmount = parseFloat(paymentData?.paidPrice) || 0;
      fetch(`${request.nextUrl.origin}/api/meta-conversions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: 'Purchase',
          eventId: `purchase_${result.order_id || result.id}_${Date.now()}`,
          eventSourceUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.demfirat.com'}/order/confirmation`,
          userData: {
            email: guestInfo?.email || paymentData?.email,
            phone: guestInfo?.phone || deliveryAddress?.phone,
            firstName: guestInfo?.firstName || deliveryAddress?.first_name,
            lastName: guestInfo?.lastName || deliveryAddress?.last_name,
            city: deliveryAddress?.city,
            country: deliveryAddress?.country,
            ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
          },
          customData: {
            value: totalAmount,
            currency: paymentData?.currency || 'TRY',
            content_ids: cartItems?.map((item: any) => item.product_sku),
            content_type: 'product',
            contents: cartItems?.map((item: any) => ({
              id: item.product_sku,
              quantity: parseFloat(item.quantity) || 1,
              item_price: parseFloat(item.product?.price || item.custom_price || 0)
            })),
            num_items: cartItems?.length || 0,
            order_id: result.order_id || result.id
          }
        })
      }).then(r => {
        if (r.ok) console.log('✅ Facebook Conversions API - Purchase event sent');
        else console.warn('⚠️ Facebook Conversions API error:', r.status);
      }).catch(e => console.error('⚠️ Facebook Conversions API error:', e.message));
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      order: result,
      invoice: null
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
