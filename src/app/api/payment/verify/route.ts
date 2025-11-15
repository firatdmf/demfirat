import { NextRequest, NextResponse } from 'next/server';
const Iyzipay = require('iyzipay');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { paymentId, conversationId } = body;

    if (!paymentId) {
      return NextResponse.json(
        { success: false, error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Initialize iyzico client
    const iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY,
      uri: process.env.IYZICO_BASE_URL,
    });

    // Complete 3D Secure payment
    // After 3D Secure callback, we need to create/complete the payment
    const paymentRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: conversationId || 'payment-verification',
      paymentId: paymentId,
    };

    console.log('Completing 3D Secure payment with paymentId:', paymentId);

    return new Promise<NextResponse>((resolve) => {
      iyzipay.threedsPayment.create(paymentRequest, (err: any, result: any) => {
        if (err) {
          console.error('iyzico verification error:', err);
          resolve(
            NextResponse.json(
              { 
                success: false, 
                error: 'Payment verification failed',
                details: err 
              },
              { status: 500 }
            )
          );
          return;
        }

        console.log('iyzico verification result:', result);

        // Check payment status
        // fraudStatus: 1 means payment is approved
        // status: 'success' means API call succeeded
        if (result.status === 'success' && result.fraudStatus === 1) {
          resolve(
            NextResponse.json({
              success: true,
              payment: {
                paymentId: result.paymentId,
                conversationId: result.conversationId,
                price: result.price,
                paidPrice: result.paidPrice,
                currency: result.currency,
                basketId: result.basketId,
                fraudStatus: result.fraudStatus,
                merchantCommissionRate: result.merchantCommissionRate,
                merchantCommissionRateAmount: result.merchantCommissionRateAmount,
                iyziCommissionRateAmount: result.iyziCommissionRateAmount,
                iyziCommissionFee: result.iyziCommissionFee,
                cardType: result.cardType,
                cardAssociation: result.cardAssociation,
                cardFamily: result.cardFamily,
                binNumber: result.binNumber,
                lastFourDigits: result.lastFourDigits,
                authCode: result.authCode,
                phase: result.phase,
              }
            })
          );
        } else {
          resolve(
            NextResponse.json(
              { 
                success: false, 
                error: 'Payment failed',
                errorMessage: result.errorMessage,
                errorCode: result.errorCode,
                status: result.status,
                paymentStatus: result.paymentStatus
              },
              { status: 400 }
            )
          );
        }
      });
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
