#!/usr/bin/env node
"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url"),
  M = require("../src/engine.js");
function args() {
  const a = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    if (!process.argv[i].startsWith("--") || !process.argv[i + 1])
      throw new Error("Options require --name value.");
    a[process.argv[i].slice(2)] = process.argv[i + 1];
  }
  return a;
}
(async () => {
  let browser;
  try {
    const a = args();
    if (!a.project || !a.out) {
      console.error(
        "Usage: node scripts/render.cjs --project scene.motion.json --out frames [--scene id|all] [--fps 30] [--width 1920] [--height 1080] [--browser /path/to/chrome]",
      );
      process.exitCode = 2;
      return;
    }
    const p = M.assertValid(JSON.parse(fs.readFileSync(a.project, "utf8"))),
      out = path.resolve(a.out),
      fps = Number(a.fps || p.fps),
      width = Number(a.width || p.width),
      height = Number(a.height || p.height);
    if (
      !Number.isInteger(fps) ||
      fps < 1 ||
      fps > 60 ||
      ![width, height].every(
        (n) => Number.isInteger(n) && n >= 256 && n <= 4096,
      )
    )
      throw new Error("Use integer fps 1–60 and dimensions 256–4096.");
    if (fs.existsSync(out) && fs.readdirSync(out).length)
      throw new Error(
        "Output folder must be empty. Existing frames will not be overwritten.",
      );
    const scenes =
      !a.scene || a.scene === "all"
        ? p.scenes
        : p.scenes.filter((s) => s.id === a.scene);
    if (!scenes.length) throw new Error("Unknown scene id.");
    let playwright;
    try {
      playwright = require("playwright");
    } catch {
      throw new Error(
        "Install render dependencies: npm install, then npx playwright install chromium.",
      );
    }
    browser = await playwright.chromium.launch({
      headless: true,
      ...(a.browser ? { executablePath: a.browser } : {}),
    });
    const page = await browser.newPage({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    await page.goto(
      pathToFileURL(path.resolve(__dirname, "../index.html")).href +
        "?export=1",
    );
    await page.waitForFunction(() => window.ready);
    await page.evaluate((p) => window.MotionForgeApp.setProject(p), p);
    await page.evaluate(() => document.fonts.ready);
    fs.mkdirSync(out, { recursive: true });
    let index = 0;
    const manifest = {
      project: p.name,
      width,
      height,
      fps,
      frames: 0,
      scenes: [],
    };
    for (const s of scenes) {
      const count = Math.ceil(s.duration * fps);
      manifest.scenes.push({
        id: s.id,
        name: s.name,
        firstFrame: index,
        frameCount: count,
        requestedDuration: s.duration,
        renderedDuration: count / fps,
      });
      for (let i = 0; i < count; i++) {
        await page.evaluate(
          ([id, t]) => window.renderFrame(id, t),
          [s.id, i / fps],
        );
        await page.screenshot({
          path: path.join(out, `frame-${String(index++).padStart(6, "0")}.png`),
          omitBackground: true,
        });
      }
      console.log(`Rendered ${s.id}: ${count} frames.`);
    }
    manifest.frames = index;
    fs.writeFileSync(
      path.join(out, "render-manifest.json"),
      JSON.stringify(manifest, null, 2) + "\n",
    );
    console.log(
      `Done: ${index} frames. Encode with FFmpeg; see docs/EXPORT.md.`,
    );
  } catch (e) {
    console.error(e.message);
    process.exitCode = 1;
  } finally {
    await browser?.close();
  }
})();
