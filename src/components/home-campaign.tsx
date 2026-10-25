"use client";
import Link from "next/link";
import { ArrowUpRight, Sparkles, Truck } from "lucide-react";
import { useShop } from "./shop-provider";
import { money } from "@/lib/types";

export default function HomeCampaign() {
  const { settings: s } = useShop();
  if (!s.campaignEnabled) return null;
  return (
    <section className="home-campaign-surface" aria-label="Güncel kampanya">
      <div className="shell">
        <div className="home-campaign">
          <div className="campaign-copy">
            {s.campaignEyebrow && (
              <span className="campaign-eyebrow">
                <Sparkles size={15} />
                {s.campaignEyebrow}
              </span>
            )}
            <h2>{s.campaignTitle}</h2>
            <p>{s.campaignDescription}</p>
            <Link href={s.campaignHref} className="button primary">
              {s.campaignButton}
              <ArrowUpRight size={18} />
            </Link>
            {s.shippingEnabled &&
              s.freeShippingThreshold > 0 &&
              s.shippingFee > 0 && (
                <div className="campaign-shipping">
                  <Truck size={22} />
                  <span>
                    <b>
                      {money(s.freeShippingThreshold)} ve üzeri kargo bedava
                    </b>
                    <small>
                      Kargoya uygun ürünlerde, sepetinize otomatik uygulanır.
                    </small>
                  </span>
                </div>
              )}
          </div>
          <div className="campaign-visual">
            <img src={s.campaignImage} alt="" loading="lazy" />
            <div className="campaign-visual-shade" />
            <span className="campaign-visual-label">
              <span /> DENİZLİ POSEIDON AKVARYUM
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
