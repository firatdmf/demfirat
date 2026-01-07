import { NextRequest, NextResponse } from 'next/server';
const Iyzipay = require('iyzipay');

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY || '',
    secretKey: process.env.IYZICO_SECRET_KEY || '',
    uri: process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com'
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('===== CHECKOUT FORM INIT REQUEST =====');

        const {
            // Order info
            price,
            paidPrice,
            currency = 'TRY',
            basketId,

            // Buyer object
            buyer,

            // Addresses
            shippingAddress,
            billingAddress,

            // Basket items
            basketItems,

            // Installment options
            enabledInstallments = [1, 2, 3, 6, 9, 12],

            // Callback URL
            callbackUrl
        } = body;

        // Validate required fields
        if (!price || !buyer?.email || !buyer?.gsmNumber) {
            console.error('Missing fields:', { price, email: buyer?.email, phone: buyer?.gsmNumber });
            return NextResponse.json(
                { error: 'Missing required order or buyer information' },
                { status: 400 }
            );
        }

        // Create checkout form request
        const checkoutFormRequest = {
            locale: 'tr',
            conversationId: basketId || `order-${Date.now()}`,
            price: price.toString(),
            paidPrice: paidPrice?.toString() || price.toString(),
            currency: currency,
            basketId: basketId || `basket-${Date.now()}`,
            paymentGroup: 'PRODUCT',
            callbackUrl: callbackUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/api/payment/callback`,
            enabledInstallments: enabledInstallments,

            buyer: {
                id: buyer.id || 'BY' + Date.now(),
                name: buyer.name || 'Customer',
                surname: buyer.surname || 'User',
                gsmNumber: buyer.gsmNumber,
                email: buyer.email,
                identityNumber: buyer.identityNumber || '11111111111',
                lastLoginDate: new Date().toISOString().split('T')[0] + ' 00:00:00',
                registrationDate: new Date().toISOString().split('T')[0] + ' 00:00:00',
                registrationAddress: buyer.registrationAddress || shippingAddress.address,
                ip: buyer.ip || '85.34.78.112',
                city: buyer.city || shippingAddress.city,
                country: buyer.country || shippingAddress.country,
                zipCode: buyer.zipCode || '34732'
            },

            shippingAddress: {
                contactName: shippingAddress.contactName || buyer.name + ' ' + buyer.surname,
                city: shippingAddress.city,
                country: shippingAddress.country,
                address: shippingAddress.address,
                zipCode: shippingAddress.zipCode || '34732'
            },

            billingAddress: {
                contactName: billingAddress.contactName || buyer.name + ' ' + buyer.surname,
                city: billingAddress.city,
                country: billingAddress.country,
                address: billingAddress.address,
                zipCode: billingAddress.zipCode || '34732'
            },

            basketItems: basketItems || [{
                id: 'BI' + Date.now(),
                name: 'Product',
                category1: 'Fabric',
                itemType: 'PHYSICAL',
                price: price.toString()
            }]
        };

        console.log('Checkout Form Request:', JSON.stringify(checkoutFormRequest, null, 2));

        // Initialize checkout form
        return new Promise<NextResponse>((resolve) => {
            iyzipay.checkoutFormInitialize.create(checkoutFormRequest, function (err: any, result: any) {
                if (err) {
                    console.error('===== IYZICO CHECKOUT FORM ERROR =====');
                    console.error('Error:', JSON.stringify(err, null, 2));
                    resolve(NextResponse.json(
                        { error: 'Checkout form initialization failed', details: err },
                        { status: 500 }
                    ));
                } else if (result.status === 'success') {
                    console.log('===== IYZICO CHECKOUT FORM SUCCESS =====');
                    console.log('Token:', result.token);
                    // Return checkout form content for embedding
                    resolve(NextResponse.json({
                        success: true,
                        checkoutFormContent: result.checkoutFormContent,
                        paymentPageUrl: result.paymentPageUrl,
                        token: result.token,
                        tokenExpireTime: result.tokenExpireTime
                    }));
                } else {
                    console.error('===== IYZICO CHECKOUT FORM FAILED =====');
                    console.error('Status:', result.status);
                    console.error('Error Message:', result.errorMessage);
                    console.error('Error Code:', result.errorCode);
                    resolve(NextResponse.json(
                        { error: 'Checkout form initialization failed', message: result.errorMessage, code: result.errorCode },
                        { status: 400 }
                    ));
                }
            });
        });

    } catch (error: any) {
        console.error('Checkout Form API error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: error.message },
            { status: 500 }
        );
    }
}
