import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
process.env.APP_MODE = "live";

async function main() {
  if (!process.env.DATABASE_URL)
    throw new Error("DATABASE_URL eksik. .env.local dosyasını doldurun.");
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY eksik.");
  const { getProducts } = await import("../src/lib/db");
  const { setupCloudStorage } = await import("../src/lib/cloud-storage");
  const products = await getProducts();
  await setupCloudStorage();
  console.log(
    `Supabase hazır: özel veritabanı şeması, ${products.length} ürün ve özel görsel alanı doğrulandı. Mevcut kayıtlar korunur.`,
  );
}
main().catch((error) => {
  console.error(
    "Bulut kurulumu tamamlanamadı.",
    error instanceof Error &&
      !/postgres|password|connect|certificate/i.test(error.message)
      ? error.message
      : "Bağlantı bilgilerini, veritabanı parolasını ve TLS sertifikasını kontrol edin.",
  );
  process.exitCode = 1;
});
