"use client";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  CreditCard,
  Landmark,
  Store,
  Truck,
  LockKeyhole,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Info,
  Check,
  ShoppingBag,
} from "lucide-react";
import { useShop } from "./shop-provider";
import { Breadcrumb, CheckoutSteps, PageHeading } from "./shop-shell";
import { quoteCart } from "@/lib/commerce";
import { money } from "@/lib/types";
export default function CheckoutPage() {
  const {
    demo,
    products,
    settings,
    cart,
    ready,
    count,
    clear,
    refresh,
    checkoutKey,
  } = useShop();
  const router = useRouter();
  const [delivery, setDelivery] = useState<"shipping" | "pickup">("shipping");
  const [payment, setPayment] = useState<"bank" | "online">("online");
  const [billing, setBilling] = useState("individual");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [card, setCard] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [refreshing, setRefreshing] = useState(true);
  const hasLive = cart.some(
    (i) => products.find((p) => p.id === i.id)?.category === "Canlılar",
  );
  useEffect(() => {
    refresh()
      .catch(() =>
        setError(
          "Güncel stok ve ödeme ayarları alınamadı. Lütfen sayfayı yenileyin.",
        ),
      )
      .finally(() => setRefreshing(false));
  }, [refresh]);
  useEffect(() => {
    if (hasLive || !settings.shippingEnabled) setDelivery("pickup");
    else if (!settings.pickupEnabled) setDelivery("shipping");
    if (!settings.demoOnlineEnabled && settings.bankEnabled) setPayment("bank");
    else if (!settings.bankEnabled && settings.demoOnlineEnabled)
      setPayment("online");
  }, [hasLive, settings]);
  let quote: ReturnType<typeof quoteCart> | undefined;
  let quoteError = "";
  if (ready && cart.length) {
    try {
      quote = quoteCart(products, cart, settings, delivery);
    } catch (e) {
      quoteError = e instanceof Error ? e.message : "Sepetinizi kontrol edin.";
    }
  }
  const availablePayment = settings.bankEnabled || settings.demoOnlineEnabled;
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) {
      setError("Tanıtım modunda gerçek sipariş oluşturulmaz.");
      return;
    }
    if (busy || !quote) return;
    setError("");
    if (payment === "online") {
      const number = card.replace(/\D/g, "");
      if (number === "4000000000000002") {
        setError(
          "Demo kart reddedildi. Sipariş oluşturulmadı. Başarılı test için 4242 4242 4242 4242 kullanabilirsiniz.",
        );
        return;
      }
      if (number !== "4242424242424242") {
        setError(
          "Lütfen gerçek kart bilgisi kullanmayın. Bu demo için kart numarası: 4242 4242 4242 4242.",
        );
        return;
      }
      const match = expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/);
      if (
        !match ||
        Number(match[1]) < 1 ||
        Number(match[1]) > 12 ||
        new Date(2000 + Number(match[2]), Number(match[1]), 1).getTime() <=
          Date.now()
      ) {
        setError("Gelecekteki bir son kullanma tarihi girin (AA/YY).");
        return;
      }
      if (!cardName.trim() || cvc !== "123") {
        setError("Demo kart için kart sahibi adını ve CVC olarak 123 girin.");
        return;
      }
    }
    const form = new FormData(e.currentTarget);
    setBusy(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form.get("customer"),
          email: form.get("email"),
          phone: form.get("phone"),
          address: form.get("address") || "Mağazadan teslim",
          city: form.get("city") || "Denizli",
          district: form.get("district") || "",
          postalCode: form.get("postalCode") || "",
          note: form.get("note") || "",
          billingType: billing,
          companyName: form.get("companyName") || "",
          taxOffice: form.get("taxOffice") || "",
          taxNumber: form.get("taxNumber") || "",
          deliveryMethod: delivery,
          paymentMethod: payment,
          consent: form.get("consent") === "on",
          idempotencyKey: checkoutKey(),
          items: cart,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Sipariş oluşturulamadı.");
      setCard("");
      setCvc("");
      clear();
      router.replace(`/siparis/${data.accessToken}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Bağlantı kurulamadı. Sepetiniz korundu; tekrar deneyebilirsiniz.",
      );
      setBusy(false);
      refresh().catch(() => {});
    }
  }
  return (
    <main className="commerce-page shell">
      <Breadcrumb
        items={[{ label: "Sepetim", href: "/sepet" }, { label: "Ödeme" }]}
      />
      <CheckoutSteps current={2} />
      {demo && (
        <div className="showcase-notice" role="status">
          <Info size={20} />
          <span>
            <b>Alışveriş ekranı önizlemesi</b>
            <br />
            Bu tanıtım bağlantısında sipariş ve ödeme alınmaz. Alanları örnek
            bilgilerle inceleyebilirsiniz.
          </span>
        </div>
      )}
      <PageHeading
        eyebrow="SONRAKİ GÜZEL ŞEY BURADA BAŞLIYOR"
        title="Yeni dünyanız için son bir adım."
        description="Bilgilerinizi tamamlayın, size uygun teslimat ve ödeme yöntemini seçin."
      />
      {!ready || refreshing ? (
        <div className="page-loading">
          Güncel stok ve ödeme seçenekleri hazırlanıyor…
        </div>
      ) : !cart.length ? (
        <div className="page-empty">
          <span>
            <ShoppingBag size={38} />
          </span>
          <h2>Önce sepetinizi hazırlayalım.</h2>
          <p>Ödeme adımına geçmek için sepetinize ürün ekleyin.</p>
          <Link className="button dark" href="/urunler">
            Ürünleri keşfet <ArrowRight size={17} />
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="commerce-grid checkout-layout">
          <div className="checkout-sections">
            <section className="checkout-section">
              <div className="checkout-section-heading">
                <span>01</span>
                <div>
                  <h2>İletişim bilgileriniz</h2>
                  <p>Siparişinizle ilgili size ulaşabilmemiz için.</p>
                </div>
              </div>
              <div className="form-grid">
                <label>
                  Ad soyad <span>*</span>
                  <input
                    name="customer"
                    required
                    maxLength={120}
                    autoComplete="name"
                    placeholder="Adınız ve soyadınız"
                  />
                </label>
                <label>
                  E-posta adresi <span>*</span>
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                    placeholder="ornek@eposta.com"
                  />
                </label>
                <label className="full-width">
                  Telefon numarası <span>*</span>
                  <input
                    name="phone"
                    type="tel"
                    required
                    pattern="[+0-9\s()\-]{10,25}"
                    maxLength={25}
                    autoComplete="tel"
                    placeholder="05xx xxx xx xx"
                  />
                </label>
              </div>
            </section>
            <section className="checkout-section">
              <div className="checkout-section-heading">
                <span>02</span>
                <div>
                  <h2>Size nasıl ulaştıralım?</h2>
                  <p>Her yeni yaşam alanına, biraz özenle.</p>
                </div>
              </div>
              <div className="delivery-options">
                <label
                  className={`choice-card ${delivery === "shipping" ? "chosen" : ""} ${hasLive || !settings.shippingEnabled ? "unavailable" : ""}`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="shipping"
                    checked={delivery === "shipping"}
                    onChange={() => setDelivery("shipping")}
                    disabled={hasLive || !settings.shippingEnabled}
                  />
                  <Truck size={23} />
                  <span>
                    <b>Adresime kargolansın</b>
                    <small>
                      {hasLive
                        ? "Canlı ürünler için kullanılamaz"
                        : !settings.shippingEnabled
                          ? "Şu anda kapalı"
                          : "Ücret, sipariş tutarına göre hesaplanır"}
                    </small>
                  </span>
                </label>
                <label
                  className={`choice-card ${delivery === "pickup" ? "chosen" : ""} ${!settings.pickupEnabled ? "unavailable" : ""}`}
                >
                  <input
                    type="radio"
                    name="delivery"
                    value="pickup"
                    checked={delivery === "pickup"}
                    onChange={() => setDelivery("pickup")}
                    disabled={!settings.pickupEnabled}
                  />
                  <Store size={23} />
                  <span>
                    <b>Mağazadan teslim alayım</b>
                    <small>Denizli · Ücretsiz</small>
                  </span>
                </label>
              </div>
              {delivery === "shipping" ? (
                <div className="form-grid shipping-fields">
                  <label>
                    İl <span>*</span>
                    <input
                      name="city"
                      required
                      maxLength={80}
                      autoComplete="address-level1"
                      placeholder="İl"
                    />
                  </label>
                  <label>
                    İlçe <span>*</span>
                    <input
                      name="district"
                      required
                      maxLength={100}
                      autoComplete="address-level2"
                      placeholder="İlçe"
                    />
                  </label>
                  <label className="full-width">
                    Açık adres <span>*</span>
                    <textarea
                      name="address"
                      required
                      minLength={10}
                      maxLength={600}
                      rows={3}
                      autoComplete="street-address"
                      placeholder="Mahalle, sokak, bina ve daire numarası"
                    />
                  </label>
                  <label>
                    Posta kodu (isteğe bağlı)
                    <input
                      name="postalCode"
                      pattern="[0-9]{5}"
                      maxLength={5}
                      inputMode="numeric"
                      autoComplete="postal-code"
                      placeholder="20000"
                    />
                  </label>
                </div>
              ) : (
                <div className="pickup-address">
                  <MapPinIcon />
                  <div>
                    <b>{settings.storeName}</b>
                    <p>
                      {settings.address ||
                        "Denizli · Açık adres için mağazamızla iletişime geçin."}
                    </p>
                    <small>
                      Siparişiniz hazır olduğunda teslim almak için mağazayla
                      iletişim kurabilirsiniz.
                    </small>
                  </div>
                </div>
              )}
            </section>
            <section className="checkout-section">
              <div className="checkout-section-heading">
                <span>03</span>
                <div>
                  <h2>Ödeme yönteminizi seçin</h2>
                  <p>İhtiyacınıza uygun, açık ve anlaşılır seçenekler.</p>
                </div>
              </div>
              <div className="payment-tabs">
                <label className={payment === "online" ? "chosen" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={payment === "online"}
                    onChange={() => setPayment("online")}
                    disabled={!settings.demoOnlineEnabled}
                  />
                  <CreditCard size={20} />
                  <span>
                    Online ödeme <small>DEMO</small>
                  </span>
                </label>
                <label className={payment === "bank" ? "chosen" : ""}>
                  <input
                    type="radio"
                    name="payment"
                    value="bank"
                    checked={payment === "bank"}
                    onChange={() => setPayment("bank")}
                    disabled={!settings.bankEnabled}
                  />
                  <Landmark size={20} />
                  <span>Havale / EFT</span>
                </label>
              </div>
              {payment === "online" && settings.demoOnlineEnabled ? (
                <div className="demo-payment">
                  <div className="demo-payment-notice">
                    <Info size={18} />
                    <p>
                      <b>Bu bir ödeme demosudur.</b> Gerçek tahsilat yapılmaz.
                      Yalnızca test kartını kullanın. Kart bilgileri sunucuya
                      gönderilmez veya kaydedilmez.
                    </p>
                  </div>
                  <div className="demo-card-preview" aria-hidden="true">
                    <div>
                      <span>POSEIDON</span>
                      <small>DEMO KART</small>
                    </div>
                    <CreditCard size={28} strokeWidth={1} />
                    <strong>{card || "•••• •••• •••• ••••"}</strong>
                    <div>
                      <span>{cardName || "KART SAHİBİ"}</span>
                      <span>{expiry || "AA/YY"}</span>
                    </div>
                  </div>
                  <div className="form-grid card-fields">
                    <label className="full-width">
                      Kart üzerindeki ad soyad
                      <input
                        value={cardName}
                        onChange={(e) =>
                          setCardName(e.target.value.toLocaleUpperCase("tr"))
                        }
                        required={payment === "online"}
                        maxLength={80}
                        autoComplete="off"
                        placeholder="ÖRN. DENİZ YILMAZ"
                      />
                    </label>
                    <label className="full-width">
                      Demo kart numarası
                      <input
                        value={card}
                        onChange={(e) =>
                          setCard(
                            e.target.value
                              .replace(/\D/g, "")
                              .slice(0, 16)
                              .replace(/(.{4})/g, "$1 ")
                              .trim(),
                          )
                        }
                        required={payment === "online"}
                        inputMode="numeric"
                        maxLength={19}
                        autoComplete="off"
                        placeholder="4242 4242 4242 4242"
                      />
                    </label>
                    <label>
                      Son kullanma tarihi
                      <input
                        value={expiry}
                        onChange={(e) => {
                          const digits = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 4);
                          setExpiry(
                            digits.length > 2
                              ? digits.slice(0, 2) + "/" + digits.slice(2)
                              : digits,
                          );
                        }}
                        required={payment === "online"}
                        maxLength={5}
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="AA/YY"
                      />
                    </label>
                    <label>
                      CVC
                      <input
                        type="password"
                        value={cvc}
                        onChange={(e) =>
                          setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))
                        }
                        required={payment === "online"}
                        maxLength={3}
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="123"
                      />
                    </label>
                  </div>
                  <div className="test-card-hint">
                    <span>
                      Test kartı: <b>4242 4242 4242 4242</b>
                    </span>
                    <span>
                      Gelecekteki tarih · CVC: <b>123</b>
                    </span>
                  </div>
                </div>
              ) : payment === "bank" && settings.bankEnabled ? (
                <div className="bank-checkout-info">
                  <Landmark size={28} />
                  <h3>Havale / EFT ile tamamlayın.</h3>
                  <p>
                    Siparişiniz oluşturulduktan sonra banka bilgileri ve
                    açıklamaya yazmanız gereken sipariş numarası gösterilecek.
                    Ödemeniz mağaza tarafından onaylandıktan sonra siparişiniz
                    hazırlanır.
                  </p>
                  <dl>
                    <div>
                      <dt>Banka</dt>
                      <dd>{settings.bankName}</dd>
                    </div>
                    <div>
                      <dt>Hesap sahibi</dt>
                      <dd>{settings.accountName}</dd>
                    </div>
                    <div>
                      <dt>IBAN</dt>
                      <dd>{settings.iban.replace(/(.{4})/g, "$1 ").trim()}</dd>
                    </div>
                  </dl>
                </div>
              ) : (
                <div className="commerce-notice">
                  <Info size={20} />
                  <p>
                    {!availablePayment
                      ? "Ödeme yöntemleri henüz açılmamış. Lütfen mağazayla iletişime geçin."
                      : "Bu yöntem henüz yapılandırılmamış. Kullanılabilir diğer yöntemi seçin."}
                  </p>
                </div>
              )}
            </section>
            <section className="checkout-section">
              <div className="checkout-section-heading">
                <span>04</span>
                <div>
                  <h2>Fatura & son detaylar</h2>
                  <p>Az kaldı. Son bir kontrol yapalım.</p>
                </div>
              </div>
              <div className="billing-options">
                <label>
                  <input
                    type="radio"
                    name="billing"
                    value="individual"
                    checked={billing === "individual"}
                    onChange={() => setBilling("individual")}
                  />{" "}
                  Bireysel
                </label>
                <label>
                  <input
                    type="radio"
                    name="billing"
                    value="business"
                    checked={billing === "business"}
                    onChange={() => setBilling("business")}
                  />{" "}
                  Kurumsal
                </label>
              </div>
              {billing === "business" && (
                <div className="form-grid">
                  <label className="full-width">
                    Firma unvanı
                    <input name="companyName" required maxLength={150} />
                  </label>
                  <label>
                    Vergi dairesi
                    <input name="taxOffice" required maxLength={150} />
                  </label>
                  <label>
                    Vergi numarası
                    <input
                      name="taxNumber"
                      required
                      pattern="[0-9]{10,11}"
                      maxLength={11}
                      inputMode="numeric"
                    />
                  </label>
                </div>
              )}
              <label className="order-note-label">
                Sipariş notu (isteğe bağlı)
                <textarea
                  name="note"
                  maxLength={1000}
                  rows={3}
                  placeholder="Bilmemizi istediğiniz bir şey var mı?"
                />
              </label>
              <label className="checkout-consent">
                <input name="consent" type="checkbox" required />
                <span>
                  <Link href="/mesafeli-satis" target="_blank">
                    Ön bilgilendirme ve satış koşullarını
                  </Link>{" "}
                  ve{" "}
                  <Link href="/gizlilik" target="_blank">
                    gizlilik bilgilendirmesini
                  </Link>{" "}
                  okudum, kabul ediyorum.
                </span>
              </label>
            </section>
            <Link href="/sepet" className="text-link">
              <ArrowLeft size={16} /> Sepete geri dön
            </Link>
          </div>
          <aside className="summary-card checkout-summary">
            <span className="eyebrow">HER ŞEY YERLİ YERİNDE</span>
            <h2>Siparişiniz</h2>
            <div className="checkout-product-list">
              {cart.map((i) => {
                const p = products.find((p) => p.id === i.id);
                return (
                  <div key={i.id}>
                    <span className="summary-product-image">
                      <img src={p?.image || "/images/aquarium.svg"} alt="" />
                      <b>{i.quantity}</b>
                    </span>
                    <span>
                      <Link href={`/urunler/${i.id}`}>
                        {p?.name || "Ürün kaldırılmış"}
                      </Link>
                      <small>{p?.category}</small>
                    </span>
                    <strong>{p ? money(p.price * i.quantity) : "—"}</strong>
                  </div>
                );
              })}
            </div>
            <dl>
              <div>
                <dt>Ara toplam</dt>
                <dd>{money(quote?.subtotal || 0)}</dd>
              </div>
              <div>
                <dt>{delivery === "pickup" ? "Mağazadan teslim" : "Kargo"}</dt>
                <dd>
                  {quote?.shippingFee ? money(quote.shippingFee) : "Ücretsiz"}
                </dd>
              </div>
            </dl>
            <div className="summary-total">
              <span>Genel toplam</span>
              <strong>{money(quote?.total || 0)}</strong>
            </div>
            <p className="summary-tax">Vergiler dahil. Gizli ücret yok.</p>
            {quoteError && (
              <div className="form-error">
                {quoteError} <Link href="/sepet">Sepeti düzenle</Link>
              </div>
            )}
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button
              className="button dark w-full"
              type="submit"
              disabled={
                demo ||
                busy ||
                !quote ||
                !availablePayment ||
                refreshing ||
                (payment === "bank" && !settings.bankEnabled) ||
                (payment === "online" && !settings.demoOnlineEnabled)
              }
            >
              {demo
                ? "Tanıtım · Sipariş alınmıyor"
                : busy
                  ? "Sipariş oluşturuluyor…"
                  : payment === "online"
                    ? "Demo siparişi tamamla"
                    : "Siparişi tamamla"}
              <ArrowRight size={17} />
            </button>
            <div className="summary-assurance">
              <LockKeyhole size={20} />
              <p>
                {payment === "online"
                  ? "Demo işlemi gerçek tahsilat yapmaz."
                  : "Ödemenizi sipariş sonrasında havale/EFT ile yapabilirsiniz."}
              </p>
            </div>
            <Link href="/iletisim" className="summary-help">
              Bir sorunuz mu var? Yanınızdayız.
            </Link>
          </aside>
        </form>
      )}
    </main>
  );
}
function MapPinIcon() {
  return <Store size={22} />;
}
