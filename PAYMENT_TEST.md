# 🧪 İyzico Ödeme Test Rehberi

## ✅ Hazırlık (Yapılması Gerekenler)

### 1. iyzico Hesabı Oluştur
1. https://merchant.iyzipay.com/ adresine git
2. **"Üye Ol"** butonuna tıkla
3. Gerekli bilgileri doldur (şirket bilgileri gerekli)
4. E-posta doğrulaması yap
5. Merchant paneline giriş yap

### 2. API Anahtarlarını Al
1. Merchant panelde **Ayarlar > API Anahtarları** bölümüne git
2. **Sandbox (Test)** API Key ve Secret Key'i kopyala
3. `.env` dosyasını güncelle:

```bash
# Test API keys (iyzico Merchant Panel'den al)
IYZICO_API_KEY=sandbox-xxxxxxxxxxx
IYZICO_SECRET_KEY=sandbox-xxxxxxxxxxx
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

### 3. Sunucuyu Yeniden Başlat
`.env` değişikliği yaptıktan sonra:
```bash
npm run dev
```

## 🎯 Test Senaryosu

### Adım 1: Giriş Yap ve Sepete Ürün Ekle
1. http://localhost:3000 adresine git
2. Sağ üstten **Login** tıkla
3. Giriş yap veya kayıt ol
4. **Products** veya **Curtains/Fabrics** sayfasına git
5. Birkaç ürün sepete ekle

### Adım 2: Checkout Sayfasına Git
1. Header'da **Cart** ikonuna tıkla
2. Sepetinde ürünler olduğunu doğrula
3. **"Alışverişi Tamamla"** butonuna tıkla
4. Checkout sayfasına yönlendirileceksin

### Adım 3: Adresleri Seç
1. **Teslimat Adresi** seç (varsa) veya yeni adres ekle
2. **Fatura Adresi** için:
   - "Teslimat adresi ile aynı" işaretle
   - VEYA farklı bir adres seç

### Adım 4: Kart Bilgilerini Gir

**Test Kartı (Başarılı Ödeme):**
```
Kart Üzerindeki İsim: TEST KULLANICI
Kart Numarası: 5528 7900 0000 0008
Son Kullanma: 12/30
CVV: 123
```

> **NOT:** Kart numarasını yazarken otomatik olarak formatlanacak (4'er 4'er)

### Adım 5: Siparişi Tamamla
1. **"Siparişi Tamamla"** butonuna tıkla
2. Popup engelleyici aktifse izin ver
3. Yeni bir pencere açılacak (iyzico 3D Secure sayfası)

### Adım 6: 3D Secure Doğrulama
1. 3D Secure sayfası açılacak
2. **Sandbox ortamında**: Her hangi bir değer gir (örn: `123456`)
3. **Production'da**: Bankanın gönderdiği SMS kodunu gir
4. **"Doğrula"** veya **"Onayla"** butonuna tıkla

### Adım 7: Sonuç
- ✅ **Başarılı**: Callback sayfasına yönlendirileceksin
  - Yeşil tik ikonu görünecek
  - "Ödeme Başarılı!" mesajı
  - 2 saniye sonra otomatik olarak **Order Confirmation** sayfasına yönleneceksin
  
- ❌ **Başarısız**: Hata mesajı görünecek
  - Kırmızı X ikonu
  - Hata açıklaması
  - "Geri Dön" butonu ile checkout'a dönebilirsin

### Adım 8: Sipariş Onay Sayfası
- Yeşil onay ikonu görünecek
- "Sipariş Onaylandı!" mesajı
- "Alışverişe Devam Et" butonu ile ürünlere dönebilirsin

## 🔍 Test Kartları

### ✅ Başarılı Ödeme
```
Kart No: 5528790000000008
Tarih: 12/30
CVV: 123
3D Şifre: Herhangi bir değer
```

### ❌ Başarısız Ödeme (Yetersiz Bakiye)
```
Kart No: 5406670000000009
Tarih: 12/30
CVV: 123
```

### ❌ 3D Secure Hatası
```
Kart No: 5528790000000008
Tarih: 12/30
CVV: 123
3D Şifre: Boş bırak veya "cancel" yaz
```

## 🐛 Hata Ayıklama

### Console Logları
Tarayıcı console'unu aç (F12) ve şunları kontrol et:
```javascript
// Checkout sayfasında
console.log('Payment data:', paymentData);

// Callback sayfasında
console.log('Callback params:', { mdStatus, status, paymentId });

// Verification'da
console.log('Verification result:', data);
```

### Network Sekmesi
1. F12 > Network sekmesi
2. **Checkout'ta**: `/api/payment/iyzico` isteğini kontrol et
3. **Callback'te**: `/api/payment/verify` isteğini kontrol et

### Yaygın Hatalar

**1. "Popup engelleyici kapalı olmalı"**
- Tarayıcı ayarlarından popup'lara izin ver
- Veya 3D Secure'u aynı sekmede göster (kod değişikliği gerekli)

**2. "Payment initialization failed"**
- `.env` dosyasında API key'leri kontrol et
- Sunucuyu yeniden başlat
- Console'da detaylı hata mesajını oku

**3. "3D Secure verification failed"**
- `mdStatus` parametresini kontrol et (console'da)
- iyzico sandbox'ta 3D Secure her zaman başarılı olmalı

**4. "Payment verification failed"**
- `paymentId` parametresinin geldiğini kontrol et
- `/api/payment/verify` endpoint'inin çalıştığını kontrol et

## 📊 Test Checklist

- [ ] iyzico hesabı oluşturuldu
- [ ] API keys `.env` dosyasına eklendi
- [ ] Sunucu yeniden başlatıldı
- [ ] Kullanıcı girişi yapıldı
- [ ] Sepete ürün eklendi
- [ ] Checkout sayfası açıldı
- [ ] Adresler seçildi/eklendi
- [ ] Kart bilgileri girildi (format kontrolü)
- [ ] Sipariş tamamlandı
- [ ] 3D Secure sayfası açıldı
- [ ] 3D Secure doğrulama yapıldı
- [ ] Callback sayfası çalıştı
- [ ] Payment verification başarılı
- [ ] Order confirmation sayfası göründü
- [ ] Sepet temizlendi

## 🚀 Canlıya Geçiş

Test başarılı olduktan sonra:

1. **Production API Keys Al**
   - iyzico merchant panelde production keys'i etkinleştir
   - `.env` dosyasını güncelle:
   ```bash
   IYZICO_API_KEY=production-key-buraya
   IYZICO_SECRET_KEY=production-secret-buraya
   IYZICO_BASE_URL=https://api.iyzipay.com
   ```

2. **HTTPS Zorunlu**
   - Production'da HTTPS olmadan ödeme alınamaz
   - SSL sertifikası kur

3. **Gerçek Kimlik Numarası**
   - Test kimlik `11111111111` yerine gerçek TC kimlik no kullan
   - Veya yabancı müşteriler için passport numarası

4. **İzinler**
   - iyzico'dan production iznini al
   - Gerekli belgeleri tamamla

## 💡 İpuçları

- **Test Sırasında**: Her adımı console'da logla
- **Hata Durumunda**: Network sekmesindeki request/response'ları kontrol et
- **3D Secure**: Sandbox'ta gerçek banka sayfası açılmaz, test sayfası açılır
- **Başarılı Ödeme**: Merchant panelde işlemleri görebilirsin

## 📞 Destek

- **iyzico Dokümantasyon**: https://dev.iyzipay.com/
- **Test Kartları**: https://dev.iyzipay.com/tr/test-kartlari
- **iyzico Destek**: destek@iyzico.com
- **Merchant Panel**: https://merchant.iyzipay.com/
