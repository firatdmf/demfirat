import soap from 'soap';

// Environment variable'dan URL al veya varsayılan kullan
const getInvoiceServiceUrl = (isProduction: boolean): string => {
    // Önce environment variable kontrol et
    if (process.env.ISNET_INVOICE_SERVICE_URL) {
        console.log('[İşNet] Using ISNET_INVOICE_SERVICE_URL from environment:', process.env.ISNET_INVOICE_SERVICE_URL);
        return process.env.ISNET_INVOICE_SERVICE_URL;
    }

    // Environment'a göre varsayılan URL kullan
    const url = isProduction
        ? 'http://einvoiceservice.isnet.net.tr/InvoiceService/ServiceContract/InvoiceService.svc?wsdl'
        : 'http://einvoiceservicetest.isnet.net.tr/InvoiceService/ServiceContract/InvoiceService.svc?wsdl';

    console.log(`[İşNet] Using default ${isProduction ? 'production' : 'test'} URL:`, url);
    return url;
};

const getAddressBookServiceUrl = (isProduction: boolean): string => {
    if (process.env.ISNET_ADDRESS_BOOK_SERVICE_URL) {
        return process.env.ISNET_ADDRESS_BOOK_SERVICE_URL;
    }
    return isProduction
        ? 'http://einvoiceservice.isnet.net.tr/AddressBookService/ServiceContract/AddressBookService.svc?wsdl'
        : 'http://einvoiceservicetest.isnet.net.tr/AddressBookService/ServiceContract/AddressBookService.svc?wsdl';
};

export class IsNetSoapClient {
    private invoiceClient: any = null;
    private addressBookClient: any = null;
    private isProduction: boolean;

    constructor(isProduction: boolean = false) {
        this.isProduction = isProduction;
        console.log(`[İşNet] SOAP Client initialized. Environment: ${isProduction ? 'PRODUCTION' : 'TEST'}`);
    }

    /**
     * Fatura servisi client'ını başlat
     */
    private async getInvoiceClient() {
        if (this.invoiceClient) return this.invoiceClient;

        const wsdlUrl = getInvoiceServiceUrl(this.isProduction);
        const endpoint = wsdlUrl.replace('?wsdl', '');

        console.log('[İşNet] Creating SOAP client...');
        console.log('[İşNet] WSDL URL:', wsdlUrl);
        console.log('[İşNet] Endpoint:', endpoint);

        try {
            this.invoiceClient = await soap.createClientAsync(wsdlUrl, {
                endpoint: endpoint,
                // SOAP client seçenekleri
                wsdl_options: {
                    timeout: 30000, // 30 saniye timeout
                },
            });

            console.log('[İşNet] ✅ SOAP client created successfully');
            console.log('[İşNet] Available methods:', Object.keys(this.invoiceClient.InvoiceService?.BasicHttpBinding_IInvoiceService || {}));

            return this.invoiceClient;
        } catch (error: any) {
            console.error('[İşNet] ❌ SOAP client creation failed');
            console.error('[İşNet] Error:', error.message);
            console.error('[İşNet] Full error:', error);
            throw new Error(`İşNet servisine bağlanılamadı: ${error.message}`);
        }
    }

    /**
     * E-Arşiv fatura gönder
     */
    async sendArchiveInvoice(request: SendArchiveInvoiceRequest): Promise<SendArchiveInvoiceResponse> {
        const client = await this.getInvoiceClient();

        try {
            // SOAP XML yapısı için tüm array'leri wrapper element ile sarmala
            // node-soap array'leri düzgün serileştirmek için explicit wrapper gerektirir
            // KRITIK: Sadece değeri olan alanları dahil et, undefined/null gönderme!

            // Her fatura için sadece dolu alanları sarmala
            const wrappedInvoices = request.ArchiveInvoices.map(invoice => {
                const wrapped: any = { ...invoice };

                // InvoiceDetails varsa ve dolu ise sarmala
                if (invoice.InvoiceDetails && invoice.InvoiceDetails.length > 0) {
                    wrapped.InvoiceDetails = {
                        ArchiveInvoiceDetail: invoice.InvoiceDetails
                    };
                } else {
                    // InvoiceDetails yoksa veya boşsa tamamen kaldır
                    delete wrapped.InvoiceDetails;
                }

                // Notes varsa ve dolu ise sarmala
                if (invoice.Notes && invoice.Notes.length > 0) {
                    wrapped.Notes = { string: invoice.Notes };
                } else {
                    delete wrapped.Notes;
                }

                return wrapped;
            });

            const wrappedRequest = {
                CompanyTaxCode: request.CompanyTaxCode,
                CompanyVendorNumber: request.CompanyVendorNumber,
                ArchiveInvoices: {
                    ArchiveInvoice: wrappedInvoices
                }
            };

            // DEBUG: Also try without manual wrapping
            const unwrappedRequest = {
                CompanyTaxCode: request.CompanyTaxCode,
                CompanyVendorNumber: request.CompanyVendorNumber,
                ArchiveInvoices: request.ArchiveInvoices
            };

            // SOAP request XML'ini logla
            console.log('===== SOAP REQUEST (WRAPPED) =====');
            console.log(JSON.stringify(wrappedRequest, null, 2));
            console.log('===== SOAP REQUEST (UNWRAPPED) =====');
            console.log(JSON.stringify(unwrappedRequest, null, 2));

            // Son request'i XML olarak görmek için
            client.on('request', (xml: string) => {
                console.log('===== SOAP XML =====');
                console.log(xml);
            });

            // Try UNWRAPPED first - let node-soap handle wrapping
            console.log('Trying UNWRAPPED request...');
            const [result] = await client.SendArchiveInvoiceAsync(unwrappedRequest);

            console.log('İşNet Response:', result);

            return result;
        } catch (error: any) {
            console.error('E-Arşiv gönderim hatası:', error);

            // Detaylı hata bilgisi
            if (error.root) {
                console.error('SOAP Fault Detail:', JSON.stringify(error.root, null, 2));
            }

            throw new Error(error.message || 'Fatura gönderilemedi');
        }
    }

    /**
     * E-Arşiv fatura sorgula
     */
    async searchArchiveInvoice(request: SearchArchiveInvoiceRequest): Promise<SearchArchiveInvoiceResponse> {
        const client = await this.getInvoiceClient();

        try {
            const [result] = await client.SearchArchiveInvoiceAsync(request);
            return result;
        } catch (error: any) {
            console.error('Fatura sorgulama hatası:', error);
            throw new Error(error.message || 'Fatura sorgulanamadı');
        }
    }

    /**
     * E-Arşiv faturayı email ile gönder
     */
    async sendArchiveInvoiceMail(request: SendArchiveInvoiceMailRequest): Promise<SendArchiveInvoiceMailResponse> {
        const client = await this.getInvoiceClient();

        try {
            const [result] = await client.SendArchiveInvoiceMailAsync(request);
            return result;
        } catch (error: any) {
            console.error('Email gönderim hatası:', error);
            throw new Error(error.message || 'Email gönderilemedi');
        }
    }

    /**
     * Fatura PDF/XML linki al
     */
    async getDocumentViewerLink(request: GetDocumentViewerLinkRequest): Promise<GetDocumentViewerLinkResponse> {
        const client = await this.getInvoiceClient();

        try {
            const [result] = await client.GetDocumentViewerLinkAsync(request);
            return result;
        } catch (error: any) {
            console.error('Link alma hatası:', error);
            throw new Error(error.message || 'Link alınamadı');
        }
    }
}

// ==================== TYPE DEFINITIONS ====================

export interface SendArchiveInvoiceRequest {
    CompanyTaxCode: string;
    CompanyVendorNumber?: string;
    ArchiveInvoices: ArchiveInvoice[];
}

export interface ArchiveInvoice {
    CurrencyCode: string;                 // TRY, USD, EUR (alfabetik sıra)
    ExternalArchiveInvoiceCode: string;   // Kaynak sistem fatura kodu (unique)
    InvoiceDate: string;                  // YYYY-MM-DD
    InvoiceDetails?: ArchiveInvoiceDetail[];  // Dokümanda "Opsiyonel" olarak belirtilmiş
    InvoiceType: InvoiceType;
    LastPaymentDate?: string;             // Son ödeme tarihi
    Notes?: string[];
    OrderDate?: string;
    OrderNumber?: number;                 // Number olarak gönder
    Receiver: AddressBookEntry;
    SendMailAutomatically?: boolean;
    TotalDiscountAmount: number;          // İndirim tutarı
    TotalLineExtensionAmount: number;     // Mal/hizmet tutarı
    TotalPayableAmount: number;           // Ödenecek tutar
    TotalTaxInclusiveAmount: number;      // Vergiler dahil toplam
    TotalVATAmount: number;               // KDV tutarı
    WebSellingInfo?: WebSellingInfo;      // E-ticaret için zorunlu
}

export interface AddressBookEntry {
    Address: Address;                     // Alfabetik sıra
    ReceiverName: string;
    ReceiverTaxCode: string;              // Alıcı VKN veya TCKN
    RecipientType: RecipientType;
    SendingType: SendingType;
}

export interface Address {
    BoulevardAveneuStreetName: string;    // Sokak/cadde adı
    BuildingName?: string;                // Bina adı (alfabetik sıra)
    BuildingNumber?: string;              // Bina numarası
    CityCode: number;                     // İl kodu (ZORUNLU) - örn: 17 = Çanakkale
    CityName: string;                     // İl adı
    CountryName?: string;                 // Ülke adı
    Email?: string;                       // E-posta
    FaxNumber?: string;                   // Faks numarası
    PostalCode?: number;                  // Posta kodu (decimal in docs)
    TaxOfficeCode?: number;               // Vergi dairesi kodu
    TaxOfficeName?: string;               // Vergi dairesi adı
    TelephoneNumber?: string;             // Telefon numarası
    TownCode: number;                     // İlçe kodu (ZORUNLU)
    TownName?: string;                    // İlçe adı
    WebSite?: string;                     // Web sitesi
}

export interface ArchiveInvoiceDetail {
    CurrencyCode: string;                 // Alfabetik sıra
    DiscountAmount?: number;
    LineExtensionAmount: number;          // Satır tutarı
    Product: Product;
    Quantity: number;
    VatAmount: number;
    VatRate: number;                      // KDV oranı (örn: 20)
}

export interface Product {
    ExternalProductCode: string;          // Alfabetik sıra
    MeasureUnit: string;                  // 'C62' = Adet, 'MTR' = Metre
    ProductName: string;
    UnitPrice: number;
}

export interface WebSellingInfo {
    Carrier?: Carrier;                    // Kargo bilgisi
    PaymentDate: string;                  // Ödeme tarihi (YYYY-MM-DD)
    PaymentType: PaymentType;             // Ödeme tipi
    SendingDate: string;                  // Gönderim tarihi
    WebAddress: number;                   // Web adresi KODU (int!) - NOT: string DEĞİL!
}

export interface Carrier {
    CarrierName: string;                  // Alfabetik sıra
    VknTckn?: string;
}

export enum InvoiceType {
    Satis = 1,
    Iade = 2,
    Tevkifat = 4,
    OzelMatrah = 5,
    IhracKayitli = 6
}

export enum RecipientType {
    Earsiv = 2
}

export enum SendingType {
    Elektronik = 1,
    Kagit = 2
}

export enum PaymentType {
    KREDIKARTI_BANKAKARTI = 1,
    EFT_HAVALE = 2,
    KAPIDA_ODEME = 3,
    ODEME_ARACISI = 4,
    DIGER = 5
}

export interface SendArchiveInvoiceResponse {
    Result: 'Success' | 'Failed';
    ErrorMessage?: string;
    ArchiveInvoices: ArchiveInvoiceReturn[];
}

export interface ArchiveInvoiceReturn {
    ExternalArchiveInvoiceCode: string;
    ArchiveInvoiceNumber: string;         // Sistem tarafından verilen fatura no
    Ettn: string;                         // E-Arşiv UUID
}

export interface SearchArchiveInvoiceRequest {
    CompanyTaxCode: string;
    Ettn?: string;
    MinInvoiceDate?: string;
    MaxInvoiceDate?: string;
    InvoiceResultSet: InvoiceResultSet;
}

export interface InvoiceResultSet {
    IsInvoiceDetailIncluded: boolean;
    IsXMLIncluded: boolean;
    IsPDFIncluded: boolean;
}

export interface SearchArchiveInvoiceResponse {
    Result: 'Success' | 'Failed';
    ErrorMessage?: string;
    ArchiveInvoices: ArchiveInvoice[];
}

export interface SendArchiveInvoiceMailRequest {
    CompanyTaxCode: string;
    ETTN: string;
    Email: string;
}

export interface SendArchiveInvoiceMailResponse {
    Result: 'Success' | 'Failed';
    ErrorMessage?: string;
}

export interface GetDocumentViewerLinkRequest {
    CompanyTaxCode: string;
    Ettn: string;
    InvoiceDirection: 'Giden' | 'Gelen';
    InvoiceDocumentType: 'EArchiveInvoice';
}

export interface GetDocumentViewerLinkResponse {
    Result: 'Success' | 'Failed';
    ErrorMessage?: string;
    DocumentViewerLink: string;
}
