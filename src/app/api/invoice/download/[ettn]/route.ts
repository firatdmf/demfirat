import { NextRequest, NextResponse } from 'next/server';
import { IsNetSoapClient } from '@/lib/isnet/soap-client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ettn: string }> }
) {
  try {
    const { ettn } = await params;
    
    if (!ettn) {
      return NextResponse.json(
        { error: 'ETTN gerekli' },
        { status: 400 }
      );
    }

    console.log('===== FATURA PDF İNDİRME =====');
    console.log('ETTN:', ettn);

    const companyTaxCode = process.env.ISNET_COMPANY_VKN || '1234567890';
    const isProduction = process.env.ISNET_ENVIRONMENT === 'production';

    // İşNet client
    const isnetClient = new IsNetSoapClient(isProduction);

    // PDF link al
    const linkResponse = await isnetClient.getDocumentViewerLink({
      CompanyTaxCode: companyTaxCode,
      Ettn: ettn,
      InvoiceDirection: 'Giden',
      InvoiceDocumentType: 'EArchiveInvoice'
    });

    if (linkResponse.Result === 'Success' && linkResponse.DocumentViewerLink) {
      console.log('PDF Link:', linkResponse.DocumentViewerLink);

      // PDF'i fetch et
      const pdfResponse = await fetch(linkResponse.DocumentViewerLink);
      
      if (!pdfResponse.ok) {
        throw new Error('PDF indirilemedi');
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();

      // PDF'i döndür
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="fatura-${ettn}.pdf"`
        }
      });
    } else {
      return NextResponse.json(
        { error: linkResponse.ErrorMessage || 'PDF linki alınamadı' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('PDF indirme hatası:', error);
    return NextResponse.json(
      { error: 'PDF indirilemedi', details: error.message },
      { status: 500 }
    );
  }
}
