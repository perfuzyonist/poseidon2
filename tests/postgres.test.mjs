import { test } from "node:test";
import assert from "node:assert/strict";
import { PGlite } from "@electric-sql/pglite";
import { createPostgresAdapter } from "../src/lib/database/postgres.ts";

test("PostgreSQL adapter runs schema, private access, transactions, rollback and ordered durable data", async () => {
  // Real PostgreSQL engine in WASM, with a single-connection Pool-shaped transport.
  const engine = new PGlite();
  let tail = Promise.resolve();
  async function connect() {
    const before = tail;
    let release;
    tail = new Promise((done) => {
      release = done;
    });
    await before;
    return {
      query: async (sql, values) => {
        if (values) return engine.query(sql, values);
        const results = await engine.exec(sql);
        return results.at(-1) || { rows: [] };
      },
      release,
    };
  }
  const pool = {
    connect,
    end: async () => {},
    query: async (sql, values) => {
      const client = await connect();
      try {
        return await client.query(sql, values);
      } finally {
        client.release();
      }
    },
  };
  try {
    const store = await createPostgresAdapter(pool);
    await store.transaction(async (tx) => {
      await tx.query("INSERT INTO products (id,data) VALUES (?,?)", [
        "first",
        JSON.stringify({ stock: 1 }),
      ]);
      await tx.query("INSERT INTO products (id,data) VALUES (?,?)", [
        "second",
        "{}",
      ]);
    });
    assert.deepEqual(
      (await store.query("SELECT id FROM products ORDER BY rowid")).map(
        (r) => r.id,
      ),
      ["first", "second"],
    );
    await assert.rejects(
      store.transaction(async (tx) => {
        await tx.query("UPDATE products SET data=? WHERE id=?", [
          JSON.stringify({ stock: 0 }),
          "first",
        ]);
        await tx.query("INSERT INTO orders (id,data) VALUES (?,?)", [
          "rollback-order",
          "{}",
        ]);
        throw new Error("force rollback");
      }),
      /force rollback/,
    );
    assert.equal(
      JSON.parse(
        (
          await store.query("SELECT data FROM products WHERE id=?", ["first"])
        )[0].data,
      ).stock,
      1,
    );
    assert.equal((await store.query("SELECT data FROM orders")).length, 0);
    const results = await Promise.allSettled(
      [1, 2].map((id) =>
        store.transaction(async (tx) => {
          const p = JSON.parse(
            (
              await tx.query("SELECT data FROM products WHERE id=?", ["first"])
            )[0].data,
          );
          if (!p.stock) throw new Error("out of stock");
          await tx.query("UPDATE products SET data=? WHERE id=?", [
            JSON.stringify({ stock: p.stock - 1 }),
            "first",
          ]);
          await tx.query("INSERT INTO orders (id,data) VALUES (?,?)", [
            String(id),
            "{}",
          ]);
        }),
      ),
    );
    assert.equal(results.filter((r) => r.status === "fulfilled").length, 1);
    for (let i = 0; i < 2; i++)
      await store.query(
        "INSERT INTO login_attempts (key,count,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=login_attempts.count+1",
        ["test", Date.now()],
      );
    assert.equal(
      (
        await store.query("SELECT count FROM login_attempts WHERE key=?", [
          "test",
        ])
      )[0].count,
      2,
    );
    await store.query(
      "INSERT INTO meta (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value",
      ["store-settings", JSON.stringify({ campaignTitle: "Kalıcı kampanya" })],
    );
    await store.query("INSERT INTO messages (id,data) VALUES (?,?)", [
      "message",
      JSON.stringify({ read: false }),
    ]);
    await store.query("UPDATE messages SET data=? WHERE id=?", [
      JSON.stringify({ read: true }),
      "message",
    ]);
    // Reinitialization cannot reset saved content or re-seed over edits.
    const restarted = await createPostgresAdapter(pool);
    assert.equal(
      JSON.parse(
        (
          await restarted.query("SELECT value FROM meta WHERE key=?", [
            "store-settings",
          ])
        )[0].value,
      ).campaignTitle,
      "Kalıcı kampanya",
    );
    assert.equal(
      JSON.parse((await restarted.query("SELECT data FROM messages"))[0].data)
        .read,
      true,
    );
    const rls = await engine.query(
      "SELECT relname,relrowsecurity FROM pg_class WHERE relnamespace='poseidon'::regnamespace AND relkind='r'",
    );
    assert.equal(rls.rows.length, 5);
    assert.equal(
      rls.rows.every((r) => r.relrowsecurity),
      true,
    );
    await engine.exec("CREATE ROLE demo_anon; SET ROLE demo_anon;");
    await assert.rejects(
      engine.query("SELECT data FROM poseidon.orders"),
      /permission denied/,
    );
    await engine.exec("RESET ROLE");
  } finally {
    await engine.close();
  }
});
