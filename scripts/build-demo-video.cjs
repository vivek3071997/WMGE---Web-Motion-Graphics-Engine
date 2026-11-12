"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto("file:///" + path.resolve(__dirname, "..", "index.html").replaceAll("\\", "/"));
    await page.waitForFunction(() => window.ready);
    const bytes = await page.evaluate(async () => {
      const canvas = document.createElement("canvas");
      canvas.width = 640; canvas.height = 360;
      const result = await MotionVideo.record({
        canvas, duration: 2, fps: 30, format: "webm", bitrate: 3000000,
        paint: async (time) => {
          const ctx = canvas.getContext("2d");
          const gradient = ctx.createLinearGradient(0, 0, 640, 360);
          gradient.addColorStop(0, "#10264a");
          gradient.addColorStop(1, "#146b72");
          ctx.fillStyle = gradient; ctx.fillRect(0, 0, 640, 360);
          for (let i = 0; i < 12; i++) {
            const phase = i * 0.6 + time * Math.PI;
            ctx.beginPath();
            ctx.arc(320 + Math.cos(phase) * (80 + i * 12), 180 + Math.sin(phase) * 100, 8 + i * 2, 0, Math.PI * 2);
            ctx.fillStyle = i % 2 ? "#56e0cf60" : "#8d9bff90"; ctx.fill();
          }
        },
      });
      return [...new Uint8Array(await result.blob.arrayBuffer())];
    });
    const out = path.resolve(__dirname, "..", "examples", "assets", "catalog-source.webm");
    fs.writeFileSync(out, Buffer.from(bytes));
    console.log("Generated original synthetic clip:", out);
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
