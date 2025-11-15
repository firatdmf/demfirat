# iyzico Ödeme Entegrasyonu

## 📋 Kurulum Adımları

### 1. iyzico Hesabı Oluşturma
1. https://merchant.iyzipay.com/ adresinden kayıt olun
2. Merchant paneline giriş yapın
3. **Ayarlar > API Anahtarları** bölümünden API Key ve Secret Key'i alın

### 2. Environment Variables
`.env.local` dosyasına aşağıdaki bilgileri ekleyin:

```bash
# Test (Sandbox) için:
IYZICO_API_KEY=sandbox-api-key-buraya
IYZICO_SECRET_KEY=sandbox-secret-key-buraya
IYZICO_BASE_URL=https://sandbox-api.iyzipay.com

# Canlıya geçince:
# IYZICO_API_KEY=production-api-key
# IYZICO_SECRET_KEY=production-secret-key
# IYZICO_BASE_URL=https://api.iyzipay.com

# Site URL'i
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Test Kartları (Sandbox)
iyzico test ortamında kullanabileceğiniz kartlar:

**Başarılı Ödeme:**
- Kart No: `5528790000000008`
- Son Kullanma: `12/30`
- CVV: `123`
- Kart Üzerindeki İsim: İstediğiniz ismi yazabilirsiniz
- 3D Secure Şifre: Banka sayfasında **her hangi bir değer** girin (sandbox'ta gerçek doğrulama yok)

**Başarısız Ödeme:**
- Kart No: `5406670000000009`
- Son Kullanma: `12/30`
- CVV: `123`

**NOT:** Henüz iyzico hesabı oluşturmadan test edemezsiniz. Önce aşağıdaki adımları tamamlayın.

## 🔒 Güvenlik Özellikleri

✅ **PCI-DSS Compliance**: iyzico PCI-DSS Level 1 sertifikalıdır
✅ **3D Secure**: Tüm ödemeler 3D Secure ile güvenli
✅ **Kart Bilgileri**: Asla sizin sunucunuzda saklanmaz
✅ **HTTPS**: Production'da HTTPS zorunludur
✅ **Tokenization**: Kartlar güvenli token'lara çevrilir

## 💳 Desteklenen Kartlar

- 🇹🇷 Türkiye: Visa, Mastercard, American Express, Troy
- 🌍 Yurtdışı: Visa, Mastercard, American Express
- Hem kredi hem de banka kartları

## 📱 Ödeme Akışı

1. Kullanıcı checkout sayfasında kart bilgilerini girer
2. "Siparişi Tamamla" butonuna tıklar
3. Bilgiler `/api/payment/iyzico` endpoint'ine gönderilir
4. iyzico 3D Secure sayfasına yönlendirme yapar
5. Kullanıcı bankasının şifresini girer
6. `/payment/callback` sayfasına dönüş yapılır
7. Ödeme doğrulanır ve sipariş oluşturulur

## 🔌 Checkout Entegrasyonu

Checkout sayfasında `handleCompleteOrder` fonksiyonunu güncelleyin:

\`\`\`typescript
const handleCompleteOrder = async () => {
  // Validation...
  
  const paymentData = {
    // Kart bilgileri
    cardHolderName: cardHolderName,
    cardNumber: cardNumber,
    expireMonth: expMonth,
    expireYear: expYear,
    cvc: cvv,
    
    // Sipariş bilgileri
    price: calculateSubtotal(),
    currency: 'TRY', // veya 'USD', 'EUR'
    basketId: `basket-${Date.now()}`,
    
    // Kullanıcı bilgileri
    buyerEmail: session?.user?.email,
    buyerPhone: userPhone,
    buyerName: firstName,
    buyerSurname: lastName,
    buyerId: userId,
    buyerIp: await fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => d.ip),
    
    // Adres bilgileri
    deliveryAddress: selectedDeliveryAddress.address,
    deliveryCity: selectedDeliveryAddress.city,
    deliveryCountry: selectedDeliveryAddress.country,
    deliveryContactName: cardHolderName,
    
    billingAddress: selectedBillingAddress.address,
    billingCity: selectedBillingAddress.city,
    billingCountry: selectedBillingAddress.country,
    billingContactName: cardHolderName,
    
    // Sepet ürünleri
    basketItems: cartItems.map(item => ({
      id: item.id,
      name: item.product?.title,
      category1: item.product_category,
      itemType: 'PHYSICAL',
      price: item.product?.price
    })),
    
    callbackUrl: \`\${window.location.origin}/\${locale}/payment/callback\`
  };
  
  const response = await fetch('/api/payment/iyzico', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(paymentData)
  });
  
  const result = await response.json();
  
  if (result.success && result.threeDSHtmlContent) {
    // 3D Secure sayfasını modal veya yeni sekmede göster
    const threeDSWindow = window.open('', '_blank');
    threeDSWindow?.document.write(result.threeDSHtmlContent);
  }
};
\`\`\`

## ⚠️ Önemli Notlar

1. **Sandbox Test**: Canlıya geçmeden önce mutlaka sandbox'ta test edin
2. **SSL Zorunlu**: Production'da HTTPS olmazsa ödeme alınamaz
3. **TC Kimlik**: Test için `11111111111` kullanabilirsiniz
4. **IP Adresi**: Kullanıcının gerçek IP'sini gönderin
5. **Para Birimi**: TRY, USD, EUR, GBP desteklenir
6. **Taksit**: `enabledInstallments` array'ini değiştirerek taksit seçenekleri eklenebilir

## 📞 Destek

- iyzico Dokümantasyon: https://dev.iyzipay.com/
- Merchant Panel: https://merchant.iyzipay.com/
- Destek: destek@iyzico.com

## ✅ Production Checklist

- [ ] HTTPS aktif
- [ ] Production API keys .env'de
- [ ] Test ödemeleri başarılı
- [ ] 3D Secure akışı çalışıyor
- [ ] Callback URL doğru
- [ ] Gerçek IP adresleri kullanılıyor
- [ ] Error handling tamamlandı
- [ ] Sipariş kaydetme mekanizması hazır
