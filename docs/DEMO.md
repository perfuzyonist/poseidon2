# Supabase olmadan müşteri demosu

Proje varsayılan olarak **tanıtım modunda** açılır. Supabase hesabı veya bağlantı anahtarı gerekmez. Girilmiş hatalı Supabase değişkenleri bu modda kullanılmaz.

## Bilgisayarda

```bash
npm install
npm run dev
```

http://127.0.0.1:3000 adresini açın. `.env.local` dosyasında `APP_MODE=live` varsa `APP_MODE=demo` yapın. Diğer anahtarları silmeniz gerekmez.

## GitHub → Vercel

1. Proje kaynaklarını GitHub deposuna gönderin. `public/`, `src/`, `package.json`, `package-lock.json` ve yapılandırma dosyaları dahil olmalı. `.env.local`, `data`, `node_modules` ve `.next` klasörleri Git dışında kalmalıdır; `.gitignore` bunu sağlar.
2. Vercel'de **Add New → Project → Import Git Repository** ile depoyu seçin.
3. **Framework: Next.js**, **Node.js: 24.x**, **Build Command: npm run build** ayarlarıyla **Deploy** seçin. Output Directory ve diğer Next.js ayarlarını varsayılan bırakın. Bu demo için ortam değişkeni gerekmez. Daha önceden `APP_MODE=live` eklediyseniz `demo` yapıp yeniden dağıtın.

Vercel'in verdiği bağlantıyı müşteriye gönderebilirsiniz. GitHub güncellemeleri aynı proje üzerinden yeniden dağıtılır.

## Demoda neler var?

- Mevcut ürünler, detay sayfaları, arama ve kategoriler.
- Mevcut kampanya, işletme bilgileri, logo ve görseller. Son yüklenmiş kampanya görseli de `public/images/` içine kopyalanmıştır.
- Tarayıcıda çalışan sepet ve ödeme ekranı önizlemesi.
- `/admin` üzerinden şifresiz, **salt okunur** yönetim paneli önizlemesi.
- WhatsApp, konum, harita ve bilgi sayfaları.

Kalıcı admin değişiklikleri, yeni fotoğraf yükleme, form gönderme ve sipariş oluşturma bu modda kapalıdır; ekranlarda açıklama bulunur. Gerçek müşteri, sipariş, mesaj, banka ve oturum bilgileri demoya dahil edilmez. Bir ziyaretçinin form değişiklikleri diğer ziyaretçileri etkilemez ve kaydedilmez.

## Vitrini daha sonra güncellemek

Demo vitrini `src/lib/demo-data.json` dosyasından okunur. Metin/fiyatları buradan ve görselleri `public/images/` altından güncelleyip GitHub'a gönderebilirsiniz. Yerel SQLite ile çalışan asıl paneldeki güncel vitrini tekrar almak için:

```bash
npm run demo:export
```

Bu komut yerel SQLite dosyasını salt okunur açar; sadece yayımlanacak ürünleri, işletme/kampanya ayarlarını ve kullanılan görselleri dışa aktarır. Buluta bağlanmaz; özel kayıtları kopyalamaz. Vercel derlemesinde çalıştırmayın; çıktı dosyaları zaten projeye dahildir.

Kalıcı kayıtlarla gerçek kullanım gerektiğinde `APP_MODE=live` ile ayrı veri altyapısı açılır. [Supabase rehberi](VERCEL.md) bu sonraki aşama içindir; müşteri demosu için gerekli değildir.
