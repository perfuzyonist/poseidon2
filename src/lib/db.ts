import { AsyncLocalStorage } from "node:async_hooks";
import { seedProducts } from "./seed";
import type { Product, Order } from "./types";
import type { Adapter, Connection } from "./database/types";
import { isShowcase } from "./mode";
import demoData from "./demo-data.json";
const context = new AsyncLocalStorage<Connection>();
let ready: Promise<Adapter> | undefined;
async function adapter(): Promise<Adapter> {
  if (isShowcase())
    throw new Error("Tanıtım modunda veritabanı işlemleri kapalıdır.");
  if (!ready)
    ready = (async () => {
      if (process.env.VERCEL && !process.env.DATABASE_URL)
        throw new Error(
          "Vercel için DATABASE_URL tanımlanmalıdır. Yerel disk bu ortamda kullanılmaz.",
        );
      const database = process.env.DATABASE_URL
        ? await (await import("./database/postgres")).createPostgres()
        : (await import("./database/sqlite")).createSqlite();
      await database.transaction(async (conn) => {
        if (
          !(await conn.query("SELECT key FROM meta WHERE key=?", ["seeded"]))
            .length
        ) {
          for (const p of seedProducts)
            await conn.query(
              "INSERT INTO products (id,data) VALUES (?,?) ON CONFLICT(id) DO NOTHING",
              [p.id, JSON.stringify(p)],
            );
          await conn.query(
            "INSERT INTO meta (key,value) VALUES (?,?) ON CONFLICT(key) DO NOTHING",
            ["seeded", "1"],
          );
        }
      });
      return database;
    })().catch((error) => {
      ready = undefined;
      throw error;
    });
  return ready;
}
async function query(sql: string, params: unknown[] = []) {
  const active = context.getStore();
  return active
    ? active.query(sql, params)
    : (await adapter()).query(sql, params);
}
export function db() {
  return {
    prepare(sql: string) {
      return {
        all: (...params: unknown[]) => query(sql, params),
        get: async (...params: unknown[]) => (await query(sql, params))[0],
        run: async (...params: unknown[]) => {
          await query(sql, params);
        },
      };
    },
    async transaction<T>(work: () => Promise<T>): Promise<T> {
      if (context.getStore()) return work();
      return (await adapter()).transaction((conn) => context.run(conn, work));
    },
  };
}
export async function getProducts(): Promise<Product[]> {
  if (isShowcase()) return structuredClone(demoData.products);
  const rows = await db()
    .prepare("SELECT data FROM products ORDER BY rowid")
    .all();
  return rows.map((r) => JSON.parse(r.data as string));
}
export async function getOrders(): Promise<Order[]> {
  if (isShowcase()) return [];
  const rows = await db()
    .prepare("SELECT data FROM orders ORDER BY rowid DESC")
    .all();
  return rows.map((r) => JSON.parse(r.data as string));
}
export async function saveProduct(product: Product) {
  const {
    id,
    name,
    category,
    price,
    oldPrice,
    stock,
    image,
    description,
    badge,
    featured,
  } = product;
  await db().transaction(async () => {
    await db()
      .prepare(
        "INSERT INTO products (id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data",
      )
      .run(
        id,
        JSON.stringify({
          id,
          name,
          category,
          price,
          oldPrice,
          stock,
          image,
          description,
          badge,
          featured,
        }),
      );
  });
}
export async function deleteProduct(id: string) {
  await db().transaction(async () => {
    await db().prepare("DELETE FROM products WHERE id=?").run(id);
  });
}
export async function takeLimit(
  key: string,
  maximum: number,
  duration: number,
) {
  return db().transaction(async () => {
    const now = Date.now();
    await db().prepare("DELETE FROM login_attempts WHERE expires < ?").run(now);
    const row = await db()
      .prepare("SELECT count FROM login_attempts WHERE key=?")
      .get(key);
    if (row && Number(row.count) >= maximum) return false;
    await db()
      .prepare(
        "INSERT INTO login_attempts (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=login_attempts.count+1",
      )
      .run(key, now + duration);
    return true;
  });
}
