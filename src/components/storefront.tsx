"use client";
import Link from "next/link";
import { useState, useMemo, useEffect, useRef } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  ChevronDown,
  Fish,
  Flower2,
  Waves,
  SlidersHorizontal,
  ShoppingBag,
  Search,
  Menu,
  MapPin,
  Instagram,
  MessageCircle,
  ShieldCheck,
  HeartHandshake,
  Minus,
  Plus,
  Trash2,
  X,
  Leaf,
  CheckCircle2,
} from "lucide-react";
import { matchesProduct } from "@/lib/search";
import { Brand } from "./brand";
import { useShop } from "./shop-provider";
import StoreLocation from "./store-location";
import HomeCampaign from "./home-campaign";
import { whatsappHref, businessPhone } from "@/lib/contact";
import { categories, money, type Product } from "@/lib/types";
const instagram = "https://www.instagram.com/denizliposeidonakvaryum/";
const heroImage = "/images/aquascape-hero.webp";
const categoryCards = [
  {
    name: "Canlılar",
    sub: "Küçük dostlar, büyük bir dünya.",
    image: "/images/betta.jpg",
    icon: Fish,
  },
  {
    name: "Akvaryumlar",
    sub: "Hayalinizdeki dünyanın başlangıcı.",
    image: heroImage,
    icon: Waves,
  },
  {
    name: "Ekipmanlar",
    sub: "Dengeli bir yaşamın arkasındaki güç.",
    image: "/images/equipment-scene.svg",
    icon: SlidersHorizontal,
  },
  {
    name: "Bitki & Dekor",
    sub: "Doğadan ilham alan dokunuşlar.",
    image: "/images/plant-scene.svg",
    icon: Flower2,
  },
];
export default function Storefront({
  products,
  catalog = false,
  initialQuery = "",
  initialCategory = "Tümü",
}: {
  products: Product[];
  catalog?: boolean;
  initialQuery?: string;
  initialCategory?: string;
}) {
  const { add, settings } = useShop();
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialQuery);
  const [sort, setSort] = useState("featured");
  const searchInput = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setCategory(initialCategory);
    setSearch(initialQuery);
    if (params.has("arama")) searchInput.current?.focus();
  }, [initialQuery, initialCategory]);
  const visible = useMemo(() => {
    let list = products.filter(
      (p) =>
        (category === "Tümü" || p.category === category) &&
        matchesProduct(p, search),
    );
    if (sort === "low") list.sort((a, b) => a.price - b.price);
    else if (sort === "high") list.sort((a, b) => b.price - a.price);
    else list.sort((a, b) => Number(b.featured) - Number(a.featured));
    return catalog || category !== "Tümü" || search ? list : list.slice(0, 4);
  }, [products, category, search, sort, catalog]);
  return (
    <main>
      {!catalog && (
        <>
          <section className="hero">
            <img
              className="hero-photo"
              src={heroImage}
              alt="Yeşil bitkiler ve renkli balıklarla dolu doğal akvaryum"
              fetchPriority="high"
            />
            <div className="hero-shade" />
            <div className="shell hero-content">
              <div className="eyebrow light">
                <span />
                DENİZLİ’NİN SUALTI DÜNYASI
              </div>
              <h1>
                Suyun altında,
                <br />
                bambaşka bir <em>dünya.</em>
              </h1>
              <p>
                Doğanın huzurunu yaşam alanınıza taşıyın.
                <br />
                İlk akvaryumunuzdan hayalinizdeki sualtı bahçesine,
                <br className="desktop-break" /> her adımda Poseidon yanınızda.
              </p>
              <div className="hero-buttons">
                <Link href="/urunler" className="button primary">
                  Dünyamızı keşfedin <ArrowUpRight size={18} />
                </Link>
                <Link href="/hakkimizda" className="button hero-secondary">
                  Bizi tanıyın <ArrowRight size={17} />
                </Link>
              </div>
              <div className="hero-bottom">
                <span>
                  <i />
                  Küçük bir ekosistem. Sonsuz bir ilham.
                </span>
                <span className="hero-coordinate">
                  DENİZLİ, TÜRKİYE <span>37°46′ N · 29°05′ E</span>
                </span>
              </div>
            </div>
            <div className="hero-caption">
              <span>DOĞADAN İLHAM ALDIK</span>
              <b>Sizin için bir dünya kurduk.</b>
              <span className="hero-caption-line" />
            </div>
          </section>
          <section className="benefit-strip">
            <div className="shell benefit-grid">
              <div>
                <ShieldCheck />
                <span>
                  <b>Özenle seçilen ürünler</b>
                  <small>Her detayda doğru tercih</small>
                </span>
              </div>
              <div>
                <HeartHandshake />
                <span>
                  <b>Birlikte doğru başlangıç</b>
                  <small>İhtiyacınıza uygun öneriler</small>
                </span>
              </div>
              <div>
                <Leaf />
                <span>
                  <b>Doğal yaşam odağımızda</b>
                  <small>Dengeli, sağlıklı ekosistemler</small>
                </span>
              </div>
              <div>
                <MapPin />
                <span>
                  <b>Denizli’de buluşalım</b>
                  <small>Sualtı dünyamıza bekleriz</small>
                </span>
              </div>
            </div>
          </section>
        </>
      )}
      <section
        id="koleksiyon"
        className={`collection ${catalog ? "catalog-page" : ""}`}
      >
        <div className="shell">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {catalog
                  ? "POSEIDON KOLEKSİYONU"
                  : "BİZİM SEÇTİKLERİMİZ, SİZİN FAVORİLERİNİZ"}
              </span>
              {catalog ? (
                <h1>Sualtı dünyanıza bir dokunuş.</h1>
              ) : (
                <h2>Akvaryumunuza çok yakışacak.</h2>
              )}
              {catalog && (
                <p className="section-sub">
                  Canlılardan ekipmanlara, kendi dünyanızı oluşturmak için
                  keşfedin.
                </p>
              )}
            </div>
            {!catalog && (
              <Link className="text-link" href="/urunler">
                Tüm ürünleri incele <ArrowUpRight size={17} />
              </Link>
            )}
          </div>
          <div className="catalog-toolbar">
            <div className="category-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  className={category === c ? "selected" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <label className="sort-control">
              <SlidersHorizontal size={15} />
              <select
                aria-label="Ürün sıralaması"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
              >
                <option value="featured">Önerilen sıralama</option>
                <option value="low">Fiyat: Artan</option>
                <option value="high">Fiyat: Azalan</option>
              </select>
            </label>
          </div>
          {catalog && (
            <div className="catalog-search">
              <Search size={18} />
              <input
                ref={searchInput}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Dünyanız için ne arıyorsunuz?"
                aria-label="Ürün adı ara"
              />
              <span>{visible.length} ürün</span>
            </div>
          )}
          {visible.length ? (
            <div className="product-grid">
              {visible.map((p) => (
                <article className="product-card" key={p.id}>
                  <Link
                    className="product-image"
                    href={`/urunler/${p.id}`}
                    aria-label={`${p.name} detayları`}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/images/aquarium.svg";
                      }}
                    />
                    {p.badge && (
                      <span
                        className={`product-badge ${p.badge === "Fırsat" ? "sale" : ""}`}
                      >
                        {p.badge === "Çok sevilen" && <span>✦</span>}
                        {p.badge}
                      </span>
                    )}
                    <span className="quick-view">
                      Yakından keşfet <ArrowUpRight size={15} />
                    </span>
                  </Link>
                  <div className="product-meta">
                    <span>{p.category}</span>
                    <small className={p.stock > 0 ? "in-stock" : "out-stock"}>
                      <i />
                      {p.stock > 0 ? "Stokta" : "Tükendi"}
                    </small>
                  </div>
                  <Link className="product-title" href={`/urunler/${p.id}`}>
                    {p.name}
                  </Link>
                  <div className="product-bottom">
                    <div>
                      <strong>{money(p.price)}</strong>
                      {p.oldPrice && <del>{money(p.oldPrice)}</del>}
                    </div>
                    <button
                      className="add-button"
                      aria-label={`${p.name} sepete ekle`}
                      onClick={() => add(p)}
                      disabled={!p.stock}
                    >
                      <Plus size={19} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <Fish size={40} />
              <h3>Burada henüz bir ürün yok.</h3>
              <p>Başka bir kategori veya arama kelimesi deneyin.</p>
              <button
                className="text-link"
                onClick={() => {
                  setCategory("Tümü");
                  setSearch("");
                }}
              >
                Tüm ürünleri göster <ArrowRight size={16} />
              </button>
            </div>
          )}
          <p className="demo-note">
            Görseller temsilidir. Örnek ürün, fiyat ve stok bilgileri içerir;
            güncel seçenekler için bize ulaşın.
          </p>
        </div>
      </section>
      {!catalog && (
        <>
          <HomeCampaign />
          <div className="home-categories-surface">
            <section className="shell section categories-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    HER DÜNYANIN BİR BAŞLANGICI VAR
                  </span>
                  <h2>Sizin dünyanız hangisi?</h2>
                </div>
                <Link className="text-link" href="/urunler">
                  Tüm kategorileri keşfet <ArrowUpRight size={17} />
                </Link>
              </div>
              <div className="category-grid">
                {categoryCards.map((c, i) => (
                  <Link
                    key={c.name}
                    href={`/urunler?kategori=${encodeURIComponent(c.name)}`}
                    className={`category-card category-${i}`}
                  >
                    <img src={c.image} alt={c.name} loading="lazy" />
                    <div className="category-overlay" />
                    <span className="category-number">0{i + 1}</span>
                    <div className="category-content">
                      <c.icon size={26} strokeWidth={1.4} />
                      <h3>{c.name}</h3>
                      <p>{c.sub}</p>
                    </div>
                    <span className="round-arrow">
                      <ArrowUpRight size={20} />
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          </div>
          <section id="hikayemiz" className="shell story section">
            <div className="story-image">
              <img
                src="/images/reef.jpg"
                alt="Doğal sualtı yaşamı ve mercanlar"
                loading="lazy"
              />
              <div className="story-stamp">
                <Waves size={26} />
                <span>
                  DOĞAYA YAKIN.
                  <br />
                  HAYATA DAİR.
                </span>
              </div>
            </div>
            <div className="story-content">
              <span className="eyebrow">BİR TUTKUNUN ETRAFINDA BULUŞTUK</span>
              <h2>
                Sadece akvaryum değil,
                <br />
                bir yaşam alanı.
              </h2>
              <p>
                Bir balığın zarif hareketinde, suyun sakin sesinde, yeşilin her
                tonunda keşfedilecek başka bir dünya var.
              </p>
              <p>
                Poseidon Akvaryum olarak Denizli’de bu dünyayı sizinle paylaşmak
                istiyoruz. İster ilk kez başlayın, ister yıllardır bu tutkunun
                peşinde olun; ihtiyaçlarınıza uygun bir akvaryumu birlikte
                düşünelim.
              </p>
              <a
                className="text-link"
                href={instagram}
                target="_blank"
                rel="noreferrer"
              >
                Hikâyemize ortak olun <ArrowUpRight size={18} />
              </a>
              <div className="story-sign">
                <Brand />
                <span>
                  Biraz doğa.
                  <br />
                  Biraz huzur. Biraz Poseidon.
                </span>
              </div>
            </div>
          </section>
          <section id="rehber" className="guide-section">
            <div className="shell guide-inner">
              <div>
                <span className="eyebrow">MERAKLA BAŞLAR, BİLGİYLE BÜYÜR</span>
                <h2>
                  İlk akvaryumunuz mu?
                  <br />
                  Güzel bir başlangıç yapalım.
                </h2>
                <p>
                  Doğru boyut, uygun ekipman ve biraz sabır.
                  <br />
                  Kendi sualtı dünyanızı kurmak düşündüğünüzden daha keyifli.
                </p>
                <Link className="button dark" href="/rehber/ilk-akvaryum">
                  Başlangıç rehberini incele <ArrowUpRight size={18} />
                </Link>
              </div>
              <div className="guide-steps">
                {[
                  {
                    n: "01",
                    title: "Dünyanızı hayal edin",
                    text: "Alanınıza ve bakım rutininize uygun bir akvaryum seçin.",
                    icon: Waves,
                  },
                  {
                    n: "02",
                    title: "Dengeyi birlikte kuralım",
                    text: "Filtrasyon, aydınlatma ve doğal döngüyü planlayın.",
                    icon: Leaf,
                  },
                  {
                    n: "03",
                    title: "Yeni dostlarınızla tanışın",
                    text: "Birlikte yaşayabilen türleri, doğru zamanda ekleyin.",
                    icon: Fish,
                  },
                ].map((s) => (
                  <div key={s.n}>
                    <span className="step-icon">
                      <s.icon size={23} />
                    </span>
                    <span>
                      <b>{s.title}</b>
                      <p>{s.text}</p>
                    </span>
                    <small>{s.n}</small>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
      {!catalog && (
        <div className="shell home-location">
          <StoreLocation />
        </div>
      )}
    </main>
  );
}
