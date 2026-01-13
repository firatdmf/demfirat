import { NextRequest, NextResponse } from 'next/server';
const Iyzipay = require('iyzipay');

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || '',
  secretKey: process.env.IYZICO_SECRET_KEY || '',
  uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
});

export async function POST(request: NextRequest) {
  try {
    // Debug API key configuration
    console.log('===== IYZICO CONFIG CHECK =====');
    console.log('API Key exists:', !!process.env.IYZICO_API_KEY);
    console.log('API Key length:', process.env.IYZICO_API_KEY?.length || 0);
    console.log('Secret Key exists:', !!process.env.IYZICO_SECRET_KEY);
    console.log('Secret Key length:', process.env.IYZICO_SECRET_KEY?.length || 0);
    console.log('Base URL:', process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com');

    const body = await request.json();
    console.log('===== PAYMENT REQUEST RECEIVED =====');
    console.log('Body keys:', Object.keys(body));
    console.log('Buyer:', body.buyer);
    console.log('Price:', body.price);
    console.log('ShippingAddress:', body.shippingAddress);
    console.log('BillingAddress:', body.billingAddress);

    const {
      // Card info
      cardHolderName,
      cardNumber,
      expireMonth,
      expireYear,
      cvc,

      // Order info
      price,
      paidPrice,
      currency = 'TRY',
      basketId,
      paymentGroup,

      // Buyer object (from frontend)
      buyer,

      // Addresses
      shippingAddress,
      billingAddress,

      // Basket items
      basketItems,

      // Callback URL
      callbackUrl
    } = body;

    // Validate required fields
    if (!cardHolderName || !cardNumber || !expireMonth || !expireYear || !cvc) {
      return NextResponse.json(
        { error: 'Missing card information' },
        { status: 400 }
      );
    }

    if (!price || !buyer?.email || !buyer?.gsmNumber) {
      console.error('Missing fields:', { price, email: buyer?.email, phone: buyer?.gsmNumber });
      return NextResponse.json(
        { error: 'Missing required order or buyer information' },
        { status: 400 }
      );
    }

    // Create payment request
    const paymentRequest = {
      locale: 'tr',
      conversationId: basketId || `order-${Date.now()}`,
      price: price.toString(),
      paidPrice: paidPrice?.toString() || price.toString(),
      currency: currency,
      basketId: basketId || `basket-${Date.now()}`,
      paymentGroup: 'PRODUCT',
      callbackUrl: callbackUrl || 'http://localhost:3000/api/payment/callback',
      enabledInstallments: [1], // Tek çekim, taksit için [2, 3, 6, 9, 12]

      buyer: {
        id: buyer.id || 'BY' + Date.now(),
        name: buyer.name || cardHolderName.split(' ')[0],
        surname: buyer.surname || cardHolderName.split(' ').slice(1).join(' '),
        gsmNumber: buyer.gsmNumber,
        email: buyer.email,
        identityNumber: buyer.identityNumber || '11111111111',
        lastLoginDate: new Date().toISOString().split('T')[0] + ' 00:00:00',
        registrationDate: new Date().toISOString().split('T')[0] + ' 00:00:00',
        registrationAddress: buyer.registrationAddress || shippingAddress.address,
        ip: buyer.ip || '85.34.78.112',
        city: buyer.city || shippingAddress.city,
        country: buyer.country || shippingAddress.country,
        zipCode: '34732'
      },

      shippingAddress: {
        contactName: shippingAddress.contactName || cardHolderName,
        city: shippingAddress.city,
        country: shippingAddress.country,
        address: shippingAddress.address,
        zipCode: '34732'
      },

      billingAddress: {
        contactName: billingAddress.contactName || cardHolderName,
        city: billingAddress.city,
        country: billingAddress.country,
        address: billingAddress.address,
        zipCode: '34732'
      },

      basketItems: basketItems || [{
        id: 'BI' + Date.now(),
        name: 'Product',
        category1: 'Fabric',
        itemType: 'PHYSICAL',
        price: price.toString()
      }],

      paymentCard: {
        cardHolderName: cardHolderName,
        cardNumber: cardNumber.replace(/\s/g, ''),
        expireMonth: expireMonth,
        expireYear: expireYear,
        cvc: cvc,
        registerCard: 0 // Kartı kaydetme
      }
    };

    console.log('===== PAYMENT REQUEST TO IYZICO =====');
    console.log('Request:', JSON.stringify(paymentRequest, null, 2));

    // Initialize 3D Secure payment
    return new Promise<NextResponse>((resolve) => {
      iyzipay.threedsInitialize.create(paymentRequest, function (err: any, result: any) {
        if (err) {
          console.error('===== IYZICO ERROR =====');
          console.error('Error:', JSON.stringify(err, null, 2));
          resolve(NextResponse.json(
            { error: 'Payment initialization failed', details: err },
            { status: 500 }
          ));
        } else if (result.status === 'success') {
          console.log('===== IYZICO SUCCESS =====');
          console.log('Payment initialized successfully');
          // Return 3D Secure HTML content
          resolve(NextResponse.json({
            success: true,
            threeDSHtmlContent: result.threeDSHtmlContent,
            paymentPageUrl: result.paymentPageUrl
          }));
        } else {
          console.error('===== IYZICO FAILED =====');
          console.error('Status:', result.status);
          console.error('Error Message:', result.errorMessage);
          console.error('Error Code:', result.errorCode);
          console.error('Full Result:', JSON.stringify(result, null, 2));
          resolve(NextResponse.json(
            { error: 'Payment initialization failed', message: result.errorMessage, code: result.errorCode },
            { status: 400 }
          ));
        }
      });
    });

  } catch (error: any) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
