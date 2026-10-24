# DEMFIRAT KARVEN - Proje Dokümantasyonu

## 📋 Genel Bakış

**DEMFIRAT KARVEN** - Premium ev tekstili e-ticaret platformu. Next.js 15.5.0 ile geliştirilmiş, çok dilli (4 dil), ürün kataloğu ve CRM özellikleri içeren full-stack web uygulaması.

**Şirket Hikayesi**: Dem Fırat Karven Tekstil, 1991'de İstanbul'da Cuma Öztürk tarafından kuruldu. Küçük bir aile tekstil dükkanından başlayarak, ayda 20 milyon yard'dan fazla kumaş üreten bir üretim tesisine dönüştü.

---

## 🛠️ Teknoloji Stack

### Frontend
- **Framework**: Next.js 15.5.0 (App Router)
- **React**: 18.3.1
- **TypeScript**: 5.x
- **Styling**: 
  - Tailwind CSS 3.x
  - Sass/SCSS
  - CSS Modules
- **UI Kütüphaneleri**:
  - React Icons
  - PDF-lib (PDF oluşturma)

### Backend & Database
- **ORM**: Prisma 6.17.1
- **Database**: PostgreSQL (Supabase üzerinde host ediliyor)
- **Auth**: NextAuth.js 4.24.5
- **Password Hashing**: bcrypt 5.1.1

### i18n (Çok Dil Desteği)
- **Kütüphane**: next-intl 4.0.0
- **Desteklenen Diller**: 
  - 🇬🇧 İngilizce (en)
  - 🇷🇺 Rusça (ru)
  - 🇵🇱 Lehçe (pl)
  - 🇹🇷 Türkçe (tr)
- **Dosya Konumu**: `/messages/{locale}.json`

### DevOps & Deployment
- **Node Version**: 22.x
- **Package Manager**: npm/yarn/pnpm/bun
- **Build Tool**: Turbopack (dev mode)
- **Port**: 3000

### External APIs
- **Backend API**: Django REST API (NEJUM_API_URL)
  - URL: http://127.0.0.1:8000/
  - Endpoints:
    - `/marketing/api/get_product_categories`
    - `/marketing/api/get_product?product_sku={sku}`

---

## 📁 Proje Yapısı

```
demfirat/
├── prisma/
│   ├── schema.prisma          # Veritabanı şeması
│   └── migrations/            # Migration dosyaları
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── [locale]/          # Çok dilli route'lar
│   │   │   ├── about/         # Hakkımızda sayfası
│   │   │   ├── blogs/         # Blog sayfası
│   │   │   ├── contact/       # İletişim sayfası
│   │   │   ├── dashboard/     # Admin/Dashboard
│   │   │   ├── order/         # Sipariş detayları
│   │   │   ├── product/       # Ürün sayfaları
│   │   │   │   ├── [product_category]/
│   │   │   │   │   ├── [product_sku]/  # Ürün detay sayfası
│   │   │   │   │   └── page.tsx
│   │   │   │   └── fabrics/embroidery/
│   │   │   ├── layout.tsx     # Root layout
│   │   │   └── page.tsx       # Ana sayfa
│   │   └── api/
│   │       ├── auth/[...nextauth]/  # NextAuth API route
│   │       └── generate-pdf/        # PDF oluşturma API
│   ├── components/
│   │   ├── AutoSlider.tsx
│   │   ├── ClientTestimonials.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   ├── HeroVideo.tsx
│   │   ├── LocaleSwitcher.tsx
│   │   ├── Menu.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetailCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductShowcase.tsx
│   │   └── Spinner.tsx
│   ├── lib/
│   │   ├── functions.ts       # Yardımcı fonksiyonlar
│   │   ├── interfaces.ts      # TypeScript interface'leri
│   │   ├── prisma.ts          # Prisma client instance
│   │   └── googleAnalytics.tsx
│   ├── utils/
│   │   └── authOptions.ts     # NextAuth yapılandırması
│   ├── middleware.ts          # Next.js middleware (i18n routing)
│   └── i18n.ts                # i18n yapılandırması
├── messages/
│   ├── en.json                # İngilizce çeviriler
│   ├── ru.json                # Rusça çeviriler
│   ├── pl.json                # Lehçe çeviriler
│   └── tr.json                # Türkçe çeviriler
├── public/
│   └── media/                 # Statik medya dosyaları
├── .env                       # Çevre değişkenleri
├── next.config.js             # Next.js yapılandırması
├── tailwind.config.ts         # Tailwind yapılandırması
├── tsconfig.json              # TypeScript yapılandırması
├── package.json               # Bağımlılıklar
├── todo.txt                   # Yapılacaklar listesi
├── Notes.txt                  # Geliştirici notları
└── designNotes.txt            # Tasarım notları
```

---

## 🗄️ Veritabanı Şeması

### Ana Modeller

#### User (NextJS Authentication)
```prisma
model User {
  id       Int     @id @default(autoincrement())
  username String  @unique
  email    String  @unique
  password String  # bcrypt hashed
  name     String?
}
```

#### Django Modelleri (CRM & Accounting)
Proje, Django backend ile entegre çalışıyor. Prisma şeması aşağıdaki modülleri içeriyor:

**CRM Modülleri:**
- `crm_company` - Şirket bilgileri
- `crm_contact` - İletişim/Müşteri bilgileri
- `crm_note` - Notlar
- `crm_supplier` - Tedarikçi bilgileri
- `todo_task` - Görevler

**Marketing Modülleri:**
- `marketing_product` - Ürünler
- `marketing_productcategory` - Ürün kategorileri
- `marketing_productcollection` - Ürün koleksiyonları
- `marketing_productvariant` - Ürün varyantları
- `marketing_productfile` - Ürün görselleri
- `marketing_productvariantattribute` - Varyant özellikleri (renk, beden vs.)

**Accounting Modülleri:**
- `accounting_book` - Muhasebe defterleri
- `accounting_assetcash` - Nakit varlıklar
- `accounting_assetinventorygood` - Stok (Bitmiş ürün)
- `accounting_assetinventoryrawmaterial` - Hammadde stoğu
- `accounting_invoice` - Faturalar
- `accounting_equityrevenue` - Gelirler
- `accounting_equityexpense` - Giderler
- `accounting_transaction` - Işlemler

**Auth Modülleri** (Django standart):
- `auth_user`
- `auth_group`
- `auth_permission`

---

## 🔐 Kimlik Doğrulama (Authentication)

### NextAuth.js Yapılandırması

**Provider**: Credentials Provider (Kullanıcı adı/şifre)

**Flow**:
1. Kullanıcı username + password girer
2. Prisma ile veritabanından kullanıcı sorgulanır
3. bcrypt ile şifre doğrulanır
4. JWT token oluşturulur
5. Session cookie'ye kaydedilir

**Korumalı Route'lar**:
- `/dashboard`
- `/app/*`
- `/products/*`

**Dosyalar**:
- Auth config: `src/utils/authOptions.ts`
- API route: `src/app/api/auth/[...nextauth]/route.ts`
- Middleware: `src/middleware.ts`

---

## 🌍 Çok Dil Desteği (i18n)

### Yapılandırma

**Default Locale**: `en` (İngilizce)

**Middleware Routing**:
```typescript
locales: ['en','ru','pl','tr']
defaultLocale: 'en'
localePrefix: 'as-needed'
```

**URL Örnekleri**:
- `/` → İngilizce (default)
- `/tr/product` → Türkçe
- `/ru/about` → Rusça
- `/pl/contact` → Lehçe

### Çeviri Dosyaları

Her dil için JSON dosyası (`messages/{locale}.json`):
- `Header` - Başlık metinleri
- `Menu` - Menü öğeleri
- `Products` - Ürün sayfası metinleri
- `AboutUsPage` - Hakkımızda sayfası
- `ContactPage` - İletişim sayfası
- `FooterPage` - Footer metinleri

**Kullanım**:
```typescript
import { getTranslations } from 'next-intl/server';

const t = await getTranslations({ locale, namespace: 'Menu' });
const homeText = t('Home');
```

---

## 🛍️ Ürün Yönetimi

### Ürün Akışı

1. **Kategori Listesi** → `/product`
   - Django API'den kategoriler çekilir
   - Grid layout ile gösterilir

2. **Kategori Sayfası** → `/product/[product_category]`
   - Kategoriye ait ürünler listelenir
   - Filtreleme ve arama özellikleri

3. **Ürün Detay** → `/product/[product_category]/[product_sku]`
   - Ürün bilgileri (title, description, tags)
   - Varyantlar (renk, beden, desen)
   - Görseller (gallery)
   - PDF katalog indirme

### PDF Katalog Oluşturma

**API Endpoint**: `/api/generate-pdf`

**Özellikler**:
- SKU'ya göre ürün bilgileri
- Ürün görseli
- Varyant bilgileri
- Şirket logosu ve iletişim bilgileri
- Türkçe karakter desteği (ASCII'ye çevrilerek)

**Kullanım**:
```
GET /api/generate-pdf?sku=12345&title=Product%20Name&image=https://...
```

---

## 🎨 UI/UX Özellikleri

### Ana Sayfa Bileşenleri

1. **HeroVideo** - Video hero section
2. **ProductShowcase** - Ürün vitrin bölümü
3. **AutoSlider** - Otomatik slider (fabrika görselleri)
4. **ClientTestimonials** - Müşteri yorumları

### Responsive Design
- Mobile-first yaklaşım
- Tailwind breakpoints
- CSS Grid & Flexbox

### Tema
- **Ana Renk**: Gold (#c9a961)
- **Koyu Renk**: #2c2c2c
- **Gri Tonları**: #666666, #e0dcd2

---

## 🚀 Komutlar

### Development
```bash
npm run dev        # Port 3000'de dev server (Turbopack ile)
npm run build      # Production build (Prisma generate + Next build)
npm run start      # Production server
npm run lint       # ESLint çalıştır
```

### Prisma
```bash
npx prisma generate                    # Prisma client oluştur
npx prisma migrate dev --name init     # Migration oluştur
npx prisma db seed                     # Seed data ekle
npx prisma db pull                     # Mevcut DB'den şema çek
npx prisma db push                     # Şemayı DB'ye push et
npx prisma studio                      # Prisma Studio aç
```

---

## 🔧 Çevre Değişkenleri (.env)

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=bfd4b5187c2fc72b42270150e879e546

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.eyzefiawzpxtwzqymyph:***@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.eyzefiawzpxtwzqymyph:***@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"

# Django API
NEJUM_API_URL="http://127.0.0.1:8000/"
NEXT_PUBLIC_NEJUM_API_URL="http://127.0.0.1:8000"

# Other
NODE_PATH=/src/app/[locale]
```

---

## 📝 TODO & Notlar

### Yapılacaklar (todo.txt)
- ✅ Çok dilli URL yapısı
- ✅ PDF katalog oluşturma
- ⏳ Blog modülü ekleme
- ⏳ Instagram entegrasyonu (stories)
- ⏳ Email newsletter
- ⏳ Favori ürünler sistemi
- ⏳ SEO optimizasyonu (next/image)
- ⏳ Google Analytics entegrasyonu
- ⏳ Rusya için www.karven.ru yönlendirmesi

### Bilinen Sorunlar (designNotes.txt)
- Bazı ürünlerde (24654, 24655, 24891) duplike kayıtlar var
- Bazı desenlerin fotoğrafları yok (24768, 24770, 12915 vb.)

### Geliştirici Notları (Notes.txt)
- Prisma migration workflow
- JSON-server kullanımı
- NextAuth session yönetimi
- Middleware kullanımı

---

## 🌐 Deployment

### Önerilen Platform
**Vercel** (Next.js'in yaratıcısı)

### Build Adımları
1. `npm run build` - Prisma client oluşturur + Next.js build
2. Environment variables set et
3. Database connection string doğrula
4. Deploy

### Image Hosting
- Cloudinary (configured in next.config.js)
- Local development için localhost:3000

---

## 👥 Şirket Bilgileri

**Şirket Adı**: Dem Fırat Karven Tekstil  
**Kuruluş**: 1991, İstanbul  
**Fabrika**: 60,000 SF, İstanbul yakınları  
**Üretim Kapasitesi**: 20 milyon yard/ay  
**Ürün Kategorileri**:
- Nakışlı tül perde kumaşları
- Upholstery (döşemelik) kumaşlar
- Nevresim takımları
- Yatak örtüleri
- Havlu setleri
- Masa örtüleri

**İletişim**:
- Website: www.demfirat.com
- Email: hello@demfirat.com
- Tel: +90 (282) 675-1552
- Adres: Vakıflar OSB Mah D100 Cad No 38, Ergene, Tekirdağ 59930, Türkiye

**Showroom Lokasyonları**:
- İstanbul, Türkiye
- Moskova, Rusya

---

## 📊 Teknik Detaylar

### Next.js Config Highlights
```javascript
// Server-only packages (Prisma, bcrypt)
serverExternalPackages: ["@prisma/client", "bcrypt"]

// Image domains
remotePatterns: [
  'res.cloudinary.com',
  'localhost',
  'app.nejum.com'
]

// i18n plugin
withNextIntl('./src/i18n.ts')
```

### TypeScript Config
- Target: ES2015
- Strict mode: enabled
- Path alias: `@/*` → `./src/*`

### CSS/Styling Yaklaşımı
- Global styles: `globals.css`
- Component-level: CSS Modules (`.module.css`)
- Utility-first: Tailwind CSS
- Preprocessor: Sass/SCSS

---

## 🔍 Arama & SEO

### Meta Tags
```typescript
title: "DEMFIRAT KARVEN | Home Collection"
description: "Your premium home textiles provider."
```

### Google Analytics
`src/lib/googleAnalytics.tsx` üzerinden entegre edilmiş

---

## 🤝 Katkıda Bulunma

Proje şu an aktif geliştirme aşamasında. TODO listesindeki görevler için katkı yapılabilir.

---

## 📄 Lisans

Tüm hakları saklıdır © Dem Fırat Karven Tekstil

---

**Son Güncelleme**: 2025-10-20  
**Versiyon**: 0.1.0  
**Geliştirici**: Enes (Founder's son)
