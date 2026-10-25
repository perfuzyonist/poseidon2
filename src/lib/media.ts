import { mkdir, writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { cloudClient, cloudBucket, hasCloudStorage } from "./cloud-storage";
import { uploadsPath } from "./uploads";
import { isShowcase } from "./mode";
export const mediaName =
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;
export class MediaNotFound extends Error {}
function cloudMode() {
  if (hasCloudStorage()) return true;
  if (
    process.env.VERCEL ||
    process.env.DATABASE_URL ||
    process.env.SUPABASE_URL ||
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
    throw new Error("Bulut görsel depolaması yapılandırılmadı.");
  return false;
}
export async function storeImage(name: string, buffer: Buffer) {
  if (!mediaName.test(name)) throw new Error("Görsel adı geçersiz.");
  if (cloudMode()) {
    const { error } = await cloudClient()
      .storage.from(cloudBucket())
      .upload(name, buffer, {
        contentType: "image/webp",
        cacheControl: "31536000",
        upsert: false,
      });
    if (error) throw new Error("Fotoğraf buluta kaydedilemedi.");
  } else {
    await mkdir(uploadsPath(), { recursive: true });
    await writeFile(join(uploadsPath(), name), buffer, { flag: "wx" });
  }
  return `/api/media/${name}`;
}
export async function readImage(name: string): Promise<Uint8Array> {
  if (isShowcase()) throw new MediaNotFound();
  if (!mediaName.test(name)) throw new MediaNotFound();
  if (cloudMode()) {
    const { data, error } = await cloudClient()
      .storage.from(cloudBucket())
      .download(name);
    if (error) {
      if (["404", "400"].includes(String(error.statusCode)))
        throw new MediaNotFound();
      throw new Error("Görsel depolamasına ulaşılamadı.");
    }
    return new Uint8Array(await data.arrayBuffer());
  }
  try {
    return new Uint8Array(await readFile(join(uploadsPath(), name)));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT")
      throw new MediaNotFound();
    throw error;
  }
}
