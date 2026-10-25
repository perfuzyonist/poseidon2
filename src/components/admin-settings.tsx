"use client";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  Landmark,
  Truck,
  Settings2,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { StoreSettings } from "@/lib/types";
import ImageUploader from "./image-uploader";
export default function AdminSettings() {
  const [data, setData] = useState<StoreSettings | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [imageBusy, setImageBusy] = useState(false);
  const router = useRouter();
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => {
        if (!r.ok) throw new Error("Ayarlar alınamadı.");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (imageBusy) return;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const r = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      setData(result);
      setSaved(true);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ayarlar kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  }
  if (!data)
    return (
      <div className="admin-panel settings-loading">
        {error || "Mağaza ayarları yükleniyor…"}
      </div>
    );
  function field(key: keyof StoreSettings, value: string | number | boolean) {
    setSaved(false);
    setData((prev) => (prev ? { ...prev, [key]: value } : prev));
  }
  return (
    <form className="admin-settings-form" onSubmit={save}>
      {saved && (
        <div className="alert success" role="status">
          <CheckCircle2 size={18} />
          Ayarlar kaydedildi. Ana sayfa, mağaza ve ödeme bilgileri güncellendi.
        </div>
      )}
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <div className="settings-grid">
        <section className="admin-panel settings-edit-panel">
          <div className="panel-heading">
            <h2>Mağaza bilgileri</h2>
            <Settings2 size={20} />
          </div>
          <div className="form-grid">
            <label className="full-width">
              Mağaza adı
              <input
                value={data.storeName}
                required
                maxLength={100}
                onChange={(e) => field("storeName", e.target.value)}
              />
            </label>
            <label>
              Telefon
              <input
                value={data.phone}
                type="tel"
                maxLength={40}
                onChange={(e) => field("phone", e.target.value)}
              />
            </label>
            <label>
              E-posta
              <input
                value={data.email}
                type="email"
                maxLength={200}
                onChange={(e) => field("email", e.target.value)}
              />
            </label>
            <label className="full-width">
              Açık adres
              <textarea
                value={data.address}
                rows={3}
                maxLength={600}
                onChange={(e) => field("address", e.target.value)}
              />
            </label>
            <label className="full-width">
              Çalışma saatleri
              <input
                value={data.hours}
                placeholder="Örn. Hafta içi 09.00 – 19.00"
                maxLength={200}
                onChange={(e) => field("hours", e.target.value)}
              />
            </label>
            <label className="full-width">
              Instagram bağlantısı
              <input
                value={data.instagram}
                type="url"
                required
                maxLength={600}
                onChange={(e) => field("instagram", e.target.value)}
              />
            </label>
          </div>
        </section>
        <section className="admin-panel settings-edit-panel">
          <div className="panel-heading">
            <h2>Havale / EFT</h2>
            <Landmark size={20} />
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={data.bankEnabled}
              onChange={(e) => field("bankEnabled", e.target.checked)}
            />
            <span>
              <b>Havale ile sipariş al</b>
              <small>Banka bilgileri tamamlandığında açabilirsiniz.</small>
            </span>
          </label>
          <div className="form-grid">
            <label className="full-width">
              Banka adı
              <input
                value={data.bankName}
                maxLength={200}
                required={data.bankEnabled}
                onChange={(e) => field("bankName", e.target.value)}
              />
            </label>
            <label className="full-width">
              Hesap sahibi / Firma unvanı
              <input
                value={data.accountName}
                maxLength={200}
                required={data.bankEnabled}
                onChange={(e) => field("accountName", e.target.value)}
              />
            </label>
            <label className="full-width">
              IBAN (Türkiye)
              <input
                value={data.iban}
                maxLength={40}
                placeholder="TR…"
                required={data.bankEnabled}
                onChange={(e) => field("iban", e.target.value.toUpperCase())}
              />
            </label>
          </div>
          <div className="settings-note">
            <ShieldCheck size={18} />
            <p>
              IBAN kontrol basamakları doğrulanır. Banka bilgileri müşteri
              tarafından ödeme ve sipariş sonucu sayfasında görülebilir.
              Ödemeleri sipariş detayından manuel onaylayın.
            </p>
          </div>
        </section>
        <section className="admin-panel settings-edit-panel">
          <div className="panel-heading">
            <h2>Teslimat seçenekleri</h2>
            <Truck size={20} />
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={data.shippingEnabled}
              onChange={(e) => field("shippingEnabled", e.target.checked)}
            />
            <span>
              <b>Kargo ile teslimatı aç</b>
              <small>Canlı içeren sepetlerde kargo kapalıdır.</small>
            </span>
          </label>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={data.pickupEnabled}
              onChange={(e) => field("pickupEnabled", e.target.checked)}
            />
            <span>
              <b>Mağazadan teslimatı aç</b>
              <small>Ücretsiz mağazadan teslim seçeneği.</small>
            </span>
          </label>
          <div className="form-grid">
            <label>
              Kargo ücreti (₺)
              <input
                type="number"
                min={0}
                max={100000}
                step="0.01"
                required
                value={data.shippingFee}
                onChange={(e) => field("shippingFee", Number(e.target.value))}
              />
            </label>
            <label>
              Ücretsiz kargo eşiği (₺)
              <input
                type="number"
                min={0}
                max={10000000}
                step="0.01"
                required
                value={data.freeShippingThreshold}
                onChange={(e) =>
                  field("freeShippingThreshold", Number(e.target.value))
                }
              />
            </label>
          </div>
          <p className="small-muted">
            Ücretsiz kargo eşiği 0 olduğunda eşik uygulanmaz; kargo ücreti her
            kargolu siparişe eklenir. En az bir teslimat yöntemi açık olmalıdır.
          </p>
        </section>
        <section className="admin-panel settings-edit-panel">
          <div className="panel-heading">
            <h2>Online ödeme · Demo</h2>
            <CreditCard size={20} />
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={data.demoOnlineEnabled}
              onChange={(e) => field("demoOnlineEnabled", e.target.checked)}
            />
            <span>
              <b>Test kartıyla demo ödemeyi aç</b>
              <small>Gerçek para tahsil edilmez.</small>
            </span>
          </label>
          <div className="settings-note">
            <CreditCard size={23} />
            <p>
              Test kartı: <b>4242 4242 4242 4242</b>
              <br />
              Gelecekteki tarih · CVC: 123
              <br />
              Reddedilme testi: 4000 0000 0000 0002
            </p>
          </div>
          <p className="small-muted">
            Kart alanları yalnızca tarayıcıda çalışır. Sunucuya kart numarası
            veya CVC gönderilmez. Gerçek online ödeme sağlayıcısı sonraki
            aşamada entegre edilecektir. Demo siparişler ciro sayılmaz.
          </p>
        </section>
        <section className="admin-panel settings-edit-panel campaign-settings-panel">
          <div className="panel-heading">
            <h2>Ana sayfa kampanyası</h2>
            <Sparkles size={20} />
          </div>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={data.campaignEnabled}
              onChange={(e) => field("campaignEnabled", e.target.checked)}
            />
            <span>
              <b>Kampanya alanını göster</b>
              <small>
                Ana sayfada ürünler ile kategoriler arasında görünür.
              </small>
            </span>
          </label>
          <div className="campaign-editor-grid">
            <div className="form-grid">
              <label className="full-width">
                Üst etiket
                <input
                  maxLength={60}
                  value={data.campaignEyebrow}
                  onChange={(e) => field("campaignEyebrow", e.target.value)}
                />
              </label>
              <label className="full-width">
                Kampanya başlığı
                <input
                  maxLength={100}
                  required={data.campaignEnabled}
                  value={data.campaignTitle}
                  onChange={(e) => field("campaignTitle", e.target.value)}
                />
              </label>
              <label className="full-width">
                Kampanya açıklaması
                <textarea
                  rows={3}
                  maxLength={600}
                  required={data.campaignEnabled}
                  value={data.campaignDescription}
                  onChange={(e) => field("campaignDescription", e.target.value)}
                />
              </label>
              <label>
                Buton metni
                <input
                  maxLength={60}
                  required={data.campaignEnabled}
                  value={data.campaignButton}
                  onChange={(e) => field("campaignButton", e.target.value)}
                />
              </label>
              <label>
                Buton bağlantısı
                <input
                  maxLength={600}
                  required
                  placeholder="/urunler"
                  value={data.campaignHref}
                  onChange={(e) => field("campaignHref", e.target.value)}
                />
                <small className="small-muted">
                  Site içi adres. Örn. /urunler?kategori=Ekipmanlar
                </small>
              </label>
            </div>
            <div>
              <ImageUploader
                label="Kampanya görseli"
                value={data.campaignImage}
                onChange={(url) => field("campaignImage", url)}
                onBusyChange={setImageBusy}
              />
              <p className="small-muted">
                Yatay bir fotoğraf önerilir. Ücretsiz kargo mesajı teslimat
                ayarlarındaki eşikten alınır. Ürün indirimlerini ürünün satış
                fiyatından düzenleyin.
              </p>
            </div>
          </div>
        </section>
      </div>
      <div className="settings-save-bar">
        <p>Ayarlar mağaza genelinde uygulanır.</p>
        <button className="button dark" disabled={busy || imageBusy}>
          {imageBusy
            ? "Görsel yükleniyor…"
            : busy
              ? "Kaydediliyor…"
              : "Ayarları kaydet"}
          <Save size={17} />
        </button>
      </div>
    </form>
  );
}
