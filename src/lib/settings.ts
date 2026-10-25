import { db } from "./db";
import type { StoreSettings } from "./types";
import { businessAddress, businessPhone } from "./contact";
import { isShowcase } from "./mode";
import demoData from "./demo-data.json";
export const defaultSettings: StoreSettings = {
  storeName: "Poseidon Akvaryum",
  phone: businessPhone,
  email: "",
  address: businessAddress,
  hours: "",
  instagram: "https://www.instagram.com/denizliposeidonakvaryum/",
  bankEnabled: false,
  bankName: "",
  accountName: "",
  iban: "",
  demoOnlineEnabled: true,
  shippingEnabled: true,
  pickupEnabled: true,
  shippingFee: 99,
  freeShippingThreshold: 1500,
  campaignEnabled: true,
  campaignEyebrow: "KEŞFETME ZAMANI",
  campaignTitle: "Yeni dünyanıza yer açın.",
  campaignDescription:
    "Doğru ekipman, doğal dokunuşlar ve yepyeni bir başlangıç. Akvaryumunuz için seçtiğimiz ürünlerle kendi sualtı dünyanızı tamamlayın.",
  campaignButton: "Koleksiyonu keşfet",
  campaignHref: "/urunler",
  campaignImage: "/images/reef.jpg",
};
export async function getSettings(): Promise<StoreSettings> {
  if (isShowcase())
    return {
      ...defaultSettings,
      ...demoData.settings,
      bankEnabled: false,
      bankName: "",
      accountName: "",
      iban: "",
    };
  const row = (await db()
    .prepare("SELECT value FROM meta WHERE key=?")
    .get("store-settings")) as { value: string } | undefined;
  return { ...defaultSettings, ...(row ? JSON.parse(row.value) : {}) };
}
export async function saveSettings(settings: StoreSettings) {
  await db().transaction(async () => {
    await db()
      .prepare(
        "INSERT INTO meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      )
      .run("store-settings", JSON.stringify(settings));
  });
}
export function validIban(input: string) {
  const s = input.replace(/\s/g, "").toUpperCase();
  if (!/^TR\d{24}$/.test(s)) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  let rem = 0;
  for (const c of rearranged) {
    for (const n of /[A-Z]/.test(c) ? String(c.charCodeAt(0) - 55) : c)
      rem = (rem * 10 + Number(n)) % 97;
  }
  return rem === 1;
}
export function validSettings(s: StoreSettings) {
  return (
    s &&
    typeof s.storeName === "string" &&
    s.storeName.trim().length > 1 &&
    s.storeName.length <= 100 &&
    typeof s.campaignEnabled === "boolean" &&
    [
      "campaignEyebrow",
      "campaignTitle",
      "campaignDescription",
      "campaignButton",
    ].every(
      (key) =>
        typeof s[key as keyof StoreSettings] === "string" &&
        (s[key as keyof StoreSettings] as string).length <=
          (key === "campaignDescription"
            ? 600
            : key === "campaignTitle"
              ? 100
              : 60),
    ) &&
    (!s.campaignEnabled ||
      [s.campaignTitle, s.campaignDescription, s.campaignButton].every(
        (v) => v.trim().length > 0,
      )) &&
    typeof s.campaignHref === "string" &&
    s.campaignHref.length <= 600 &&
    /^\/(?![\/\\])/.test(s.campaignHref) &&
    !/[\\\u0000-\u0020]/.test(s.campaignHref) &&
    typeof s.campaignImage === "string" &&
    s.campaignImage.length <= 2000 &&
    (/^\/images\/[\w.-]+$/.test(s.campaignImage) ||
      /^\/api\/media\/[a-f0-9-]{36}\.webp$/.test(s.campaignImage) ||
      /^https:\/\//.test(s.campaignImage)) &&
    [
      "phone",
      "email",
      "address",
      "hours",
      "bankName",
      "accountName",
      "iban",
      "instagram",
    ].every(
      (k) =>
        typeof s[k as keyof StoreSettings] === "string" &&
        (s[k as keyof StoreSettings] as string).length <= 600,
    ) &&
    (!s.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) &&
    /^https:\/\//.test(s.instagram) &&
    [
      "bankEnabled",
      "demoOnlineEnabled",
      "shippingEnabled",
      "pickupEnabled",
    ].every((k) => typeof s[k as keyof StoreSettings] === "boolean") &&
    Number.isFinite(s.shippingFee) &&
    s.shippingFee >= 0 &&
    s.shippingFee <= 100000 &&
    Number.isFinite(s.freeShippingThreshold) &&
    s.freeShippingThreshold >= 0 &&
    s.freeShippingThreshold <= 10000000 &&
    (s.shippingEnabled || s.pickupEnabled) &&
    (!s.bankEnabled ||
      (s.bankName.trim().length > 1 &&
        s.accountName.trim().length > 1 &&
        validIban(s.iban)))
  );
}
