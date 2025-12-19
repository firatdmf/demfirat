import {
  ArchiveInvoice,
  AddressBookEntry,
  Address,
  ArchiveInvoiceDetail,
  Product,
  WebSellingInfo,
  InvoiceType,
  RecipientType,
  SendingType,
  PaymentType
} from './soap-client';

interface OrderData {
  orderId: number;  // Number olarak
  orderDate: string;
  customer: {
    name: string;
    taxNumber: string;  // VKN veya TCKN
    email: string;
    phone: string;
    address: string;
    city: string;
    district?: string;
    postalCode?: string;
  };
  items: Array<{
    productCode: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    vatRate: number;     // %20 = 20
    discount?: number;
  }>;
  paymentMethod: 'card' | 'bank_transfer' | 'cash_on_delivery';
  exchangeRate?: number;
  originalCurrency?: string;
  shippingDate?: string;
}

export class InvoiceBuilder {
  /**
   * Siparişten e-Arşiv fatura objesi oluştur
   */
  static buildArchiveInvoice(orderData: OrderData): ArchiveInvoice {
    const now = new Date();
    const invoiceDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

    // Fatura detaylarını oluştur
    const invoiceDetails: ArchiveInvoiceDetail[] = orderData.items.map(item => {
      const lineTotal = item.quantity * item.unitPrice;
      const discountAmount = item.discount || 0;
      const lineAfterDiscount = lineTotal - discountAmount;
      const vatAmount = (lineAfterDiscount * item.vatRate) / 100;

      return {
        CurrencyCode: 'TRY',
        DiscountAmount: discountAmount > 0 ? this.roundToTwoDecimals(discountAmount) : undefined,
        LineExtensionAmount: this.roundToTwoDecimals(lineAfterDiscount),
        Product: {
          ExternalProductCode: item.productCode,
          MeasureUnit: 'C62',  // C62 = Adet (piece)
          ProductName: this.sanitizeText(item.productName),
          UnitPrice: item.unitPrice
        },
        Quantity: item.quantity,
        VatAmount: this.roundToTwoDecimals(vatAmount),
        VatRate: item.vatRate
      };
    });

    // Toplamları hesapla
    const totals = this.calculateTotals(invoiceDetails);

    // CRITICAL: İşNet SOAP API - SADECE değeri olan alanları gönder!
    // Boş string ('') gönderilirse NullReferenceException alınır
    // Dokümantasyon: "tagların alfabetik sıralamaya göre uygun şekilde gönderilmesi gerekmektedir"

    // Address - SADECE zorunlu ve dolu olan alanlar
    const address: Address = {
      BoulevardAveneuStreetName: this.sanitizeText(orderData.customer.address),
      // BuildingName ve BuildingNumber opsiyonel, boş gönderme
      CityCode: this.getCityCode(orderData.customer.city),
      CityName: this.sanitizeText(orderData.customer.city),
      // CountryName opsiyonel, dokümanda yok
      Email: orderData.customer.email,
      // FaxNumber opsiyonel, boş gönderme
      PostalCode: parseInt(orderData.customer.postalCode || '34000', 10),  // decimal/number olmalı
      // TaxOfficeCode ve TaxOfficeName opsiyonel
      TelephoneNumber: orderData.customer.phone,
      TownCode: this.getTownCode(orderData.customer.city, orderData.customer.district),
      TownName: orderData.customer.district ? this.sanitizeText(orderData.customer.district) : 'Merkez'
      // WebSite opsiyonel, boş gönderme
    };

    // AddressBookEntry - Alfabetik sırada (A-Z)
    const receiver: AddressBookEntry = {
      Address: address,
      ReceiverName: this.sanitizeText(orderData.customer.name),
      ReceiverTaxCode: orderData.customer.taxNumber,
      RecipientType: RecipientType.Earsiv,
      SendingType: SendingType.Elektronik
    };

    // İnternet satış bilgileri (e-Arşiv için zorunlu)
    const webSellingInfo: WebSellingInfo = {
      Carrier: {
        CarrierName: 'Kargo Sirketi'  // Gerçek kargo firması adını buraya ekleyin
      },
      PaymentDate: invoiceDate,
      PaymentType: this.mapPaymentType(orderData.paymentMethod),
      SendingDate: orderData.shippingDate || invoiceDate,
      WebAddress: 1  // Web adresi KODU (int!) - 1 = Varsayılan
    };

    // Notlar
    const notes: string[] = [];
    if (orderData.originalCurrency && orderData.originalCurrency !== 'TRY') {
      notes.push(`Orijinal para birimi: ${orderData.originalCurrency}`);
      notes.push(`Döviz kuru: ${orderData.exchangeRate || 1} ${orderData.originalCurrency}/TRY`);
    }
    notes.push('E-ticaret siparişi');

    // Fatura objesi (alfabetik sıraya dikkat!)
    const invoice: ArchiveInvoice = {
      CurrencyCode: 'TRY',
      ExternalArchiveInvoiceCode: `ORDER-${orderData.orderId}`,
      InvoiceDate: invoiceDate,
      InvoiceDetails: invoiceDetails,
      InvoiceType: InvoiceType.Satis,
      LastPaymentDate: invoiceDate,  // Son ödeme tarihi (fatura tarihi ile aynı)
      Notes: notes.length > 0 ? notes : undefined,
      OrderDate: orderData.orderDate,
      OrderNumber: orderData.orderId,  // Number olarak
      Receiver: receiver,
      SendMailAutomatically: true,  // Otomatik mail gönder
      TotalDiscountAmount: totals.discount,
      TotalLineExtensionAmount: totals.lineExtension,
      TotalPayableAmount: totals.payable,
      TotalTaxInclusiveAmount: totals.taxInclusive,
      TotalVATAmount: totals.vat,
      WebSellingInfo: webSellingInfo
    };

    return invoice;
  }

  /**
   * Fatura toplamlarını hesapla
   */
  private static calculateTotals(details: ArchiveInvoiceDetail[]) {
    let lineExtension = 0;
    let vat = 0;
    let discount = 0;

    details.forEach(detail => {
      lineExtension += detail.LineExtensionAmount;
      vat += detail.VatAmount;
      discount += detail.DiscountAmount || 0;
    });

    const taxInclusive = lineExtension + vat;
    const payable = taxInclusive;

    return {
      lineExtension: this.roundToTwoDecimals(lineExtension),
      vat: this.roundToTwoDecimals(vat),
      discount: this.roundToTwoDecimals(discount),
      taxInclusive: this.roundToTwoDecimals(taxInclusive),
      payable: this.roundToTwoDecimals(payable)
    };
  }

  /**
   * Ödeme yöntemini İşNet enum'una çevir
   */
  private static mapPaymentType(method: string): PaymentType {
    switch (method) {
      case 'card':
        return PaymentType.KREDIKARTI_BANKAKARTI;
      case 'bank_transfer':
        return PaymentType.EFT_HAVALE;
      case 'cash_on_delivery':
        return PaymentType.KAPIDA_ODEME;
      default:
        return PaymentType.DIGER;
    }
  }

  /**
   * Şehir adından il kodunu al (Türkiye plaka kodları)
   */
  private static getCityCode(cityName: string): number {
    const sanitized = this.sanitizeText(cityName).toLowerCase();
    const cityCodes: { [key: string]: number } = {
      'adana': 1, 'adiyaman': 2, 'afyon': 3, 'afyonkarahisar': 3, 'agri': 4,
      'amasya': 5, 'ankara': 6, 'antalya': 7, 'artvin': 8, 'aydin': 9,
      'balikesir': 10, 'bilecik': 11, 'bingol': 12, 'bitlis': 13, 'bolu': 14,
      'burdur': 15, 'bursa': 16, 'canakkale': 17, 'cankiri': 18, 'corum': 19,
      'denizli': 20, 'diyarbakir': 21, 'edirne': 22, 'elazig': 23, 'erzincan': 24,
      'erzurum': 25, 'eskisehir': 26, 'gaziantep': 27, 'giresun': 28, 'gumushane': 29,
      'hakkari': 30, 'hatay': 31, 'isparta': 32, 'mersin': 33, 'icel': 33,
      'istanbul': 34, 'izmir': 35, 'kars': 36, 'kastamonu': 37, 'kayseri': 38,
      'kirklareli': 39, 'kirsehir': 40, 'kocaeli': 41, 'konya': 42, 'kutahya': 43,
      'malatya': 44, 'manisa': 45, 'kahramanmaras': 46, 'mardin': 47, 'mugla': 48,
      'mus': 49, 'nevsehir': 50, 'nigde': 51, 'ordu': 52, 'rize': 53, 'sakarya': 54,
      'samsun': 55, 'siirt': 56, 'sinop': 57, 'sivas': 58, 'tekirdag': 59,
      'tokat': 60, 'trabzon': 61, 'tunceli': 62, 'sanliurfa': 63, 'usak': 64,
      'van': 65, 'yozgat': 66, 'zonguldak': 67, 'aksaray': 68, 'bayburt': 69,
      'karaman': 70, 'kirikkale': 71, 'batman': 72, 'sirnak': 73, 'bartin': 74,
      'ardahan': 75, 'igdir': 76, 'yalova': 77, 'karabuk': 78, 'kilis': 79,
      'osmaniye': 80, 'duzce': 81
    };
    return cityCodes[sanitized] || 34; // Varsayılan: İstanbul
  }

  /**
   * İlçe kodunu al (basitleştirilmiş - merkez için 1)
   */
  private static getTownCode(cityName: string, districtName?: string): number {
    // Basitleştirilmiş: Merkez ilçe için 1 döndür
    // Gerçek uygulamada, tam ilçe kodu listesi gerekir
    // İşNet'in ilçe kodu listesi PDF'de olabilir
    if (!districtName || districtName.toLowerCase().includes('merkez')) {
      return 1;
    }
    // Varsayılan merkez
    return 1;
  }

  /**
   * Türkçe karakterleri temizle (GİB uyumluluğu için)
   */
  private static sanitizeText(text: string): string {
    return text
      .replace(/ı/g, 'i')
      .replace(/İ/g, 'I')
      .replace(/ğ/g, 'g')
      .replace(/Ğ/g, 'G')
      .replace(/ü/g, 'u')
      .replace(/Ü/g, 'U')
      .replace(/ş/g, 's')
      .replace(/Ş/g, 'S')
      .replace(/ö/g, 'o')
      .replace(/Ö/g, 'O')
      .replace(/ç/g, 'c')
      .replace(/Ç/g, 'C')
      .trim();
  }

  /**
   * İki ondalık basamağa yuvarla
   */
  private static roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100;
  }

  /**
   * TC Kimlik numarası geçerli mi kontrol et
   */
  static isValidTCKN(tckn: string): boolean {
    if (!/^\d{11}$/.test(tckn)) return false;

    const digits = tckn.split('').map(Number);
    if (digits[0] === 0) return false;

    const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
    const evenSum = digits[1] + digits[3] + digits[5] + digits[7];

    const digit10 = (oddSum * 7 - evenSum) % 10;
    if (digit10 !== digits[9]) return false;

    const digit11 = (oddSum + evenSum + digits[9]) % 10;
    if (digit11 !== digits[10]) return false;

    return true;
  }

  /**
   * VKN (Vergi Kimlik Numarası) geçerli mi kontrol et
   */
  static isValidVKN(vkn: string): boolean {
    if (!/^\d{10}$/.test(vkn)) return false;

    const digits = vkn.split('').map(Number);
    let sum = 0;

    for (let i = 0; i < 9; i++) {
      let temp = (digits[i] + (9 - i)) % 10;
      sum += (temp * Math.pow(2, 9 - i)) % 9;
      if (temp !== 0 && (temp * Math.pow(2, 9 - i)) % 9 === 0) sum += 9;
    }

    const lastDigit = sum % 10 === 0 ? 0 : 10 - (sum % 10);
    return lastDigit === digits[9];
  }
}
