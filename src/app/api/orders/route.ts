import { showcaseWriteResponse, isShowcase } from "@/lib/mode";
import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/auth";
import { takeLimit, getOrders } from "@/lib/db";
import { validCheckout } from "@/lib/validation";
import { placeOrder, updateOrder } from "@/lib/shop-orders";
import { orderStatuses } from "@/lib/types";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  if (isShowcase()) return NextResponse.json([]);
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  return NextResponse.json(await getOrders());
}
export async function POST(req: Request) {
  const demoResponse = showcaseWriteResponse();
  if (demoResponse) return demoResponse;
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Geçersiz istek kaynağı." },
      { status: 403 },
    );
  let input;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }
  if (!validCheckout(input))
    return NextResponse.json(
      {
        error:
          "Teslimat, fatura ve sepet bilgilerini kontrol edin; sözleşmeleri onaylayın.",
      },
      { status: 400 },
    );
  if (!(await takeLimit("inquiries", 100, 3600000)))
    return NextResponse.json(
      { error: "Talep limiti doldu. Lütfen daha sonra tekrar deneyin." },
      { status: 429 },
    );
  try {
    const order = await placeOrder(input);
    return NextResponse.json(
      { id: order.id, total: order.total, accessToken: order.accessToken },
      { status: 201 },
    );
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Talep oluşturulamadı." },
      { status: 400 },
    );
  }
}
export async function PATCH(req: Request) {
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
  if (typeof body?.id !== "string" || (!body.status && !body.paymentStatus))
    return NextResponse.json({ error: "Geçersiz sipariş." }, { status: 400 });
  try {
    const order = await updateOrder(body.id, {
      status: body.status,
      paymentStatus: body.paymentStatus,
    });
    return NextResponse.json({ ok: true, order });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Sipariş güncellenemedi." },
      { status: 400 },
    );
  }
}
