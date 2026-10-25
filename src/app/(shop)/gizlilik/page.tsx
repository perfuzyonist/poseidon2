import { getSettings } from "@/lib/settings";
import { Breadcrumb, PageHeading } from "@/components/shop-shell";
export const metadata = { title: "Gizlilik bilgilendirmesi" };
export default async function Page() {
  const s = await getSettings();
  return (
    <main className="shell support-page">
      <Breadcrumb items={[{ label: "Gizlilik" }]} />
      <PageHeading
        eyebrow="BİLGİLERİNİZE ÖZEN GÖSTERİYORUZ"
        title="Gizlilik bilgilendirmesi."
      />
      <article className="policy-prose">
        <h2>Hangi bilgiler kullanılır?</h2>
        <p>
          Siparişte verdiğiniz ad, telefon, e-posta, teslimat adresi, sipariş
          kalemleri ve varsa fatura bilgileri; siparişinizi hazırlamak,
          teslimatı koordine etmek ve sizinle iletişim kurmak için kaydedilir.
          İletişim formundaki bilgiler mesajınıza yanıt vermek amacıyla
          kullanılır.
        </p>
        <h2>Ödeme bilgileri</h2>
        <p>
          Online ödeme alanı demo olarak çalışır. Test kartı alanları yalnızca
          tarayıcıda değerlendirilir; kart numarası, son kullanma tarihi ve CVC
          uygulama sunucusuna gönderilmez. Gerçek kart bilgilerinizi
          kullanmayın. Havale banka bilgileri ödeme adımında ve sipariş
          sonucunda gösterilir.
        </p>
        <h2>Tarayıcı depolaması ve çerezler</h2>
        <p>
          Sepetiniz bu tarayıcıda saklanır. Siparişin tekrar oluşturulmasını
          önlemek için oturum depolaması, yönetim panelinin güvenliği için
          zorunlu oturum çerezi kullanılır. Reklam ve analiz çerezleri
          kullanılmaz.
        </p>
        <h2>Başvuru ve iletişim</h2>
        <p>
          {s.storeName}
          <br />
          {s.address || "Denizli, Türkiye"}
          <br />
          {s.email ||
            "İletişim sayfasındaki form üzerinden bize ulaşabilirsiniz."}
        </p>
        <p className="policy-draft-note">
          Yayına hazırlık notu: Firmanın veri sorumlusu kimliği, saklama
          süreleri ve yasal başvuru bilgileri tamamlanarak bu bilgilendirme
          işletmenin gerçek süreçlerine uyarlanmalıdır.
        </p>
      </article>
    </main>
  );
}
