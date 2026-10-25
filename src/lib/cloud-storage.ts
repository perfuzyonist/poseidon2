import { createClient } from "@supabase/supabase-js";
let client: ReturnType<typeof createClient> | undefined;
export function hasCloudStorage() {
  return !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY;
}
export function cloudBucket() {
  const name = process.env.SUPABASE_STORAGE_BUCKET || "poseidon-images";
  if (!/^[a-z0-9][a-z0-9-]{2,62}$/.test(name))
    throw new Error("Depolama klasörü adı geçersiz.");
  return name;
}
export function cloudClient() {
  if (!hasCloudStorage())
    throw new Error("SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY gereklidir.");
  if (!client)
    client = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      },
    );
  return client;
}
export async function setupCloudStorage() {
  const storage = cloudClient().storage;
  const name = cloudBucket();
  const existing = await storage.getBucket(name);
  if (!existing.error) {
    if (existing.data.public)
      throw new Error("poseidon-images için private bir bucket kullanın.");
    return;
  }
  if (String(existing.error.statusCode) !== "404")
    throw new Error(
      "Depolama alanı sorgulanamadı; proje adresini ve sunucu anahtarını kontrol edin.",
    );
  const created = await storage.createBucket(name, {
    public: false,
    fileSizeLimit: 4 * 1024 * 1024,
    allowedMimeTypes: ["image/webp"],
  });
  if (created.error)
    throw new Error(
      "Depolama alanı oluşturulamadı; Supabase yetkilerini kontrol edin.",
    );
}
