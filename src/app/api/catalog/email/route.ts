import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

const BACKEND_URL = process.env.NEXT_PUBLIC_NEJUM_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, name, phone, products, locale } = body;

        if (!email || !name || !phone) {
            return NextResponse.json({ success: false, error: 'Eksik bilgi' }, { status: 400 });
        }

        // 1. Backend Newsletter Subscription and Discount Code Generation
        const subscribeResponse = await fetch(`${BACKEND_URL}/marketing/api/subscribe/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, phone, name }),
        });

        const subscribeData = await subscribeResponse.json();
        let discountCode = '';
        if (subscribeData.success && subscribeData.code) {
            discountCode = subscribeData.code;
        }

        // 2. Generate PDF using our existing internal API
        // We call the same origin Next.js API route to generate the PDF buffer
        const protocol = request.headers.get('x-forwarded-proto') || 'http';
        const host = request.headers.get('host');
        // Use full URL to self in Next.js Server Components / API
        const selfUrl = `${protocol}://${host}/api/catalog/generate`;

        let pdfBuffer: Buffer | null = null;
        try {
            const pdfGenResponse = await fetch(selfUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ products, locale })
            });

            if (pdfGenResponse.ok) {
                const arrayBuffer = await pdfGenResponse.arrayBuffer();
                pdfBuffer = Buffer.from(arrayBuffer);
            } else {
                console.error('[Catalog Email] PDF Generation failed internally:', await pdfGenResponse.text());
                return NextResponse.json({ success: false, error: 'PDF oluşturulamadı' }, { status: 500 });
            }
        } catch (pdfError) {
            console.error('[Catalog Email] Failed to fetch PDF:', pdfError);
            return NextResponse.json({ success: false, error: 'PDF hizmetine erişilemedi' }, { status: 500 });
        }

        // 3. Send the Email with Attachment
        const htmlContent = `
        <div style="font-family: 'Montserrat', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #faf8f3;">
            <div style="text-align: center; margin-bottom: 30px;">
                <img src="https://www.demfirat.com/logo/logo-dark.png" alt="Karven Home Collection" style="height: 60px;" />
            </div>
            
            <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
                <h1 style="color: #2c2c2c; text-align: center; font-family: Georgia, serif; font-size: 28px; margin: 0 0 20px 0;">Kataloğunuz Hazır! 📖</h1>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6; text-align: center;">
                    Merhaba ${name}, Karven & Dem Fırat ürün kataloğumuz bu e-postanın ekinde yer almaktadır.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="https://www.demfirat.com" style="display: inline-block; background: #2c2c2c; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">Sitemizi Ziyaret Edin</a>
            </div>
            
            <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">
                Sevgilerle,<br>
                <strong>Karven Home Collection</strong><br>
                <a href="https://www.demfirat.com" style="color: #c9a961;">www.demfirat.com</a>
            </p>
        </div>
        `;

        const attachments = [];
        if (pdfBuffer) {
            attachments.push({
                filename: `DemFirat-Katalog-${Date.now()}.pdf`,
                content: pdfBuffer,
                contentType: 'application/pdf'
            });
        }

        const emailResult = await sendEmail(
            email,
            'İşte Kataloğunuz! 📖',
            htmlContent,
            attachments
        );

        if (!emailResult.success) {
            console.error('[Catalog Email] Failed to send email.', emailResult.error);
            return NextResponse.json({ success: false, error: 'E-posta gönderilemedi.' }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Katalog başarıyla gönderildi.' }, { status: 200 });

    } catch (error) {
        console.error('[Catalog Email API] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Sunucu hatası. Lütfen tekrar deneyin.' },
            { status: 500 }
        );
    }
}
