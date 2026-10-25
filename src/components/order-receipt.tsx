"use client";
import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  Check,
  Landmark,
  Package,
  Store,
  ArrowRight,
  Truck,
  Clock3,
} from "lucide-react";
import { money, type Order } from "@/lib/types";
export function OrderReceipt({
  order,
  success = false,
}: {
  order: Order;
  success?: boolean;
}) {
  const [copied, setCopied] = useState("");
  async function copy(value: string, id: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(id);
    } catch {
      setCopied("unavailable");
    }
  }
  return (
    <div className="order-receipt">
      {success && (
        <div className="receipt-intro">
          <span>
            <CheckCircle2 size={37} />
          </span>
          <span className="eyebrow">GÜZEL BİR DÜNYA BURADA BAŞLIYOR</span>
          <h1>
            {order.paymentMethod === "bank"
              ? "Siparişiniz alındı."
              : "Demo siparişiniz tamamlandı."}
          </h1>
          <p>
            {order.paymentMethod === "bank"
              ? "Banka bilgileri aşağıda. Havaleniz onaylandıktan sonra siparişiniz hazırlanacak."
              : "Demo akışı başarıyla tamamlandı. Gerçek bir tahsilat yapılmadı."}
          </p>
        </div>
      )}
      <div className="receipt-overview">
        <div>
          <small>Sipariş numarası</small>
          <b>{order.id}</b>
          <button
            onClick={() => copy(order.id, "id")}
            aria-label="Sipariş numarasını kopyala"
          >
            {copied === "id" ? <Check size={14} /> : <Copy size={14} />}
          </button>
        </div>
        <div>
          <small>Tarih</small>
          <b>
            {new Date(order.createdAt).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              timeZone: "Europe/Istanbul",
            })}
          </b>
        </div>
        <div>
          <small>Sipariş durumu</small>
          <b className="receipt-status">{order.status}</b>
        </div>
        <div>
          <small>Ödeme durumu</small>
          <b>{order.paymentStatus || "Belirtilmedi"}</b>
        </div>
      </div>
      {order.paymentMethod === "bank" && order.bankSnapshot && (
        <section className="receipt-bank">
          <div>
            <Landmark size={26} />
            <h2>Havale / EFT bilgileriniz</h2>
          </div>
          <p>
            Havale açıklamasına <b>{order.id}</b> yazın. Sipariş tutarı:{" "}
            <b>{money(order.total)}</b>.
          </p>
          <dl>
            <div>
              <dt>Banka</dt>
              <dd>{order.bankSnapshot.bankName}</dd>
            </div>
            <div>
              <dt>Hesap sahibi</dt>
              <dd>{order.bankSnapshot.accountName}</dd>
            </div>
            <div>
              <dt>IBAN</dt>
              <dd>
                {order.bankSnapshot.iban.replace(/(.{4})/g, "$1 ").trim()}
                <button
                  onClick={() => copy(order.bankSnapshot!.iban, "iban")}
                  className="text-link"
                >
                  {copied === "iban" ? (
                    <>
                      <Check size={15} /> Kopyalandı
                    </>
                  ) : (
                    <>
                      <Copy size={15} /> Kopyala
                    </>
                  )}
                </button>
              </dd>
            </div>
          </dl>
          <small>
            Ödeme açıklaması ve hesap tutarını kontrol edin. Ödemenin onayı
            mağaza tarafından yapılır.
          </small>
        </section>
      )}
      <div className="receipt-grid">
        <section className="receipt-panel">
          <h2>
            <Package size={20} /> Siparişinizde neler var?
          </h2>
          {order.items.map((i) => (
            <div className="receipt-line" key={i.id}>
              <span>
                <Link href={`/urunler/${i.id}`}>{i.name}</Link>
                <small>
                  {i.quantity} adet × {money(i.price)}
                </small>
              </span>
              <b>{money(i.price * i.quantity)}</b>
            </div>
          ))}
          <dl>
            <div>
              <dt>Ara toplam</dt>
              <dd>{money(order.subtotal ?? order.total)}</dd>
            </div>
            <div>
              <dt>
                {order.deliveryMethod === "pickup"
                  ? "Mağazadan teslim"
                  : "Kargo"}
              </dt>
              <dd>
                {order.shippingFee ? money(order.shippingFee) : "Ücretsiz"}
              </dd>
            </div>
          </dl>
          <div className="summary-total">
            <span>Genel toplam</span>
            <strong>{money(order.total)}</strong>
          </div>
        </section>
        <section className="receipt-panel">
          <h2>
            {order.deliveryMethod === "pickup" ? (
              <Store size={20} />
            ) : (
              <Truck size={20} />
            )}{" "}
            Teslimat bilgileriniz
          </h2>
          <h3>{order.customer}</h3>
          <p>
            {order.deliveryMethod === "pickup"
              ? "Mağazadan teslim alınacak."
              : `${order.address}, ${order.district || ""} / ${order.city || ""} ${order.postalCode || ""}`}
          </p>
          <p>
            {order.phone}
            <br />
            {order.email}
          </p>
          {order.billingType === "business" && (
            <div className="receipt-billing">
              <h3>Kurumsal fatura</h3>
              <p>
                {order.companyName}
                <br />
                {order.taxOffice} · {order.taxNumber}
              </p>
            </div>
          )}
          {order.note && (
            <div className="receipt-billing">
              <h3>Sipariş notunuz</h3>
              <p>{order.note}</p>
            </div>
          )}
          <div className="commerce-notice">
            <Clock3 size={19} />
            <p>
              Sipariş durumunuzu numaranız ve e-posta adresinizle takip
              edebilirsiniz.
            </p>
          </div>
        </section>
      </div>
      {copied === "unavailable" && (
        <p className="small-muted">
          Otomatik kopyalama kullanılamıyor. Bilgileri seçip
          kopyalayabilirsiniz.
        </p>
      )}
      <div className="receipt-actions">
        <Link href="/urunler" className="button dark">
          Alışverişe devam et <ArrowRight size={17} />
        </Link>
        <Link href="/siparis-takibi" className="button outline">
          Siparişimi takip et
        </Link>
        <Link href="/iletisim" className="text-link">
          Desteğe ihtiyacım var
        </Link>
      </div>
    </div>
  );
}
