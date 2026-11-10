#!/usr/bin/env node
"use strict";
const http = require("node:http"),
  fs = require("node:fs"),
  path = require("node:path");
const root = path.resolve(__dirname, ".."),
  port = Number(process.env.PORT || 4173);
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".md": "text/plain",
  ".txt": "text/plain",
};
const server = http.createServer((req, res) => {
  let target;
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, "http://localhost").pathname,
    );
    target = path.resolve(root, "." + pathname);
    if (!target.startsWith(root + path.sep) && target !== root)
      throw new Error("Forbidden");
    if (fs.existsSync(target) && fs.statSync(target).isDirectory())
      target = path.join(target, "index.html");
    const real = fs.realpathSync(target);
    if (!real.startsWith(root + path.sep)) throw new Error("Forbidden");
    if (!fs.statSync(real).isFile()) throw new Error("Not a file");
    res.writeHead(200, {
      "Content-Type": mime[path.extname(real)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
    });
    fs.createReadStream(real).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Motion Forge: http://127.0.0.1:${port}\nLocal access only. Ctrl+C to stop.`,
  ),
);
