import { loadEnvConfig } from "@next/env";
import { DatabaseSync } from "node:sqlite";
import { resolve } from "node:path";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
loadEnvConfig(process.cwd());
process.env.APP_MODE = "live";
async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error("Önce DATABASE_URL tanımlayın.");
  const includeOrders = process.argv.includes("--include-orders");
  const localPath = resolve(
    process.env.DATABASE_PATH || "./data/poseidon.sqlite",
  );
  const local = new DatabaseSync(localPath, { readOnly: true });
  try {
    const { db, getProducts } = await import("../src/lib/db");
    const { seedProducts } = await import("../src/lib/seed");
    const { storeImage, readImage, mediaName } =
      await import("../src/lib/media");
    const { setupCloudStorage } = await import("../src/lib/cloud-storage");
    const { uploadsPath } = await import("../src/lib/uploads");
    const products = local
      .prepare("SELECT data FROM products ORDER BY rowid")
      .all() as { data: string }[];
    const settings = local
      .prepare("SELECT value FROM meta WHERE key=?")
      .get("store-settings") as { value: string } | undefined;
    // Only published product/campaign photos are copied; unrelated local files stay local.
    const filenames = new Set<string>();
    for (const text of [
      ...products.map((p) => p.data),
      settings?.value || "",
    ]) {
      for (const match of text.matchAll(/\/api\/media\/([a-f0-9-]{36}\.webp)/g))
        if (mediaName.test(match[1])) filenames.add(match[1]);
    }
    await setupCloudStorage();
    const hash = (buffer: Uint8Array) =>
      createHash("sha256").update(buffer).digest("hex");
    for (const name of filenames) {
      const buffer = await readFile(resolve(uploadsPath(), name));
      let existing: Uint8Array | undefined;
      try {
        existing = await readImage(name);
      } catch (error) {
        if ((error as Error).constructor.name !== "MediaNotFound") throw error;
      }
      if (existing) {
        if (hash(existing) !== hash(buffer))
          throw new Error(
            "Aynı adlı farklı bir görsel var; aktarım durduruldu.",
          );
      } else await storeImage(name, buffer);
    }
    await getProducts();
    let copied = 0,
      skipped = 0;
    await db().transaction(async () => {
      // Never overwrite a cloud product that was edited after its initial seed.
      for (const row of products) {
        const p = JSON.parse(row.data);
        const current = await db()
          .prepare("SELECT data FROM products WHERE id=?")
          .get(p.id);
        const seed = seedProducts.find((s) => s.id === p.id);
        if (
          current &&
          (!seed ||
            JSON.stringify(JSON.parse(current.data as string)) !==
              JSON.stringify(seed))
        ) {
          skipped++;
          continue;
        }
        await db()
          .prepare(
            "INSERT INTO products (id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
          )
          .run(p.id, row.data);
        copied++;
      }
      if (settings)
        await db()
          .prepare(
            "INSERT INTO meta (key,value) VALUES (?,?) ON CONFLICT(key) DO NOTHING",
          )
          .run("store-settings", settings.value);
      if (includeOrders) {
        for (const row of local
          .prepare("SELECT id,data FROM orders ORDER BY rowid")
          .all() as { id: string; data: string }[]) {
          await db()
            .prepare(
              "INSERT INTO orders (id,data) VALUES (?,?) ON CONFLICT(id) DO NOTHING",
            )
            .run(row.id, row.data);
        }
        const table = local
          .prepare(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='messages'",
          )
          .get();
        if (table)
          for (const row of local
            .prepare("SELECT id,data FROM messages ORDER BY rowid")
            .all() as { id: string; data: string }[])
            await db()
              .prepare(
                "INSERT INTO messages (id,data) VALUES (?,?) ON CONFLICT(id) DO NOTHING",
              )
              .run(row.id, row.data);
      }
    });
    console.log(
      `Aktarım tamamlandı: ${copied} ürün, ${skipped} korunmuş bulut ürünü, ${filenames.size} görsel. Sipariş/mesaj aktarımı: ${includeOrders ? "açık" : "kapalı"}. Yerel veritabanı değiştirilmedi.`,
    );
  } finally {
    local.close();
  }
}
main().catch(() => {
  console.error(
    "Aktarım tamamlanamadı. Bağlantıyı ve yerel görselleri kontrol edin. Kaynak kayıtlar değiştirilmedi; kişisel veriler ve anahtarlar yazdırılmadı.",
  );
  process.exitCode = 1;
});
