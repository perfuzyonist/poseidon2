import { DatabaseSync } from "node:sqlite";
import nextEnv from "@next/env";
const { loadEnvConfig } = nextEnv;
import {
  existsSync,
  mkdirSync,
  readFileSync,
  copyFileSync,
  writeFileSync,
} from "node:fs";
import { resolve, dirname, join } from "node:path";
loadEnvConfig(process.cwd());
const sourcePath = resolve(
  process.env.DATABASE_PATH || "./data/poseidon.sqlite",
);
if (!existsSync(sourcePath))
  throw new Error(
    "Yerel vitrin veritabanı bulunamadı. Kaynak silinmedi veya değiştirilmedi.",
  );
const local = new DatabaseSync(sourcePath, { readOnly: true });
try {
  const images = new Set();
  const uploads = resolve(
    process.env.UPLOADS_PATH || join(dirname(sourcePath), "uploads"),
  );
  function publicImage(value) {
    if (!value?.startsWith("/api/media/")) return value;
    const filename = value.slice("/api/media/".length);
    if (!/^[a-f0-9-]{36}\.webp$/.test(filename))
      throw new Error("Geçersiz görsel yolu.");
    const original = resolve(uploads, filename);
    if (!existsSync(original))
      throw new Error(
        "Vitrinde kullanılan bir görsel eksik. Dışa aktarım durduruldu.",
      );
    const target = resolve("public/images", `demo-${filename}`);
    mkdirSync(dirname(target), { recursive: true });
    if (
      existsSync(target) &&
      !readFileSync(target).equals(readFileSync(original))
    )
      throw new Error("Aynı adlı farklı demo görseli var; dosya korunuyor.");
    if (!existsSync(target)) copyFileSync(original, target);
    images.add(filename);
    return `/images/demo-${filename}`;
  }
  const products = local
    .prepare("SELECT data FROM products ORDER BY rowid")
    .all()
    .map(({ data }) => {
      const p = JSON.parse(data);
      return {
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        oldPrice: p.oldPrice,
        stock: p.stock,
        image: publicImage(p.image),
        description: p.description,
        badge: p.badge,
        featured: p.featured,
      };
    });
  const saved = local
    .prepare("SELECT value FROM meta WHERE key=?")
    .get("store-settings");
  const originalSettings = saved ? JSON.parse(saved.value) : {};
  const keys = [
    "storeName",
    "phone",
    "email",
    "address",
    "hours",
    "instagram",
    "shippingEnabled",
    "pickupEnabled",
    "shippingFee",
    "freeShippingThreshold",
    "campaignEnabled",
    "campaignEyebrow",
    "campaignTitle",
    "campaignDescription",
    "campaignButton",
    "campaignHref",
    "campaignImage",
  ];
  const settings = Object.fromEntries(
    keys
      .filter((k) => originalSettings[k] !== undefined)
      .map((k) => [
        k,
        k === "campaignImage"
          ? publicImage(originalSettings[k])
          : originalSettings[k],
      ]),
  );
  writeFileSync(
    "src/lib/demo-data.json",
    JSON.stringify({ products, settings }, null, 2) + "\n",
  );
  console.log(
    `Demo vitrini hazır: ${products.length} ürün, ${images.size} yüklenmiş görsel. Sipariş, müşteri, mesaj, banka ve giriş bilgileri dışa aktarılmadı.`,
  );
} finally {
  local.close();
}
