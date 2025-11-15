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
      items: cartItems?.map((item: any) => ({
        product_sku: item.product_sku,
        product_variant_sku: item.variant_sku,
        quantity: parseFloat(item.quantity),
        price: item.product?.price
      })),
      
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

    return NextResponse.json({
      success: true,
      order: result
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
