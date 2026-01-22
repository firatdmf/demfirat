import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // First, call Django backend to validate and create subscription
        const response = await fetch(`${BACKEND_URL}/marketing/api/subscribe/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();

        // If subscription was successful, send email from Next.js
        if (data.success && data.code) {
            const discountCode = data.code;
            const email = body.email;

            const htmlContent = `
            <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #faf8f3;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <img src="https://www.demfirat.com/logo/logo-dark.png" alt="Karven Home Collection" style="height: 60px;" />
                </div>
                
                <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                    <h1 style="color: #2c2c2c; text-align: center; font-family: Georgia, serif; font-size: 28px; margin: 0 0 20px 0;">Hoş Geldiniz! 🎉</h1>
                    
                    <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
                        Karven Home Collection bültenimize abone olduğunuz için teşekkür ederiz!
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #c9a961 0%, #b8956a 100%); padding: 30px; border-radius: 12px; text-align: center; margin: 30px 0;">
                        <p style="color: white; margin: 0 0 10px 0; font-size: 14px;">Size özel %5 indirim kodunuz:</p>
                        <p style="color: white; font-size: 32px; font-weight: bold; margin: 0; letter-spacing: 3px;">${discountCode}</p>
                    </div>
                    
                    <p style="color: #666; font-size: 14px; line-height: 1.6; text-align: center;">
                        Bu kodu ödeme sayfasında kullanarak ilk siparişinizde <strong>%5 indirim</strong> kazanabilirsiniz.
                    </p>
                    
                    <p style="color: #999; font-size: 12px; margin-top: 30px; text-align: center;">
                        ⚠️ Bu kod tek kullanımlıktır.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 30px;">
                    <a href="https://www.demfirat.com" style="display: inline-block; background: #2c2c2c; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Alışverişe Başla</a>
                </div>
                
                <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
                    Sevgilerle,<br>
                    <strong>Karven Home Collection</strong><br>
                    <a href="https://www.demfirat.com" style="color: #c9a961;">www.demfirat.com</a>
                </p>
            </div>
            `;

            try {
                await sendEmail(
                    email,
                    'Hoş Geldiniz! %5 İndirim Kodunuz 🎉',
                    htmlContent
                );
                console.log('[Subscribe] Email sent successfully to:', email);
            } catch (emailError) {
                console.error('[Subscribe] Email sending failed:', emailError);
                // Don't fail the subscription if email fails
            }
        }

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('[Subscribe API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Sunucu hatası. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
