"use client";
import { useState, type FormEvent } from "react";
import { Search, Package, ArrowRight } from "lucide-react";
import { Breadcrumb, PageHeading } from "./shop-shell";
import { OrderReceipt } from "./order-receipt";
import type { Order } from "@/lib/types";
export default function TrackingPage() {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setOrder(null);
    const form = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/orders/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: form.get("id"), email: form.get("email") }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error);
      setOrder(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sipariş bilgileri alınamadı.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell support-page">
      <Breadcrumb items={[{ label: "Sipariş takibi" }]} />
      <PageHeading
        eyebrow="YENİ DÜNYANIZ NE DURUMDA?"
        title="Siparişinizin izini sürün."
        description="Sipariş numaranız ve siparişte kullandığınız e-posta adresi yeterli."
      />
      <form className="tracking-form" onSubmit={submit}>
        <Package size={28} />
        <div className="form-grid">
          <label>
            Sipariş numarası
            <input
              name="id"
              required
              maxLength={40}
              placeholder="PS-XXXXXXXXXXXX"
              autoCapitalize="characters"
            />
          </label>
          <label>
            E-posta adresi
            <input
              name="email"
              required
              type="email"
              maxLength={200}
              placeholder="Siparişte kullandığınız e-posta"
              autoComplete="email"
            />
          </label>
        </div>
        <button className="button dark" disabled={busy}>
          {busy ? "Sorgulanıyor…" : "Siparişimi göster"}
          <ArrowRight size={17} />
        </button>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
      </form>
      {order && <OrderReceipt order={order} />}
    </main>
  );
}
