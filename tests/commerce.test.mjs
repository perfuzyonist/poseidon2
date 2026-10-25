import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, basename, resolve } from "node:path";
import { randomUUID } from "node:crypto";
const directory = mkdtempSync(join(tmpdir(), "poseidon-test-"));
const base = "http://127.0.0.1:3101";
const password = "integration-test-only-password";
let server, cookie, settings, demoOrder, bankOrder;
async function request(
  path,
  method = "GET",
  body,
  auth = false,
  origin = base,
) {
  return fetch(base + path, {
    method,
    headers: {
      Origin: origin,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(auth ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(12000),
  });
}
const product = {
  id: "test-product",
  name: "Test Akvaryum",
  category: "Akvaryumlar",
  price: 1234.5,
  oldPrice: null,
  stock: 5,
  image: "/images/aquarium.svg",
  description: "Test ürünü",
  badge: "",
  featured: false,
};
const customer = {
  customer: "Test Müşteri",
  email: "test@example.com",
  phone: "05551234567",
  address: "Test Mahallesi, Test Sokak No:1",
  city: "Denizli",
  district: "Merkezefendi",
  postalCode: "20000",
  note: "Test siparişi",
  deliveryMethod: "shipping",
  paymentMethod: "online",
  billingType: "individual",
  companyName: "",
  taxOffice: "",
  taxNumber: "",
  consent: true,
};
const orderBody = (extra = {}) => ({
  ...customer,
  idempotencyKey: randomUUID(),
  items: [{ id: product.id, quantity: 1 }],
  ...extra,
});
before(async () => {
  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--hostname",
      "127.0.0.1",
      "-p",
      "3101",
    ],
    {
      cwd: process.cwd(),
      env: {
        ...process.env,
        NODE_ENV: "production",
        DATABASE_PATH: join(directory, "test.sqlite"),
        DATABASE_URL: "",
        APP_MODE: "live",
        SUPABASE_URL: "",
        SUPABASE_SERVICE_ROLE_KEY: "",
        VERCEL: "",
        ADMIN_PASSWORD: password,
        SESSION_SECRET: "a".repeat(64),
      },
      stdio: "pipe",
      windowsHide: true,
    },
  );
  let output = "";
  server.stdout.on("data", (d) => (output += d));
  server.stderr.on("data", (d) => (output += d));
  for (let i = 0; i < 120; i++) {
    try {
      if ((await request("/api/products")).ok) return;
    } catch {}
    if (server.exitCode !== null) throw new Error(output);
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("Test server not ready: " + output);
});
after(async () => {
  if (server && server.exitCode === null) {
    server.kill();
    await new Promise((r) => server.once("exit", r));
  }
  if (
    dirname(resolve(directory)) !== resolve(tmpdir()) ||
    !basename(directory).startsWith("poseidon-test-")
  )
    throw new Error("Unexpected cleanup path");
  rmSync(directory, { recursive: true, force: true });
});
test("Small business ecommerce workflow", async (t) => {
  await t.test("photo upload is private", async () => {
    const form = new FormData();
    form.append(
      "file",
      new Blob(["not-an-image"], { type: "image/png" }),
      "test.png",
    );
    assert.equal(
      (
        await fetch(base + "/api/uploads", {
          method: "POST",
          headers: { Origin: base },
          body: form,
        })
      ).status,
      401,
    );
  });
  await t.test(
    "store pages, individual products, unknown product and private receipt routes",
    async () => {
      for (const path of [
        "/",
        "/urunler",
        "/urunler/ocellaris",
        "/sepet",
        "/odeme",
        "/hakkimizda",
        "/rehber",
        "/rehber/ilk-akvaryum",
        "/iletisim",
        "/sss",
        "/siparis-takibi",
        "/teslimat-iade",
        "/odeme-bilgileri",
        "/gizlilik",
        "/mesafeli-satis",
      ])
        assert.equal((await request(path)).status, 200, path);
      assert.equal((await request("/urunler/not-a-product")).status, 404);
      assert.equal((await request("/siparis/" + "0".repeat(64))).status, 404);
    },
  );
  await t.test(
    "private APIs require auth; login validates origin and password",
    async () => {
      assert.equal((await request("/api/orders")).status, 401);
      assert.equal((await request("/api/messages")).status, 401);
      assert.equal((await request("/api/settings", "PUT", {})).status, 401);
      assert.equal(
        (
          await request(
            "/api/auth",
            "POST",
            { password },
            false,
            "https://foreign.example",
          )
        ).status,
        403,
      );
      assert.equal(
        (await request("/api/auth", "POST", { password: "wrong" })).status,
        401,
      );
      const r = await request("/api/auth", "POST", { password });
      assert.equal(r.status, 200);
      cookie = r.headers.get("set-cookie").split(";")[0];
      assert.match(r.headers.get("set-cookie"), /httponly/i);
      assert.match(r.headers.get("set-cookie"), /samesite=strict/i);
    },
  );
  await t.test(
    "bank, shipping and demo settings validate and persist",
    async () => {
      settings = await (await request("/api/settings")).json();
      assert.equal(
        (
          await request(
            "/api/settings",
            "PUT",
            { ...settings, bankEnabled: true, iban: "TR123" },
            true,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "/api/settings",
            "PUT",
            { ...settings, shippingEnabled: false, pickupEnabled: false },
            true,
          )
        ).status,
        400,
      );
      const body = "0000000000000000000001";
      const check = String(98 - Number(BigInt(body + "292700") % 97n)).padStart(
        2,
        "0",
      );
      settings = {
        ...settings,
        bankEnabled: true,
        bankName: "TEST BANKASI — GERÇEK HESAP DEĞİLDİR",
        accountName: "Test İşletmesi",
        iban: "TR" + check + body,
        shippingFee: 99,
        freeShippingThreshold: 1500,
      };
      assert.equal(
        (await request("/api/settings", "PUT", settings, true)).status,
        200,
      );
      const saved = await (await request("/api/settings")).json();
      assert.equal(saved.iban, settings.iban);
      assert.equal(saved.shippingFee, 99);
    },
  );
  await t.test(
    "campaign content persists and rejects unsafe destinations",
    async () => {
      settings = {
        ...settings,
        campaignTitle: "Yeni kampanya",
        campaignDescription: "Seçili ekipmanları keşfedin.",
        campaignButton: "Ekipmanlara git",
        campaignHref: "/urunler?kategori=Ekipmanlar",
      };
      assert.equal(
        (await request("/api/settings", "PUT", settings, true)).status,
        200,
      );
      const saved = await (await request("/api/settings")).json();
      assert.equal(saved.campaignTitle, settings.campaignTitle);
      assert.equal(saved.campaignHref, settings.campaignHref);
      for (const campaignHref of [
        "javascript:alert(1)",
        "//example.com",
        "/\\example.com",
        "/urunler\n",
      ]) {
        assert.equal(
          (
            await request(
              "/api/settings",
              "PUT",
              { ...settings, campaignHref },
              true,
            )
          ).status,
          400,
        );
      }
      assert.equal(
        (
          await request(
            "/api/settings",
            "PUT",
            { ...settings, campaignTitle: "" },
            true,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "/api/settings",
            "PUT",
            { ...settings, campaignImage: "data:image/svg+xml,bad" },
            true,
          )
        ).status,
        400,
      );
      assert.equal(
        (
          await request(
            "/api/settings",
            "PUT",
            { ...settings, campaignEnabled: false },
            true,
          )
        ).status,
        200,
      );
      assert.equal(
        (await (await request("/api/settings")).json()).campaignEnabled,
        false,
      );
      assert.equal(
        (await request("/api/settings", "PUT", settings, true)).status,
        200,
      );
    },
  );
  await t.test(
    "upload decodes real photos, strips metadata and rejects invalid content",
    async () => {
      const { default: sharp } = await import("sharp");
      const photo = await sharp({
        create: { width: 300, height: 200, channels: 3, background: "#649b70" },
      })
        .jpeg()
        .withMetadata({ orientation: 6 })
        .toBuffer();
      const form = new FormData();
      form.append(
        "file",
        new Blob([photo], { type: "image/jpeg" }),
        "camera-photo.jpg",
      );
      const r = await fetch(base + "/api/uploads", {
        method: "POST",
        headers: { Origin: base, Cookie: cookie },
        body: form,
      });
      assert.equal(r.status, 201);
      const result = await r.json();
      assert.match(result.url, /^\/api\/media\/[a-f0-9-]{36}\.webp$/);
      const image = await request(result.url);
      assert.equal(image.status, 200);
      assert.equal(image.headers.get("content-type"), "image/webp");
      const metadata = await sharp(
        Buffer.from(await image.arrayBuffer()),
      ).metadata();
      assert.equal(metadata.format, "webp");
      assert.equal(metadata.width, 200);
      assert.equal(metadata.height, 300);
      assert.equal(metadata.exif, undefined);
      assert.equal(metadata.orientation, undefined);
      assert.equal(
        (
          await request(
            "/api/products",
            "POST",
            { ...product, id: "photo-product", image: result.url },
            true,
          )
        ).status,
        200,
      );
      assert.equal(
        (await (await request("/api/products")).json()).find(
          (p) => p.id === "photo-product",
        ).image,
        result.url,
      );
      for (const [content, type] of [
        ["not-an-image", "image/png"],
        [
          '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"/>',
          "image/png",
        ],
      ]) {
        const bad = new FormData();
        bad.append("file", new Blob([content], { type }), "bad.png");
        assert.equal(
          (
            await fetch(base + "/api/uploads", {
              method: "POST",
              headers: { Origin: base, Cookie: cookie },
              body: bad,
            })
          ).status,
          400,
        );
      }
      assert.equal((await request("/api/media/not-a-file.webp")).status, 404);
    },
  );
  await t.test("product validation and durable update", async () => {
    assert.equal(
      (await request("/api/products", "POST", { ...product, price: -1 }, true))
        .status,
      400,
    );
    assert.equal(
      (
        await request(
          "/api/products",
          "POST",
          { ...product, image: "javascript:alert(1)" },
          true,
        )
      ).status,
      400,
    );
    assert.equal(
      (await request("/api/products", "POST", product, true)).status,
      200,
    );
    assert.equal(
      (await request("/api/products", "POST", { ...product, stock: 4 }, true))
        .status,
      200,
    );
    assert.equal(
      (await (await request("/api/products")).json()).find(
        (p) => p.id === product.id,
      ).stock,
      4,
    );
  });
  await t.test(
    "checkout rejects malformed lines, absent consent, invalid invoice and overstock",
    async () => {
      for (const extra of [
        { items: [] },
        { items: [null] },
        { consent: false },
        { items: [{ id: product.id, quantity: 1.5 }] },
        {
          items: [
            { id: product.id, quantity: 3 },
            { id: product.id, quantity: 3 },
          ],
        },
        {
          billingType: "business",
          companyName: "",
          taxOffice: "",
          taxNumber: "",
        },
        { city: "", district: "" },
      ])
        assert.equal(
          (await request("/api/orders", "POST", orderBody(extra))).status,
          400,
        );
    },
  );
  await t.test(
    "server pricing, merged lines, reservation and idempotent retry",
    async () => {
      const body = orderBody({
        total: 1,
        shippingFee: 1,
        items: [
          { id: product.id, quantity: 1, price: 1 },
          { id: product.id, quantity: 1, price: 1 },
        ],
      });
      const r = await request("/api/orders", "POST", body);
      assert.equal(r.status, 201);
      const result = await r.json();
      assert.equal(result.total, 2469);
      assert.match(result.accessToken, /^[a-f0-9]{64}$/);
      demoOrder = (
        await (await request("/api/orders", "GET", undefined, true)).json()
      ).find((o) => o.id === result.id);
      assert.equal(demoOrder.items.length, 1);
      assert.equal(demoOrder.items[0].quantity, 2);
      assert.equal(demoOrder.paymentStatus, "Demo ödeme tamamlandı");
      assert.equal(demoOrder.shippingFee, 0);
      assert.equal(demoOrder.cardNumber, undefined);
      assert.equal(
        (await (await request("/api/orders", "POST", body)).json()).id,
        result.id,
      );
      assert.equal(
        (await (await request("/api/products")).json()).find(
          (p) => p.id === product.id,
        ).stock,
        2,
      );
      assert.equal(
        (await request("/siparis/" + result.accessToken)).status,
        200,
      );
    },
  );
  await t.test(
    "bank order snapshots bank details and charges shipping below threshold",
    async () => {
      const r = await request(
        "/api/orders",
        "POST",
        orderBody({ paymentMethod: "bank" }),
      );
      assert.equal(r.status, 201);
      const result = await r.json();
      assert.equal(result.total, 1333.5);
      bankOrder = (
        await (await request("/api/orders", "GET", undefined, true)).json()
      ).find((o) => o.id === result.id);
      assert.equal(bankOrder.paymentStatus, "Havale bekleniyor");
      assert.equal(bankOrder.bankSnapshot.iban, settings.iban);
      assert.equal(bankOrder.shippingFee, 99);
      assert.equal(
        (
          await request(
            "/api/orders",
            "PATCH",
            { id: result.id, status: "Hazırlanıyor" },
            true,
          )
        ).status,
        400,
      );
    },
  );
  await t.test(
    "tracking verifies email and excludes capability secrets",
    async () => {
      assert.equal(
        (
          await request("/api/orders/lookup", "POST", {
            id: bankOrder.id,
            email: "wrong@example.com",
          })
        ).status,
        404,
      );
      const r = await request("/api/orders/lookup", "POST", {
        id: bankOrder.id,
        email: customer.email.toUpperCase(),
      });
      assert.equal(r.status, 200);
      const o = await r.json();
      assert.equal(o.id, bankOrder.id);
      assert.equal(o.accessToken, undefined);
      assert.equal(o.idempotencyKey, undefined);
    },
  );
  await t.test(
    "admin confirms bank payment, advances order and restores stock once on cancellation",
    async () => {
      assert.equal(
        (
          await request(
            "/api/orders",
            "PATCH",
            { id: bankOrder.id, paymentStatus: "Ödeme onaylandı" },
            true,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            "/api/orders",
            "PATCH",
            { id: bankOrder.id, status: "Hazırlanıyor" },
            true,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            "/api/orders",
            "PATCH",
            { id: bankOrder.id, status: "İptal edildi" },
            true,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await request(
            "/api/orders",
            "PATCH",
            { id: bankOrder.id, status: "İptal edildi" },
            true,
          )
        ).status,
        200,
      );
      assert.equal(
        (await (await request("/api/products")).json()).find(
          (p) => p.id === product.id,
        ).stock,
        2,
      );
      assert.equal(
        (
          await request(
            "/api/orders",
            "PATCH",
            { id: bankOrder.id, status: "Yeni sipariş" },
            true,
          )
        ).status,
        400,
      );
    },
  );
  await t.test(
    "live animals require pickup and have no shipping fee",
    async () => {
      assert.equal(
        (
          await request(
            "/api/orders",
            "POST",
            orderBody({ items: [{ id: "ocellaris", quantity: 1 }] }),
          )
        ).status,
        400,
      );
      const r = await request(
        "/api/orders",
        "POST",
        orderBody({
          items: [{ id: "ocellaris", quantity: 1 }],
          deliveryMethod: "pickup",
        }),
      );
      assert.equal(r.status, 201);
      const result = await r.json();
      const order = (
        await (await request("/api/orders", "GET", undefined, true)).json()
      ).find((o) => o.id === result.id);
      assert.equal(order.shippingFee, 0);
      assert.equal(
        (
          await request(
            "/api/orders",
            "PATCH",
            { id: order.id, status: "Kargoya verildi" },
            true,
          )
        ).status,
        400,
      );
    },
  );
  await t.test("server enforces disabled payment method", async () => {
    await request(
      "/api/settings",
      "PUT",
      { ...settings, demoOnlineEnabled: false },
      true,
    );
    assert.equal(
      (await request("/api/orders", "POST", orderBody())).status,
      400,
    );
    await request("/api/settings", "PUT", settings, true);
  });
  await t.test(
    "concurrent checkout cannot oversell the last item",
    async () => {
      await request("/api/products", "POST", { ...product, stock: 1 }, true);
      const rs = await Promise.all([
        request("/api/orders", "POST", orderBody()),
        request("/api/orders", "POST", orderBody()),
      ]);
      assert.deepEqual(rs.map((r) => r.status).sort(), [201, 400]);
      assert.equal(
        (await (await request("/api/products")).json()).find(
          (p) => p.id === product.id,
        ).stock,
        0,
      );
    },
  );
  await t.test(
    "contact message reaches private inbox and can be marked read",
    async () => {
      assert.equal(
        (
          await request("/api/messages", "POST", {
            name: "Deniz",
            email: "invalid",
            subject: "Test",
            message: "Merhaba",
            consent: true,
          })
        ).status,
        400,
      );
      assert.equal(
        (
          await request("/api/messages", "POST", {
            name: "Deniz",
            email: "test@example.com",
            subject: "Kurulum sorusu",
            message: "Bir test mesajı.",
            consent: true,
          })
        ).status,
        201,
      );
      const list = await (
        await request("/api/messages", "GET", undefined, true)
      ).json();
      assert.equal(list[0].subject, "Kurulum sorusu");
      assert.equal(
        (await request("/api/messages", "PATCH", { id: list[0].id }, true))
          .status,
        200,
      );
      assert.equal(
        (
          await (await request("/api/messages", "GET", undefined, true)).json()
        )[0].read,
        true,
      );
    },
  );
  await t.test(
    "deletion preserves historical lines; tampered session is rejected",
    async () => {
      assert.equal(
        (
          await request(
            "/api/products?id=" + product.id,
            "DELETE",
            undefined,
            true,
          )
        ).status,
        200,
      );
      assert.equal(
        (
          await (await request("/api/orders", "GET", undefined, true)).json()
        ).find((o) => o.id === demoOrder.id).items[0].name,
        product.name,
      );
      cookie += "tampered";
      assert.equal(
        (await request("/api/orders", "GET", undefined, true)).status,
        401,
      );
    },
  );
});
