import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ArrowLeft } from "lucide-react";
import { Breadcrumb, PageHeading } from "@/components/shop-shell";
import { guides } from "@/lib/guides";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return {
    title: guides.find((g) => g.slug === slug)?.title || "Rehber bulunamadı",
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = guides.find((g) => g.slug === slug);
  if (!guide) notFound();
  return (
    <main className="shell editorial-page">
      <Breadcrumb
        items={[
          { label: "Akvaryum rehberi", href: "/rehber" },
          { label: guide.title },
        ]}
      />
      <div className="article-heading">
        <PageHeading
          eyebrow={guide.category}
          title={guide.title}
          description={guide.intro}
        />
      </div>
      <img className="article-cover" src={guide.image} alt={guide.title} />
      <div className="article-layout">
        <nav aria-label="Rehber içindekiler">
          <span className="eyebrow">BU REHBERDE</span>
          {guide.sections.map((s, i) => (
            <a key={s.title} href={`#adim-${i + 1}`}>
              <span>0{i + 1}</span>
              {s.title}
            </a>
          ))}
        </nav>
        <article className="article-body">
          {guide.sections.map((s, i) => (
            <section key={s.title} id={`adim-${i + 1}`}>
              <span className="eyebrow">0{i + 1}</span>
              <h2>{s.title}</h2>
              <p>{s.body}</p>
            </section>
          ))}
          <div className="article-contact">
            <h3>Her akvaryumun hikâyesi farklı.</h3>
            <p>
              Kurulumunuzu birlikte değerlendirelim; size uygun seçenekleri
              konuşalım.
            </p>
            <Link href="/iletisim" className="button dark">
              Bize danışın <ArrowUpRight size={17} />
            </Link>
          </div>
          <Link href="/rehber" className="text-link">
            <ArrowLeft size={16} /> Tüm rehberlere dön
          </Link>
        </article>
      </div>
    </main>
  );
}
