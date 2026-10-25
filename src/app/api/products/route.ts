import { showcaseWriteResponse, isShowcase } from "@/lib/mode";
import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/auth";
import { getProducts, saveProduct, deleteProduct } from "@/lib/db";
import { validProduct } from "@/lib/validation";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(await getProducts());
}
export async function POST(req: Request) {
  const demoResponse = showcaseWriteResponse();
  if (demoResponse) return demoResponse;
  if (!sameOrigin(req) || !(await isAdmin()))
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }
  if (!validProduct(body))
    return NextResponse.json(
      {
        error:
          "Ürün bilgilerini kontrol edin. Eski fiyat satış fiyatından yüksek olmalıdır.",
      },
      { status: 400 },
    );
  await saveProduct(body);
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  const demoResponse = showcaseWriteResponse();
  if (demoResponse) return demoResponse;
  if (!sameOrigin(req) || !(await isAdmin()))
    return NextResponse.json({ error: "Yetkisiz işlem." }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id)
    return NextResponse.json({ error: "Ürün seçilmedi." }, { status: 400 });
  await deleteProduct(id);
  return NextResponse.json({ ok: true });
}
