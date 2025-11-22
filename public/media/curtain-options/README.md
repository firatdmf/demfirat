# Perde Seçenekleri Resimleri

Bu klasör, "Perde Diktir" (Custom Curtain) özelliği için gerekli resim dosyalarını içerir.

## 📋 Gerekli Resimler

### Montaj Tipleri (Mounting Types)
1. **cornice-mounting.jpg** - Korniş montaj (Cornice)
2. **rustic-mounting.jpg** - Rustik montaj (Rustic/Country style)

### Pile Tipleri (Pleat Types)
1. **pleat-flat.jpg** - Yatık Pile (Flat Pleat)
2. **pleat-kanun.jpg** - Kanun Pile (Pencil Pleat)
3. **pleat-pipe.jpg** - Boru Pile (Pipe/Tube Pleat)
4. **pleat-water-wave.jpg** - Su Dalgası (Water Wave)
5. **pleat-american.jpg** - Amerikan Pile (American Pleat)
6. **pleat-extrafor.jpg** - Extrafor Pile (Extrafor/Goblet Pleat)

### Placeholder (Opsiyonel)
- **placeholder-curtain.jpg** - Resim yüklenmediğinde gösterilecek varsayılan resim

## 📐 Resim Özellikleri

### Önerilen Boyutlar
- **Aspect Ratio**: 4:3 (Örnek: 800x600px veya 1200x900px)
- **Format**: JPG veya WEBP
- **Maksimum Boyut**: 500KB (optimize edilmiş)
- **Kalite**: Yüksek kalite ama optimize edilmiş

### Resim İçeriği Önerileri
- Açık, net fotoğraflar
- İyi aydınlatma
- Pile/montaj tipinin net görünmesi
- Beyaz veya nötr arka plan
- Profesyonel çekim

## 🎨 Tasarım Notları

### Montaj Tipleri
- **Cornice**: Korniş ile montaj görseli
- **Rustic**: Rustik/köy tarzı montaj görseli

### Pile Tipleri
- **Flat (Yatık)**: Düz/yatık pile görseli
- **Kanun**: Kalem pile görseli (dar büzgüler)
- **Pipe**: Boru pile görseli (silindirik büzgüler)
- **Water Wave**: Su dalgası efekti görseli
- **American**: Amerikan pile görseli (derin kıvrımlar)
- **Extrafor**: Goblet/bardak pile görseli

## 🔧 Teknik Detaylar

### Fallback Mekanizması
Eğer bir resim yüklenmezse, otomatik olarak `placeholder-curtain.jpg` gösterilir.

### Responsive Davranış
- **Desktop**: 2 sütun grid (yan yana)
- **Tablet**: 1 sütun (resimler soldaki küçük preview)
- **Mobile**: 1 sütun (daha küçük resimler)

## 📝 Kullanım

Resimleri bu klasöre yukarıdaki isimlerle kaydedin. Sistem otomatik olarak bu resimleri kullanacaktır.

### Örnek Dosya Yapısı:
```
curtain-options/
├── README.md (bu dosya)
├── cornice-mounting.jpg
├── rustic-mounting.jpg
├── pleat-flat.jpg
├── pleat-kanun.jpg
├── pleat-pipe.jpg
├── pleat-water-wave.jpg
├── pleat-american.jpg
├── pleat-extrafor.jpg
└── placeholder-curtain.jpg
```

## ⚠️ Önemli Notlar

1. Resim isimleri değiştirilmemelidir
2. Tüm resimlerin boyutları benzer olmalıdır
3. Resimler optimize edilmelidir (hız için)
4. Yüksek çözünürlüklü versiyonlar tercih edilmelidir
5. Alt text için anlamlı isimler kullanılmıştır

---

**Son Güncelleme**: 21 Kasım 2025
