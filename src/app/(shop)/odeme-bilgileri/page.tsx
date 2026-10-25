import Link from "next/link";
import { Landmark, CreditCard, ArrowUpRight, ShieldCheck } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { Breadcrumb, PageHeading } from "@/components/shop-shell";
export const metadata = { title: "Ödeme seçenekleri" };
export default async function Page() {
  const s = await getSettings();
  return (
    <main className="shell support-page">
      <Breadcrumb items={[{ label: "Ödeme seçenekleri" }]} />
      <PageHeading
        eyebrow="AÇIK, ANLAŞILIR BİR ALIŞVERİŞ"
        title="Size uygun bir ödeme yolu."
        description="Siparişinize başlamadan önce seçenekleri birlikte inceleyelim."
      />
      <div className="payment-info-grid">
        <section>
          <Landmark size={30} />
          <span className="status-badge status-done">
            {s.bankEnabled ? "Kullanılabilir" : "Henüz açılmadı"}
          </span>
          <h2>Havale / EFT</h2>
          <p>
            Siparişinizi oluşturun, sonuç sayfasındaki banka bilgilerini
            kullanarak ödeme yapın. Açıklamaya sipariş numaranızı yazın.
          </p>
          {s.bankEnabled && (
            <dl>
              <div>
                <dt>Banka</dt>
                <dd>{s.bankName}</dd>
              </div>
              <div>
                <dt>Hesap sahibi</dt>
                <dd>{s.accountName}</dd>
              </div>
              <div>
                <dt>IBAN</dt>
                <dd>{s.iban.replace(/(.{4})/g, "$1 ").trim()}</dd>
              </div>
            </dl>
          )}
          <small>
            Mağaza ödemeyi kontrol ettikten sonra siparişinizi onaylar.
          </small>
        </section>
        <section>
          <CreditCard size={30} />
          <span className="status-badge status-pending">Demo</span>
          <h2>Online ödeme</h2>
          <p>
            Ödeme sayfasındaki kart alanı test içindir. Gerçek tahsilat
            yapılmaz; kart bilgileri sunucuya gönderilmez veya saklanmaz.
          </p>
          <div className="demo-test-number">4242 4242 4242 4242</div>
          <p>
            Gelecekteki bir son kullanma tarihi ve CVC olarak 123 ile test
            edebilirsiniz. Gerçek kart bilgilerinizi kullanmayın.
          </p>
          <small>
            Sanal POS entegrasyonu tamamlandığında gerçek kartla ödeme
            açılacaktır.
          </small>
        </section>
      </div>
      <div className="support-bottom">
        <div>
          <h2>Her adımda yanınızdayız.</h2>
          <p>Ödeme hakkında sorunuz varsa bize ulaşın.</p>
        </div>
        <Link className="button dark" href="/iletisim">
          Bize ulaşın <ArrowUpRight size={17} />
        </Link>
      </div>
    </main>
  );
}
