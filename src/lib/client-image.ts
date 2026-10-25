// Keep the HTTP payload below Vercel's 4.5 MB function limit.
export const uploadLimit = 4 * 1024 * 1024;
export async function prepareImage(file: File): Promise<File> {
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    if (bitmap.width * bitmap.height > 40000000)
      throw new Error("Fotoğraf çok büyük. Daha küçük bir fotoğraf seçin.");
    const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Fotoğraf hazırlanamadı.");
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.86),
    );
    if (!blob || blob.size > uploadLimit)
      throw new Error("Fotoğraf hazırlanamadı.");
    return new File([blob], "photo.webp", { type: blob.type });
  } catch {
    if (file.size <= uploadLimit) return file;
    throw new Error(
      "Fotoğraf küçültülemedi. 4 MB altında bir JPG, PNG, WebP veya AVIF seçin.",
    );
  } finally {
    bitmap?.close();
  }
}
