"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ArrowUpRight,
  Instagram,
  MapPin,
  Phone,
  MessageCircle,
  Package,
  ArrowRight,
  Waves,
  ShieldCheck,
  Leaf,
  Store,
  ChevronRight,
  ChevronDown,
  LayoutGrid,
  Truck,
  Fish,
  Flower2,
  SlidersHorizontal,
  Heart,
} from "lucide-react";
import { useShop } from "./shop-provider";
import { Brand } from "./brand";
import LiveSearch from "./live-search";
import { categories } from "@/lib/types";
import {
  directionsHref,
  whatsappHref,
  phoneHref,
  businessPhone,
  businessAddress,
} from "@/lib/contact";
const links = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/urunler", label: "Ürünlerimiz" },
  { href: "/hakkimizda", label: "Hikâyemiz" },
  { href: "/rehber", label: "Akvaryum Rehberi" },
  { href: "/iletisim", label: "İletişim" },
];
export default function StoreChrome({ children }: { children: ReactNode }) {
  const { count, settings, refresh } = useShop();
  const path = usePathname();
  const [mobile, setMobile] = useState(false);
  const categoryMenu = useRef<HTMLDetailsElement>(null);
  const phone = settings.phone || businessPhone;
  const address = settings.address || businessAddress;
  const whatsapp = whatsappHref(phone);
  const directions = directionsHref(address);
  useEffect(() => {
    setMobile(false);
    if (categoryMenu.current) categoryMenu.current.open = false;
    window.scrollTo({ top: 0, behavior: "instant" });
    refresh().catch(() => {});
  }, [path, refresh]);
  useEffect(() => {
    const dismiss = (e: PointerEvent) => {
      if (
        categoryMenu.current &&
        !categoryMenu.current.contains(e.target as Node)
      )
        categoryMenu.current.open = false;
    };
    const escape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && categoryMenu.current?.open) {
        categoryMenu.current.open = false;
        categoryMenu.current.querySelector("summary")?.focus();
      }
    };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <>
      <div className="utility-bar">
        <div className="shell">
          {settings.shippingEnabled &&
          settings.freeShippingThreshold > 0 &&
          settings.shippingFee > 0 ? (
            <Link className="shipping-promo" href="/teslimat-iade">
              <Truck size={15} />
              <span>
                <b>
                  {settings.freeShippingThreshold.toLocaleString("tr-TR")} TL ve
                  üzeri
                </b>{" "}
                siparişlerde kargo bedava
              </span>
              <ArrowUpRight size={12} />
            </Link>
          ) : (
            <span>
              <MapPin size={12} /> Denizli’deki sualtı dünyanız
            </span>
          )}
          <div>
            <Link href="/siparis-takibi">
              <Package size={13} /> Sipariş takibi
            </Link>
            <a href={whatsapp} target="_blank" rel="noreferrer">
              <MessageCircle size={13} /> {phone}
            </a>
          </div>
        </div>
      </div>
      <header className="site-header renewed-header">
        <div className="shell brandbar">
          <Link
            className="brandbar-logo"
            href="/"
            aria-label="Poseidon ana sayfa"
          >
            <Brand />
          </Link>
          <LiveSearch />
          <a
            className="header-consult"
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={21} />
            <span>
              <small>BİRLİKTE DOĞRU SEÇİM</small>
              <b>
                Bize danışın <ArrowUpRight size={13} />
              </b>
            </span>
          </a>
          <Link
            className="header-cart"
            href="/sepet"
            aria-label={`Sepetim, ${count} ürün`}
          >
            <span>
              <ShoppingBag size={21} />
              <b>{count}</b>
            </span>
            <strong>Sepetim</strong>
          </Link>
          <button
            className="header-menu-button"
            aria-label={mobile ? "Menüyü kapat" : "Menüyü aç"}
            onClick={() => setMobile(!mobile)}
          >
            {mobile ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className="navigation-line">
          <div className="shell navigation-inner">
            <details className="header-category-menu" ref={categoryMenu}>
              <summary>
                <LayoutGrid size={17} />
                Kategoriler
                <ChevronDown size={14} />
              </summary>
              <div className="header-category-dropdown">
                <div>
                  <span className="eyebrow">DÜNYANIZI KEŞFEDİN</span>
                  <b>Her ihtiyaca bir dokunuş.</b>
                </div>
                <nav aria-label="Ürün kategorileri">
                  {categories.slice(1).map((c, i) => {
                    const Icon = [
                      Fish,
                      Waves,
                      SlidersHorizontal,
                      Heart,
                      Flower2,
                    ][i];
                    return (
                      <Link
                        href={`/urunler?kategori=${encodeURIComponent(c)}`}
                        key={c}
                        onClick={() => {
                          if (categoryMenu.current)
                            categoryMenu.current.open = false;
                        }}
                      >
                        <span>
                          <Icon size={20} />
                        </span>
                        <b>{c}</b>
                        <ArrowUpRight size={15} />
                      </Link>
                    );
                  })}
                </nav>
                <Link
                  className="category-menu-all"
                  href="/urunler"
                  onClick={() => {
                    if (categoryMenu.current) categoryMenu.current.open = false;
                  }}
                >
                  Tüm ürünleri keşfet
                  <ArrowRight size={16} />
                </Link>
              </div>
            </details>
            <nav className="main-navigation" aria-label="Ana menü">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={
                    (l.href === "/" ? path === "/" : path.startsWith(l.href))
                      ? "active"
                      : ""
                  }
                >
                  <span className="nav-desktop-label">{l.label}</span>
                  <span className="nav-mobile-label">
                    {l.href === "/urunler"
                      ? "Ürünler"
                      : l.href === "/rehber"
                        ? "Rehber"
                        : l.label}
                  </span>
                  {l.href === "/urunler" && (
                    <span className="nav-product-dot" />
                  )}
                </Link>
              ))}
            </nav>
            <a
              className="navigation-location"
              href={directions}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={15} /> Mağazamıza gelin <ArrowUpRight size={13} />
            </a>
          </div>
        </div>
        {mobile && (
          <div className="expanded-mobile-menu">
            <LiveSearch mobile onNavigate={() => setMobile(false)} />
            <nav>
              {links.map((l) => (
                <Link key={l.href} href={l.href}>
                  {l.label}
                  <ChevronRight size={16} />
                </Link>
              ))}
              <Link href="/siparis-takibi">
                Sipariş takibi <Package size={16} />
              </Link>
            </nav>
            <div>
              <a href={whatsapp} target="_blank" rel="noreferrer">
                <MessageCircle size={17} /> WhatsApp
              </a>
              <a href={directions} target="_blank" rel="noreferrer">
                <MapPin size={17} /> Yol tarifi
              </a>
            </div>
          </div>
        )}
      </header>
      {children}
      <footer className="site-footer">
        <div className="shell footer-invitation">
          <div className="footer-invitation-icon">
            <Waves size={31} />
          </div>
          <div>
            <span className="eyebrow">EKRANDAN ÇIKIN, DÜNYAMIZA GELİN</span>
            <h2>Bir merhaba, yepyeni bir dünya.</h2>
            <p>İlk akvaryumunuzdan yeni dostlarınıza, birlikte düşünelim.</p>
          </div>
          <div className="footer-invitation-actions">
            <a
              className="button primary"
              href={whatsapp}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} /> WhatsApp’tan yazın
            </a>
            <a
              className="button glass-button"
              href={directions}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={17} /> Yol tarifi <ArrowUpRight size={16} />
            </a>
          </div>
        </div>
        <div className="shell powerful-footer-grid">
          <div className="footer-brand-story">
            <Link href="/">
              <Brand light />
            </Link>

            <span>
              Denizli’de tutkuyla kurduğumuz bu dünyada, sizin hikâyenize de yer
              var.
            </span>
            <div className="footer-socials">
              <a
                href={settings.instagram}
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram hesabımız"
              >
                <Instagram size={20} />
              </a>
              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp’tan bize yazın"
              >
                <MessageCircle size={20} />
              </a>
              <a href={phoneHref(phone)} aria-label="Mağazamızı arayın">
                <Phone size={19} />
              </a>
            </div>
          </div>
          <div className="footer-link-column">
            <h3>Dünyamızı keşfedin</h3>
            <Link href="/hakkimizda">Hikâyemiz</Link>
            <Link href="/urunler">Tüm ürünler</Link>
            <Link href="/rehber">Akvaryum rehberi</Link>
            {categories.slice(1, 4).map((c) => (
              <Link key={c} href={`/urunler?kategori=${encodeURIComponent(c)}`}>
                {c}
              </Link>
            ))}
          </div>
          <div className="footer-link-column">
            <h3>Alışverişin her adımında</h3>
            <Link href="/siparis-takibi">Sipariş takibi</Link>
            <Link href="/odeme-bilgileri">Ödeme seçenekleri</Link>
            <Link href="/teslimat-iade">Teslimat & iade</Link>
            <Link href="/sss">Sık sorulan sorular</Link>
            <Link href="/iletisim">İletişim & destek</Link>
            <Link href="/mesafeli-satis">Satış koşulları</Link>
          </div>
          <div className="footer-visit">
            <h3>Denizli’de buluşalım.</h3>
            <a
              className="footer-address"
              href={directions}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={20} />
              <span>{address}</span>
            </a>
            <a className="footer-phone" href={phoneHref(phone)}>
              <Phone size={19} />
              <b>{phone}</b>
            </a>
            {settings.hours && <p>{settings.hours}</p>}
            <a
              className="footer-directions"
              href={directions}
              target="_blank"
              rel="noreferrer"
            >
              Konuma git <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
        <div className="shell footer-promises">
          <div>
            <ShieldCheck size={22} />
            <span>
              Özenli alışveriş<small>Açık fiyatlar, anlaşılır adımlar.</small>
            </span>
          </div>
          <div>
            <Store size={22} />
            <span>
              Denizli’de mağazadan teslim
              <small>Birlikte kontrol ederek teslim alın.</small>
            </span>
          </div>
          <div>
            <Leaf size={22} />
            <span>
              Doğru kurulum, doğal denge
              <small>Seçiminizi birlikte düşünelim.</small>
            </span>
          </div>
          <div className="footer-payment-labels">
            <span>HAVALE / EFT</span>
            <span>ONLINE · DEMO</span>
          </div>
        </div>
        <div className="shell powerful-footer-bottom">
          <span>
            © {new Date().getFullYear()} {settings.storeName}. Tüm hakları
            saklıdır.
          </span>
          <div>
            <Link href="/gizlilik">Gizlilik</Link>
            <Link href="/mesafeli-satis">Satış koşulları</Link>
            <Link href="/admin">
              Yönetim <ArrowUpRight size={12} />
            </Link>
          </div>
          <span>SUYUN İÇİNDE HAYAT VAR.</span>
        </div>
      </footer>
      <a
        href={whatsapp}
        target="_blank"
        rel="noreferrer"
        className="floating-whatsapp"
        aria-label="WhatsApp’tan bize ulaşın"
      >
        <span className="floating-whatsapp-ring" />
        <MessageCircle size={25} />
        <span>Birlikte seçelim.</span>
      </a>
      <nav className="mobile-contact-dock" aria-label="Hızlı iletişim">
        <a href={phoneHref(phone)}>
          <Phone size={19} />
          <span>Ara</span>
        </a>
        <a
          className="dock-whatsapp"
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
        >
          <MessageCircle size={22} />
          <span>WhatsApp</span>
        </a>
        <a href={directions} target="_blank" rel="noreferrer">
          <MapPin size={20} />
          <span>Konuma git</span>
        </a>
        <Link href="/sepet">
          <ShoppingBag size={20} />
          <span>Sepetim {count > 0 && <b>{count}</b>}</span>
        </Link>
      </nav>
    </>
  );
}
