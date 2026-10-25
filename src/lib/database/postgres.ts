import { Pool, type PoolClient } from "pg";
import type { Adapter, Connection } from "./types";

// Only application-owned, constant SQL enters this adapter. Values remain parameters.
export function postgresSql(sql: string) {
  let parameter = 0;
  return sql
    .replace(/\?/g, () => `$${++parameter}`)
    .replace(
      /\b(products|orders|login_attempts|meta|messages)\b/g,
      'poseidon."$1"',
    );
}
export const postgresSchema = `
  CREATE SCHEMA IF NOT EXISTS poseidon;
  REVOKE ALL ON SCHEMA poseidon FROM PUBLIC;
  CREATE TABLE IF NOT EXISTS poseidon.products (id TEXT PRIMARY KEY, data TEXT NOT NULL, rowid BIGSERIAL UNIQUE);
  CREATE TABLE IF NOT EXISTS poseidon.orders (id TEXT PRIMARY KEY, data TEXT NOT NULL, rowid BIGSERIAL UNIQUE);
  CREATE TABLE IF NOT EXISTS poseidon.meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  CREATE TABLE IF NOT EXISTS poseidon.login_attempts (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires BIGINT NOT NULL);
  CREATE TABLE IF NOT EXISTS poseidon.messages (id TEXT PRIMARY KEY, data TEXT NOT NULL, rowid BIGSERIAL UNIQUE);
  ALTER TABLE poseidon.products ENABLE ROW LEVEL SECURITY;
  ALTER TABLE poseidon.orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE poseidon.meta ENABLE ROW LEVEL SECURITY;
  ALTER TABLE poseidon.login_attempts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE poseidon.messages ENABLE ROW LEVEL SECURITY;
`;
export async function createPostgres(): Promise<Adapter> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !/^postgres(ql)?:\/\//.test(connectionString))
    throw new Error("Geçerli bir DATABASE_URL gerekli.");
  const pool = new Pool({
    connectionString,
    max: 1,
    allowExitOnIdle: true,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000,
    ssl: process.env.DATABASE_CA_CERT
      ? {
          ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, "\n"),
          rejectUnauthorized: true,
        }
      : { rejectUnauthorized: true },
  });
  pool.on("error", () =>
    console.error(
      "Veritabanı bağlantısı kesildi; sonraki istekte yeniden bağlanılacak.",
    ),
  );
  return createPostgresAdapter(pool);
}
export async function createPostgresAdapter(pool: Pool): Promise<Adapter> {
  function connection(client: PoolClient): Connection {
    return {
      async query(sql, params = []) {
        return (await client.query(postgresSql(sql), params)).rows;
      },
    };
  }
  async function transaction<T>(work: (conn: Connection) => Promise<T>) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      // Shared across all Vercel instances: stock changes and idempotent retries serialize.
      await client.query("SELECT pg_advisory_xact_lock(73921, 1)");
      const result = await work(connection(client));
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
  const setup = await pool.connect();
  let failed = false;
  try {
    await setup.query("BEGIN");
    await setup.query("SELECT pg_advisory_xact_lock(73921, 1)");
    await setup.query(postgresSchema);
    await setup.query("COMMIT");
  } catch (error) {
    failed = true;
    await setup.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    setup.release();
    if (failed) await pool.end();
  }
  return {
    async query(sql, params = []) {
      return (await pool.query(postgresSql(sql), params)).rows;
    },
    transaction,
  };
}
