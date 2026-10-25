import Link from "next/link";
import { Plus, ArrowUpRight } from "lucide-react";
import { Breadcrumb, PageHeading } from "@/components/shop-shell";
export const metadata = { title: "Sık sorulan sorular" };
const faqs = [
  {
    q: "Nasıl sipariş verebilirim?",
    a: "Ürünleri sepetinize ekleyin. Sepet sayfasından ödeme adımına geçerek iletişim bilgilerinizi ve teslimat tercihinizi tamamlayın. Sipariş sonucunda numaranızı kaydedin.",
  },
  {
    q: "Hangi ödeme yöntemleri kullanılabilir?",
    a: "Mağaza tarafından açıldığında Havale / EFT kullanılabilir. Online ödeme alanı şu an test kartıyla çalışan bir demodur; gerçek tahsilat yapmaz. Aktif seçenekler ödeme sayfasında gösterilir.",
  },
  {
    q: "Havale açıklamasına ne yazmalıyım?",
    a: "Sipariş tamamlandığında gösterilen PS- ile başlayan sipariş numaranızı havale açıklamasına yazın. Banka bilgileri sipariş sonucunda gösterilir. Mağaza ödeme girişini kontrol ederek onaylar.",
  },
  {
    q: "Canlı ürünleri kargoluyor musunuz?",
    a: "Bu mağazada canlı içeren siparişler yalnızca mağazadan teslim alınabilir. Sepette canlı varsa kargo seçeneği kullanılamaz.",
  },
  {
    q: "Kargo ücreti nasıl hesaplanıyor?",
    a: "Kargo tutarı ve varsa ücretsiz kargo eşiği mağaza ayarlarına göre hesaplanır. Kesin ücret, siparişi tamamlamadan önce ödeme özetinde gösterilir. Mağazadan teslim ücretsizdir.",
  },
  {
    q: "Siparişimin durumunu nereden görebilirim?",
    a: "Sipariş takibi sayfasında sipariş numaranızı ve alışverişte kullandığınız e-posta adresini girerek sipariş ve ödeme durumunu inceleyebilirsiniz.",
  },
  {
    q: "Ürün seçerken yardım alabilir miyim?",
    a: "Elbette. İletişim formunu kullanabilir veya Instagram üzerinden mağazamıza ulaşabilirsiniz. Kurulumunuzun ölçülerini ve beslemek istediğiniz türleri paylaşmanız doğru seçim yapmayı kolaylaştırır.",
  },
  {
    q: "İptal veya iade için nasıl başvururum?",
    a: "Sipariş numaranızla iletişim sayfasından mağazaya başvurun. İade veya iptal talebiniz ürünün niteliği ve sipariş aşamasına göre değerlendirilir. Ayrıntılar teslimat ve iade sayfasındadır.",
  },
];
export default function Page() {
  return (
    <main className="shell support-page">
      <Breadcrumb items={[{ label: "Sık sorulan sorular" }]} />
      <PageHeading
        eyebrow="AKLINIZDA SORU KALMASIN"
        title="Birlikte netleştirelim."
        description="Sipariş, ödeme ve teslimat hakkında merak ettikleriniz."
      />
      <div className="faq-list">
        {faqs.map((f, i) => (
          <details key={f.q}>
            <summary>
              <span>0{i + 1}</span>
              {f.q}
              <Plus size={19} />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
      <div className="support-bottom">
        <div>
          <h2>Aradığınız yanıt burada değil mi?</h2>
          <p>Bir mesaj uzağınızdayız.</p>
        </div>
        <Link href="/iletisim" className="button dark">
          Bize ulaşın <ArrowUpRight size={17} />
        </Link>
      </div>
    </main>
  );
}
