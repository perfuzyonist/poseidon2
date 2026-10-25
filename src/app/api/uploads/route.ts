import { showcaseWriteResponse, isShowcase } from "@/lib/mode";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { isAdmin, sameOrigin } from "@/lib/auth";
import { storeImage } from "@/lib/media";
import { uploadLimit } from "@/lib/client-image";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const demoResponse = showcaseWriteResponse();
  if (demoResponse) return demoResponse;
  if (!sameOrigin(req) || !(await isAdmin()))
    return NextResponse.json(
      { error: "Fotoğraf yüklemek için yönetici girişi yapın." },
      { status: 401 },
    );
  if (Number(req.headers.get("content-length")) > uploadLimit + 128 * 1024)
    return NextResponse.json(
      { error: "Yüklenecek fotoğraf en fazla 4 MB olabilir." },
      { status: 413 },
    );
  let form;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Fotoğraf okunamadı." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File) || !file.size)
    return NextResponse.json({ error: "Bir fotoğraf seçin." }, { status: 400 });
  if (file.size > uploadLimit)
    return NextResponse.json(
      { error: "Yüklenecek fotoğraf en fazla 4 MB olabilir." },
      { status: 413 },
    );
  if (
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)
  )
    return NextResponse.json(
      { error: "JPG, PNG, WebP veya AVIF fotoğraf yükleyebilirsiniz." },
      { status: 400 },
    );
  let buffer: Buffer;
  try {
    const source = Buffer.from(await file.arrayBuffer());
    const pipeline = sharp(source, { limitInputPixels: 40000000 });
    const metadata = await pipeline.metadata();
    if (
      !metadata.format ||
      !["jpeg", "png", "webp", "heif", "avif"].includes(metadata.format)
    )
      return NextResponse.json(
        {
          error:
            "Dosya geçerli bir JPG, PNG, WebP veya AVIF fotoğrafı olmalıdır.",
        },
        { status: 400 },
      );
    buffer = await pipeline
      .rotate()
      .resize({
        width: 1800,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 86 })
      .toBuffer();
  } catch {
    return NextResponse.json(
      {
        error:
          "Bu dosya geçerli bir fotoğraf olarak işlenemedi. Başka bir fotoğraf deneyin.",
      },
      { status: 400 },
    );
  }
  try {
    const url = await storeImage(`${randomUUID()}.webp`, buffer);
    return NextResponse.json({ url, size: buffer.length }, { status: 201 });
  } catch {
    return NextResponse.json(
      {
        error:
          "Fotoğraf kaydedilemedi. Depolama bağlantısını kontrol edip tekrar deneyin.",
      },
      { status: 503 },
    );
  }
}
