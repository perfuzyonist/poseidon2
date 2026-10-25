import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumb, PageHeading } from "@/components/shop-shell";
import { guides } from "@/lib/guides";
export const metadata = { title: "Akvaryum rehberi" };
export default function Page() {
  return (
    <main className="shell editorial-page">
      <Breadcrumb items={[{ label: "Akvaryum rehberi" }]} />
      <PageHeading
        eyebrow="MERAKLA BAŞLAR, BİLGİYLE BÜYÜR"
        title="Küçük notlar, güzel başlangıçlar."
        description="İlk kurulumdan doğal peyzaja; kendi sualtı dünyanızı düşünürken size eşlik edecek rehberler."
      />
      <div className="guide-articles">
        {guides.map((g, i) => (
          <Link
            key={g.slug}
            className="guide-article-card"
            href={`/rehber/${g.slug}`}
          >
            <div>
              <img src={g.image} alt={g.title} />
              <span>0{i + 1}</span>
            </div>
            <span className="eyebrow">{g.category}</span>
            <h2>{g.title}</h2>
            <p>{g.intro}</p>
            <span className="text-link">
              Rehberi okuyun <ArrowUpRight size={18} />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
