"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowUpRight,
  ArrowRight,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers3,
  Settings2,
  LogOut,
  Search,
  Plus,
  Pencil,
  Trash2,
  TrendingUp,
  ChevronRight,
  LockKeyhole,
  Eye,
  EyeOff,
  CircleHelp,
  CheckCircle2,
  RefreshCw,
  Menu,
  X,
  AlertCircle,
  Clock3,
  CreditCard,
  Check,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "./brand";
import { Modal } from "./modal";
import AdminSettings from "./admin-settings";
import ImageUploader from "./image-uploader";
import AdminMessages from "./admin-messages";
import {
  categories,
  money,
  orderStatuses,
  type Product,
  type Order,
} from "@/lib/types";
type View =
  "overview" | "products" | "orders" | "categories" | "settings" | "messages";
const views = [
  { id: "overview", label: "Genel bakış", icon: LayoutDashboard },
  { id: "products", label: "Ürünler", icon: Package },
  { id: "orders", label: "Siparişler", icon: ShoppingBag },
  { id: "categories", label: "Kategoriler", icon: Layers3 },
  { id: "messages", label: "Mesajlar", icon: Search },
  { id: "settings", label: "Mağaza & ödeme", icon: Settings2 },
] as const;
const emptyProduct: Product = {
  id: "",
  name: "",
  category: "Canlılar",
  price: 1,
  oldPrice: null,
  stock: 0,
  image: "/images/aquarium.svg",
  description: "",
  badge: "",
  featured: false,
};
export default function Admin({
  authenticated,
  initialProducts,
  initialOrders,
  demo = false,
}: {
  authenticated: boolean;
  initialProducts: Product[];
  initialOrders: Order[];
  demo?: boolean;
}) {
  const router = useRouter();
  const [view, setView] = useState<View>("overview");
  const [products, setProducts] = useState(initialProducts);
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tümü");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [removing, setRemoving] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [notice, setNotice] = useState("");
  const [sidebar, setSidebar] = useState(false);
  useEffect(() => {
    setProducts(initialProducts);
    setOrders(initialOrders);
  }, [initialProducts, initialOrders]);
  async function request(url: string, method = "GET", body?: unknown) {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) {
      if (res.status === 401 && authenticated) router.refresh();
      throw new Error(data.error || "İşlem tamamlanamadı.");
    }
    return data;
  }
  async function login(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const password = new FormData(e.currentTarget).get("password");
    try {
      await request("/api/auth", "POST", { password });
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Bağlantı hatası.");
    } finally {
      setBusy(false);
    }
  }
  async function refresh() {
    setBusy(true);
    setError("");
    try {
      const [p, o] = await Promise.all([
        request("/api/products"),
        request("/api/orders"),
      ]);
      setProducts(p);
      setOrders(o);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Veriler yüklenemedi.");
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    try {
      await request("/api/auth", "DELETE");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Çıkış yapılamadı.");
    }
  }
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editing || imageBusy) return;
    setBusy(true);
    setError("");
    try {
      const product = { ...editing, id: editing.id || crypto.randomUUID() };
      await request("/api/products", "POST", product);
      setProducts((prev) =>
        prev.some((p) => p.id === product.id)
          ? prev.map((p) => (p.id === product.id ? product : p))
          : [...prev, product],
      );
      setEditing(null);
      setNotice("Ürün kaydedildi. Mağaza kataloğu güncellendi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kayıt başarısız.");
    } finally {
      setBusy(false);
    }
  }
  async function remove() {
    if (!removing) return;
    setBusy(true);
    try {
      await request(
        `/api/products?id=${encodeURIComponent(removing.id)}`,
        "DELETE",
      );
      setProducts((prev) => prev.filter((p) => p.id !== removing.id));
      setRemoving(null);
      setNotice("Ürün katalogdan kaldırıldı.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Silinemedi.");
    } finally {
      setBusy(false);
    }
  }
  async function changeStatus(order: Order, status: string) {
    setBusy(true);
    setError("");
    try {
      const result = await request("/api/orders", "PATCH", {
        id: order.id,
        status,
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? result.order : o)),
      );
      setSelectedOrder(result.order);
      setProducts(await request("/api/products"));
      setNotice("Sipariş durumu güncellendi.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Durum güncellenemedi.");
    } finally {
      setBusy(false);
    }
  }
  async function confirmPayment(order: Order) {
    setBusy(true);
    setError("");
    try {
      const result = await request("/api/orders", "PATCH", {
        id: order.id,
        paymentStatus: "Ödeme onaylandı",
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? result.order : o)),
      );
      setSelectedOrder(result.order);
      setNotice("Havale ödemesi onaylandı.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ödeme onaylanamadı.");
    } finally {
      setBusy(false);
    }
  }
  function go(v: View) {
    setView(v);
    setQuery("");
    setFilter("Tümü");
    setSidebar(false);
    setError("");
    setNotice("");
  }
  if (!authenticated)
    return (
      <main className="admin-login">
        <div className="login-art">
          <Link href="/">
            <Brand light />
          </Link>
          <div>
            <span className="eyebrow light">POSEIDON YÖNETİM</span>
            <h1>
              Her güzel dünyanın
              <br />
              arkasında
              <br />
              <em>biraz özen var.</em>
            </h1>
            <p>Mağazanızın dünyasını tek bir yerden yönetin.</p>
          </div>
          <span>DENİZLİ · AKVARYUM & DOĞAL YAŞAM</span>
        </div>
        <div className="login-form-area">
          <Link href="/" className="text-link">
            Mağazaya dön <ArrowUpRight size={16} />
          </Link>
          <form className="login-form" onSubmit={login}>
            <span className="login-icon">
              <LockKeyhole size={25} />
            </span>
            <span className="eyebrow">YENİDEN HOŞ GELDİNİZ</span>
            <h2>Mağazanıza giriş yapın.</h2>
            <p>Ürünler, stoklar ve yeni siparişler sizi bekliyor.</p>
            <label>
              Yönetici şifresi
              <div className="password-field">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="Şifrenizi girin"
                  maxLength={500}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                </button>
              </div>
            </label>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <button className="button primary w-full" disabled={busy}>
              {busy ? "Kontrol ediliyor…" : "Güvenli giriş yap"}
              <ArrowRight size={18} />
            </button>
            <small>
              <ShieldCheck size={15} /> Yalnızca yetkili mağaza yöneticileri
              içindir.
            </small>
          </form>
          <span className="login-copyright">
            © {new Date().getFullYear()} Poseidon Akvaryum
          </span>
        </div>
      </main>
    );
  const lowStock = products.filter((p) => p.stock <= 5);
  const newOrders = orders.filter((o) =>
    ["Yeni sipariş", "Ödeme bekleniyor", "Yeni talep"].includes(o.status),
  );
  const total = orders
    .filter(
      (o) =>
        o.status !== "İptal edildi" && o.paymentStatus === "Ödeme onaylandı",
    )
    .reduce((n, o) => n + o.total, 0);
  const shownProducts = products.filter(
    (p) =>
      (filter === "Tümü" || p.category === filter) &&
      p.name.toLocaleLowerCase("tr").includes(query.toLocaleLowerCase("tr")),
  );
  const shownOrders = orders.filter(
    (o) =>
      (filter === "Tümü" || o.status === filter) &&
      `${o.id} ${o.customer} ${o.phone}`
        .toLocaleLowerCase("tr")
        .includes(query.toLocaleLowerCase("tr")),
  );
  function orderTable(list: Order[]) {
    return list.length ? (
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Sipariş / Tarih</th>
              <th>Müşteri</th>
              <th>Ürünler</th>
              <th>Tutar</th>
              <th>Durum</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id}>
                <td>
                  <b>{o.id}</b>
                  <small>
                    {new Date(o.createdAt).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      timeZone: "Europe/Istanbul",
                    })}
                  </small>
                </td>
                <td>
                  <b>{o.customer}</b>
                  <small>{o.email}</small>
                </td>
                <td>{o.items.reduce((n, i) => n + i.quantity, 0)} ürün</td>
                <td>
                  <b>{money(o.total)}</b>
                </td>
                <td>
                  <span
                    className={`status-badge status-${o.status === "Yeni sipariş" ? "new" : o.status === "Tamamlandı" ? "done" : o.status === "İptal edildi" ? "cancel" : "pending"}`}
                  >
                    {o.status}
                  </span>
                </td>
                <td>
                  <button
                    className="icon-button"
                    aria-label={`${o.id} detayları`}
                    onClick={() => setSelectedOrder(o)}
                  >
                    <ChevronRight size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <div className="admin-empty">
        <ShoppingBag size={32} />
        <h3>
          {query || filter !== "Tümü"
            ? "Eşleşen sipariş yok."
            : "İlk siparişiniz için her şey hazır."}
        </h3>
        <p>Mağazadan gönderilen siparişler burada görünecek.</p>
        <Link href="/urunler" className="text-link">
          Mağazayı ziyaret et <ArrowUpRight size={16} />
        </Link>
      </div>
    );
  }
  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${sidebar ? "sidebar-open" : ""}`}>
        <Link href="/">
          <Brand />
        </Link>
        <div className="workspace-label">MAĞAZA YÖNETİMİ</div>
        <nav>
          {views.map((v) => (
            <button
              key={v.id}
              className={view === v.id ? "selected" : ""}
              onClick={() => go(v.id)}
            >
              <v.icon size={19} />
              {v.label}
              {v.id === "orders" && newOrders.length > 0 && (
                <b>{newOrders.length}</b>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="store-status">
            <span />
            <span>
              <b>Mağazanız hazır</b>
              <small>Sipariş alma modu</small>
            </span>
            <WavesIcon />
          </div>
          <Link href="/" target="_blank" className="button outline">
            Mağazayı görüntüle <ArrowUpRight size={16} />
          </Link>
          <button className="sidebar-user" onClick={logout}>
            <span className="avatar">P</span>
            <span>
              <b>Mağaza yöneticisi</b>
              <small>Güvenli çıkış</small>
            </span>
            <LogOut size={17} />
          </button>
        </div>
      </aside>
      {sidebar && (
        <button
          className="sidebar-backdrop"
          onClick={() => setSidebar(false)}
          aria-label="Menüyü kapat"
        />
      )}
      <div className="admin-workspace">
        <header className="admin-header">
          <div>
            <button
              className="icon-button admin-menu"
              onClick={() => setSidebar(!sidebar)}
              aria-label="Menü"
            >
              {sidebar ? <X /> : <Menu />}
            </button>
            <span>
              Mağaza yönetimi <ChevronRight size={13} />{" "}
              <b>{views.find((v) => v.id === view)?.label}</b>
            </span>
          </div>
          <div>
            <span className="admin-date">
              {new Date().toLocaleDateString("tr-TR", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "Europe/Istanbul",
              })}
            </span>
            <span className="avatar small">P</span>
          </div>
        </header>
        <main className="admin-main">
          {demo && (
            <div className="alert showcase-notice" role="status">
              <ShieldCheck size={20} />
              <span>
                <b>Yönetim paneli · Tanıtım önizlemesi</b>
                <br />
                Menüleri ve formları inceleyebilirsiniz. Değişiklikler
                kaydedilmez; gerçek müşteri veya sipariş bilgisi gösterilmez.
              </span>
            </div>
          )}
          <div className="admin-page-heading">
            <div>
              <span className="eyebrow">POSEIDON KONTROL MERKEZİ</span>
              <h1>
                {view === "overview"
                  ? "Merhaba, Poseidon"
                  : views.find((v) => v.id === view)?.label}
                <span className="heading-dot">.</span>
              </h1>
              <p>
                {view === "overview"
                  ? "Mağazanızda bugün neler oluyor, birlikte bakalım."
                  : view === "products"
                    ? "Koleksiyonunuzu düzenleyin, stoklarınızı güncel tutun."
                    : view === "orders"
                      ? "Müşterilerinizin yeni dünyalarına ilk adımı burada başlıyor."
                      : view === "categories"
                        ? "Koleksiyonunuzun her bölümüne bir bakış."
                        : "Mağazanızın bağlantıları ve entegrasyon durumu."}
              </p>
            </div>
            <div className="admin-heading-actions">
              <button
                className="icon-button"
                aria-label="Verileri yenile"
                disabled={busy}
                onClick={refresh}
              >
                <RefreshCw size={18} className={busy ? "spin" : ""} />
              </button>
              {(view === "products" || view === "overview") && (
                <button
                  className="button primary"
                  onClick={() => {
                    setEditing({ ...emptyProduct });
                    setError("");
                  }}
                >
                  <Plus size={17} /> Yeni ürün ekle
                </button>
              )}
            </div>
          </div>
          {error && !editing && (
            <div className="alert error" role="alert">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {notice && (
            <div className="alert success" role="status">
              <CheckCircle2 size={18} />
              {notice}
              <button
                className="icon-button"
                onClick={() => setNotice("")}
                aria-label="Bildirimi kapat"
              >
                <X size={16} />
              </button>
            </div>
          )}
          {view === "overview" && (
            <>
              <div className="stats-grid">
                {[
                  {
                    label: "Toplam ürün",
                    value: products.length,
                    description: `${categories.length - 1} kategoride listeleniyor`,
                    icon: Package,
                    color: "mint",
                  },
                  {
                    label: "Yeni siparişler",
                    value: newOrders.length,
                    description: "İşlem bekleyen siparişler",
                    icon: ShoppingBag,
                    color: "blue",
                  },
                  {
                    label: "Onaylanan havaleler",
                    value: money(total),
                    description: "Mağazanın onayladığı ödemeler",
                    icon: TrendingUp,
                    color: "sand",
                  },
                  {
                    label: "Düşük stoklu ürün",
                    value: lowStock.length,
                    description: "5 adet ve altında stok",
                    icon: AlertCircle,
                    color: "rose",
                  },
                ].map((s) => (
                  <div className="stat-card" key={s.label}>
                    <div>
                      <span>{s.label}</span>
                      <span className={`stat-icon ${s.color}`}>
                        <s.icon size={19} />
                      </span>
                    </div>
                    <strong>{s.value}</strong>
                    <small>{s.description}</small>
                  </div>
                ))}
              </div>
              <div className="admin-overview-grid">
                <section className="admin-panel recent-orders">
                  <div className="panel-heading">
                    <div>
                      <h2>Son siparişler</h2>
                      <p>Yeni bir dünyanın ilk adımları.</p>
                    </div>
                    <button className="text-link" onClick={() => go("orders")}>
                      Tümünü gör <ArrowRight size={15} />
                    </button>
                  </div>
                  {orderTable(orders.slice(0, 5))}
                </section>
                <section className="admin-panel stock-panel">
                  <div className="panel-heading">
                    <div>
                      <h2>Stok takibi</h2>
                      <p>Biraz ilgi bekleyen ürünler.</p>
                    </div>
                    <Package size={20} />
                  </div>
                  {lowStock.length ? (
                    lowStock.map((p) => (
                      <button
                        className="stock-row"
                        key={p.id}
                        onClick={() => {
                          setEditing({ ...p });
                          setError("");
                        }}
                      >
                        <img src={p.image} alt="" />
                        <span>
                          <b>{p.name}</b>
                          <small>{p.category}</small>
                        </span>
                        <strong>{p.stock} adet</strong>
                      </button>
                    ))
                  ) : (
                    <div className="stock-good">
                      <span>
                        <Check size={23} />
                      </span>
                      <h3>Stoklarınız iyi görünüyor.</h3>
                      <p>Şu an kritik seviyede bir ürününüz yok.</p>
                    </div>
                  )}
                  <button
                    className="stock-footer"
                    onClick={() => go("products")}
                  >
                    Ürünleri yönet <ArrowRight size={15} />
                  </button>
                </section>
              </div>
              <section className="admin-welcome-banner">
                <div>
                  <span className="eyebrow light">BİR SONRAKİ ADIM</span>
                  <h2>Mağazanızı büyütmeye hazır mısınız?</h2>
                  <p>
                    Ürünlerinizi hazırlayın. Online ödeme entegrasyonunu sonraki
                    adımda tamamlayın.
                  </p>
                </div>
                <button
                  className="button banner-button"
                  onClick={() => go("settings")}
                >
                  Mağaza bilgileri <ArrowUpRight size={17} />
                </button>
              </section>
              <div className="admin-tip">
                <CircleHelp size={18} />
                <p>
                  Online ödemeler demodur. Onaylanan havaleler kartı yalnızca
                  mağazanın doğruladığı ödemeleri gösterir.
                </p>
              </div>
            </>
          )}
          {view === "products" && (
            <section className="admin-panel">
              <div className="admin-table-toolbar">
                <div className="admin-search">
                  <Search size={17} />
                  <input
                    placeholder="Ürün adı ara…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label="Kategori filtresi"
                >
                  {categories.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span>{shownProducts.length} ürün</span>
              </div>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Ürün</th>
                      <th>Kategori</th>
                      <th>Satış fiyatı</th>
                      <th>Stok</th>
                      <th>Görünürlük</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownProducts.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <div className="table-product">
                            <img src={p.image} alt="" />
                            <span>
                              <b>{p.name}</b>
                              <small>{p.id.slice(0, 20)}</small>
                            </span>
                          </div>
                        </td>
                        <td>{p.category}</td>
                        <td>
                          <b>{money(p.price)}</b>
                          {p.oldPrice && (
                            <small>
                              <del>{money(p.oldPrice)}</del>
                            </small>
                          )}
                        </td>
                        <td>
                          <span
                            className={`status-badge ${p.stock > 5 ? "status-done" : p.stock > 0 ? "status-pending" : "status-cancel"}`}
                          >
                            {p.stock} adet
                          </span>
                        </td>
                        <td>
                          {p.featured ? (
                            <span className="featured-tag">✦ Öne çıkan</span>
                          ) : (
                            <span className="muted">Katalog</span>
                          )}
                        </td>
                        <td>
                          <div className="table-actions">
                            <button
                              className="icon-button"
                              aria-label={`${p.name} düzenle`}
                              onClick={() => {
                                setEditing({ ...p });
                                setError("");
                              }}
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="icon-button danger"
                              aria-label={`${p.name} sil`}
                              onClick={() => setRemoving(p)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {!shownProducts.length && (
                <div className="admin-empty">
                  <Package />
                  <h3>Ürün bulunamadı.</h3>
                  <p>Aramayı veya kategori filtresini değiştirin.</p>
                </div>
              )}
            </section>
          )}
          {view === "orders" && (
            <section className="admin-panel">
              <div className="admin-table-toolbar">
                <div className="admin-search">
                  <Search size={17} />
                  <input
                    placeholder="Sipariş no, müşteri veya telefon ara…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  aria-label="Durum filtresi"
                >
                  <option>Tümü</option>
                  {orderStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <span>{shownOrders.length} sipariş</span>
              </div>
              {orderTable(shownOrders)}
            </section>
          )}
          {view === "categories" && (
            <div className="admin-category-grid">
              {categories.slice(1).map((c, i) => (
                <button
                  className="admin-category-card"
                  key={c}
                  onClick={() => {
                    go("products");
                    setFilter(c);
                  }}
                >
                  <span>0{i + 1}</span>
                  <Layers3 size={26} />
                  <h2>{c}</h2>
                  <p>
                    {products.filter((p) => p.category === c).length} ürün ·{" "}
                    {products
                      .filter((p) => p.category === c)
                      .reduce((n, p) => n + p.stock, 0)}{" "}
                    adet stok
                  </p>
                  <span className="text-link">
                    Ürünleri yönet <ArrowUpRight size={17} />
                  </span>
                </button>
              ))}
            </div>
          )}
          {view === "settings" && <AdminSettings />}
          {view === "messages" && <AdminMessages />}
          <div className="admin-footer">
            <span>Poseidon Akvaryum · Yönetim Paneli</span>
            <span>
              <i /> Her detayda biraz özen.
            </span>
          </div>
        </main>
      </div>
      {editing && (
        <Modal
          title={editing.id ? "Ürünü düzenle" : "Yeni bir ürün ekleyin"}
          onClose={() => {
            if (!busy && !imageBusy) {
              setEditing(null);
              setError("");
            }
          }}
          wide
        >
          <form onSubmit={save} className="product-form">
            <div className="form-grid">
              <label className="full-width">
                Ürün adı
                <input
                  value={editing.name}
                  required
                  maxLength={150}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </label>
              <label>
                Kategori
                <select
                  value={editing.category}
                  onChange={(e) =>
                    setEditing({ ...editing, category: e.target.value })
                  }
                >
                  {categories.slice(1).map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </label>
              <label>
                Stok adedi
                <input
                  type="number"
                  min="0"
                  max="100000"
                  required
                  value={editing.stock}
                  onChange={(e) =>
                    setEditing({ ...editing, stock: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Satış fiyatı (₺)
                <input
                  type="number"
                  min="0.01"
                  max="10000000"
                  step="0.01"
                  required
                  value={editing.price}
                  onChange={(e) =>
                    setEditing({ ...editing, price: Number(e.target.value) })
                  }
                />
              </label>
              <label>
                Eski fiyat (isteğe bağlı)
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={editing.oldPrice ?? ""}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      oldPrice: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </label>
              <div className="full-width">
                <ImageUploader
                  value={editing.image}
                  onChange={(url) =>
                    setEditing((prev) =>
                      prev ? { ...prev, image: url } : prev,
                    )
                  }
                  onBusyChange={setImageBusy}
                />
              </div>
              <label className="full-width">
                Ürün açıklaması
                <textarea
                  rows={4}
                  required
                  maxLength={3000}
                  value={editing.description}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                />
              </label>
              <label>
                Etiket
                <input
                  placeholder="Örn. Yeni gelen"
                  value={editing.badge}
                  maxLength={40}
                  onChange={(e) =>
                    setEditing({ ...editing, badge: e.target.value })
                  }
                />
              </label>
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={editing.featured}
                  onChange={(e) =>
                    setEditing({ ...editing, featured: e.target.checked })
                  }
                />
                Ana sayfada öne çıkar
              </label>
            </div>
            {error && (
              <p className="form-error" role="alert">
                {error}
              </p>
            )}
            <div className="form-actions">
              <button
                type="button"
                className="button outline"
                disabled={busy || imageBusy}
                onClick={() => setEditing(null)}
              >
                Vazgeç
              </button>
              <button className="button primary" disabled={busy || imageBusy}>
                {busy ? "Kaydediliyor…" : "Ürünü kaydet"}
                <Check size={17} />
              </button>
            </div>
          </form>
        </Modal>
      )}
      {removing && (
        <Modal
          title="Ürün katalogdan kaldırılsın mı?"
          onClose={() => setRemoving(null)}
        >
          <div className="prose-content">
            <p>
              <b>{removing.name}</b> mağazadan kaldırılacak. Önceki
              siparişlerdeki ürün kayıtları korunur.
            </p>
            <div className="form-actions">
              <button
                className="button outline"
                onClick={() => setRemoving(null)}
                disabled={busy}
              >
                Vazgeç
              </button>
              <button
                className="button danger-button"
                onClick={remove}
                disabled={busy}
              >
                {busy ? "Kaldırılıyor…" : "Ürünü kaldır"}
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        </Modal>
      )}
      {selectedOrder && (
        <Modal
          title={`Sipariş ${selectedOrder.id}`}
          onClose={() => setSelectedOrder(null)}
          wide
        >
          <div className="order-detail">
            <div className="order-detail-top">
              <div>
                <h3>{selectedOrder.customer}</h3>
                <a href={`mailto:${selectedOrder.email}`}>
                  {selectedOrder.email}
                </a>
                <a href={`tel:${selectedOrder.phone}`}>{selectedOrder.phone}</a>
                <p>
                  {selectedOrder.address}
                  <br />
                  {selectedOrder.district} / {selectedOrder.city}{" "}
                  {selectedOrder.postalCode}
                </p>
              </div>
              <label>
                Sipariş durumu
                <select
                  value={selectedOrder.status}
                  disabled={busy}
                  onChange={(e) => changeStatus(selectedOrder, e.target.value)}
                >
                  {orderStatuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <small>Ödeme durumu aşağıda gösterilir</small>
              </label>
            </div>
            <div className="order-admin-payment">
              <div>
                <span>
                  <b>
                    {selectedOrder.paymentMethod === "bank"
                      ? "Havale / EFT"
                      : selectedOrder.paymentMethod === "online"
                        ? "Online ödeme (Demo)"
                        : "Eski talep kaydı"}
                  </b>
                  <p>{selectedOrder.paymentStatus || "Ödeme bilgisi yok"}</p>
                </span>
                {selectedOrder.paymentMethod === "bank" &&
                  selectedOrder.paymentStatus === "Havale bekleniyor" &&
                  selectedOrder.status !== "İptal edildi" && (
                    <button
                      className="button dark"
                      disabled={busy}
                      onClick={() => confirmPayment(selectedOrder)}
                    >
                      Havaleyi onayla <Check size={15} />
                    </button>
                  )}
              </div>
              <p>
                {selectedOrder.deliveryMethod === "pickup"
                  ? "Mağazadan teslim"
                  : "Kargo ile teslim"}{" "}
                · Kargo: {money(selectedOrder.shippingFee || 0)}
              </p>
              {selectedOrder.paymentMethod === "online" && (
                <p>
                  Bu bir demo siparişidir. Gerçek kart tahsilatı yapılmamıştır.
                </p>
              )}
              {selectedOrder.bankSnapshot && (
                <p>
                  {selectedOrder.bankSnapshot.bankName} ·{" "}
                  {selectedOrder.bankSnapshot.accountName}
                  <br />
                  {selectedOrder.bankSnapshot.iban}
                </p>
              )}
              {selectedOrder.status === "İptal edildi" &&
                selectedOrder.paymentStatus === "Ödeme onaylandı" && (
                  <p>
                    Ödeme banka üzerinden manuel iade edilmelidir. Sipariş
                    iptali para transferi yapmaz.
                  </p>
                )}
              {selectedOrder.billingType === "business" && (
                <p>
                  Fatura: {selectedOrder.companyName} ·{" "}
                  {selectedOrder.taxOffice} / {selectedOrder.taxNumber}
                </p>
              )}
            </div>
            {selectedOrder.note && (
              <div className="order-note">
                <b>Müşteri notu</b>
                <p>{selectedOrder.note}</p>
              </div>
            )}
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Ürün</th>
                    <th>Adet</th>
                    <th>Birim fiyat</th>
                    <th>Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((i) => (
                    <tr key={i.id}>
                      <td>{i.name}</td>
                      <td>{i.quantity}</td>
                      <td>{money(i.price)}</td>
                      <td>{money(i.price * i.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="order-summary">
              <span>Sipariş tutarı</span>
              <b>{money(selectedOrder.total)}</b>
            </div>
            {error && <p className="form-error">{error}</p>}
          </div>
        </Modal>
      )}
    </div>
  );
}
function WavesIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <path d="M2 7c4-5 6 5 10 0s6 5 10 0M2 12c4-5 6 5 10 0s6 5 10 0M2 17c4-5 6 5 10 0s6 5 10 0" />
    </svg>
  );
}
