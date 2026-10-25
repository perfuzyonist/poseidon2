import { loadEnvConfig } from "@next/env";
import { randomUUID } from "node:crypto";
import assert from "node:assert/strict";
import sharp from "sharp";
loadEnvConfig(process.cwd());
process.env.APP_MODE = "live";
async function main() {
  for (const key of [
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ADMIN_PASSWORD",
    "SESSION_SECRET",
  ])
    if (!process.env[key]) throw new Error(`${key} eksik.`);
  if (process.env.SESSION_SECRET!.length < 32)
    throw new Error("SESSION_SECRET en az 32 karakter olmalıdır.");
  const { db, getProducts } = await import("../src/lib/db");
  const { cloudClient, cloudBucket } = await import("../src/lib/cloud-storage");
  const { storeImage, readImage } = await import("../src/lib/media");
  await getProducts();
  const marker = `check-${randomUUID()}`;
  await db().transaction(async () => {
    await db()
      .prepare("INSERT INTO meta (key,value) VALUES (?,?)")
      .run(marker, "ok");
  });
  try {
    assert.equal(
      (await db().prepare("SELECT value FROM meta WHERE key=?").get(marker))
        ?.value,
      "ok",
    );
  } finally {
    await db().prepare("DELETE FROM meta WHERE key=?").run(marker);
  }
  const filename = `${randomUUID()}.webp`;
  const image = await sharp({
    create: { width: 2, height: 2, channels: 3, background: "#123462" },
  })
    .webp()
    .toBuffer();
  let uploaded = false;
  try {
    await storeImage(filename, image);
    uploaded = true;
    assert.deepEqual(Buffer.from(await readImage(filename)), image);
  } finally {
    if (uploaded) {
      const { error } = await cloudClient()
        .storage.from(cloudBucket())
        .remove([filename]);
      if (error)
        throw new Error(
          "Kontrol görseli silinemedi; Storage bağlantısını kontrol edin.",
        );
    }
  }
  console.log(
    "Bulut kontrolü geçti: PostgreSQL yazma/okuma ve Storage yükleme/indirme doğrulandı. Yalnızca bu kontrolün oluşturduğu kayıtlar temizlendi.",
  );
}
main().catch(() => {
  console.error(
    "Bulut kontrolü başarısız. Ortam değişkenlerini, SQL ve Storage erişimini kontrol edin. Gizli değerler yazdırılmadı.",
  );
  process.exitCode = 1;
});
