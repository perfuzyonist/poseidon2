import { readImage, mediaName, MediaNotFound } from "@/lib/media";
export const runtime = "nodejs";
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  if (!mediaName.test(filename))
    return new Response("Not found", { status: 404 });
  try {
    const buffer = await readImage(filename);
    return new Response(buffer as BodyInit, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new Response(
      error instanceof MediaNotFound ? "Not found" : "Media unavailable",
      { status: error instanceof MediaNotFound ? 404 : 503 },
    );
  }
}
