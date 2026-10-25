import { showcaseWriteResponse, isShowcase } from "@/lib/mode";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { db, takeLimit } from "@/lib/db";
import { sameOrigin, isAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() {
  if (isShowcase()) return NextResponse.json([]);
  if (!(await isAdmin()))
    return NextResponse.json({ error: "Yetkisiz erişim." }, { status: 401 });
  const rows = (await db()
    .prepare("SELECT data FROM messages ORDER BY rowid DESC")
    .all()) as { data: string }[];
  return NextResponse.json(rows.map((r) => JSON.parse(r.data)));
}
export async function POST(req: Request) {
  const demoResponse = showcaseWriteResponse();
  if (demoResponse) return demoResponse;
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Geçersiz kaynak." }, { status: 403 });
  let p;
  try {
    p = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz veri." }, { status: 400 });
  }
  if (p?.website) return NextResponse.json({ ok: true });
  if (
    !p ||
    !["name", "email", "subject", "message"].every(
      (k) =>
        typeof p[k] === "string" &&
        p[k].trim().length > 0 &&
        p[k].length <= (k === "message" ? 3000 : 200),
    ) ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email) ||
    p.consent !== true
  )
    return NextResponse.json(
      { error: "Lütfen formdaki bilgileri kontrol edin." },
      { status: 400 },
    );
  const conn = db();
  if (!(await takeLimit("messages", 30, 3600000)))
    return NextResponse.json(
      { error: "Mesaj limiti doldu. Lütfen daha sonra tekrar deneyin." },
      { status: 429 },
    );
  const m = {
    id: randomUUID(),
    name: p.name.trim(),
    email: p.email.trim(),
    subject: p.subject.trim(),
    message: p.message.trim(),
    createdAt: new Date().toISOString(),
    read: false,
  };
  await conn
    .prepare("INSERT INTO messages (id,data) VALUES (?,?)")
    .run(m.id, JSON.stringify(m));
  return NextResponse.json({ ok: true }, { status: 201 });
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
  const conn = db();
  const row = (await conn
    .prepare("SELECT data FROM messages WHERE id=?")
    .get(typeof body?.id === "string" ? body.id : "")) as
    { data: string } | undefined;
  if (!row)
    return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });
  const data = JSON.parse(row.data);
  data.read = true;
  await conn
    .prepare("UPDATE messages SET data=? WHERE id=?")
    .run(JSON.stringify(data), body.id);
  return NextResponse.json({ ok: true });
}
