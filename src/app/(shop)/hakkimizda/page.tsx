import Link from "next/link";
import { ArrowUpRight, Leaf, HeartHandshake, Waves } from "lucide-react";
import { Breadcrumb, PageHeading } from "@/components/shop-shell";
export const metadata = { title: "Hikâyemiz" };
export default function Page() {
  return (
    <main className="shell editorial-page">
      <Breadcrumb items={[{ label: "Hikâyemiz" }]} />
      <div className="about-hero">
        <div>
          <PageHeading
            eyebrow="BİR TUTKUNUN ETRAFINDA BULUŞTUK"
            title="Doğaya yakın. Hayata dair."
            description="Bir akvaryumdan çok daha fazlasına inanıyoruz: yaşam alanınıza eşlik eden, her gün yeniden keşfedilen küçük bir dünya."
          />
          <p>
            Poseidon Akvaryum olarak Denizli’de sualtı yaşamına duyduğumuz
            ilgiyi sizinle paylaşıyoruz. İlk akvaryumunu kuranlarla, yıllardır
            bu tutkunun peşinde olanlarla aynı merakın etrafında buluşmak
            istiyoruz.
          </p>
          <Link href="/iletisim" className="button dark">
            Bir merhaba ile başlayalım <ArrowUpRight size={18} />
          </Link>
        </div>
        <img
          src="/images/reef.jpg"
          alt="Mercanlar arasında doğal sualtı yaşamı"
        />
      </div>
      <section className="about-principles">
        {[
          {
            icon: Waves,
            title: "Birlikte doğru başlangıç",
            text: "Alanınıza, beklentinize ve bakım rutininize uygun bir akvaryumu birlikte düşünelim.",
          },
          {
            icon: Leaf,
            title: "Doğal yaşam odağımızda",
            text: "Görünüm kadar, kurulacak ekosistemin dengesi ve canlıların ihtiyaçları da seçimimizin parçası.",
          },
          {
            icon: HeartHandshake,
            title: "Alışverişten sonra da yanınızda",
            text: "Kurulumunuzla ilgili sorularınız için mağazamıza ulaşabilir, deneyimlerinizi bizimle paylaşabilirsiniz.",
          },
        ].map((v) => (
          <article key={v.title}>
            <v.icon size={28} />
            <h2>{v.title}</h2>
            <p>{v.text}</p>
          </article>
        ))}
      </section>
      <section className="about-invitation">
        <span className="eyebrow">DÜNYANIZI BİRLİKTE KURALIM</span>
        <h2>
          Biraz doğa. Biraz huzur.
          <br />
          <em>Biraz Poseidon.</em>
        </h2>
        <Link className="text-link" href="/urunler">
          Koleksiyonumuzu keşfedin <ArrowUpRight size={18} />
        </Link>
      </section>
    </main>
  );
}
