import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import sharp from "sharp";

test("Supabase storage sends secrets only server-side and media survives independent readers", async () => {
  const files = new Map();
  let bucketExists = false,
    bucketOptions;
  const secret = "test-server-key-never-public";
  const server = createServer(async (req, res) => {
    const json = (status, body) => {
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (
      req.headers.apikey !== secret ||
      req.headers.authorization !== `Bearer ${secret}`
    )
      return json(401, { error: "unauthorized" });
    if (req.url === "/storage/v1/bucket/poseidon-images")
      return bucketExists
        ? json(200, {
            id: "poseidon-images",
            name: "poseidon-images",
            public: false,
          })
        : json(404, {
            statusCode: "404",
            error: "not_found",
            message: "Bucket not found",
          });
    if (req.url === "/storage/v1/bucket" && req.method === "POST") {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      bucketOptions = JSON.parse(Buffer.concat(chunks).toString());
      bucketExists = true;
      return json(200, { name: "poseidon-images" });
    }
    const match = req.url.match(
      /^\/storage\/v1\/object\/poseidon-images\/([a-f0-9-]+\.webp)$/,
    );
    if (match && req.method === "POST") {
      if (files.has(match[1]))
        return json(409, {
          statusCode: "409",
          error: "exists",
          message: "Already exists",
        });
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      files.set(match[1], Buffer.concat(chunks));
      assert.equal(req.headers["content-type"], "image/webp");
      return json(200, {
        Key: `poseidon-images/${match[1]}`,
        Id: randomUUID(),
      });
    }
    if (match && req.method === "GET") {
      if (!files.has(match[1]))
        return json(404, {
          statusCode: "404",
          error: "not_found",
          message: "Object not found",
        });
      res.writeHead(200, { "Content-Type": "image/webp" });
      res.end(files.get(match[1]));
      return;
    }
    json(404, { statusCode: "404", message: "Not found" });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  process.env.APP_MODE = "live";
  process.env.SUPABASE_URL = `http://127.0.0.1:${server.address().port}`;
  process.env.SUPABASE_SERVICE_ROLE_KEY = secret;
  process.env.SUPABASE_STORAGE_BUCKET = "poseidon-images";
  try {
    const { setupCloudStorage } = await import("../src/lib/cloud-storage.ts");
    const { storeImage, readImage, MediaNotFound } =
      await import("../src/lib/media.ts");
    await setupCloudStorage();
    assert.equal(bucketOptions.public, false);
    assert.deepEqual(bucketOptions.allowed_mime_types, ["image/webp"]);
    assert.equal(bucketOptions.file_size_limit, 4 * 1024 * 1024);
    const buffer = await sharp({
      create: { width: 3, height: 3, channels: 3, background: "#123462" },
    })
      .webp()
      .toBuffer();
    const filename = `${randomUUID()}.webp`;
    const url = await storeImage(filename, buffer);
    assert.equal(url, `/api/media/${filename}`);
    assert.equal(url.includes(secret), false);
    assert.deepEqual(Buffer.from(await readImage(filename)), buffer);
    const { createClient } = await import("@supabase/supabase-js");
    const independent = createClient(process.env.SUPABASE_URL, secret, {
      auth: { persistSession: false },
    });
    const downloaded = await independent.storage
      .from("poseidon-images")
      .download(filename);
    assert.equal(downloaded.error, null);
    assert.deepEqual(Buffer.from(await downloaded.data.arrayBuffer()), buffer);
    await assert.rejects(storeImage(filename, buffer), /kaydedilemedi/);
    await assert.rejects(readImage(`${randomUUID()}.webp`), MediaNotFound);
    await assert.rejects(readImage("../private"), MediaNotFound);
    await setupCloudStorage();
    assert.equal(files.size, 1);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
