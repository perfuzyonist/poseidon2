# Vercel kalıcı veri kurulumu

**Yalnızca müşteriye demo gösterecekseniz bu kurulumu yapmayın.** Proje varsayılan olarak Supabase gerektirmeyen tanıtım modundadır. [GitHub → Vercel demo rehberini](DEMO.md) izleyin. Aşağıdaki adımlar kalıcı admin/sipariş işlemleri için `APP_MODE=live` içindir.

Bu sürüm Vercel'de **Supabase PostgreSQL + Supabase Storage** kullanır. SQLite ve yerel yüklemeler yalnızca yerel geliştirme için korunur. Vercel'de bağlantı eksikse uygulama geçici diske sessizce kayıt yapmaz.

## 1. Ücretsiz Supabase projesi

1. https://supabase.com/dashboard üzerinden ücretsiz bir proje oluşturun. Yakın bir Avrupa bölgesi seçin, veritabanı parolasını saklayın.
2. Proje hazır olduğunda **Connect → Transaction pooler** bağlantısını alın. `postgresql://postgres.PROJE:PAROLA@POOLER:6543/postgres` biçimindedir. Adres ve kullanıcı adını panelden aynen alın; tahmin ederek yazmayın. `[YOUR-PASSWORD]` yerine kendi parolanızı koyun. Paroladaki özel karakterleri URL kodlayın.
3. Proje ayarlarından **Project URL** ile **Secret key** veya Legacy bölümündeki **service_role** anahtarını alın. Publishable / anon anahtarı bu sunucu işlemleri için uygun değildir.
4. Projenin mevcut `.env.local` dosyasına ekleyin. Mevcut `ADMIN_PASSWORD` ve `SESSION_SECRET` değerlerini koruyun:

```dotenv
APP_MODE="live"
DATABASE_URL="postgresql://PANELDEN_ALINAN_BAGLANTI"
SUPABASE_URL="https://PROJE.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="SUNUCU_ANAHTARI"
SUPABASE_STORAGE_BUCKET="poseidon-images"
```

Bu değerlerin hiçbirine `NEXT_PUBLIC_` öneki eklemeyin. Veritabanı ve Storage erişimi yalnızca sunucudadır. `.env.local` dosyası Git'e ve Vercel kaynak yüklemesine dahil edilmez.

## 2. Tablolar ve görsel alanı

Node.js 24 ile proje klasöründe:

```bash
npm install
npm run cloud:setup
npm run cloud:check
```

`cloud:setup`, uygulamaya özel `poseidon` şemasını ve tabloları oluşturur, örnek ürünleri yalnızca ilk kurulumda ekler. Mevcut ürün, ayar ve siparişleri sıfırlamaz. Şema public Data API'ye açılmaz ve tablolarda RLS etkinleştirilir. Supabase SQL Editor / Table Editor'da tabloları görmek için `poseidon` şemasını seçin. Şemayı API'nin “Exposed schemas” listesine eklemeyin.

Görseller için **private** `poseidon-images` bucket oluşturulur. Ziyaretçiler yalnızca `/api/media/UUID.webp` adreslerinden ürün/kampanya görsellerini görüntüler. Yükleme admin oturumu ve aynı kaynak kontrolü gerektirir. Sunucu anahtarı tarayıcıya gönderilmez.

`cloud:check`, gerçek bulut bağlantısında geçici bir veritabanı işareti ve 2×2 piksellik kontrol görseli yazar, geri okur ve yalnızca kendi oluşturduğu kayıtları temizler. Şifre ve anahtarları çıktıya yazmaz. Bu kontrol sipariş oluşturmaz, stok veya mağaza ayarlarını değiştirmez.

TLS sertifika doğrulaması açıktır. Sertifika zinciri hatası olursa Supabase panelinin sunduğu CA sertifikasını `DATABASE_CA_CERT` değişkenine ekleyin; doğrulamayı kapatmayın.

## 3. Mevcut yerel vitrini aktarma (isteğe bağlı)

Yerelde düzenlediğiniz ürünleri, kampanya/mağaza ayarlarını ve kullanılan yüklenmiş görselleri taşımak için:

```bash
npm run cloud:migrate
```

Yerel SQLite dosyasını değiştirmez veya silmez. Varsayılan kaynak `DATABASE_PATH=./data/poseidon.sqlite` dosyasıdır. Kaynak görseller `UPLOADS_PATH` veya veritabanının yanındaki `uploads` klasöründen alınır. Eksik görsel varsa aktarım durur; bozuk bağlantı kaydedilmez. Aynı görsel yeniden aktarılacaksa içerik özeti doğrulanır. Bulutta sonradan düzenlenmiş ürünlerin ve mevcut mağaza ayarlarının üzerine yazılmaz; yalnızca ilk örnek ürünler yerel sürümleriyle güncellenir.

Siparişler ve iletişim mesajları müşteri bilgisi içerdiği için varsayılan aktarımın dışındadır. Bunları da bu Supabase projesine taşımayı istiyorsanız:

```bash
npm run cloud:migrate -- --include-orders
```

Mevcut sipariş kimlikleri, gizli sonuç bağlantıları ve durumları korunur. Aktarım siparişleri yeniden işlemez, yeniden stok düşmez ve e-posta göndermez. Test verisini gerçek müşteri verisinden ayrı tutun.

## 4. Vercel

Vercel'e kaynak deposunu aktarın veya Vercel CLI ile proje klasörünü dağıtın:

- Framework: **Next.js**
- Node.js: **24.x** (`package.json` ile sabitlenir)
- Build Command: `npm run build`
- Output Directory: Next.js varsayılanı; değiştirmeyin.
- Install Command: varsayılan `npm install` veya `npm ci`.

Vercel’de ayrıca `APP_MODE=live` tanımlayın; aksi halde tanıtım modu açık kalır.

**Settings → Environment Variables** bölümünde şu değerleri ekleyin. Production ve kullanacağınız Preview ortamlarını seçin:

| Değişken                    | Değer                                     |
| --------------------------- | ----------------------------------------- |
| `DATABASE_URL`              | Supabase Transaction pooler bağlantısı    |
| `SUPABASE_URL`              | Supabase proje adresi                     |
| `SUPABASE_SERVICE_ROLE_KEY` | Sunucu Secret / service_role anahtarı     |
| `SUPABASE_STORAGE_BUCKET`   | `poseidon-images`                         |
| `ADMIN_PASSWORD`            | Güçlü, demoya özel yönetici şifresi       |
| `SESSION_SECRET`            | En az 32 karakterlik rastgele gizli değer |

Bu değişkenleri sadece bilgisayardaki `.env.local` dosyasına eklemek Vercel'i yapılandırmaz. Vercel paneline de ekleyin ve değişikliklerden sonra yeniden dağıtın. `DATABASE_PATH` / `UPLOADS_PATH` Vercel'de kullanılmaz. `APP_ORIGIN` boş bırakılabilir; her Preview adresi kendi kaynağıyla doğrulanır. Özel alan adına sabitlemek isterseniz `https://alanadi` biçiminde, sonunda `/` olmadan tanımlayın.

Önizlemeler varsayılan olarak aynı Supabase projesini kullanır. Demo ürün/stok/siparişleri de ortaktır. Gerçek kullanıma geçerken ayrı bir proje ve anahtarlar kullanın.

## 5. Dağıtım sonrası kısa kontrol

1. Ana sayfa ve bir ürün detay sayfasını açın.
2. `/admin` üzerinden giriş yapın; bir demo ürünün fiyatını ve kampanya başlığını değiştirip kaydedin.
3. Ürün veya kampanya görseli yükleyin. Başka tarayıcıda ve yeni dağıtımdan sonra değişikliklerle görselin kaldığını doğrulayın.
4. Kargoya uygun ürün ekleyip demo kartı `4242 4242 4242 4242`, gelecekteki tarih ve CVC `123` ile bir test siparişi oluşturun. Gerçek kart kullanmayın.
5. Siparişi admin panelinde ve sipariş takip ekranında kontrol edin. İptal edip stoğun yalnızca bir kez geri geldiğini doğrulayın.
6. Havale kullanacaksanız panelden banka bilgilerini girip açın. Havale onayı manueldir. Gerçek POS bağlı değildir.

Fotoğraf seçimi 10 MB'a kadar desteklenir; tarayıcı görseli en fazla 1800 piksele küçültür. HTTP ile sunucuya gönderilen dosya 4 MB altında tutulur; sunucuda dosya türü ayrıca doğrulanıp metaverileri temizlenir. Bu, Vercel'in 4.5 MB istek sınırına uygun hazırlanmıştır.

## Ücretsiz planın sınırları

Supabase Free planında güncel olarak 500 MB veritabanı ve 1 GB dosya alanı bulunur. Bir hafta kullanılmayan ücretsiz projeler duraklatılabilir; demo öncesi panelden açık olduğunu kontrol edin. Kod ücretsiz plan seçimini veya sağlayıcı kotalarını değiştirmez; ücretli plan açmaz.

Kaynaklar: [Supabase fiyatlandırma](https://supabase.com/pricing), [veritabanı bağlantıları](https://supabase.com/docs/guides/database/connecting-to-postgres), [Vercel istek sınırı](https://vercel.com/docs/functions/limitations).
