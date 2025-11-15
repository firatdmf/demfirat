import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // iyzico sends callback data as form data
    const formData = await request.formData();
    
    // Extract all parameters
    const params: Record<string, string> = {};
    formData.forEach((value, key) => {
      params[key] = value.toString();
    });
    
    console.log('===== IYZICO CALLBACK (POST) =====');
    console.log('Params:', params);
    
    const { mdStatus, status, paymentId, conversationId, conversationData } = params;
    
    // Build query string for redirect
    const queryParams = new URLSearchParams({
      mdStatus: mdStatus || '',
      status: status || '',
      paymentId: paymentId || '',
      conversationId: conversationId || '',
      conversationData: conversationData || ''
    });
    
    // Default to 'tr' for Turkish locale
    // ConversationId format is: basket-{userId}-{timestamp}
    const locale = 'tr';
    
    // Redirect to callback page with query params
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const redirectPath = `/${locale}/payment/callback?${queryParams.toString()}`;
    const redirectUrl = new URL(redirectPath, baseUrl);
    
    console.log('Redirecting to:', redirectUrl.toString());
    
    // Use 303 See Other to change POST to GET
    return NextResponse.redirect(redirectUrl, 303);
    
  } catch (error) {
    console.error('Callback POST error:', error);
    return NextResponse.json(
      { error: 'Callback processing failed' },
      { status: 500 }
    );
  }
}
