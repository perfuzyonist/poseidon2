import { test } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
const fixture = JSON.parse(
  readFileSync(new URL("../src/lib/demo-data.json", import.meta.url), "utf8"),
);

test("GitHub/Vercel showcase works without working database credentials and cannot write or expose customer records", async () => {
  const base = "http://127.0.0.1:3102";
  const server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "-p",
      "3102",
    ],
    {
      cwd: process.cwd(),
      windowsHide: true,
      stdio: "pipe",
      env: {
        ...process.env,
        NODE_ENV: "production",
        APP_MODE: "demo",
        VERCEL: "1",
        DATABASE_URL: "postgresql://unusable:unused@127.0.0.1:1/none",
        SUPABASE_URL: "https://unusable.invalid",
        SUPABASE_SERVICE_ROLE_KEY: "never-connect",
        ADMIN_PASSWORD: "not-needed-for-read-only-demo",
        SESSION_SECRET: "x".repeat(32),
      },
    },
  );
  let output = "";
  server.stdout.on("data", (part) => (output += part));
  server.stderr.on("data", (part) => (output += part));
  const request = (path, method = "GET", body) =>
    fetch(base + path, {
      method,
      headers: {
        Origin: base,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(5000),
    });
  try {
    let up = false;
    for (let i = 0; i < 100; i++) {
      try {
        if ((await request("/api/products")).ok) {
          up = true;
          break;
        }
      } catch {}
      if (server.exitCode !== null)
        throw new Error("Demo server failed to start");
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    assert.equal(up, true, output.slice(-1000));
    assert.deepEqual(
      await (await request("/api/products")).json(),
      fixture.products,
    );
    const settings = await (await request("/api/settings")).json();
    assert.equal(settings.campaignTitle, fixture.settings.campaignTitle);
    assert.equal(settings.iban, "");
    assert.equal(settings.bankEnabled, false);
    for (const path of [
      "/",
      "/urunler",
      `/urunler/${fixture.products[0].id}`,
      "/sepet",
      "/odeme",
      "/admin",
      "/iletisim",
      "/siparis-takibi",
    ])
      assert.equal((await request(path)).status, 200, path);
    const admin = await (await request("/admin")).text();
    assert.ok(admin.includes("Tanıtım önizlemesi"));
    assert.deepEqual(await (await request("/api/orders")).json(), []);
    assert.deepEqual(await (await request("/api/messages")).json(), []);
    for (const [path, method] of [
      ["/api/products", "POST"],
      ["/api/products?id=first", "DELETE"],
      ["/api/orders", "POST"],
      ["/api/orders", "PATCH"],
      ["/api/orders/lookup", "POST"],
      ["/api/messages", "POST"],
      ["/api/messages", "PATCH"],
      ["/api/settings", "PUT"],
      ["/api/uploads", "POST"],
      ["/api/auth", "POST"],
      ["/api/auth", "DELETE"],
    ]) {
      const response = await request(path, method, { anything: "demo" });
      assert.equal(response.status, 403, `${method} ${path}`);
      assert.match((await response.json()).error, /tanıtım demosudur/);
    }
    assert.equal((await request(`/siparis/${"a".repeat(64)}`)).status, 404);
    assert.equal(
      (await request("/api/media/11111111-1111-1111-1111-111111111111.webp"))
        .status,
      404,
    );
    const images = new Set([
      ...fixture.products.map((p) => p.image),
      fixture.settings.campaignImage,
    ]);
    for (const image of images) {
      const response = await request(image);
      assert.equal(response.status, 200, image);
      assert.match(response.headers.get("content-type"), /^image\//);
    }
    assert.deepEqual(
      await (await request("/api/products")).json(),
      fixture.products,
    );
  } finally {
    if (server.exitCode === null) {
      const ended = new Promise((resolve) => server.once("exit", resolve));
      server.kill();
      await ended;
    }
  }
});
