"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(pathToFileURL(path.join(root, "index.html")).href + "?export=1");
    await page.waitForFunction(() => window.ready);
    const project = JSON.parse(fs.readFileSync(path.join(root, "examples", "catalog.motion.json")));
    const cookbook = fs.readFileSync(path.join(root, "docs", "EXAMPLE_COOKBOOK.md"), "utf8");
    await page.evaluate((p) => MotionForgeApp.setProject(p), project);
    const out = path.join(root, "test-output", "catalog");
    fs.mkdirSync(out, { recursive: true });
    for (const scene of project.scenes) {
      assert.ok(cookbook.includes(`id="${scene.id}"`), scene.id + " has documentation");
      for (const t of [0, 3, scene.duration - 0.1])
        await page.evaluate(([id, t]) => MotionForgeApp.renderFrame(id, t, { image: false }), [scene.id, t]);
      await page.evaluate((id) => MotionForgeApp.renderFrame(id, 3, { image: false }), scene.id);
      await page.locator("#stage").screenshot({ path: path.join(out, scene.id + ".png") });
      console.log("PASS", scene.id, scene.name);
    }
    assert.deepEqual(errors, []);
    console.log("Verified", project.scenes.length, "documented scenes at start/middle/end with no browser errors.");
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
