import soap from 'soap';

// İşNet SOAP servis URL'leri
const ISNET_URLS = {
    test: {
        invoice: 'http://einvoiceservicetest.isnet.net.tr/InvoiceService/ServiceContract/InvoiceService.svc?wsdl',
        addressBook: 'http://einvoiceservicetest.isnet.net.tr/AddressBookService/ServiceContract/AddressBookService.svc?wsdl'
    },
    production: {
        invoice: 'https://einvoiceservice.isnet.net.tr/InvoiceService/ServiceContract/InvoiceService.svc?wsdl',
        addressBook: 'https://einvoiceservice.isnet.net.tr/AddressBookService/ServiceContract/AddressBookService.svc?wsdl'
    }
};

export class IsNetSoapClient {
    private invoiceClient: any = null;
    private addressBookClient: any = null;
    private isProduction: boolean;

    constructor(isProduction: boolean = false) {
        this.isProduction = isProduction;
    }

    /**
     * Fatura servisi client'ını başlat
     */
    private async getInvoiceClient() {
        if (this.invoiceClient) return this.invoiceClient;

        const url = this.isProduction
            ? ISNET_URLS.production.invoice
            : ISNET_URLS.test.invoice;

        try {
            this.invoiceClient = await soap.createClientAsync(url, {
                endpoint: url.replace('?wsdl', '')
            });
            return this.invoiceClient;
        } catch (error) {
            console.error('SOAP client oluşturma hatası:', error);
            throw new Error('İşNet servisine bağlanılamadı');
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

            // Her fatura için InvoiceDetails'ı da sarmala
            const wrappedInvoices = request.ArchiveInvoices.map(invoice => ({
                ...invoice,
                // InvoiceDetails array'ini ArchiveInvoiceDetail wrapper ile sarmala
                InvoiceDetails: {
                    ArchiveInvoiceDetail: invoice.InvoiceDetails
                },
                // Notes array'ini string wrapper ile sarmala (eğer varsa)
                Notes: invoice.Notes ? { string: invoice.Notes } : undefined
            }));

            const wrappedRequest = {
                CompanyTaxCode: request.CompanyTaxCode,
                CompanyVendorNumber: request.CompanyVendorNumber,
                ArchiveInvoices: {
                    ArchiveInvoice: wrappedInvoices
                }
            };

            // SOAP request XML'ini logla
            console.log('===== SOAP REQUEST (WRAPPED) =====');
            console.log(JSON.stringify(wrappedRequest, null, 2));

            // Son request'i XML olarak görmek için
            client.on('request', (xml: string) => {
                console.log('===== SOAP XML =====');
                console.log(xml);
            });

            // Doğrudan wrappedRequest'i gönder
            const [result] = await client.SendArchiveInvoiceAsync(wrappedRequest);

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
    InvoiceDetails: ArchiveInvoiceDetail[];
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
    PostalCode?: string;                  // Posta kodu
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
