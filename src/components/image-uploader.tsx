"use client";
import { useRef, useState, type DragEvent } from "react";
import { prepareImage } from "@/lib/client-image";
import {
  UploadCloud,
  ImagePlus,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
export default function ImageUploader({
  value,
  onChange,
  onBusyChange,
  label = "Ürün fotoğrafı",
}: {
  value: string;
  onChange: (url: string) => void;
  onBusyChange: (busy: boolean) => void;
  label?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const hasPhoto = !!value && value !== "/images/aquarium.svg";
  async function upload(file?: File) {
    if (!file || busy) return;
    setError("");
    setUploaded(false);
    if (file.size > 10 * 1024 * 1024) {
      setError("Fotoğraf en fazla 10 MB olabilir.");
      return;
    }
    setBusy(true);
    onBusyChange(true);
    try {
      const form = new FormData();
      form.append("file", await prepareImage(file));
      const r = await fetch("/api/uploads", { method: "POST", body: form });
      const result = await r.json();
      if (!r.ok) throw new Error(result.error);
      onChange(result.url);
      setUploaded(true);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Yükleme sırasında bağlantı kesildi. Tekrar deneyin.",
      );
    } finally {
      setBusy(false);
      onBusyChange(false);
      if (input.current) input.current.value = "";
    }
  }
  function drop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    upload(e.dataTransfer.files[0]);
  }
  return (
    <div className="image-uploader">
      <div className="upload-label">
        <b>{label}</b>
        <span>JPG, PNG, WebP, AVIF · En fazla 10 MB · Otomatik küçültülür</span>
      </div>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        id="product-photo-upload"
        aria-label={`${label} seç`}
        onChange={(e) => upload(e.target.files?.[0])}
        disabled={busy}
      />
      <div
        className={`upload-dropzone ${dragging ? "drag-active" : ""} ${busy ? "is-uploading" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={drop}
      >
        {hasPhoto && <img src={value} alt={`${label} önizlemesi`} />}
        <div className="upload-prompt">
          {busy ? (
            <LoaderCircle className="spin" size={29} />
          ) : (
            <UploadCloud size={29} />
          )}
          <b>
            {busy
              ? "Fotoğraf hazırlanıyor…"
              : "Fotoğrafınızı buraya sürükleyin"}
          </b>
          <span>veya cihazınızdan bir fotoğraf seçin</span>
          <button
            type="button"
            className="button dark"
            disabled={busy}
            onClick={() => input.current?.click()}
          >
            <ImagePlus size={17} />
            {busy
              ? "Yükleniyor…"
              : hasPhoto
                ? "Fotoğrafı değiştir"
                : "Fotoğraf yükle"}
          </button>
        </div>
      </div>
      {uploaded && (
        <p className="upload-success" role="status">
          <CheckCircle2 size={15} /> Fotoğraf yüklendi. Değişiklikleri
          kaydederek yayınlayın.
        </p>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <details className="upload-url-option">
        <summary>Bağlantıyla fotoğraf eklemek istiyorum</summary>
        <label>
          Görsel bağlantısı
          <input
            value={value}
            maxLength={2000}
            onChange={(e) => {
              onChange(e.target.value);
              setUploaded(false);
            }}
            placeholder="https://…"
            disabled={busy}
          />
        </label>
      </details>
    </div>
  );
}
