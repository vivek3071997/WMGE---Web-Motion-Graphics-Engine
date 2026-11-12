"use strict";
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { once } = require("node:events");
const root = path.resolve(__dirname, "..");

test("local server supports exact byte ranges and HEAD for seekable video", { timeout: 30000 }, async () => {
  const child = spawn(process.execPath, [path.join(root, "scripts", "serve.cjs")], {
    env: { ...process.env, PORT: "0" }, stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
  });
  try {
    const base = await new Promise((resolve, reject) => {
      let output = "";
      child.once("error", reject);
      child.once("exit", (code) => reject(new Error(`Server exited before readiness: ${code}`)));
      child.stderr.on("data", (chunk) => reject(new Error(chunk.toString())));
      child.stdout.on("data", (chunk) => {
        output += chunk;
        const match = /http:\/\/127\.0\.0\.1:\d+/.exec(output);
        if (match) resolve(match[0]);
      });
    });
    const bytes = fs.readFileSync(path.join(root, "examples", "assets", "catalog-source.webm"));
    const url = `${base}/examples/assets/catalog-source.webm`;
    const full = await fetch(url);
    assert.equal(full.status, 200);
    assert.equal(full.headers.get("content-type"), "video/webm");
    assert.equal(full.headers.get("accept-ranges"), "bytes");
    assert.equal(Number(full.headers.get("content-length")), bytes.length);
    assert.deepEqual(Buffer.from(await full.arrayBuffer()), bytes);
    for (const [range, start, end] of [
      ["bytes=0-31", 0, 31],
      ["bytes=32-", 32, bytes.length - 1],
      ["bytes=-17", bytes.length - 17, bytes.length - 1],
      [`bytes=${bytes.length - 5}-${bytes.length + 100}`, bytes.length - 5, bytes.length - 1],
    ]) {
      const response = await fetch(url, { headers: { Range: range } });
      assert.equal(response.status, 206, range);
      assert.equal(response.headers.get("content-range"), `bytes ${start}-${end}/${bytes.length}`);
      assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes.subarray(start, end + 1));
    }
    for (const range of ["bytes=999999999-", "bytes=8-2", "bytes=-0", "bytes=-", "bytes=0-1,4-5", "bytes=1e2-"]) {
      const response = await fetch(url, { headers: { Range: range } });
      assert.equal(response.status, 416, range);
      assert.equal(response.headers.get("content-range"), `bytes */${bytes.length}`);
      assert.equal((await response.arrayBuffer()).byteLength, 0);
    }
    const head = await fetch(url, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(Number(head.headers.get("content-length")), bytes.length);
    assert.equal((await head.arrayBuffer()).byteLength, 0);
    const missing = await fetch(`${base}/not-a-story.webm`);
    assert.equal(missing.status, 404);
    await missing.arrayBuffer();
  } finally {
    if (child.exitCode === null) {
      child.kill();
      await once(child, "exit");
    }
  }
});
