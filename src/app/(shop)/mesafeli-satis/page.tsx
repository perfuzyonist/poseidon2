import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { Breadcrumb, PageHeading } from "@/components/shop-shell";
export const metadata = { title: "Ön bilgilendirme ve satış koşulları" };
export default async function Page() {
  const s = await getSettings();
  return (
    <main className="shell support-page">
      <Breadcrumb items={[{ label: "Satış koşulları" }]} />
      <PageHeading
        eyebrow="SİPARİŞTEN ÖNCE BİRLİKTE BAKALIM"
        title="Ön bilgilendirme & satış koşulları."
      />
      <article className="policy-prose">
        <h2>Mağaza bilgileri</h2>
        <p>
          {s.storeName}
          <br />
          {s.address || "Denizli, Türkiye"}
          <br />
          {s.phone}
          <br />
          {s.email}
        </p>
        <h2>Sipariş ve ücretler</h2>
        <p>
          Ürün adı, birim fiyat, adet, teslimat yöntemi ve varsa kargo ücreti
          siparişin tamamlanmasından önce ödeme özetinde gösterilir. Sipariş
          sonucu numaranız ve sipariş detaylarınızla birlikte kaydedilir.
          Katalogda örnek olarak işaretlenmiş içerikler gerçek satış açılmadan
          güncellenecektir.
        </p>
        <h2>Ödeme</h2>
        <p>
          Havale/EFT seçildiğinde sipariş ödeme bekler; mağaza havaleyi kontrol
          ederek onaylar. Online ödeme bu sürümde demodur ve gerçek tahsilat
          yapmaz. Havale bilgileri sipariş oluşturulduğu andaki haliyle sipariş
          kaydına eklenir.
        </p>
        <h2>Teslimat ve sipariş sonrası destek</h2>
        <p>
          Canlı içeren siparişlerde yalnızca mağazadan teslim kullanılabilir.
          İptal, teslimat veya iade başvuruları sipariş numarasıyla mağazaya
          iletilir. Bu sayfa yasal tüketici haklarını sınırlandırmaz. Ayrıntılar
          için <Link href="/teslimat-iade">teslimat ve iade</Link> sayfasını
          inceleyin.
        </p>
        <p className="policy-draft-note">
          Yayına hazırlık notu: Bu metin işletmenin unvanı, resmi adresi ve
          gerçek ticari koşullarıyla tamamlanmalıdır. Ürünler ve ödeme akışı şu
          anda örnek / demo içerikler barındırır.
        </p>
      </article>
    </main>
  );
}
