# 📄 İŞNET E-ARŞİV ENTEGRASYONU - KURULUM REHBERİ

## 🎯 **ÖZET**

Bu proje **İşNet (NetTe Fatura)** e-Arşiv sistemi ile entegre edilmiştir. Sipariş tamamlandığında otomatik olarak e-Arşiv faturası oluşturulur ve müşteriye email ile gönderilir.

---

## 📦 **KURULUM ADIMLARI**

### **1. SOAP Kütüphanesini Kur**

```bash
npm install soap
npm install --save-dev @types/soap
```

### **2. Environment Variables Ekle**

`.env` dosyasına aşağıdaki satırları ekleyin:

```env
# İşNet E-Arşiv Entegrasyonu
ISNET_COMPANY_VKN=4810173324              # Firmanızın VKN (10 haneli)
ISNET_ENVIRONMENT=test                     # test veya production
```

**ÖNEMLİ NOTLAR:**
- ✅ **Test ortamında** IP doğrulaması YOK, direkt çalışır
- ✅ **Production'a geçmeden önce** IP adresinizi `efaturadestek@nettefatura.com.tr` adresine bildirin
- ✅ IP-VKN tabanlı kimlik doğrulama (kullanıcı adı/şifre yok)

---

## 🧪 **TEST ORTAMI**

### **Test Bilgileri:**

```
Test Portal: http://efatura.isnet.net.tr
Kullanıcı: 12345678901
Şifre: 1234

Test Firma VKN: 4810173324 veya 1234567805
```

### **Test Adımları:**

1. **Sipariş Oluştur:**
   - Checkout sayfasından normal sipariş süreci
   - Ödeme başarılı olunca otomatik fatura oluşturulur

2. **Faturayı Kontrol Et:**
   - İşNet test portalına giriş yap: http://efatura.isnet.net.tr
   - "E-Arşiv Faturalar" menüsünden faturayı görüntüle
   - ETTN numarasını kontrol et

3. **Console Log Kontrol:**
   ```
   ===== E-ARŞİV FATURA OLUŞTURMA =====
   Fatura objesi oluşturuldu: {...}
   ===== FATURA BAŞARIYLA OLUŞTURULDU =====
   Fatura No: FRT2025000001
   ETTN: 12345678-1234-1234-1234-123456789012
   ```

---

## 🔄 **SİSTEM AKIŞI**

```
1. Müşteri ödeme yapar (iyzico)
   ↓
2. /api/orders/create endpoint'i sipariş kaydı oluşturur
   ↓
3. /api/invoice/create endpoint'i e-Arşiv faturası oluşturur
   ↓
4. İşNet SOAP servisine fatura gönderilir
   ↓
5. ETTN + Fatura No döner
   ↓
6. Django backend'e fatura bilgisi kaydedilir
   ↓
7. Müşteriye otomatik email gönderilir (İşNet tarafından)
```

---

## 📁 **OLUŞTURULAN DOSYALAR**

```
src/
├── lib/
│   └── isnet/
│       ├── soap-client.ts          ✅ SOAP client (İşNet servisleri)
│       └── invoice-builder.ts      ✅ Fatura objesi oluşturucu
├── app/
│   └── api/
│       └── invoice/
│           ├── create/
│           │   └── route.ts        ✅ E-Arşiv oluşturma
│           └── download/
│               └── [ettn]/
│                   └── route.ts    ✅ PDF indirme
```

---

## 🔧 **API ENDPOINT'LERİ**

### **1. Fatura Oluştur**

```typescript
POST /api/invoice/create

Body: {
  orderId: string,
  orderData: {
    firstName: string,
    lastName: string,
    taxNumber: string,      // TCKN veya VKN
    email: string,
    phone: string,
    deliveryAddress: {
      address: string,
      city: string,
      district?: string
    },
    items: [{
      product_sku: string,
      name: string,
      quantity: number,
      price: number          // TRY cinsinden
    }],
    paymentMethod: 'card' | 'bank_transfer',
    exchangeRate?: number,
    originalCurrency?: string
  }
}

Response: {
  success: true,
  invoice: {
    invoiceNumber: string,  // Fatura No
    ettn: string,           // E-Arşiv UUID
    invoiceDate: string     // YYYY-MM-DD
  }
}
```

### **2. Fatura PDF İndir**

```typescript
GET /api/invoice/download/[ettn]

Response: PDF file (application/pdf)
```

---

## 💳 **FATURA BİLGİLERİ**

### **Zorunlu Alanlar:**
- ✅ Müşteri VKN veya TCKN
- ✅ Müşteri adı/soyadı
- ✅ Müşteri email
- ✅ Teslimat adresi (şehir, adres)
- ✅ Ürün bilgileri (SKU, ad, adet, fiyat)
- ✅ KDV oranı (Türkiye için %20 standart)
- ✅ İnternet satış bilgileri (e-Arşiv için zorunlu)

### **Otomatik Doldurulan Alanlar:**
- ✅ Fatura tarihi (sipariş tarihi)
- ✅ Fatura numarası (İşNet tarafından atanır)
- ✅ ETTN (benzersiz UUID)
- ✅ Toplam tutarlar (KDV dahil/hariç)

---

## 🚀 **CANLI ORTAMA GEÇİŞ**

### **Adım 1: IP Adresi Bildirimi**

Email gönder: `efaturadestek@nettefatura.com.tr`

```
Konu: Canlı Ortam IP Tanımlaması

Merhaba,

Test ortamında başarılı e-Arşiv faturalar oluşturduk.
Canlı ortama geçiş için IP adresimizi bildiriyoruz:

Firma VKN: [FIRMANIZIN_VKN]
IP Adresi: [SERVER_IP_ADRESI]
Test Fatura ETTN: [BASARILI_TEST_ETTN]

Saygılarımızla,
[Firma Adı]
```

### **Adım 2: Production URL Güncelleme**

`.env` dosyasını güncelle:

```env
ISNET_ENVIRONMENT=production
```

Kod otomatik olarak production URL'i kullanacak:
```
https://einvoiceservice.isnet.net.tr/InvoiceService/ServiceContract/InvoiceService.svc
```

### **Adım 3: Test Et**

1. Gerçek bir sipariş oluştur
2. Faturanın oluştuğunu doğrula
3. İşNet production portalından kontrol et
4. Müşteri email'ini kontrol et

---

## 📧 **OTOMATIK EMAIL GÖNDERİMİ**

E-Arşiv faturası oluşturulduğunda **İşNet otomatik olarak** müşteriye email gönderir:

**Email İçeriği:**
- ✅ Fatura PDF eki
- ✅ ETTN numarası
- ✅ Fatura no ve tarihi
- ✅ İndirme linki

**Ayar:**
```typescript
SendMailAutomatically: true  // invoice-builder.ts içinde
```

---

## 🔍 **HATA AYIKLAMA**

### **1. SOAP Client Hatası**

```
Hata: İşNet servisine bağlanılamadı
Çözüm: İnternet bağlantısını kontrol et, URL'leri doğrula
```

### **2. Fatura Oluşturulamadı**

```
Hata: Result: Failed, ErrorMessage: "..."
Çözüm: 
- Console log'u kontrol et
- Zorunlu alanları kontrol et (email, VKN, adres)
- İşNet test portalından hatayı kontrol et
```

### **3. IP Engellendi (Production)**

```
Hata: Unauthorized / IP not allowed
Çözüm: 
- IP adresini İşNet'e bildirdin mi?
- Doğru IP'yi mi bildirdin? (sunucu IP'si)
```

### **4. ETTN Bulunamadı**

```
Hata: ETTN not found
Çözüm:
- ETTN'nin doğru yazıldığını kontrol et
- Faturanın başarıyla oluştuğunu kontrol et
- 5-10 dakika bekle (bazen gecikmeli indeksleme olur)
```

---

## 📊 **DJANGO BACKEND GÜNCELLEMESİ**

### **Yeni Endpoint Gerekli:**

```python
# /operating/orders/update_invoice/

@api_view(['POST'])
def update_invoice(request):
    order_id = request.data.get('order_id')
    invoice_number = request.data.get('invoice_number')
    ettn = request.data.get('ettn')
    invoice_date = request.data.get('invoice_date')
    
    order = Order.objects.get(id=order_id)
    order.invoice_number = invoice_number
    order.invoice_ettn = ettn
    order.invoice_date = invoice_date
    order.invoice_type = 'e-arsiv'
    order.invoice_provider = 'isnet'
    order.save()
    
    return Response({'success': True})
```

### **Model Alanları Ekle:**

```python
class Order(models.Model):
    # Mevcut alanlar...
    
    invoice_number = models.CharField(max_length=50, null=True, blank=True)
    invoice_ettn = models.CharField(max_length=36, null=True, blank=True)  # UUID
    invoice_date = models.DateField(null=True, blank=True)
    invoice_type = models.CharField(max_length=20, default='e-arsiv')
    invoice_provider = models.CharField(max_length=20, default='isnet')
```

---

## ✅ **TEST CHECKLIST**

- [ ] `npm install soap` çalıştırıldı
- [ ] `.env` dosyasına `ISNET_COMPANY_VKN` eklendi
- [ ] Test ortamında sipariş oluşturuldu
- [ ] Console log'da ETTN göründü
- [ ] İşNet test portalında fatura görüntülendi
- [ ] PDF indirme çalışıyor (`/api/invoice/download/[ettn]`)
- [ ] Django backend'e fatura bilgisi kaydedildi
- [ ] Müşteriye email gitti (SendMailAutomatically: true)

---

## 🎉 **SONUÇ**

Sisteminiz artık otomatik e-Arşiv fatura oluşturabilir! 

**Sıradaki Adımlar:**
1. ✅ Test ortamında 5-10 başarılı fatura oluştur
2. ✅ İşNet'e IP adresi bildir
3. ✅ Production'a geç
4. ✅ Gerçek müşterilerle test et

**Destek:**
- İşNet Destek: efaturadestek@nettefatura.com.tr
- Dokümantasyon: `/WebServis/IsNet-EArşiv-WebServiceArayuzDokumani-*.pdf`

---

**Başarılar!** 🚀
