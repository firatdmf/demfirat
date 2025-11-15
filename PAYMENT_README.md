# 💳 Ödeme Sistemi - Hızlı Başlangıç

## ✅ Tamamlanan İşler

### 1. iyzico Entegrasyonu
- ✅ `iyzipay` paketi kuruldu
- ✅ `/api/payment/iyzico` endpoint'i oluşturuldu (3D Secure başlatma)
- ✅ `/api/payment/verify` endpoint'i oluşturuldu (ödeme doğrulama)
- ✅ Checkout formu güncellendi (kart bilgileri + validasyon)
- ✅ Payment callback sayfası hazır
- ✅ Order confirmation sayfası oluşturuldu

### 2. Checkout Formu
- ✅ Kart üzerindeki isim input (otomatik büyük harf)
- ✅ Kart numarası input (otomatik formatlanma: 4-4-4-4)
- ✅ Son kullanma tarihi input (otomatik format: MM/YY)
- ✅ CVV input (sadece rakam)
- ✅ Tüm alanlar için validasyon
- ✅ Adres seçimi entegrasyonu

### 3. Ödeme Akışı
```
Checkout Formu
    ↓
Kart Bilgileri Girişi
    ↓
"Siparişi Tamamla" Butonu
    ↓
/api/payment/iyzico (POST)
    ↓
3D Secure Popup Açılır
    ↓
Banka Doğrulaması
    ↓
/payment/callback (iyzico redirect)
    ↓
/api/payment/verify (POST)
    ↓
Başarılı ise → /order/confirmation
Başarısız ise → Error message + Checkout'a dön
```

## 🚀 Test Etmek İçin

### Adım 1: iyzico Hesabı Oluştur
```bash
1. https://merchant.iyzipay.com/ adresine git
2. Kayıt ol (şirket bilgileri gerekli)
3. Ayarlar > API Anahtarları'ndan Sandbox keys'i al
```

### Adım 2: .env Dosyasını Güncelle
```bash
# .env dosyasında bu satırları bul ve güncelle:
IYZICO_API_KEY=sandbox-your-api-key-here
IYZICO_SECRET_KEY=sandbox-your-secret-key-here
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com
```

### Adım 3: Sunucuyu Yeniden Başlat
```bash
# Terminalde:
npm run dev
```

### Adım 4: Test Yap
```bash
# Test kartı bilgileri:
Kart No: 5528 7900 0000 0008
Tarih: 12/30
CVV: 123
İsim: TEST KULLANICI
3D Secure: Herhangi bir şifre (örn: 123456)
```

## 📁 Oluşturulan Dosyalar

```
demfirat/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx ✅ (Güncellendi - kart formu eklendi)
│   │   │   ├── payment/
│   │   │   │   └── callback/
│   │   │   │       └── page.tsx ✅ (Yeni - 3D Secure callback)
│   │   │   └── order/
│   │   │       └── confirmation/
│   │   │           └── page.tsx ✅ (Yeni - sipariş onay)
│   │   └── api/
│   │       └── payment/
│   │           ├── iyzico/
│   │           │   └── route.ts ✅ (Yeni - ödeme başlatma)
│   │           └── verify/
│   │               └── route.ts ✅ (Yeni - ödeme doğrulama)
├── .env ✅ (Güncellendi - iyzico credentials eklendi)
├── IYZICO_SETUP.md ✅ (Yeni - detaylı kurulum dokümantasyonu)
├── PAYMENT_TEST.md ✅ (Yeni - adım adım test rehberi)
└── PAYMENT_README.md ✅ (Bu dosya - hızlı başlangıç)
```

## 🔐 Güvenlik

- ✅ Kart bilgileri asla sunucuda saklanmaz
- ✅ PCI-DSS Level 1 sertifikalı (iyzico)
- ✅ 3D Secure zorunlu (güvenli ödeme)
- ✅ HTTPS zorunlu (production'da)
- ✅ API keys environment variables'da

## 🌍 Desteklenen Özellikler

- ✅ Türkiye kartları (Visa, Mastercard, Troy, Amex)
- ✅ Yurtdışı kartları (Visa, Mastercard, Amex)
- ✅ 3D Secure doğrulama
- ✅ Çoklu para birimi (TRY, USD, EUR, GBP)
- ✅ Kredi kartı ve banka kartı
- ✅ Taksit desteği (ayarlanabilir)

## ⚠️ Önemli Notlar

1. **Sandbox Test**: Gerçek para çekilmez, sadece test
2. **Production**: SSL sertifikası zorunlu
3. **Kimlik No**: Test için `11111111111` kullanılıyor
4. **Sipariş Kayıt**: Ödeme başarılıysa Django backend'e kayıt yapılmalı (TODO)

## 📚 Daha Fazla Bilgi

- **Detaylı Kurulum**: `IYZICO_SETUP.md` dosyasını oku
- **Test Rehberi**: `PAYMENT_TEST.md` dosyasını oku
- **iyzico Docs**: https://dev.iyzipay.com/

## 🎯 Sıradaki Adımlar

1. ✅ iyzico hesabı oluştur
2. ✅ API keys'i .env'e ekle
3. ✅ Test et (PAYMENT_TEST.md'yi takip et)
4. ⏳ Django backend'e sipariş kayıt endpoint'i ekle
5. ⏳ Ödeme başarılıysa siparişi kaydet
6. ⏳ Production'a geç (SSL + Production keys)

## 🆘 Sorun mu Yaşıyorsun?

### Hızlı Kontrol Listesi:
- [ ] iyzico hesabı var mı?
- [ ] .env dosyasında API keys doğru mu?
- [ ] Sunucu yeniden başlatıldı mı?
- [ ] Popup engelleyici kapalı mı?
- [ ] Console'da hata var mı? (F12)
- [ ] Network sekmesinde istekler başarılı mı?

### Yaygın Hatalar:
- **"Payment initialization failed"** → API keys'i kontrol et
- **"Popup blocked"** → Tarayıcı ayarlarından popup'lara izin ver
- **"3D Secure failed"** → Console'da `mdStatus` parametresini kontrol et

---

**Hazır!** 🎉 Test edebilirsin. `PAYMENT_TEST.md` dosyasını adım adım takip et.
