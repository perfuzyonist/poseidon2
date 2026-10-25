import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Adapter, Connection, Row } from "./types";

export function createSqlite(): Adapter {
  const path = resolve(process.env.DATABASE_PATH || "./data/poseidon.sqlite");
  mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  database.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
    CREATE TABLE IF NOT EXISTS products (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS orders (id TEXT PRIMARY KEY, data TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE IF NOT EXISTS messages (id TEXT PRIMARY KEY, data TEXT NOT NULL);`);
  const raw: Connection = {
    async query(sql, params = []) {
      const statement = database.prepare(sql);
      if (/^\s*SELECT\b/i.test(sql) || /\bRETURNING\b/i.test(sql))
        return statement.all(...(params as never[])) as Row[];
      statement.run(...(params as never[]));
      return [];
    },
  };
  // A single local connection must not interleave other requests during awaits.
  let tail = Promise.resolve();
  async function serial<T>(work: () => Promise<T>) {
    const before = tail;
    let release!: () => void;
    tail = new Promise<void>((done) => {
      release = done;
    });
    await before;
    try {
      return await work();
    } finally {
      release();
    }
  }
  return {
    query: (sql, params) => serial(() => raw.query(sql, params)),
    transaction: (work) =>
      serial(async () => {
        database.exec("BEGIN IMMEDIATE");
        try {
          const result = await work(raw);
          database.exec("COMMIT");
          return result;
        } catch (error) {
          database.exec("ROLLBACK");
          throw error;
        }
      }),
  };
}
