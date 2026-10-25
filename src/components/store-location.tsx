"use client";
import {
  MapPin,
  ArrowUpRight,
  MessageCircle,
  Phone,
  Store,
} from "lucide-react";
import { useShop } from "./shop-provider";
import {
  businessAddress,
  businessPhone,
  directionsHref,
  mapEmbedHref,
  whatsappHref,
  phoneHref,
} from "@/lib/contact";
export default function StoreLocation({
  compact = false,
}: {
  compact?: boolean;
}) {
  const { settings } = useShop();
  const address = settings.address || businessAddress;
  const phone = settings.phone || businessPhone;
  return (
    <section
      className={`store-location-section ${compact ? "compact-location" : ""}`}
    >
      <div className="location-copy">
        <span className="eyebrow">
          <span className="live-dot" /> DENİZLİ’DE BULUŞALIM
        </span>
        <h2>
          Biraz doğa.
          <br />
          Biraz sohbet.
          <br />
          <em>Biraz Poseidon.</em>
        </h2>
        <p>
          Yeni dostlarınızla tanışın, aklınızdakileri konuşalım.
          <br />
          Kendi sualtı dünyanızı birlikte kuralım.
        </p>
        <a
          className="location-address"
          href={directionsHref(address)}
          target="_blank"
          rel="noreferrer"
        >
          <MapPin size={22} />
          <span>{address}</span>
          <ArrowUpRight size={17} />
        </a>
        <div className="location-actions">
          <a
            className="button dark"
            href={directionsHref(address)}
            target="_blank"
            rel="noreferrer"
          >
            <MapPin size={18} /> Konuma git <ArrowUpRight size={17} />
          </a>
          <a
            className="button outline"
            href={whatsappHref(phone)}
            target="_blank"
            rel="noreferrer"
          >
            <MessageCircle size={18} /> WhatsApp
          </a>
        </div>
      </div>
      <div className="location-map">
        <iframe
          title="Poseidon Akvaryum mağaza konumu — Pamukkale, Denizli"
          src={mapEmbedHref(address)}
          width="100%"
          height="100%"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
        <div className="map-glass-label">
          <span>
            <Store size={22} />
          </span>
          <div>
            <b>Poseidon Akvaryum</b>
            <small>Pamukkale · Denizli</small>
          </div>
          <a
            href={directionsHref(address)}
            target="_blank"
            rel="noreferrer"
            aria-label="Google Haritalar’da yol tarifi al"
          >
            <ArrowUpRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}
