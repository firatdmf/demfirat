# Google OAuth Setup Guide

## 🔐 Google Cloud Console'da OAuth Credentials Oluşturma

### Adım 1: Google Cloud Console'a Git
1. [Google Cloud Console](https://console.cloud.google.com/) adresine git
2. Mevcut bir projeyi seç veya yeni proje oluştur

### Adım 2: OAuth Consent Screen Yapılandır
1. Sol menüden **APIs & Services** > **OAuth consent screen** seç
2. **External** seç ve **Create** tıkla
3. Gerekli bilgileri doldur:
   - App name: `DEMFIRAT KARVEN`
   - User support email: `info@demfirat.com`
   - Developer contact email: `info@demfirat.com`
4. **Save and Continue**

### Adım 3: OAuth Client ID Oluştur
1. Sol menüden **Credentials** seç
2. **+ CREATE CREDENTIALS** > **OAuth client ID** tıkla
3. Application type: **Web application**
4. Name: `Karven Web App`
5. **Authorized JavaScript origins** ekle:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`
6. **Authorized redirect URIs** ekle:
   - Development: `http://localhost:3000/api/auth/callback/google`
   - Production: `https://yourdomain.com/api/auth/callback/google`
7. **Create** tıkla

### Adım 4: Credentials'ı Kopyala
1. Client ID ve Client Secret'ı kopyala
2. `.env` dosyasına ekle:

```env
# Google OAuth
GOOGLE_OAUTH_CLIENT_ID=your_actual_client_id_here
GOOGLE_OAUTH_CLIENT_SECRET=your_actual_client_secret_here
```

### Adım 5: Test Et
1. Development server'ı başlat: `npm run dev`
2. Login sayfasına git: `http://localhost:3000/login`
3. "Continue with Google" butonuna tıkla
4. Google hesabınla giriş yap

## ⚠️ Önemli Notlar

- **Production'da**: 
  - OAuth consent screen'i **Published** olmalı
  - Authorized domains listesine domain eklenmiş olmalı
  - HTTPS kullanılmalı

- **Güvenlik**:
  - `.env` dosyasını asla commit etme
  - Client Secret'ı güvenli tut
  - Production'da farklı credentials kullan

## 🔄 Callback URL Formatı
```
[NEXTAUTH_URL]/api/auth/callback/google
```

Örnek:
- Dev: `http://localhost:3000/api/auth/callback/google`
- Prod: `https://karvenhome.com/api/auth/callback/google`

## 📚 Daha Fazla Bilgi
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
