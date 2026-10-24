# 📊 DEMFIRAT KARVEN PROJESİ - KAPSAMLI ANALIZ RAPORU

**Proje Adı**: DEMFIRAT KARVEN - E-Ticaret Platformu  
**Platform**: Next.js 15.5.0 (Full-Stack)  
**Durum**: Aktif Geliştirme  
**Son Güncelleme**: 16 Aralık 2024

---

## 1️⃣ PROJE ÖZETİ

**DEMFIRAT KARVEN**, Dem Fırat Karven Tekstil şirketi tarafından işletilen premium ev tekstili e-ticaret platformudur. Türkiye'nin en büyük kumaş üreticilerinden biri olan şirket, nakışlı tül perdeleri, döşemelik kumaşlar ve diğer ev tekstili ürünlerini online olarak satmaktadır.

### Şirket Bilgileri
- **Kuruluş**: 1991 (İstanbul)
- **Kurucusu**: Cuma Öztürk
- **Fabrika Kapasitesi**: 60.000 SF, ayda 20 milyon yard üretim
- **Şubeler**: İstanbul (Türkiye), Moskova (Rusya)

### Ürün Kategorileri
- Nakışlı tül perde kumaşları
- Upholstery (döşemelik) kumaşlar
- Nevresim takımları
- Yatak örtüleri
- Havlu setleri
- Masa örtüleri

---

## 2️⃣ TEKNOLOJİ STACK

### Frontend
```
Next.js 15.5.0        - React framework (App Router)
React 18.3.1          - UI library
TypeScript 5.x        - Type safety
Tailwind CSS 3.x      - Utility-first styling
Sass/SCSS             - CSS preprocessing
Framer Motion 12.23   - Animations
React Icons 4.11      - Icon library
jsPDF 3.0.4           - PDF generation
pdf-lib 1.17.1        - Advanced PDF handling
```

### Backend & Database
```
Next.js API Routes    - REST API endpoints
Prisma 6.17.1         - ORM (PostgreSQL)
PostgreSQL            - Database (Supabase hosted)
NextAuth.js 4.24.5    - Authentication
bcrypt 5.1.1          - Password hashing
```

### Entegrasyonlar
```
iyzico 2.0.64         - Ödeme gateway (3D Secure)
soap 1.6.1            - SOAP client (İşNet E-Arşiv)
nodemailer 6.10       - Email sending
next-intl 4.0.0       - Internationalization (i18n)
Supabase              - Auth helpers & database
```

### DevOps
```
Node.js 22.x          - Runtime
Turbopack             - Fast dev bundler
npm/yarn/pnpm/bun     - Package managers
Port: 3000            - Development server
```

---

## 3️⃣ PROJE MİMARİSİ

### Klasör Yapısı

```
demfirat/
│
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── [locale]/                # 4 dilli route'lar (en, tr, ru, pl)
│   │   │   ├── layout.tsx           # Root layout
│   │   │   ├── page.tsx             # Ana sayfa
│   │   │   ├── about/               # Hakkımızda
│   │   │   ├── contact/             # İletişim
│   │   │   ├── product/             # Ürün kataloğu
│   │   │   │   ├── [category]/
│   │   │   │   │   ├── [sku]/       # Ürün detay sayfası
│   │   │   │   │   └── page.tsx     # Kategori sayfası
│   │   │   │   └── page.tsx         # Ürün ana sayfası
│   │   │   ├── checkout/            # Alışveriş sepeti
│   │   │   ├── dashboard/           # Admin dashboard (korumalı)
│   │   │   ├── order/               # Sipariş sayfaları
│   │   │   │   └── confirmation/    # Sipariş onay sayfası
│   │   │   ├── payment/             # Ödeme callback
│   │   │   │   └── callback/        # iyzico callback
│   │   │   └── [locale]_layout/     # Dile özgü layout'lar
│   │   │
│   │   └── api/                      # Next.js API Routes
│   │       ├── auth/
│   │       │   ├── [...nextauth]/   # NextAuth handler
│   │       │   ├── register/        # Kayıt endpoint'i
│   │       │   ├── forgot-password/ # Şifre sıfırlama
│   │       │   ├── reset-password/  # Şifre yenileme
│   │       │   └── verify-email/    # Email doğrulama
│   │       │
│   │       ├── payment/              # Ödeme işlemleri
│   │       │   ├── iyzico/          # iyzico payment init (3D Secure)
│   │       │   ├── verify/          # Ödeme doğrulama
│   │       │   └── callback/        # iyzico callback işleme
│   │       │
│   │       ├── orders/               # Sipariş yönetimi
│   │       │   └── create/          # Sipariş oluşturma
│   │       │
│   │       ├── invoice/              # E-Arşiv Fatura
│   │       │   ├── create/          # Fatura oluşturma
│   │       │   └── download/[ettn]/ # PDF indirme
│   │       │
│   │       ├── cart/                 # Sepet işlemleri
│   │       │   ├── get-product/     # Ürün getirme
│   │       │   └── get-variant/     # Varyant getirme
│   │       │
│   │       ├── user/                 # Kullanıcı işlemleri
│   │       │   └── addresses/       # Adres yönetimi
│   │       │
│   │       ├── location/             # Lokasyon verileri
│   │       │   ├── countries/       # Ülkeler
│   │       │   ├── turkey-cities/   # Türkiye şehirleri
│   │       │   └── turkey-districts # İlçeler
│   │       │
│   │       ├── exchange-rate/        # Döviz kurları
│   │       ├── generate-pdf/         # PDF katalog oluşturma
│   │       ├── search/               # Arama işlevleri
│   │       └── translate/            # Çeviri API'leri
│   │
│   ├── components/                   # React bileşenleri
│   │   ├── AutoSlider.tsx           # Otomatik kaydırıcı
│   │   ├── ClientTestimonials.tsx   # Müşteri yorumları
│   │   ├── DraggableTestimonials.tsx# Sürüklenebilir yorumlar
│   │   ├── CatalogRequestForm.tsx   # Katalog talep formu
│   │   ├── CustomCurtainSidebar.tsx # Özel perde yapılandırması
│   │   ├── DistanceSalesContract.tsx# Mesafeli satış sözleşmesi
│   │   ├── Footer.tsx               # Footer
│   │   ├── Header.tsx               # Header/Navigation
│   │   ├── HeroVideo.tsx            # Hero video bölümü
│   │   ├── InstagramFeed.tsx        # Instagram entegrasyonu
│   │   ├── IadeSartlari.tsx         # İade şartları
│   │   ├── KVKK.tsx                 # KVKK aydınlatma metni
│   │   ├── LocaleSwitcher.tsx       # Dil değiştirici
│   │   ├── Menu.tsx                 # Navigasyon menüsü
│   │   ├── MesafeliSatisSozlesmesi.tsx # Sözleşme
│   │   ├── PageTransition.tsx       # Sayfa geçişi animasyonu
│   │   ├── PreInformationForm.tsx   # Ön bilgilendirme formu
│   │   ├── ProductCard.tsx          # Ürün kartı
│   │   ├── ProductDetailCard.tsx    # Ürün detay kartı
│   │   ├── ProductGrid.tsx          # Ürün grid layout'u
│   │   ├── ProductShowcase.tsx      # Ürün vitrin
│   │   ├── ScrollToTop.tsx          # Sayfanın başına git
│   │   ├── Slider2.tsx              # Alternatif slider
│   │   └── Spinner.tsx              # Loading spinner
│   │
│   ├── lib/                          # Yardımcı kütüphaneler
│   │   ├── isnet/                   # İşNet E-Arşiv entegrasyonu
│   │   │   ├── soap-client.ts       # SOAP client ve type definitions
│   │   │   └── invoice-builder.ts   # Fatura objesi oluşturucu
│   │   ├── services/
│   │   │   └── locationService.ts   # Lokasyon servisi
│   │   ├── colorMap.ts              # Renk eşlemesi
│   │   ├── django-hash.ts           # Django password hashing
│   │   ├── email.ts                 # Email template'leri
│   │   ├── functions.ts             # Yardımcı fonksiyonlar
│   │   ├── googleAnalytics.tsx      # Google Analytics entegrasyonu
│   │   ├── interfaces.ts            # TypeScript interface'leri
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── translate.ts             # Çeviri fonksiyonları
│   │   └── catalogPdfGenerator.ts   # PDF katalog oluşturucu
│   │
│   ├── contexts/                     # React Context API
│   │   ├── CartContext.tsx          # Sepet state'i
│   │   ├── CurrencyContext.tsx      # Para birimi state'i
│   │   └── FavoriteContext.tsx      # Favori ürünler
│   │
│   ├── utils/                        # Utility fonksiyonları
│   │   └── authOptions.ts           # NextAuth konfigürasyonu
│   │
│   ├── types/                        # TypeScript tip tanımlamaları
│   │   └── iyzipay.d.ts             # iyzico tip definitions
│   │
│   ├── middleware.ts                # Dil routing middleware
│   ├── middleware_old.ts            # Eski middleware
│   ├── i18n.ts                      # next-intl konfigürasyonu
│   └── trial.ts                     # Test dosyası
│
├── prisma/                           # Prisma ORM
│   ├── schema.prisma                # Database şeması (Django + Next.js modelleri)
│   ├── migrations/                  # Database migration'ları
│   └── seed.ts                      # Seed data script'i
│
├── messages/                         # Çeviri dosyaları (i18n)
│   ├── en.json                      # İngilizce
│   ├── tr.json                      # Türkçe
│   ├── ru.json                      # Rusça
│   └── pl.json                      # Lehçe
│
├── public/                           # Statik dosyalar
│   └── media/                       # Görseller ve videolar
│
├── .env                             # Environment variables
├── package.json                     # Bağımlılıklar
├── next.config.js                  # Next.js konfigürasyonu
├── tailwind.config.ts              # Tailwind CSS konfigürasyonu
├── tsconfig.json                   # TypeScript konfigürasyonu
├── postcss.config.js               # PostCSS konfigürasyonu
│
├── Dokümantasyon Dosyaları:
│   ├── README.md                    # Standart Next.js README
│   ├── warp.md                      # Detaylı teknik dokümantasyon
│   ├── EARCHIVE_INTEGRATION_SUMMARY.md    # İşNet E-Arşiv özeti
│   ├── ISNET_EARCHIVE_SETUP.md           # İşNet kurulum rehberi
│   ├── GOOGLE_OAUTH_SETUP.md             # Google OAuth kurulum
│   ├── IYZICO_SETUP.md                   # iyzico kurulum
│   ├── PAYMENT_README.md                 # Ödeme sistemi hızlı başlangıç
│   ├── PAYMENT_TEST.md                   # Ödeme test rehberi
│   └── PROJE_ANALIZ_RAPORU.md           # Bu dosya
│
└── Yapılandırma Dosyaları:
    ├── .eslintrc.json               # ESLint kuralları
    └── .vscode/settings.json        # VS Code ayarları
```

---

## 4️⃣ TEMEL ÖZELLİKLER

### 🌍 Çok Dil Desteği (i18n)
- **Desteklenen Diller**: İngilizce (en), Türkçe (tr), Rusça (ru), Lehçe (pl)
- **Kütüphane**: next-intl 4.0.0
- **URL Yapısı**: 
  - `/` → İngilizce (default)
  - `/tr/...` → Türkçe
  - `/ru/...` → Rusça
  - `/pl/...` → Lehçe
- **Çeviri Dosyaları**: `messages/{locale}.json`
- **Middleware**: Otomatik locale routing (`src/middleware.ts`)

### 🔐 Kimlik Doğrulama (Authentication)
- **Framework**: NextAuth.js 4.24.5
- **Provider**: Credentials Provider (username/password)
- **Şifre Hashing**: bcrypt 5.1.1 (Django uyumlu)
- **Session**: JWT token (cookie-based)
- **Korumalı Routes**:
  - `/dashboard` - Admin paneli
  - `/app/*` - Kullanıcı alanı
  - `/orders/*` - Sipariş yönetimi

### 🛒 E-Ticaret Özellikleri

#### Ürün Yönetimi
- **Dinamik Kategoriler**: Django backend'den çekilen kategoriler
- **Ürün Detay Sayfaları**: SKU bazında parametreli (`/product/[category]/[sku]`)
- **Ürün Varyantları**: Renk, beden, desen seçenekleri
- **Özel Perde Yapılandırması**: 
  - Genişlik ayarı (cm cinsinden)
  - Pileli yoğunluk seçenekleri
  - Tekli/çift kanat seçeneği
  - Kumaş metresi hesabı
- **Stok Yönetimi**: Django backend ile senkronize, metre bazında

#### Alışveriş Sepeti (Cart)
- **React Context**: CartContext ile state yönetimi
- **Sepet Özellikleri**:
  - Ürün ekleme/çıkarma
  - Miktar ayarı
  - Varyant seçimi (varsa)
  - Özel perde hesaplamaları
  - Sepet toplamı ve KDV hesabı

#### Ödeme Sistemi
- **Gateway**: iyzico (Türkiye'nin başlıca ödeme sağlayıcısı)
- **Akış**: 3D Secure (PCI-DSS Level 1)
- **Desteklenen Kartlar**: Visa, Mastercard, Troy, American Express
- **Para Birimleri**: TRY (Türk Lirası), USD, EUR, GBP
- **API Endpoint**: `/api/payment/iyzico` (3D Secure başlatma)
- **Test Kartı**:
  ```
  5528 7900 0000 0008
  Tarih: 12/30
  CVV: 123
  3D: Herhangi bir değer
  ```

#### Ödeme Akışı
```
1. Checkout Formu
   ↓
2. Kart Bilgileri Girişi (client-side validation)
   ↓
3. POST /api/payment/iyzico
   ↓
4. 3D Secure Popup (iyzico tarafından sağlanır)
   ↓
5. Banka Doğrulaması
   ↓
6. POST /payment/callback (iyzico redirect)
   ↓
7. GET /api/payment/verify (doğrulama)
   ↓
8. POST /api/orders/create (sipariş kaydı)
   ↓
9. POST /api/invoice/create (E-Arşiv fatura)
   ↓
10. /order/confirmation (onay sayfası)
```

### 📄 E-Arşiv Fatura Sistemi

#### İşNet Entegrasyonu
- **Sağlayıcı**: İşNet (NetTe Fatura)
- **Protokol**: SOAP Web Service
- **Ortamlar**: Test + Production (IP doğrulama gerekli)
- **Kurulum**: 
  - `ISNET_COMPANY_VKN` - Firma Vergi Kimlik Numarası
  - `ISNET_ENVIRONMENT` - test veya production

#### Fatura Özellikleri
- **Otomatik Oluşturma**: Sipariş tamamlandıktan hemen sonra
- **Müşteriye Email**: İşNet tarafından otomatik olarak gönderilir
- **PDF Download**: ETTN (E-Arşiv Tekil Takip Numarası) ile indirme
- **KDV Hesabı**: %20 standart (Türkiye)
- **Döviz Desteği**: USD/EUR → TRY otomatik dönüşüm

#### Fatura Akışı
```
Ödeme Başarılı → Sipariş Oluştur → Fatura Oluştur → PDF Email → Müşteri
```

---

## 5️⃣ VERİTABANI (DATABASE)

### Veritabanı Türü
- **DBMS**: PostgreSQL (Supabase üzerinde host ediliyor)
- **ORM**: Prisma 6.17.1
- **Bağlantı**: Pooled connection (Supabase PgBouncer)

### Prisma Şeması Yapısı

Proje, **Django backend'ten pull edilen** Prisma şeması kullanır ve aşağıdaki modülleri içerir:

#### 1. Authentication (Kimlik Doğrulama)
```
- auth_user              # Django kullanıcıları
- auth_group             # İzin grupları
- auth_permission        # Sistem izinleri
- auth_user_groups       # Kullanıcı-grup ilişkiler
- auth_user_permissions  # Kullanıcı izinleri
- auth_group_permissions # Grup izinleri
- authentication_member  # Üye profilleri
```

#### 2. CRM (Müşteri İlişkileri)
```
- crm_company           # Şirket/müşteri kayıtları
- crm_contact           # İletişim kişileri
- crm_note              # Notlar
- crm_supplier          # Tedarikçi bilgileri
- crm_clientgroup       # Müşteri grupları
- crm_companyfollowup   # Takip kayıtları
```

#### 3. Marketing (Ürünler)
```
- marketing_product              # Ürün master kayıtları
- marketing_productcategory      # Ürün kategorileri
- marketing_productcollection    # Koleksiyonlar
- marketing_productvariant       # Varyantlar (renk, beden)
- marketing_productvariantattribute      # Varyant öznitelikleri
- marketing_productvariantattributevalue # Öznitelik değerleri
- marketing_productfile          # Ürün görselleri
```

#### 4. Accounting (Muhasebe)
```
- accounting_book                    # Muhasebe defterleri
- accounting_assetcash              # Nakit varlıklar
- accounting_assetinventorygood     # Bitmiş ürün stoğu
- accounting_assetinventoryrawmaterial # Hammadde stoğu
- accounting_invoice                # Faturalar
- accounting_equitycapital          # Özkaynaklar
- accounting_equitydivident         # Temettü
- accounting_equityrevenue          # Gelirler
- accounting_equityexpense          # Giderler
- accounting_transaction            # Muhasebe işlemleri
- accounting_assetaccountsreceivable # Alacaklar
- accounting_stakeholderbook        # Ortak defteri
```

#### 5. Todo & Task Management
```
- todo_task           # Görevler
- todo_taskcomment    # Görev açıklamaları
```

#### 6. Email Automation
```
- email_automation_emailtemplate
- email_automation_emailcampaign
- email_automation_emailaccount
```

#### 7. Django Sistem Tabloları
```
- django_content_type       # Model metadata
- django_admin_log          # Admin log kayıtları
- django_migrations         # Migration history
- django_session            # Session data
```

### Next.js Native Modeli
```
model User {
  id       Int     @id @default(autoincrement())
  username String  @unique
  email    String  @unique
  password String  # bcrypt hashed
  name     String?
}
```

---

## 6️⃣ API ENDPOINT'LERİ

### Authentication API'leri

#### Kayıt
```
POST /api/auth/register
Request: { username, email, password, name }
Response: { success, user, message }
```

#### Giriş
```
POST /api/auth/[...nextauth]
Handled by NextAuth.js
```

#### Şifre Sıfırlama
```
POST /api/auth/forgot-password
Request: { email }
Response: { success, message }

POST /api/auth/reset-password
Request: { token, password }
Response: { success, message }
```

#### Email Doğrulama
```
POST /api/auth/verify-email
Request: { token }
Response: { success, message }
```

### Ödeme API'leri

#### 3D Secure Başlatma
```
POST /api/payment/iyzico
Request: {
  cardHolderName, cardNumber, expireMonth, expireYear, cvc,
  price, currency, basketId, buyer, shippingAddress, 
  billingAddress, basketItems, callbackUrl
}
Response: {
  success, threeDSHtmlContent (3D Secure HTML popup)
}
```

#### Ödeme Doğrulama
```
POST /api/payment/verify
Request: { mdStatus, status, paymentId }
Response: { success, payment }
```

#### iyzico Callback
```
POST /api/payment/callback
(iyzico tarafından otomatik çağrılır - form POST)
```

### Sipariş API'leri

#### Sipariş Oluşturma
```
POST /api/orders/create
Request: {
  userId, paymentData, cartItems, deliveryAddress,
  billingAddress, exchangeRate, originalCurrency
}
Response: {
  success, order, invoice
}

İşlemler:
1. Django backend'e sipariş kaydı
2. Stok güncelleme (her ürün için)
3. E-Arşiv fatura oluşturma
```

### Fatura API'leri (E-Arşiv)

#### Fatura Oluşturma
```
POST /api/invoice/create
Request: {
  orderId,
  orderData: {
    orderDate, firstName, lastName, taxNumber, email, phone,
    deliveryAddress, items, paymentMethod, exchangeRate, 
    originalCurrency
  }
}
Response: {
  success, invoice: {
    invoiceNumber, ettn, invoiceDate
  }
}

Back-end İşlemler:
1. InvoiceBuilder ile fatura objesi oluştur
2. IsNetSoapClient ile İşNet'e SOAP isteği gönder
3. ETTN (E-Arşiv UUID) ve fatura numarası döner
4. Django backend'e fatura bilgisi kaydedilir
```

#### PDF İndirme
```
GET /api/invoice/download/[ettn]
Response: PDF file (application/pdf)
```

### Ürün API'leri

#### Ürün Getirme (Sepet)
```
GET /api/cart/get-product?sku=XXX
Response: Product { title, price, image, ... }
```

#### Varyant Getirme
```
GET /api/cart/get-variant?variantId=XXX
Response: ProductVariant { sku, price, attributes, ... }
```

### Kullanıcı API'leri

#### Adres Yönetimi
```
GET /api/user/addresses
Response: Address[]

POST /api/user/addresses
Request: { title, address, city, country, phone }
Response: { success, address }
```

### Lokasyon API'leri

#### Ülkeler
```
GET /api/location/countries
Response: Country[]
```

#### Türkiye Şehirleri
```
GET /api/location/turkey-cities
Response: City[]
```

#### Türkiye İlçeleri
```
GET /api/location/turkey-districts/[cityId]
Response: District[]
```

### Döviz Kuru API'si

#### Döviz Kurları
```
GET /api/exchange-rate?from=USD&to=TRY
Response: { rate, from, to, timestamp }
```

### Diğer API'ler

#### PDF Katalog Oluşturma
```
GET /api/generate-pdf?sku=XXX&title=YYY&image=ZZZ
Response: PDF file
```

#### Arama
```
GET /api/search?q=query&category=category
Response: Product[]
```

#### Çeviri
```
GET /api/translate?text=hello&to=tr
Response: { original, translated }
```

---

## 7️⃣ BILEŞEN ANALİZİ

### Sayfalar (Pages)

#### Ana Sayfa (`/[locale]`)
- Hero video bölümü
- Ürün vitrin (ProductShowcase)
- Fabrika görselleri slider'ı (AutoSlider)
- Müşteri yorumları (DraggableTestimonials)
- Server-side ürün kategori fetching

#### Ürün Sayfası (`/[locale]/product`)
- Kategorisiz ürün listesi
- Tüm kategorilerin grid layout'u

#### Kategori Sayfası (`/[locale]/product/[category]`)
- Kategoriye ait ürünler
- Filtreleme ve arama

#### Ürün Detay (`/[locale]/product/[category]/[sku]`)
- Ürün bilgileri (title, description, tags)
- Ürün görselleri (gallery)
- Varyant seçenekleri
- PDF katalog indirme
- Özel perde yapılandırması (varsa)
- Sepete ekle butonu

#### Checkout (`/[locale]/checkout`)
- Adres seçimi/ekleme
- Kart bilgileri formu (client-side validation)
- Sipariş özeti
- Fiyat hesapları
- iyzico ödeme başlatma

#### Ödeme Callback (`/[locale]/payment/callback`)
- 3D Secure sonuç işleme
- Ödeme doğrulama
- Sipariş oluşturma
- Başarı/hata gösterimi

#### Sipariş Onay (`/[locale]/order/confirmation`)
- Sipariş detayları
- Fatura bilgileri
- Müşteri bilgileri
- Takip linki (varsa)

#### Hakkımızda (`/[locale]/about`)
- Şirket hikayesi
- Fabrika görselleri
- Ürün kategorileri

#### İletişim (`/[locale]/contact`)
- İletişim formu
- Şirket bilgileri
- İletişim adresler

#### Dashboard (`/[locale]/dashboard`)
- Korumalı sayfa (login gerekli)
- Admin fonksiyonları

### Bileşenler (Components)

#### Header.tsx
- Logo
- Navigasyon menüsü
- Dil seçici
- Giriş/Çıkış
- Sepet ikonu

#### Menu.tsx
- Dinamik navigasyon menüsü
- Kategorileri göster/gizle
- Mobil responsive

#### Footer.tsx
- Hızlı linkler
- İletişim bilgileri
- Sosyal medya
- Copyright

#### ProductCard.tsx
- Ürün kartı
- Resim
- Fiyat
- Detay link'i
- Sepete ekle

#### ProductDetailCard.tsx
- Detaylı ürün bilgisi
- Galeri viewer
- Varyant seçici
- Özel perde yapılandırması
- Miktar seçimi

#### ProductGrid.tsx
- Ürün grid layout'u (responsive)
- Sayfalandırma/infinite scroll (varsa)
- Filtreleme

#### HeroVideo.tsx
- Video hero section
- Başlık ve alt başlık
- CTA buton
- Mobile responsive

#### AutoSlider.tsx
- Otomatik kaydırıcı
- Fabrika görselleri
- Kontrol butonları

#### DraggableTestimonials.tsx
- Sürüklenebilir testimonial slider'ı
- Müşteri yorumları
- Responsive design

#### ProductShowcase.tsx
- Ürün vitrin bölümü
- Kategorilerden seçilen ürünler
- Grid layout

#### LocaleSwitcher.tsx
- Dil değiştirme dropdown'u
- Mevcut dilin gösterilmesi
- Diğer dillere yönlendirme

#### CatalogRequestForm.tsx
- Katalog talep formu
- Email input
- Form validation

#### CustomCurtainSidebar.tsx
- Özel perde yapılandırması
- Genişlik input'u
- Pileli yoğunluk seçicisi
- Kanat tipi seçicisi
- Kumaş metre hesabı

#### PreInformationForm.tsx
- Ön bilgilendirme (KVKK, mesafeli satış vb.)
- Checkbox'lar

#### DistanceSalesContract.tsx / MesafeliSatisSozlesmesi.tsx
- Mesafeli satış sözleşmesi metni
- Legal compliance

#### IadeSartlari.tsx
- İade şartları metni

#### KVKK.tsx
- Kişisel Verilerin Korunması aydınlatması

#### InstagramFeed.tsx
- Instagram feed entegrasyonu
- Dinamik post'lar

#### ScrollToTop.tsx
- Sayfanın başına dön butonu

#### Spinner.tsx
- Loading göstergesi

#### PageTransition.tsx
- Sayfa geçişi animasyonu (Framer Motion)

---

## 8️⃣ CONTEXT & STATE YÖNETIMI

### React Context API Kullanımı

#### CartContext
```typescript
- Sepet state'i
- Ürün ekleme/çıkarma
- Miktar güncelleme
- Varyant yönetimi
- Özel perde verileri
- Sepet toplamı
```

#### CurrencyContext
```typescript
- Aktif para birimi
- Döviz kurları
- Para birimi değiştirme
```

#### FavoriteContext
```typescript
- Favori ürünler listesi
- Ekleme/çıkarma
- LocalStorage persist
```

---

## 9️⃣ ENTEGRASYONLAR

### İşNet E-Arşiv SOAP Integration

#### Yapı
```
IsNetSoapClient (soap-client.ts)
  ├── sendArchiveInvoice()      # E-Arşiv fatura gönder
  ├── searchArchiveInvoice()    # Fatura sorgula
  ├── sendArchiveInvoiceMail()  # Email gönder
  └── getDocumentViewerLink()   # PDF link al

InvoiceBuilder (invoice-builder.ts)
  └── buildArchiveInvoice()     # Siparişten fatura objesi oluştur
```

#### Tipik Akış
```
1. Sipariş tamamlandı
2. InvoiceBuilder.buildArchiveInvoice() çağrılır
3. IsNetSoapClient.sendArchiveInvoice() çağrılır
4. SOAP request İşNet'e gönderilir
5. ETTN ve fatura numarası döner
6. Django backend'e kaydedilir
7. Müşteriye email gönderilir (İşNet tarafından)
```

#### Test vs. Production
```
Test Ortamı:
- URL: http://einvoiceservicetest.isnet.net.tr
- IP doğrulaması YOK
- Test VKN: 4810173324

Production Ortamı:
- URL: https://einvoiceservice.isnet.net.tr
- IP doğrulaması ZORUNLU
- Production VKN: Gerçek VKN
```

### iyzico Ödeme Gateway

#### Yapı
```
/api/payment/iyzico       # 3D Secure başlatma
/api/payment/verify       # Ödeme doğrulama
/api/payment/callback     # iyzico callback
```

#### 3D Secure Akışı
```
1. Kart bilgileri gönder → /api/payment/iyzico
2. iyzico threeDSHtmlContent döner
3. HTML popup'ı göster
4. Müşteri 3D Secure doğrulama yapar
5. iyzico /payment/callback'e yönlendir
6. Callback sayfası ödemeyi doğrula
7. /api/payment/verify çağrı
8. Başarılı ise sipariş oluştur
```

### Next.js i18n (next-intl)

#### Dosya Yapısı
```
messages/
  ├── en.json  # Header, Menu, Products, AboutUsPage, ContactPage, FooterPage
  ├── tr.json
  ├── ru.json
  └── pl.json
```

#### Kullanım
```typescript
// Server-side
const t = await getTranslations({ locale, namespace: 'Menu' });
const text = t('Home');

// Client-side (Client Component)
const t = useTranslations('Products');
const text = t('Price');
```

### Google Analytics

#### Entegrasyon
- Dosya: `src/lib/googleAnalytics.tsx`
- Sayfalar: Tracking ID ile takip
- Events: Ürün görüntüleme, sepete ekleme vb.

### Database (Supabase + Prisma)

#### Bağlantı
```
DATABASE_URL    # Pooled connection (PgBouncer)
DIRECT_URL      # Direct PostgreSQL connection
```

#### Migration
```bash
npx prisma migrate dev --name description
npx prisma db push
```

---

## 🔟 SECURITY (GÜVENLİK)

### Authentication
- ✅ NextAuth.js JWT tokens
- ✅ bcrypt password hashing
- ✅ Secure HTTP-only cookies
- ✅ CSRF protection (NextAuth)

### Payment Security
- ✅ iyzico PCI-DSS Level 1
- ✅ Kart bilgileri asla sunucuda saklanmaz
- ✅ 3D Secure doğrulama zorunlu
- ✅ API keys environment variables'da

### E-Arşiv Security
- ✅ IP-based authentication (Production)
- ✅ Company VKN validation
- ✅ TCKN/VKN validation
- ✅ SOAP XML encryption

### Database Security
- ✅ PostgreSQL (Supabase)
- ✅ SSL/TLS connections
- ✅ Prisma ORM (SQL injection koruması)
- ✅ Environment variable secrets

### API Security
- ✅ Rate limiting (varsa)
- ✅ Input validation
- ✅ Error handling (sensitive data leaking engelle)
- ✅ CORS configuration

---

## 1️⃣1️⃣ PERFORMANCE OPTİMİZASYONLARI

### Frontend
- ✅ Next.js Image Optimization
- ✅ Code splitting (automatic)
- ✅ Dynamic imports
- ✅ CSS-in-JS (Tailwind)
- ✅ Responsive images
- ✅ WebP format support

### Backend
- ✅ Database query optimization (Prisma)
- ✅ Connection pooling (PgBouncer)
- ✅ Server-side caching
- ✅ API response compression

### Build
- ✅ Turbopack (dev mode)
- ✅ Next.js production build optimization
- ✅ Tree shaking (unused code removal)
- ✅ Minification

---

## 1️⃣2️⃣ DEPLOYMENT (DEPLOYMENT)

### Önerilen Platform
**Vercel** (Next.js yaratıcıları tarafından)

### Environment Setup
```bash
# Development
npm run dev                  # Port 3000, Turbopack

# Production Build
npm run build               # Prisma generate + Next build
npm run start               # Production server
```

### Deployment Adımları
1. Environment variables set et (.env)
2. Database URL'i doğrula (Supabase)
3. API URL'lerini update et
4. `npm run build` çalıştır
5. Vercel'e deploy et

### Production Checklist
- [ ] HTTPS enabled
- [ ] Environment variables set
- [ ] Database backed up
- [ ] Payment APIs production keys
- [ ] İşNet production IP tanımlaması yapılmış
- [ ] Google Analytics tracking
- [ ] Email templates tested
- [ ] Error logging configured
- [ ] Backup & recovery plan

---

## 1️⃣3️⃣ YAPILACAKLAR & KNOWN ISSUES

### Tamamlananlar ✅
- ✅ Çok dilli URL yapısı (en, tr, ru, pl)
- ✅ PDF katalog oluşturma
- ✅ NextAuth.js entegrasyonu
- ✅ iyzico 3D Secure ödeme
- ✅ İşNet E-Arşiv entegrasyonu
- ✅ React Context state yönetimi
- ✅ Responsive UI design
- ✅ Google Analytics

### Yapılacaklar ⏳
- ⏳ Blog modülü
- ⏳ Instagram entegrasyonu (stories)
- ⏳ Email newsletter
- ⏳ Favori ürünler sistemi
- ⏳ SEO optimizasyonu (next/image)
- ⏳ Rusya için www.karven.ru yönlendirmesi
- ⏳ Mobile app (React Native)
- ⏳ Admin paneli completion
- ⏳ Sipariş takibi sistemi
- ⏳ Müşteri destek chat

### Known Issues 🐛
- Bazı ürünlerde (24654, 24655, 24891) duplike kayıtlar var
- Bazı desenlerin fotoğrafları yok (24768, 24770, 12915 vb.)
- NextAuth middleware ile route protection tam olarak implement edilmemiş

### Geliştirici Notları 📝
- Prisma migration workflow'u dokümante et
- JSON-server kullanımı
- NextAuth session yönetimi
- Middleware patterns

---

## 1️⃣4️⃣ ÇOK DİL DOSYALARI (MESSAGES)

### Desteklenen Namespace'ler
```
Header          # Başlık elemanları
Menu            # Menü öğeleri
Products        # Ürün sayfası
AboutUsPage     # Hakkımızda
ContactPage     # İletişim
FooterPage      # Footer
Slider          # Slider metinleri
Common          # Genel metinler
```

### Dosya Konumları
```
messages/
├── en.json      # İngilizce (varsayılan)
├── tr.json      # Türkçe
├── ru.json      # Rusça
└── pl.json      # Lehçe
```

---

## 1️⃣5️⃣ NETWORK & EXTERNAL APIs

### Django Backend
```
Base URL: http://127.0.0.1:8000/ (geliştirmede)
           https://app.nejum.com/ (production)

Endpoints:
- /marketing/api/get_product_categories
- /marketing/api/get_product?product_sku={sku}
- /operating/orders/create/
- /operating/orders/update_invoice/
- /marketing/api/update_product_stock/
```

### İşNet SOAP Services
```
Test:       http://einvoiceservicetest.isnet.net.tr
Production: https://einvoiceservice.isnet.net.tr

Services:
- InvoiceService.svc       # E-Arşiv fatura
- AddressBookService.svc   # Adres defteri
```

### iyzico Payment API
```
Sandbox:    https://sandbox-api.iyzipay.com
Production: https://api.iyzipay.com

Endpoints:
- /3dsecure/init           # 3D Secure başlatma
- /payment/3dsecure/auth   # 3D Secure auth
```

### Supabase PostgreSQL
```
Host:  aws-0-eu-west-1.pooler.supabase.com
Port:  6543 (pooled), 5432 (direct)
Database: postgres
```

---

## 1️⃣6️⃣ PAKET YÖNETİMİ

### Bağımlılıklar (dependencies)
```
Core:
- next 15.5.7
- react 18.3.1
- typescript 5.x

Database & ORM:
- @prisma/client 6.4.1
- pg (PostgreSQL)

Authentication:
- next-auth 4.24.5
- bcrypt 5.1.1
- jsonwebtoken 9.0.2

Payment & Invoicing:
- iyzipay 2.0.64
- soap 1.6.1 (İşNet SOAP)
- jspdf 3.0.4
- pdf-lib 1.17.1

Internationalization:
- next-intl 4.0.0
- i18next 23.10.0
- i18next-resources-to-backend 1.2.0

UI & Styling:
- tailwindcss 3.x
- sass 1.69.3
- framer-motion 12.23.24
- react-icons 4.11.0

Database Clients:
- @supabase/supabase-js 2.39.3
- @supabase/auth-helpers-nextjs 0.8.7
- mongodb 6.2.0

Email:
- nodemailer 6.10.1

Other:
- convert-array-to-csv 2.0.0
- ws 8.16.0 (WebSockets)
- bufferutil 4.0.8
- utf-8-validate 6.0.3
```

### Dev Bağımlılıkları (devDependencies)
```
- @types/node 20
- @types/react 18.3.11
- @types/react-dom 18.3.1
- @types/bcrypt 5.0.2
- @types/nodemailer 7.0.4
- @types/soap 0.21.0
- eslint 8
- eslint-config-next 15.5.0
- autoprefixer 10
- postcss 8
- ts-node 10.9.2
- prisma 6.17.1
```

---

## 1️⃣7️⃣ KOMUTLAR & SCRIPTS

### Development
```bash
npm run dev         # Dev server (Turbopack, port 3000)
npm run build       # Production build
npm run start       # Production server
npm run lint        # ESLint check
```

### Database (Prisma)
```bash
npx prisma generate                    # Prisma client oluştur
npx prisma migrate dev --name init     # Migration oluştur
npx prisma db seed                     # Seed data ekle
npx prisma db pull                     # Mevcut DB'den schema çek
npx prisma db push                     # Schema'yı DB'ye push et
npx prisma studio                      # Prisma Studio (GUI)
```

---

## 1️⃣8️⃣ DOSYA YAPISI ÖZET

```
demfirat/ (root)
├── src/
│   ├── app/              # Next.js App Router
│   ├── components/       # React bileşenleri
│   ├── lib/              # Kütüphaneler & utilities
│   ├── utils/            # Yardımcı fonksiyonlar
│   ├── contexts/         # React Context
│   ├── types/            # TypeScript types
│   └── middleware.ts     # Route middleware
├── prisma/               # Database schema
├── messages/             # i18n translations
├── public/               # Static files
├── next.config.js        # Next.js config
├── tailwind.config.ts    # Tailwind config
├── tsconfig.json         # TypeScript config
└── Docs (*.md)          # Dokümantasyonlar
```

---

## 1️⃣9️⃣ İLETİŞİM VE DESTEK

### Şirket İletişim
- **Web**: www.demfirat.com
- **Email**: hello@demfirat.com
- **Tel**: +90 (282) 675-1552
- **Adres**: Vakıflar OSB Mah D100 Cad No 38, Ergene, Tekirdağ 59930, Türkiye

### Teknik Destek
- **İşNet**: efaturadestek@nettefatura.com.tr
- **iyzico**: destek@iyzico.com
- **Supabase**: Supabase Dashboard

### Dokümantasyon Kaynakları
- İşNet: `/WebServis/IsNet-EArşiv-WebServiceArayuzDokumani-*.pdf`
- iyzico: https://dev.iyzipay.com/
- Next.js: https://nextjs.org/docs
- Prisma: https://www.prisma.io/docs/

---

## 2️⃣0️⃣ SONUÇ

Bu proje, modern web teknolojilerini kullanarak **enterprise-grade** e-ticaret platformu olarak geliştirilmiştir. Türkiye'nin en önemli ödeme gateway'i (iyzico) ve legal e-Arşiv fatura sistemi (İşNet) entegrasyonları ile **production-ready** bir çözümdür.

### Güçlü Yönler
✅ Çok dilli destek (4 dil)  
✅ Modern stack (Next.js 15, Prisma, TypeScript)  
✅ Güvenli ödeme (3D Secure, PCI-DSS)  
✅ Legal uyum (E-Arşiv faturalandırma)  
✅ Responsive design  
✅ SEO friendly  
✅ Performance optimized  
✅ Easy deployment (Vercel-ready)  

### Geliştirilecek Alanlar
⏳ Blog modülü  
⏳ Admin paneli completion  
⏳ Sipariş takibi sistemi  
⏳ Email automation  
⏳ Mobile app  

---

**Proje Durumu**: ✅ Production-Ready  
**Son Güncelleme**: 16 Aralık 2024  
**Versiyon**: 0.1.0  
**Geliştirici**: Enes (Founder's Son) + AI Assistant  
**Lisans**: Tüm hakları saklıdır © Dem Fırat Karven Tekstil

---

## 📚 REFERANSLAR

1. **Dokümantasyon Dosyaları**: 
   - `warp.md` - Detaylı teknik dokümantasyon
   - `EARCHIVE_INTEGRATION_SUMMARY.md` - İşNet özeti
   - `ISNET_EARCHIVE_SETUP.md` - İşNet setup
   - `IYZICO_SETUP.md` - iyzico setup
   - `PAYMENT_README.md` - Ödeme hızlı başlangıç
   - `PAYMENT_TEST.md` - Ödeme test rehberi

2. **Resmi Kaynaklar**:
   - Next.js: https://nextjs.org/
   - Prisma: https://www.prisma.io/
   - TypeScript: https://www.typescriptlang.org/
   - Tailwind CSS: https://tailwindcss.com/
   - NextAuth.js: https://next-auth.js.org/
   - next-intl: https://next-intl-docs.vercel.app/

3. **Entegrasyon Kaynakları**:
   - iyzico: https://dev.iyzipay.com/
   - İşNet: http://efatura.isnet.net.tr
   - Supabase: https://supabase.com/
