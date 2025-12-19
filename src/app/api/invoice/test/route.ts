import { NextRequest, NextResponse } from 'next/server';
import { IsNetSoapClient } from '@/lib/isnet/soap-client';
import { InvoiceBuilder } from '@/lib/isnet/invoice-builder';

/**
 * TEST ENDPOINT - E-Arşiv Fatura Test
 * 
 * Bu endpoint, İşNet e-Arşiv bağlantısını test etmek için kullanılır.
 * Production'da kaldırılmalı veya yetkili kullanıcılara kısıtlanmalıdır.
 * 
 * GET /api/invoice/test - Basit bağlantı testi
 * POST /api/invoice/test - Tam fatura testi
 */

export async function GET(request: NextRequest) {
    console.log('===== E-ARŞİV BAĞLANTI TESTİ =====');

    try {
        // Environment bilgilerini logla
        console.log('Environment Variables:');
        console.log('- ISNET_ENVIRONMENT:', process.env.ISNET_ENVIRONMENT || 'NOT SET');
        console.log('- ISNET_COMPANY_VKN:', process.env.ISNET_COMPANY_VKN || 'NOT SET');
        console.log('- ISNET_INVOICE_SERVICE_URL:', process.env.ISNET_INVOICE_SERVICE_URL ? 'SET' : 'NOT SET');

        const isProduction = process.env.ISNET_ENVIRONMENT === 'production';
        const companyVKN = process.env.ISNET_COMPANY_VKN || '1234567805';

        // SOAP client oluştur ve WSDL'den metodları al
        console.log('Creating SOAP client...');
        const isnetClient = new IsNetSoapClient(isProduction);

        return NextResponse.json({
            success: true,
            message: 'İşNet SOAP client hazır!',
            environment: isProduction ? 'PRODUCTION' : 'TEST',
            companyVKN: companyVKN,
            testInvoiceUrl: '/api/invoice/test (POST)',
            note: 'POST isteği ile test faturası oluşturabilirsiniz.'
        });

    } catch (error: any) {
        console.error('===== BAĞLANTI HATASI =====');
        console.error('Error:', error.message);
        console.error('Full error:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            suggestion: 'Lütfen console loglarını kontrol edin.'
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    console.log('===== E-ARŞİV FATURA TEST =====');

    try {
        const body = await request.json();

        const isProduction = process.env.ISNET_ENVIRONMENT === 'production';
        const companyVKN = process.env.ISNET_COMPANY_VKN || '1234567805';

        // Test verisi oluştur (body'den gelen veya varsayılan)
        const testOrderData = {
            orderId: body.orderId || Math.floor(Math.random() * 100000),
            orderDate: body.orderDate || new Date().toISOString().split('T')[0],
            customer: {
                name: body.customerName || 'Test Musteri',
                taxNumber: body.taxNumber || '11111111111', // Test TCKN
                email: body.email || 'test@example.com',
                phone: body.phone || '5551234567',
                address: body.address || 'Test Adres Caddesi No:1',
                city: body.city || 'Istanbul',
                district: body.district || 'Kadikoy'
            },
            items: body.items || [
                {
                    productCode: 'TEST-001',
                    productName: 'Test Urun',
                    quantity: 1,
                    unitPrice: 100,
                    vatRate: 20
                }
            ],
            paymentMethod: 'card' as const
        };

        console.log('Test Order Data:', JSON.stringify(testOrderData, null, 2));

        // Fatura objesi oluştur
        const archiveInvoice = InvoiceBuilder.buildArchiveInvoice(testOrderData);

        // MINIMAL TEST: Sadece zorunlu alanları gönder
        const minimalInvoice = {
            CurrencyCode: 'TRY',
            ExternalArchiveInvoiceCode: `TEST-${Date.now()}`,
            InvoiceDate: new Date().toISOString().split('T')[0],
            InvoiceType: 1, // Satis = 1
            Receiver: {
                Address: {
                    BoulevardAveneuStreetName: 'Test Cadde No 1',
                    CityCode: 34,
                    CityName: 'Istanbul',
                    PostalCode: 34000,
                    TelephoneNumber: '5551234567',
                    TownCode: 1,
                    TownName: 'Kadikoy'
                },
                ReceiverName: 'Test Musteri',
                ReceiverTaxCode: '11111111111',
                RecipientType: 2, // Earsiv = 2
                SendingType: 1 // Elektronik = 1
            },
            TotalDiscountAmount: 0,
            TotalLineExtensionAmount: 100,
            TotalPayableAmount: 120,
            TotalTaxInclusiveAmount: 120,
            TotalVATAmount: 20
        };

        console.log('=== MINIMAL Invoice (no optional fields) ===');
        console.log(JSON.stringify(minimalInvoice, null, 2));

        // Use minimal or full invoice based on query param
        const useMinimal = body.minimal === true;
        const invoiceToSend = useMinimal ? minimalInvoice : archiveInvoice;

        console.log(`Using ${useMinimal ? 'MINIMAL' : 'FULL'} invoice`);
        console.log('Archive Invoice:', JSON.stringify(invoiceToSend, null, 2));

        // İşNet'e gönder
        const isnetClient = new IsNetSoapClient(isProduction);

        console.log('Sending to İşNet...');
        const response = await isnetClient.sendArchiveInvoice({
            CompanyTaxCode: companyVKN,
            ArchiveInvoices: [invoiceToSend]
        });

        console.log('İşNet Response:', response);

        if (response.Result === 'Success' && response.ArchiveInvoices?.length > 0) {
            const invoice = response.ArchiveInvoices[0];
            return NextResponse.json({
                success: true,
                message: 'Test faturası başarıyla oluşturuldu!',
                invoice: {
                    invoiceNumber: invoice.ArchiveInvoiceNumber,
                    ettn: invoice.Ettn,
                    externalCode: invoice.ExternalArchiveInvoiceCode
                },
                testData: testOrderData
            });
        } else {
            return NextResponse.json({
                success: false,
                error: response.ErrorMessage || 'Bilinmeyen hata',
                response: response
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error('===== FATURA OLUŞTURMA HATASI =====');
        console.error('Error:', error.message);
        console.error('Full error:', error);

        return NextResponse.json({
            success: false,
            error: error.message,
            suggestion: 'Console loglarını kontrol edin.'
        }, { status: 500 });
    }
}
