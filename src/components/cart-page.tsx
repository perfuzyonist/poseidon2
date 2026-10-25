"use client";
import Link from "next/link";
import { useEffect } from "react";
import {
  ArrowRight,
  ArrowLeft,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  ShieldCheck,
  Truck,
  Store,
  Info,
} from "lucide-react";
import { useShop } from "./shop-provider";
import { Breadcrumb, CheckoutSteps, PageHeading } from "./shop-shell";
import { money } from "@/lib/types";
export default function CartPage() {
  const { products, cart, ready, count, update, settings, refresh } = useShop();
  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);
  const lines = cart.map((i) => ({
    item: i,
    product: products.find((p) => p.id === i.id),
  }));
  const subtotal =
    lines.reduce(
      (n, { item, product }) =>
        n + (product ? Math.round(product.price * 100) * item.quantity : 0),
      0,
    ) / 100;
  const invalid = lines.some(
    (l) => !l.product || l.item.quantity > l.product.stock,
  );
  const live = lines.some((l) => l.product?.category === "Canlılar");
  const progress = settings.freeShippingThreshold
    ? Math.min(100, (subtotal / settings.freeShippingThreshold) * 100)
    : 0;
  return (
    <main className="commerce-page shell">
      <Breadcrumb items={[{ label: "Sepetim" }]} />
      <CheckoutSteps current={1} />
      <PageHeading
        eyebrow="DÜNYANIZA BİR ADIM DAHA"
        title="Sepetinizde güzel şeyler var."
        description={
          ready && count
            ? `${count} ürün, yepyeni bir dünyanın başlangıcı.`
            : "Kendi sualtı dünyanızı birlikte tamamlayalım."
        }
      />
      {!ready ? (
        <div className="page-loading">Sepetiniz hazırlanıyor…</div>
      ) : !cart.length ? (
        <div className="page-empty">
          <span>
            <ShoppingBag size={38} />
          </span>
          <h2>Yeni dünyanız sizi bekliyor.</h2>
          <p>Sepetiniz şu an boş. Küçük bir keşifle başlayalım.</p>
          <Link href="/urunler" className="button dark">
            Ürünleri keşfet <ArrowRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="commerce-grid">
          <section className="cart-items-panel">
            <div className="cart-table-heading">
              <span>Ürün</span>
              <span>Adet / Toplam</span>
            </div>
            {lines.map(({ item, product: p }) => (
              <article className="full-cart-row" key={item.id}>
                <Link
                  href={p ? `/urunler/${p.id}` : "/urunler"}
                  className="cart-product-image"
                >
                  <img
                    src={p?.image || "/images/aquarium.svg"}
                    alt={p?.name || "Kaldırılmış ürün"}
                  />
                </Link>
                <div className="cart-product-description">
                  <span className="eyebrow">
                    {p?.category || "Ürün kaldırılmış"}
                  </span>
                  <Link href={p ? `/urunler/${p.id}` : "/urunler"}>
                    {p?.name || "Bu ürün artık mevcut değil"}
                  </Link>
                  <small>{p ? money(p.price) : "—"} / adet</small>
                  {p && item.quantity > p.stock && (
                    <span className="stock-warning">
                      {p.stock
                        ? p.stock + " adet kaldı. Adedi güncelleyin."
                        : "Bu ürün tükendi."}
                    </span>
                  )}
                  <button
                    className="remove-cart"
                    onClick={() => update(item.id, 0)}
                  >
                    <Trash2 size={13} /> Kaldır
                  </button>
                </div>
                <div className="cart-product-controls">
                  <strong>{p ? money(p.price * item.quantity) : "—"}</strong>
                  <div className="large-quantity">
                    <button
                      aria-label={`${p?.name} azalt`}
                      onClick={() => update(item.id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label={`${p?.name} artır`}
                      disabled={!p || item.quantity >= p.stock}
                      onClick={() => update(item.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
            <div className="cart-continue">
              <Link href="/urunler" className="text-link">
                <ArrowLeft size={16} /> Alışverişe devam et
              </Link>
              <span>
                <ShieldCheck size={16} /> Güvenli ve özenli alışveriş
              </span>
            </div>
            {live && (
              <div className="commerce-notice">
                <Store size={20} />
                <p>
                  Sepetinizde canlı bulunuyor. Bu siparişiniz için{" "}
                  <b>mağazadan teslim</b> seçeneği kullanılacaktır.
                </p>
              </div>
            )}
          </section>
          <aside className="summary-card">
            <span className="eyebrow">BİR SONRAKİ ADIM</span>
            <h2>Sipariş özeti</h2>
            <dl>
              <div>
                <dt>Ara toplam</dt>
                <dd>{money(subtotal)}</dd>
              </div>
              <div>
                <dt>Teslimat</dt>
                <dd>{live ? "Mağazadan teslim" : "Ödeme adımında"}</dd>
              </div>
            </dl>
            <div className="summary-total">
              <span>Ürün toplamı</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <p className="summary-tax">
              Vergiler dahildir. Kargo tutarı teslimat seçiminize göre eklenir.
            </p>
            {settings.shippingEnabled &&
              !live &&
              settings.freeShippingThreshold > 0 && (
                <div className="free-shipping">
                  <p>
                    <Truck size={16} />
                    {subtotal >= settings.freeShippingThreshold
                      ? "Kargo ücretsiz!"
                      : `Ücretsiz kargoya ${money(settings.freeShippingThreshold - subtotal)} kaldı.`}
                  </p>
                  <div>
                    <span style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}
            {invalid ? (
              <div className="form-error">
                Devam etmek için stok uyarısı olan ürünleri güncelleyin veya
                kaldırın.
              </div>
            ) : (
              <Link href="/odeme" className="button dark w-full">
                Ödemeye geç <ArrowRight size={18} />
              </Link>
            )}
            <Link href="/odeme-bilgileri" className="summary-help">
              Havale / EFT ve demo online ödeme
            </Link>
            <div className="summary-assurance">
              <ShieldCheck size={19} />
              <p>
                Son tutarı ve teslimat bilgilerini bir sonraki adımda
                inceleyebilirsiniz.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
