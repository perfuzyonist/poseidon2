"use client";
export default function Error({ reset }: { reset: () => void }) {
  return (
    <main className="error-page">
      <h1>Kısa bir mola.</h1>
      <p>Sayfa yüklenirken bir sorun oluştu. Lütfen tekrar deneyin.</p>
      <button className="button primary" onClick={reset}>
        Yeniden dene
      </button>
    </main>
  );
}
