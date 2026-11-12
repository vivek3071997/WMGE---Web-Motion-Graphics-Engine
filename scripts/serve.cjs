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
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".md": "text/plain",
  ".txt": "text/plain",
};
function byteRange(header, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || size === 0) return null;
  const first = match[1] ? Number(match[1]) : null;
  const last = match[2] ? Number(match[2]) : null;
  if ([first, last].some((n) => n !== null && !Number.isSafeInteger(n))) return null;
  const start = first === null ? Math.max(0, size - last) : first;
  const end = first === null || last === null ? size - 1 : Math.min(last, size - 1);
  return start <= end && start < size ? { start, end } : null;
}
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
    const stat = fs.statSync(real);
    if (!stat.isFile()) throw new Error("Not a file");
    const headers = {
      "Content-Type": mime[path.extname(real)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-cache",
      "Accept-Ranges": "bytes",
      "Content-Length": stat.size,
    };
    let range;
    if (req.method === "GET" && req.headers.range) {
      range = byteRange(req.headers.range, stat.size);
      if (!range) {
        res.writeHead(416, { "Content-Range": `bytes */${stat.size}`, "Content-Length": 0 });
        res.end();
        return;
      }
      headers["Content-Range"] = `bytes ${range.start}-${range.end}/${stat.size}`;
      headers["Content-Length"] = range.end - range.start + 1;
    }
    res.writeHead(range ? 206 : 200, headers);
    if (req.method === "HEAD") res.end();
    else fs.createReadStream(real, range).pipe(res);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
server.listen(port, "127.0.0.1", () =>
  console.log(
    `Motion Forge: http://127.0.0.1:${server.address().port}\nLocal access only. Ctrl+C to stop.`,
  ),
);
