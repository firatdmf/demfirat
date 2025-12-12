import { NextRequest, NextResponse } from 'next/server';
import { IsNetSoapClient } from '@/lib/isnet/soap-client';
import { InvoiceBuilder } from '@/lib/isnet/invoice-builder';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, orderData } = body;

    console.log('===== E-ARŞİV FATURA OLUŞTURMA =====');
    console.log('Order ID:', orderId);

    // Firma VKN (env'den al)
    const companyTaxCode = process.env.ISNET_COMPANY_VKN || '1234567890';
    const isProduction = process.env.ISNET_ENVIRONMENT === 'production';

    // Sipariş verisinden fatura objesi oluştur
    const archiveInvoice = InvoiceBuilder.buildArchiveInvoice({
      orderId: parseInt(orderId),  // Number olarak gönder
      orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
      customer: {
        name: `${orderData.firstName} ${orderData.lastName}`,
        taxNumber: orderData.taxNumber || '11111111111', // Test için
        email: orderData.email,
        phone: orderData.phone,
        address: orderData.deliveryAddress.address,
        city: orderData.deliveryAddress.city,
        district: orderData.deliveryAddress.district,
        postalCode: orderData.deliveryAddress.postal_code
      },
      items: orderData.items.map((item: any) => ({
        productCode: item.product_sku || item.id,
        productName: item.product?.title || item.name || 'Ürün',
        quantity: parseFloat(item.quantity),
        unitPrice: parseFloat(item.price),
        vatRate: 20,  // %20 KDV (Türkiye standart)
        discount: 0
      })),
      paymentMethod: orderData.paymentMethod === 'iyzico_card' ? 'card' : 'bank_transfer',
      exchangeRate: orderData.exchangeRate,
      originalCurrency: orderData.originalCurrency
    });

    console.log('Fatura objesi oluşturuldu:', JSON.stringify(archiveInvoice, null, 2));

    // İşNet SOAP client oluştur
    const isnetClient = new IsNetSoapClient(isProduction);

    // E-Arşiv fatura gönder
    const response = await isnetClient.sendArchiveInvoice({
      CompanyTaxCode: companyTaxCode,
      ArchiveInvoices: [archiveInvoice]
    });

    console.log('İşNet Response:', response);

    if (response.Result === 'Success' && response.ArchiveInvoices.length > 0) {
      const invoiceResult = response.ArchiveInvoices[0];
      
      console.log('===== FATURA BAŞARIYLA OLUŞTURULDU =====');
      console.log('Fatura No:', invoiceResult.ArchiveInvoiceNumber);
      console.log('ETTN:', invoiceResult.Ettn);

      // Django backend'e fatura bilgilerini kaydet
      try {
        await fetch(`${process.env.NEXT_PUBLIC_NEJUM_API_URL}/operating/orders/update_invoice/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_id: orderId,
            invoice_number: invoiceResult.ArchiveInvoiceNumber,
            ettn: invoiceResult.Ettn,
            invoice_date: archiveInvoice.InvoiceDate,
            invoice_type: 'e-arsiv',
            invoice_provider: 'isnet'
          })
        });
      } catch (dbError) {
        console.error('Django backend güncelleme hatası:', dbError);
        // Devam et, fatura oluşturuldu
      }

      return NextResponse.json({
        success: true,
        invoice: {
          invoiceNumber: invoiceResult.ArchiveInvoiceNumber,
          ettn: invoiceResult.Ettn,
          invoiceDate: archiveInvoice.InvoiceDate
        }
      });
    } else {
      console.error('İşNet Hata:', response.ErrorMessage);
      return NextResponse.json(
        {
          success: false,
          error: response.ErrorMessage || 'Fatura oluşturulamadı'
        },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('E-Arşiv fatura oluşturma hatası:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Fatura oluşturulamadı',
        details: error.message
      },
      { status: 500 }
    );
  }
}
