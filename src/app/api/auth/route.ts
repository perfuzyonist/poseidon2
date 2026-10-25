import { showcaseWriteResponse, isShowcase } from "@/lib/mode";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  configured,
  cookieName,
  loginAllowed,
  newSession,
  passwordMatches,
  sameOrigin,
  sessionAge,
} from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(req: Request) {
  const demoResponse = showcaseWriteResponse();
  if (demoResponse) return demoResponse;
  if (!sameOrigin(req))
    return NextResponse.json(
      { error: "Geçersiz istek kaynağı." },
      { status: 403 },
    );
  if (!configured())
    return NextResponse.json(
      {
        error:
          "Yönetici erişimi için sunucu ortam değişkenleri ayarlanmalıdır.",
      },
      { status: 503 },
    );
  if (!(await loginAllowed()))
    return NextResponse.json(
      { error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." },
      { status: 429 },
    );
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  if (
    typeof body?.password !== "string" ||
    body.password.length > 500 ||
    !passwordMatches(body.password)
  )
    return NextResponse.json({ error: "Şifre hatalı." }, { status: 401 });
  (await cookies()).set(cookieName, newSession(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: sessionAge,
  });
  return NextResponse.json({ ok: true });
}
export async function DELETE(req: Request) {
  const demoResponse = showcaseWriteResponse();
  if (demoResponse) return demoResponse;
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  (await cookies()).delete(cookieName);
  return NextResponse.json({ ok: true });
}
