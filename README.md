# Poseidon Akvaryum

**Müşteri demosu için Supabase gerekmez.** Proje varsayılan olarak veritabanından bağımsız tanıtım modunda açılır. Mevcut ürünler/görseller projeye dahildir. [GitHub → Vercel demo rehberi](docs/DEMO.md). Kalıcı admin ve sipariş işlemleri için `APP_MODE=live` ile [Supabase kurulumu](docs/VERCEL.md) açılır.

Küçük işletme için çok sayfalı e-ticaret mağazası. Next.js App Router, React, TypeScript, Tailwind CSS ve yerelde SQLite, Vercel’de Supabase PostgreSQL ve Supabase Storage kullanır. Manrope ve Cormorant Garamond fontları yerel paketlerden sunulur.

## Başlatma

Node.js 24 veya üzeri gerekir.

```bash
npm install
npm run dev
```

Mağaza: http://127.0.0.1:3000 · Yönetim: http://127.0.0.1:3000/admin

Bu kurulumdaki yönetici şifresi `.env.local` dosyasının `ADMIN_PASSWORD` alanındadır. Başka ortamda `.env.example` dosyasını `.env.local` olarak kopyalayın; güçlü bir yönetici şifresi ve en az 32 karakterlik rastgele `SESSION_SECRET` tanımlayın. Gizli değerler Git'e dahil edilmez.

## Sayfalar

- `/`: Ana sayfa ve koleksiyon vitrini.
- `/urunler`: Arama, kategori ve fiyat sıralaması.
- `/urunler/[id]`: Ürün açıklaması, stok, adet seçimi, sepete ekleme, hemen satın alma, teslimat bilgileri ve ilgili ürünler.
- `/sepet`: Kalıcı sepet, adet güncelleme, ürün kaldırma ve sipariş özeti.
- `/odeme`: Misafir alışverişi; iletişim ve adres, kargo veya mağazadan teslim, bireysel / kurumsal fatura, havale veya demo kart seçimi.
- `/siparis/[token]`: Tahmin edilemez bağlantıyla sipariş sonucu, kalemler, banka bilgileri ve durum.
- `/siparis-takibi`: Sipariş numarası ve e-posta eşleştirmesiyle sorgulama.
- `/hakkimizda`, `/iletisim`, `/rehber`, `/rehber/[slug]`, `/sss`.
- `/odeme-bilgileri`, `/teslimat-iade`, `/gizlilik`, `/mesafeli-satis`.

Mağaza alışveriş akışı popup kullanmaz. Admin ürün düzenleme ve sipariş detayında yardımcı dialoglar kullanılır.

## Yönetim paneli

- Ürün ekleme, düzenleme, silme; fiyat, stok, etiket ve öne çıkarma yönetimi.
- Siparişler, ödeme durumu, havale onayı ve sipariş durumu güncelleme.
- Düşük stok takibi ve yalnızca onaylanan havalelerden hesaplanan tutar. Demo kart işlemleri gerçek ciro sayılmaz.
- Kategori bazında ürün listesi.
- İletişim formundan gelen mesajları okuma ve okundu işaretleme. E-posta bağlantısı kullanıcının e-posta uygulamasını açar; sistem otomatik mesaj göndermez.
- **Mağaza & ödeme:** Telefon, e-posta, adres, saatler, Instagram; banka adı, hesap sahibi, Türkiye IBAN'ı; havale açma / kapama; demo ödeme açma / kapama; kargo ücreti, ücretsiz kargo eşiği ve teslimat yöntemleri.

Havale varsayılan olarak kapalıdır. Kendi banka bilgilerinizi panelden kaydedip açın. IBAN uzunluğu ve kontrol basamakları doğrulanır. En az bir teslimat seçeneği açık kalmalıdır. Ücretsiz kargo eşiği 0 olduğunda ücretsiz kargo kampanyası uygulanmaz.

## Ödeme davranışı

### Havale / EFT

Sipariş oluşturulunca banka bilgileri siparişe kopyalanır ve sipariş `Ödeme bekleniyor` durumuna geçer. Sonraki banka ayarı değişiklikleri eski siparişin banka bilgisini değiştirmez. Müşteri havale açıklamasına sipariş numarasını yazar. Admin sipariş detayında **Havaleyi onayla** ile ödemeyi doğrular; ardından hazırlama ve teslimat durumlarını ilerletebilir. Banka hesabı hareketleri otomatik okunmaz.

### Online ödeme demosu

Gerçek POS entegrasyonu yoktur. Kart alanları yalnızca tarayıcıda değerlendirilir; kart numarası, son kullanma tarihi ve CVC sipariş API'sine gönderilmez veya veritabanına kaydedilmez. Gerçek kart bilgileri kullanılmamalıdır.

- Başarılı test: `4242 4242 4242 4242`, gelecekteki tarih, CVC `123`.
- Reddedilme testi: `4000 0000 0000 0002`.
- Sipariş ödeme durumu: **Demo ödeme tamamlandı**. Gerçek para tahsil edilmez.

POS sağlayıcısı sonraki aşamada seçilip entegre edilecektir. `src/lib/payments.ts` sağlayıcı arayüzünü tanımlar. Canlı bağlantıda sunucuda ödeme oturumu oluşturma, güvenli yönlendirme, imzalı bildirim doğrulama, tutar / para birimi kontrolü, tekrar eden bildirim koruması, başarısızlık, iade ve canlı ortam testleri uygulanmalıdır. Demo durumu gerçek ödeme onayına dönüştürülmemelidir.

## Stok ve sipariş güvenliği

Siparişin fiyatı, kargosu ve toplamı sunucuda güncel katalog / ayarlardan hesaplanır. Aynı ürüne ait sepet satırları birleştirilir. Stok veritabanı işlemi içinde kontrol edilip sipariş oluşturulduğunda ayrılır; eşzamanlı siparişler stoğu aşamaz. Tarayıcı tutarları güvenilir kabul edilmez.

Tekrar gönderilen aynı sipariş anahtarı yeni sipariş veya ikinci stok düşüşü oluşturmaz. İptalde stok yalnızca bir kez geri eklenir. İptal edilmiş sipariş yeniden açılamaz. Teslimata çıkan veya teslim edilen siparişler doğrudan iptal edilerek stoğa eklenmez; önce mağazada iade değerlendirilmelidir. Ödeme alınmış havalenin iptali otomatik banka iadesi yapmaz.

Havale siparişleri admin onayı veya iptaline kadar stok ayırır; otomatik süre dolumu yoktur. Canlı içeren sepetlerde yalnızca mağazadan teslim kullanılabilir. Demo siparişler de akışın test edilmesi için stok ayırır; denemeden sonra admin üzerinden iptal edilebilir.

## Veri ve dağıtım

`DATABASE_PATH` varsayılanı `./data/poseidon.sqlite` dosyasıdır. Ürünler, siparişler, ayarlar ve iletişim mesajları kalıcıdır. İlk açılışta örnek ürünler bir kez yüklenir; panel değişikliklerinin üzerine yazılmaz. Önceki sürümdeki talep kayıtları korunur.

```bash
npm run build
npm start
```

Vercel kurulumu için [adım adım Supabase + Vercel rehberini](docs/VERCEL.md) izleyin. `DATABASE_URL` tanımlandığında ortak PostgreSQL kullanılır; görseller Supabase Storage’da saklanır. Bu değişken yoksa yerelde mevcut SQLite dosyası kullanılır. Vercel’de bağlantısız yerel disk modu engellenir. Düzenli yedekleme gereklidir.

Üretimde HTTPS kullanın. Yönetici oturumu imzalı, HTTP-only, SameSite=Strict çerezle korunur ve 8 saat geçerlidir. Üretimde çerez Secure olur. Proxy arkasında `APP_ORIGIN=https://alanadiniz.com` tanımlayın ve Host başlığını doğru iletin. Oturum anahtarı değiştiğinde mevcut oturumlar geçersiz olur. Giriş, sipariş, mesaj ve takip uçlarında temel sunucu sınırları bulunur; canlı trafikte güvenilir proxy katmanında ek koruma planlanabilir.

Sipariş sonucu bağlantısını gizli tutun; bu bağlantı sipariş detaylarına erişim sağlar. Takip formu sipariş numarası ile tam e-posta eşleşmesi ister. İletişim formu kayıtları yalnızca yetkili admine açıktır.

## Yayına hazırlanırken

- Gerçek ürün fotoğrafları, fiyatlar ve stoklar admin üzerinden girilmelidir. Örnek içerikler sitede işaretlidir. Ürün fotoğrafı alanı sürükle-bırak ve cihazdan yükleme destekler. JPG, PNG, WebP ve AVIF kaynak dosyaları (en fazla 10 MB) tarayıcıda küçültülür; sunucuya en fazla 4 MB gönderilir. Dosyalar ayrıca sunucuda doğrulanır, yönleri düzeltilir, metaverileri temizlenir ve en fazla 1800 piksele küçültülerek WebP olarak saklanır. URL ile ekleme gelişmiş seçenek olarak kapalı bir bölümde kalır.
- Firma bilgileri, banka bilgileri ve teslimat koşulları panelden tamamlanmalıdır.
- Gizlilik ve satış koşulları sayfaları firmanın resmi unvanı, adresi ve gerçek süreçlerine uyarlanmalıdır. Yayına hazırlık notları tamamlandıktan sonra kaldırılmalıdır.
- SMTP / SMS servisi bağlı değildir; sipariş ve iletişim kayıtları admin panelinde takip edilir.
- Gerçek POS bağlı değildir. Demo kartla tahsilat yapılmaz.
- Arama motoru indekslemesi gerçek içerik ve alan adı tamamlanana kadar kapalıdır (`src/app/layout.tsx`). Canlı yayında canonical, sitemap, robots ve sosyal paylaşım bilgileri tamamlanmalıdır.

## Görseller

Ana akvaryum görseli proje için Imagegen ile üretilmiştir. Kaynak `public/images/aquascape-hero.png`, kullanılan optimize sürüm `public/images/aquascape-hero.webp` dosyasıdır. Ürün çizimleri temsilidir. Betta, palyaço balığı ve mercan fotoğrafları Unsplash kaynaklı yerel kopyalardır (görsel kimlikleri: `photo-1544943910-4c1dc44aab44`, `photo-1535591273668-578e31182c4f`, `photo-1546026423-cc4642628d2b`).

## Kontroller

```bash
npm run typecheck
npm run build
npm test
npm run format
```

Testler üretim derlemesini 3101 portunda geçici SQLite veritabanıyla başlatır. Ayrıca PostgreSQL sorguları PGlite motorunda ve Supabase Storage istemcisi izole bir HTTP depolama sunucusuyla doğrulanır. Gerçek Supabase bağlantısı için `npm run cloud:check` ayrı çalıştırılır. Sayfalar, yetkilendirme, ayar doğrulama, ürün güncelleme, ödeme / teslimat kuralları, sunucuda fiyat, stok rezervasyonu, tekrar gönderim, eşzamanlı stok, havale onayı, iptal, sipariş takibi ve iletişim mesajları doğrulanır. Test verileri gerçek mağaza veritabanından ayrıdır.

## Fotoğraf depolaması ve mağaza iletişimi

Yüklenen fotoğraflar varsayılan olarak SQLite dosyasının yanındaki `uploads/` klasöründe saklanır ve `/api/media/[dosya]` üzerinden sunulur. `UPLOADS_PATH` ile ayrı bir kalıcı klasör seçilebilir. Veritabanıyla birlikte bu klasörü de yedekleyin. Yalnızca giriş yapmış admin fotoğraf yükleyebilir. Yükleme SVG veya çalıştırılabilir içerik kabul etmez; gerçek görsel türü çözümlenerek kontrol edilir.

Mağaza adresi ve telefon / WhatsApp bilgisi admin ayarlarından düzenlenir. Verilen Pamukkale adresi ve +90 551 859 49 01 numarası uygulanmıştır. Ana sayfada ve iletişim sayfasında Google Haritalar yer alır. WhatsApp bağlantıları ve yol tarifleri bu ayarlardan üretilir. Mobilde cam efektli Ara / WhatsApp / Konuma git / Sepetim çubuğu bulunur; form yazılırken klavyeye yer bırakmak için gizlenir.

Hareketli görseller, kart geçişleri ve cam yüzeyler azaltılmış hareket tercihine saygı gösterir; cam efekti desteklenmeyen tarayıcılarda opak arka plan kullanılır.

Ana marka rengi `#123462` olarak uygulanmıştır. Temel palet `src/app/palette.css` içinde; yüzey, tipografi ve cam efektleri `src/app/refinement.css` içinde yönetilir.

Canlı arama: Header ve mobil menüde yazdıkça ürün görseli, fiyatı ve stok bilgisi gösterilir. Türkçe karakterler normalize edilir; ok tuşları/Enter ile sonuç seçilebilir. Sonuç sayfası aynı eşleştirme işlevini kullanır (`src/lib/search.ts`).

Resmî logo: `public/images/logo.jpg` kaynak dosyası korunur; site `public/images/poseidon-logo.png` transparan, kırpılmış sürümünü kullanır. Imagegen yerleşik düzenleme aracıyla kullanılan son talep: orijinal balık ve DENİZLİ POSEİDON AKVARYUM yazı düzenini koru, mavi arka planı transparan yap, beyaz şekilleri #123462 laciverte dönüştür, gölge/parlama ekleme. Koyu yüzeylerde CSS filtresiyle beyaz gösterilir.

Ana sayfa düzeni: ürünler → kampanya → kategoriler. Kampanya görünürlüğü, üst etiketi, başlığı, açıklaması, buton metni/bağlantısı ve yüklenebilir görseli yönetim panelindeki **Mağaza & ödeme → Ana sayfa kampanyası** bölümünden düzenlenir. Buton site içi bağlantıları destekler; kampanya fiyat indirimi uygulamaz, indirimler ürün fiyatından yönetilir.

Header’da kategori menüsü ve kutulu WhatsApp danışma bağlantısı bulunur. Üst banttaki ücretsiz kargo mesajı, teslimat ayarlarının `freeShippingThreshold` değerini kullanır; kargo kapatılırsa veya eşik 0 yapılırsa gizlenir. Başlangıç eşiği 1.500 TL’dir ve mevcut sunucu hesabında bu tutar ve üzerinde uygulanır. Yeni düzenin stilleri `src/app/commerce-refresh.css` içindedir.
