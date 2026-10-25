"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import StoreChrome from "./store-chrome";
export function ShopShell({ children }: { children: ReactNode }) {
  return <StoreChrome>{children}</StoreChrome>;
}
export function Breadcrumb({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav className="breadcrumbs" aria-label="Sayfa yolu">
      <Link href="/">Ana Sayfa</Link>
      {items.map((i, n) => (
        <span key={n}>
          <span className="breadcrumb-separator">/</span>
          {i.href ? (
            <Link href={i.href}>{i.label}</Link>
          ) : (
            <span aria-current="page">{i.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
  );
}
export function CheckoutSteps({ current = 1 }: { current?: number }) {
  return (
    <ol className="checkout-steps">
      {["Sepetim", "Teslimat & ödeme", "Sipariş tamamlandı"].map((s, i) => (
        <li key={s} className={current >= i + 1 ? "current" : ""}>
          <span>{i + 1}</span>
          {i === 0 ? <Link href="/sepet">{s}</Link> : <span>{s}</span>}
        </li>
      ))}
    </ol>
  );
}
