import Link from "next/link";
import { Truck, Store, PackageCheck, ArrowUpRight } from "lucide-react";
import { getSettings } from "@/lib/settings";
import { money } from "@/lib/types";
import { Breadcrumb, PageHeading } from "@/components/shop-shell";
export const metadata = { title: "Teslimat ve iade" };
export default async function Page() {
  const s = await getSettings();
  return (
    <main className="shell support-page">
      <Breadcrumb items={[{ label: "Teslimat ve iade" }]} />
      <PageHeading
        eyebrow="HER PAKETTE BİRAZ ÖZEN"
        title="Size ulaşana kadar yanınızdayız."
        description="Teslimat seçenekleri ve sipariş sonrası destek."
      />
      <div className="delivery-info-grid">
        <section>
          <Truck size={27} />
          <h2>Adresinize teslimat</h2>
          <p>
            {s.shippingEnabled
              ? `Kargo ücreti ${money(s.shippingFee)}.${s.freeShippingThreshold > 0 ? ` ${money(s.freeShippingThreshold)} ve üzerindeki siparişlerde kargo ücretsizdir.` : ""}`
              : "Kargo seçeneği şu anda kapalıdır."}{" "}
            Siparişe uygulanacak son ücret ödeme özetinde gösterilir.
          </p>
          <p>
            Canlı içeren siparişler kargoya verilmez. Teslimat süresi ve kargo
            bilgisi için mağazayla iletişime geçebilirsiniz.
          </p>
        </section>
        <section>
          <Store size={27} />
          <h2>Mağazadan teslim</h2>
          <p>
            {s.pickupEnabled
              ? "Ürünlerinizi Denizli’de mağazamızdan ücretsiz teslim alabilirsiniz."
              : "Mağazadan teslim seçeneği şu anda kapalıdır."}{" "}
            Hazır olma durumunu sipariş takibinden kontrol edin.
          </p>
          <p>
            {s.address ||
              "Açık adres ve ziyaret planı için iletişim sayfasından bize ulaşın."}
          </p>
        </section>
      </div>
      <div className="policy-prose">
        <h2>İptal, iade ve sipariş desteği</h2>
        <p>
          Siparişinizle ilgili bir sorun varsa, sipariş numaranızla mağazaya
          başvurun. Ürünün niteliğini ve sipariş aşamasını birlikte
          değerlendirerek süreç hakkında bilgi verelim. Canlı ürünler, açılmış
          bakım ürünleri ve diğer ürünler farklı değerlendirme gerektirebilir;
          bu açıklama yasal haklarınızı sınırlandırmaz.
        </p>
        <h2>Teslim alırken</h2>
        <p>
          Paketin ve ürünün durumunu kontrol edin. Görünür hasar varsa teslimat
          sırasında kayıt altına alın ve fotoğraflarla birlikte mağazaya iletin.
          Mağazadan teslimde ürününüzü birlikte kontrol edebilirsiniz.
        </p>
        <h2>Havale siparişinin iptali</h2>
        <p>
          Ödeme yapılmış siparişlerde iade işlemini mağazayla birlikte yürütün.
          Yönetim panelindeki sipariş iptali kendiliğinden para transferi veya
          banka iadesi oluşturmaz.
        </p>
        <Link href="/iletisim" className="button dark">
          Sipariş desteği alın <ArrowUpRight size={17} />
        </Link>
      </div>
    </main>
  );
}
