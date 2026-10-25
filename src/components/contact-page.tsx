"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  Instagram,
  MapPin,
  Phone,
  Mail,
  Clock3,
  ArrowUpRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { useShop } from "./shop-provider";
import { Breadcrumb, PageHeading } from "./shop-shell";
import { MessageCircle } from "lucide-react";
import StoreLocation from "./store-location";
import {
  whatsappHref,
  directionsHref,
  businessAddress,
  businessPhone,
} from "@/lib/contact";
export default function ContactPage() {
  const { settings: s, demo } = useShop();
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (demo) {
      setError(
        "Tanıtım modunda mesaj gönderilmez. İletişim için WhatsApp bağlantısını kullanabilirsiniz.",
      );
      return;
    }
    const form = e.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"),
          email: data.get("email"),
          subject: data.get("subject"),
          message: data.get("message"),
          website: data.get("website"),
          consent: data.get("consent") === "on",
        }),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setSuccess(true);
      form.reset();
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Mesajınız kaydedilemedi. Lütfen tekrar deneyin.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="shell editorial-page">
      <Breadcrumb items={[{ label: "İletişim" }]} />
      <PageHeading
        eyebrow="BİR MERHABA İLE BAŞLAYALIM"
        title="Sualtı dünyamızda yeriniz hazır."
        description="Kurulum, ürün seçimi veya siparişiniz hakkında konuşalım. Yanınızdayız."
      />
      <div className="contact-page-grid">
        <section className="contact-details">
          <img
            src="/images/aquascape-hero.webp"
            alt="Poseidon akvaryum dünyası"
          />
          <h2>Biraz doğa, biraz sohbet.</h2>
          <div>
            <MapPin size={21} />
            <span>
              <b>Mağazamız</b>
              <p>
                {s.address ||
                  "Denizli, Türkiye · Ziyaret öncesi açık adres için bize yazın."}
              </p>
            </span>
          </div>
          {s.phone && (
            <div>
              <Phone size={21} />
              <span>
                <b>Bizi arayın</b>
                <a href={`tel:${s.phone}`}>{s.phone}</a>
              </span>
            </div>
          )}
          {s.email && (
            <div>
              <Mail size={21} />
              <span>
                <b>E-posta</b>
                <a href={`mailto:${s.email}`}>{s.email}</a>
              </span>
            </div>
          )}
          {s.hours && (
            <div>
              <Clock3 size={21} />
              <span>
                <b>Çalışma saatleri</b>
                <p>{s.hours}</p>
              </span>
            </div>
          )}
          <a
            className="button outline"
            href={s.instagram}
            target="_blank"
            rel="noreferrer"
          >
            <Instagram size={18} /> Instagram’da buluşalım{" "}
            <ArrowUpRight size={16} />
          </a>
          <div className="contact-direct-actions">
            <a
              className="button dark"
              href={whatsappHref(s.phone || businessPhone)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle size={18} /> WhatsApp’tan yazın
            </a>
            <a
              className="button outline"
              href={directionsHref(s.address || businessAddress)}
              target="_blank"
              rel="noreferrer"
            >
              <MapPin size={18} /> Konuma git
            </a>
          </div>
        </section>
        <section className="contact-form-panel">
          <span className="eyebrow">AKLINIZDAKİNİ BİRLİKTE DÜŞÜNELİM</span>
          <h2>Bize bir not bırakın.</h2>
          <p>
            Mesajınız mağaza yönetim paneline iletilir. Siparişinizle ilgiliyse
            sipariş numaranızı eklemeyi unutmayın.
          </p>
          {success ? (
            <div className="contact-success" role="status">
              <CheckCircle2 size={43} />
              <h3>Mesajınız bize ulaştı.</h3>
              <p>
                İletişim bilgilerinizle birlikte mağazaya kaydedildi. İlginiz
                için teşekkür ederiz.
              </p>
              <button className="text-link" onClick={() => setSuccess(false)}>
                Yeni mesaj yaz <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <div className="form-grid">
                <label>
                  Ad soyad
                  <input
                    name="name"
                    required
                    maxLength={200}
                    autoComplete="name"
                  />
                </label>
                <label>
                  E-posta
                  <input
                    name="email"
                    type="email"
                    required
                    maxLength={200}
                    autoComplete="email"
                  />
                </label>
                <label className="full-width">
                  Konu
                  <select name="subject" required>
                    <option value="">Bir konu seçin</option>
                    <option>Ürün ve kurulum danışmanlığı</option>
                    <option>Siparişim hakkında</option>
                    <option>İptal / iade desteği</option>
                    <option>Diğer</option>
                  </select>
                </label>
                <label className="full-width">
                  Mesajınız
                  <textarea
                    name="message"
                    required
                    maxLength={3000}
                    rows={6}
                    placeholder="Sizi dinliyoruz…"
                  />
                </label>
              </div>
              <label className="sr-only" aria-hidden="true">
                Web sitesi
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
              <label className="checkout-consent">
                <input name="consent" type="checkbox" required />
                <span>
                  <Link href="/gizlilik" target="_blank">
                    Gizlilik bilgilendirmesini
                  </Link>{" "}
                  okudum. Bilgilerimin mesajıma yanıt vermek için kullanılmasını
                  kabul ediyorum.
                </span>
              </label>
              {error && (
                <p className="form-error" role="alert">
                  {error}
                </p>
              )}
              {demo && (
                <p className="small-muted">
                  Tanıtım önizlemesinde form gönderimi kapalıdır. WhatsApp ve
                  konum bağlantıları kullanılabilir.
                </p>
              )}
              <button className="button dark" disabled={busy || demo}>
                {demo
                  ? "Tanıtım · Form gönderimi kapalı"
                  : busy
                    ? "Gönderiliyor…"
                    : "Mesajı gönder"}
                <ArrowRight size={17} />
              </button>
            </form>
          )}
        </section>
      </div>
      <StoreLocation compact />
    </main>
  );
}
