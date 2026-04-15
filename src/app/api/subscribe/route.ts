import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email';

const BACKEND_URL = process.env.NEJUM_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Verify reCAPTCHA v3 token
        const recaptchaSecret = process.env.RECAPTCHA_SECRET_KEY;
        if (recaptchaSecret && body.recaptchaToken) {
            const recaptchaRes = await fetch('https://www.google.com/recaptcha/api/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `secret=${recaptchaSecret}&response=${body.recaptchaToken}`,
            });
            const recaptchaData = await recaptchaRes.json();

            if (!recaptchaData.success || recaptchaData.score < 0.3) {
                console.log('[Subscribe] reCAPTCHA failed:', recaptchaData);
                return NextResponse.json(
                    { success: false, error: 'Bot aktivitesi tespit edildi. Lütfen tekrar deneyin.' },
                    { status: 403 }
                );
            }
            console.log('[Subscribe] reCAPTCHA score:', recaptchaData.score);
        } else if (recaptchaSecret && !body.recaptchaToken) {
            return NextResponse.json(
                { success: false, error: 'Doğrulama başarısız. Sayfayı yenileyip tekrar deneyin.' },
                { status: 403 }
            );
        }

        const isFooter = body.source === 'footer';

        // For footer: only email required, no phone needed
        // For popup: email + phone required
        const subscribeBody = isFooter
            ? { email: body.email, phone: body.phone || '0000000000', skip_discount: true }
            : { email: body.email, phone: body.phone };

        // Call Django backend to validate and create subscription
        const response = await fetch(`${BACKEND_URL}/marketing/api/subscribe/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscribeBody),
        });

        const data = await response.json();

        // Footer subscriptions: no discount email, just confirm
        if (isFooter && data.success) {
            return NextResponse.json({ success: true });
        }

        // Popup subscriptions: send discount code email
        if (data.success && data.code) {
            const discountCode = data.code;
            const email = body.email;

            const htmlContent = `
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

        <!-- Content -->
        <tr>
          <td style="padding:40px;">
            <h1 style="color:#2c2c2c;text-align:center;font-family:'Jost','Montserrat',Arial,sans-serif;font-size:26px;margin:0 0 20px;">Hoş Geldiniz!</h1>

            <p style="color:#666;font-size:15px;line-height:1.6;text-align:center;margin:0 0 24px;">
             DEMFIRAT Karven Home Collection bültenimize abone olduğunuz için teşekkür ederiz!
            </p>

            <div style="background:linear-gradient(135deg,#c9a961 0%,#b8956a 100%);padding:30px;border-radius:12px;text-align:center;margin:0 0 24px;">
              <p style="color:white;margin:0 0 10px;font-size:14px;">Size özel %5 indirim kodunuz:</p>
              <p style="color:white;font-size:32px;font-weight:bold;margin:0;letter-spacing:3px;">${discountCode}</p>
            </div>

            <p style="color:#666;font-size:14px;line-height:1.6;text-align:center;margin:0 0 8px;">
              Bu kodu ödeme sayfasında kullanarak ilk siparişinizde <strong>%5 indirim</strong> kazanabilirsiniz.
            </p>

            <p style="color:#999;font-size:12px;text-align:center;margin:24px 0 0;">
              Bu kod tek kullanımlıktır.
            </p>
          </td>
        </tr>

        <!-- CTA Button -->
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="https://www.demfirat.com" style="display:inline-block;padding:14px 36px;background:linear-gradient(135deg,#c9a961,#b8956a);color:white;text-decoration:none;border-radius:30px;font-family:'Montserrat',Arial,sans-serif;font-size:14px;font-weight:600;">Alışverişe Başla</a>
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
          <td style="padding:20px 40px;text-align:center;">
            <p style="font-family:'Montserrat',Arial,sans-serif;font-size:12px;color:#999;margin:0;">
              Sevgilerle,<br>
              <strong>DEMFIRAT | Karven Home Collection</strong><br>
              <a href="https://www.demfirat.com" style="color:#c9a961;text-decoration:none;">www.demfirat.com</a>
            </p>
          </td>
        </tr>

        <!-- Bottom Bar -->
        <tr>
          <td style="background:rgb(250,245,235);padding:14px 40px;text-align:center;">
            <p style="font-family:'Montserrat',Arial,sans-serif;font-size:11px;color:#aaa;margin:0 0 8px;">&copy; ${new Date().getFullYear()} DEMFIRAT. Tüm hakları saklıdır.</p>
            <a href="https://www.demfirat.com/unsubscribe?email=${encodeURIComponent(email)}" style="font-family:'Montserrat',Arial,sans-serif;font-size:11px;color:#aaa;text-decoration:underline;">Abonelikten cik</a>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
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
