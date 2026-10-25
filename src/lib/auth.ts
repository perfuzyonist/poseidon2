import { createHmac, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import { takeLimit } from "./db";
export const cookieName = "poseidon_session";
export const sessionAge = 60 * 60 * 8;
export function configured() {
  return (
    !!process.env.ADMIN_PASSWORD &&
    (process.env.SESSION_SECRET?.length || 0) >= 32
  );
}
function sign(payload: string) {
  return createHmac("sha256", process.env.SESSION_SECRET!)
    .update(payload)
    .digest("hex");
}
export function passwordMatches(value: string) {
  if (!configured()) return false;
  return timingSafeEqual(
    createHash("sha256").update(value).digest(),
    createHash("sha256").update(process.env.ADMIN_PASSWORD!).digest(),
  );
}
export function newSession() {
  const payload = String(Date.now() + sessionAge * 1000);
  return `${payload}.${sign(payload)}`;
}
export async function isAdmin() {
  if (!configured()) return false;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return false;
  const [expiry, signature] = token.split(".");
  if (
    !expiry ||
    !signature ||
    !/^\d+$/.test(expiry) ||
    Number(expiry) < Date.now()
  )
    return false;
  const expected = Buffer.from(sign(expiry));
  const supplied = Buffer.from(signature);
  return (
    expected.length === supplied.length && timingSafeEqual(expected, supplied)
  );
}
export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  const expected =
    process.env.APP_ORIGIN ||
    `${process.env.VERCEL ? "https:" : new URL(req.url).protocol}//${req.headers.get("host")}`;
  return !!origin && origin === expected;
}
export async function loginAllowed() {
  return takeLimit("admin", 10, 15 * 60 * 1000);
}
