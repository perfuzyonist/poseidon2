import Link from "next/link";
export default function NotFound() {
  return (
    <main className="error-page">
      <span className="eyebrow">AKINTI SİZİ BİRAZ UZAĞA TAŞIDI</span>
      <h1>Bu sayfa derinlerde kaybolmuş.</h1>
      <p>
        Aradığınız sayfa bulunamadı. Sualtı dünyamızı keşfetmeye devam edin.
      </p>
      <Link href="/" className="button primary">
        Ana sayfaya dön
      </Link>
    </main>
  );
}
