"use client";
import { useEffect, useState } from "react";
import { Mail, Check, ArrowUpRight } from "lucide-react";
type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};
export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    fetch("/api/messages")
      .then((r) => {
        if (!r.ok)
          throw new Error("Mesajlar alınamadı. Oturumunuzu kontrol edin.");
        return r.json();
      })
      .then(setMessages)
      .catch((e) => setError(e.message))
      .finally(() => setLoaded(true));
  }, []);
  async function read(id: string) {
    try {
      const r = await fetch("/api/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!r.ok) throw new Error("Mesaj güncellenemedi.");
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, read: true } : m)),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "İşlem başarısız.");
    }
  }
  return (
    <div className="admin-message-list">
      {error && <div className="form-error">{error}</div>}
      {!loaded ? (
        <div className="admin-panel settings-loading">Mesajlar yükleniyor…</div>
      ) : !messages.length ? (
        <div className="admin-panel admin-empty">
          <Mail size={32} />
          <h3>İlk merhabayı bekliyoruz.</h3>
          <p>İletişim sayfasından gönderilen mesajlar burada görünecek.</p>
        </div>
      ) : (
        messages.map((m) => (
          <details className="admin-panel admin-message" key={m.id}>
            <summary>
              <span
                className={`status-badge ${m.read ? "status-done" : "status-new"}`}
              >
                {m.read ? "Okundu" : "Yeni"}
              </span>
              <span>
                <b>{m.subject}</b>
                <small>
                  {m.name} · {m.email}
                </small>
              </span>
              <time>
                {new Date(m.createdAt).toLocaleDateString("tr-TR", {
                  timeZone: "Europe/Istanbul",
                })}
              </time>
            </summary>
            <div>
              <p>{m.message}</p>
              <div>
                <a
                  className="text-link"
                  href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`}
                >
                  E-posta uygulamasında yanıtla <ArrowUpRight size={15} />
                </a>
                {!m.read && (
                  <button className="button outline" onClick={() => read(m.id)}>
                    Okundu olarak işaretle <Check size={15} />
                  </button>
                )}
              </div>
            </div>
          </details>
        ))
      )}
    </div>
  );
}
