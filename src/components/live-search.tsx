"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Search, ArrowRight, X } from "lucide-react";
import { useShop } from "./shop-provider";
import { money } from "@/lib/types";
import { matchesProduct } from "@/lib/search";

export default function LiveSearch({
  mobile = false,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const { products } = useShop();
  const router = useRouter();
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const matches = query.trim()
    ? products
        .filter((p) => matchesProduct(p, query))
        .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))
    : [];
  const visible = matches.slice(0, 5);
  const expanded = open && !!query.trim();
  const href = `/urunler?ara=${encodeURIComponent(query.trim())}`;
  function close() {
    setOpen(false);
    setActive(-1);
    onNavigate?.();
  }
  return (
    <div
      className={`live-search ${mobile ? "live-search-mobile" : "live-search-desktop"}`}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setOpen(false);
      }}
    >
      <form
        className={mobile ? "mobile-header-search" : "header-search"}
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          router.push(
            active >= 0 && visible[active]
              ? `/urunler/${visible[active].id}`
              : href,
          );
          close();
        }}
      >
        <Search size={19} />
        <input
          name="ara"
          aria-label={mobile ? "Mobil ürün arama" : "Mağazada ürün ara"}
          placeholder="Ürün, kategori veya marka arayın…"
          value={query}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={`${id}-results`}
          aria-activedescendant={
            expanded && active >= 0 ? `${id}-${active}` : undefined
          }
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setOpen(false);
              setActive(-1);
            } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              setActive((n) =>
                visible.length
                  ? (n + (e.key === "ArrowDown" ? 1 : -1) + visible.length) %
                    visible.length
                  : -1,
              );
            }
          }}
        />
        {query && (
          <button
            type="button"
            aria-label="Aramayı temizle"
            onClick={() => {
              setQuery("");
              setActive(-1);
            }}
          >
            <X size={15} />
          </button>
        )}
        <button type="submit" aria-label="Aramayı başlat">
          <ArrowRight size={18} />
        </button>
      </form>
      {expanded && (
        <div className="live-search-panel">
          <div className="live-search-heading" role="status">
            {matches.length
              ? `${matches.length} ürün bulundu`
              : "Ürün bulunamadı"}
            <span>ANLIK ARAMA</span>
          </div>
          <ul id={`${id}-results`} role="listbox" aria-label="Ürün sonuçları">
            {visible.map((p, i) => (
              <li
                key={p.id}
                id={`${id}-${i}`}
                role="option"
                aria-selected={active === i}
              >
                <Link
                  href={`/urunler/${p.id}`}
                  onClick={close}
                  onMouseEnter={() => setActive(i)}
                  tabIndex={-1}
                >
                  <img src={p.image} alt="" width={52} height={52} />
                  <span>
                    <b>{p.name}</b>
                    <small>
                      {p.category} · {p.stock > 0 ? "Stokta" : "Tükendi"}
                    </small>
                  </span>
                  <strong>{money(p.price)}</strong>
                  <ArrowRight size={15} />
                </Link>
              </li>
            ))}
          </ul>
          {!matches.length && (
            <p className="live-search-empty">
              Farklı bir kelime deneyin. Örneğin: akvaryum, yem veya filtre.
            </p>
          )}
          <Link className="live-search-all" href={href} onClick={close}>
            Tüm sonuçları gör <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
}
