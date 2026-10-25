import { showcaseWriteResponse, isShowcase } from "@/lib/mode";
import { NextResponse } from "next/server";
import { sameOrigin } from "@/lib/auth";
import { takeLimit, getOrders } from "@/lib/db";
import { publicOrder } from "@/lib/shop-orders";
export async function POST(req: Request) {
  const demoResponse = showcaseWriteResponse();
  if (demoResponse) return demoResponse;
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Geçersiz istek kaynağı." },
      { status: 403 },
    );
  if (!(await takeLimit("order-lookup", 60, 900000)))
    return NextResponse.json(
      { error: "Çok fazla sorgu. Lütfen 15 dakika sonra tekrar deneyin." },
      { status: 429 },
    );
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }
  if (
    typeof body?.id !== "string" ||
    typeof body?.email !== "string" ||
    body.id.length > 40 ||
    body.email.length > 200
  )
    return NextResponse.json(
      { error: "Sipariş numarası ve e-postayı kontrol edin." },
      { status: 400 },
    );
  const order = (await getOrders()).find(
    (o) =>
      o.id === body.id.trim().toUpperCase() &&
      o.email.toLowerCase() === body.email.trim().toLowerCase(),
  );
  if (!order)
    return NextResponse.json(
      { error: "Bu bilgilerle eşleşen sipariş bulunamadı." },
      { status: 404 },
    );
  return NextResponse.json(publicOrder(order), {
    headers: { "Cache-Control": "no-store" },
  });
}
