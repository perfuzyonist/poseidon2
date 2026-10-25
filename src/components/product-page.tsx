"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ShoppingBag,
  Minus,
  Plus,
  ArrowRight,
  Check,
  Truck,
  Store,
  ShieldCheck,
  Leaf,
  ArrowUpRight,
  MessageCircle,
} from "lucide-react";
import { useShop } from "./shop-provider";
import { Breadcrumb } from "./shop-shell";
import { money, type Product } from "@/lib/types";
import {
  whatsappHref,
  directionsHref,
  businessPhone,
  businessAddress,
} from "@/lib/contact";
export function ProductCard({ product: p }: { product: Product }) {
  const { add } = useShop();
  return (
    <article className="product-card">
      <Link className="product-image" href={`/urunler/${p.id}`}>
        <img src={p.image} alt={p.name} loading="lazy" />
        {p.badge && <span className="product-badge">{p.badge}</span>}
        <span className="quick-view">
          Ürünü incele <ArrowUpRight size={15} />
        </span>
      </Link>
      <div className="product-meta">
        <span>{p.category}</span>
        <small className={p.stock ? "in-stock" : "out-stock"}>
          <i />
          {p.stock ? "Stokta" : "Tükendi"}
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
          onClick={() => add(p)}
          disabled={!p.stock}
          aria-label={`${p.name} sepete ekle`}
        >
          <Plus size={18} />
        </button>
      </div>
    </article>
  );
}
export default function ProductPage({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const { products, settings, add, cart } = useShop();
  const p = products.find((p) => p.id === product.id) || product;
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState("description");
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const inCart = cart.find((i) => i.id === p.id)?.quantity || 0;
  function buy(direct = false) {
    if (add(p, quantity)) {
      setAdded(true);
      if (direct) router.push("/odeme");
    }
  }
  return (
    <main className="product-page">
      <div className="shell">
        <Breadcrumb
          items={[
            { label: "Ürünler", href: "/urunler" },
            {
              label: p.category,
              href: `/urunler?kategori=${encodeURIComponent(p.category)}`,
            },
            { label: p.name },
          ]}
        />
        <section className="product-hero">
          <div className="product-gallery">
            <div className="gallery-main">
              <img src={p.image} alt={p.name} fetchPriority="high" />
              {p.badge && <span className="product-badge">{p.badge}</span>}
              <span className="gallery-caption">Görsel temsilidir</span>
            </div>
            <div className="gallery-bottom">
              <span>
                <Leaf size={15} /> Sizin dünyanız için özenle seçildi.
              </span>
              <span>01 / 01</span>
            </div>
          </div>
          <div className="product-purchase">
            <Link
              className="eyebrow"
              href={`/urunler?kategori=${encodeURIComponent(p.category)}`}
            >
              {p.category}
            </Link>
            <h1>{p.name}</h1>
            <div className="product-availability">
              <span className={`stock-label ${p.stock ? "" : "out-stock"}`}>
                <i />
                {p.stock ? `${p.stock} adet stokta` : "Şu anda tükendi"}
              </span>
              <span>Ürün kodu: {p.id.toUpperCase().slice(0, 22)}</span>
            </div>
            <p className="product-intro">{p.description}</p>
            <div className="purchase-price">
              <strong>{money(p.price)}</strong>
              {p.oldPrice && <del>{money(p.oldPrice)}</del>}
              {p.oldPrice && (
                <span>
                  %{Math.round((1 - p.price / p.oldPrice) * 100)} avantaj
                </span>
              )}
              <small>Vergiler dahil satış fiyatı</small>
            </div>
            <div className="purchase-actions">
              <div className="large-quantity">
                <button
                  aria-label="Adedi azalt"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus size={17} />
                </button>
                <span aria-live="polite">{quantity}</span>
                <button
                  aria-label="Adedi artır"
                  onClick={() => setQuantity(Math.min(p.stock, quantity + 1))}
                  disabled={quantity >= p.stock}
                >
                  <Plus size={17} />
                </button>
              </div>
              <button
                className="button dark"
                onClick={() => buy()}
                disabled={!p.stock}
              >
                <ShoppingBag size={19} /> Sepete ekle
              </button>
            </div>
            <button
              className="button outline buy-now"
              disabled={!p.stock}
              onClick={() => buy(true)}
            >
              Hemen satın al <ArrowRight size={18} />
            </button>
            <div className="product-contact-actions">
              <a
                href={whatsappHref(
                  settings.phone || businessPhone,
                  `Merhaba, ${p.name} ürünü hakkında bilgi alabilir miyim?`,
                )}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={18} /> Bu ürünü WhatsApp’ta sorun{" "}
                <ArrowUpRight size={16} />
              </a>
              <a
                href={directionsHref(settings.address || businessAddress)}
                target="_blank"
                rel="noreferrer"
              >
                <Store size={17} /> Mağazaya gelin <ArrowUpRight size={15} />
              </a>
            </div>
            {(added || inCart > 0) && (
              <div className="added-inline">
                <Check size={17} />
                <span>Sepetinizde bu üründen {inCart} adet var.</span>
                <Link href="/sepet">
                  Sepete git <ArrowRight size={15} />
                </Link>
              </div>
            )}
            <div className="product-service-list">
              <div>
                <Store size={21} />
                <span>
                  <b>Mağazadan teslim</b>
                  <small>Denizli’de mağazamızdan teslim alın.</small>
                </span>
              </div>
              <div>
                <Truck size={21} />
                <span>
                  <b>
                    {p.category === "Canlılar"
                      ? "Canlılar için özenli teslim"
                      : "Adresinize teslimat"}
                  </b>
                  <small>
                    {p.category === "Canlılar"
                      ? "Bu ürün yalnızca mağazadan teslim edilir."
                      : settings.shippingEnabled
                        ? `Kargo ücreti ödeme adımında hesaplanır.`
                        : "Teslimat seçenekleri ödeme adımında gösterilir."}
                  </small>
                </span>
              </div>
              <div>
                <ShieldCheck size={21} />
                <span>
                  <b>Açık ve anlaşılır alışveriş</b>
                  <small>Havale/EFT veya test kartıyla demo ödeme.</small>
                </span>
              </div>
            </div>
          </div>
        </section>
        <section className="product-information">
          <div
            className="product-info-tabs"
            role="tablist"
            aria-label="Ürün bilgileri"
          >
            {[
              { id: "description", label: "Ürün hakkında" },
              { id: "details", label: "Ürün bilgileri" },
              { id: "delivery", label: "Teslimat & iade" },
            ].map((t) => (
              <button
                key={t.id}
                id={`tab-${t.id}`}
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div
            className="product-info-panel"
            id={`panel-${tab}`}
            role="tabpanel"
            aria-labelledby={`tab-${tab}`}
          >
            {tab === "description" ? (
              <>
                <h2>Küçük bir detay, bambaşka bir dünya.</h2>
                <p>{p.description}</p>
                <p>
                  Ürün seçimi ve akvaryumunuza uygunluğu hakkında desteğe
                  ihtiyacınız varsa bize ulaşın. Örnek katalogdaki özellikler ve
                  görseller gerçek ürünlerle güncellenecektir.
                </p>
                <Link className="text-link" href="/iletisim">
                  Ürün hakkında bize danışın <ArrowUpRight size={16} />
                </Link>
              </>
            ) : tab === "details" ? (
              <dl className="spec-list">
                <div>
                  <dt>Ürün adı</dt>
                  <dd>{p.name}</dd>
                </div>
                <div>
                  <dt>Kategori</dt>
                  <dd>{p.category}</dd>
                </div>
                <div>
                  <dt>Ürün kodu</dt>
                  <dd>{p.id}</dd>
                </div>
                <div>
                  <dt>Stok</dt>
                  <dd>{p.stock} adet</dd>
                </div>
                <div>
                  <dt>Teslimat</dt>
                  <dd>
                    {p.category === "Canlılar"
                      ? "Mağazadan teslim"
                      : "Kargo / mağazadan teslim"}
                  </dd>
                </div>
              </dl>
            ) : (
              <>
                <h2>Size ve yeni dünyanıza özenle.</h2>
                <p>
                  Canlılar yalnızca mağazadan teslim edilir. Diğer ürünler için
                  açık teslimat seçenekleri ve kargo tutarı ödeme sayfasında
                  gösterilir. Siparişinizi sipariş takibi sayfasından kontrol
                  edebilirsiniz.
                </p>
                <p>
                  İade veya teslimat konusunda destek için sipariş numaranızla
                  mağazamıza başvurabilirsiniz. Koşullar ürünün niteliğine göre
                  değerlendirilir.
                </p>
                <Link className="text-link" href="/teslimat-iade">
                  Teslimat ve iade bilgileri <ArrowUpRight size={16} />
                </Link>
              </>
            )}
          </div>
        </section>
        {related.length > 0 && (
          <section className="related-products">
            <div className="section-heading">
              <div>
                <span className="eyebrow">DÜNYANIZI TAMAMLAYIN</span>
                <h2>Bunlar da çok yakışacak.</h2>
              </div>
              <Link className="text-link" href="/urunler">
                Koleksiyonu keşfet <ArrowUpRight size={17} />
              </Link>
            </div>
            <div className="product-grid">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
