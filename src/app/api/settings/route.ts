import { showcaseWriteResponse, isShowcase } from "@/lib/mode";
import { NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/auth";
import {
  getSettings,
  saveSettings,
  validSettings,
  defaultSettings,
} from "@/lib/settings";
import type { StoreSettings } from "@/lib/types";
export const dynamic = "force-dynamic";
export async function GET() {
  return NextResponse.json(await getSettings());
}
export async function PUT(req: Request) {
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
  if (!validSettings(body))
    return NextResponse.json(
      {
        error:
          "Bilgileri kontrol edin. Kampanya başlığı, açıklaması ve butonu dolu; bağlantısı / ile başlayan bir site içi adres olmalıdır. Havale için geçerli IBAN, banka adı ve hesap sahibi gereklidir. En az bir teslimat yöntemi açık olmalıdır.",
      },
      { status: 400 },
    );
  const settings = Object.fromEntries(
    Object.keys(defaultSettings).map((k) => [k, body[k]]),
  ) as StoreSettings;
  settings.iban = settings.iban.replace(/\s/g, "").toUpperCase();
  await saveSettings(settings);
  return NextResponse.json(settings);
}
