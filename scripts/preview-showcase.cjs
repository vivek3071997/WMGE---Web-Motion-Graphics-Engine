"use strict";
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const M = require("../src/engine.js");
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "examples", "showcase");
(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    await page.goto(pathToFileURL(path.join(root, "index.html")).href + "?export=1");
    await page.waitForFunction(() => window.ready);
    await page.addStyleTag({ content: "#toast { display:none !important }" });
    const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json")));
    const previews = path.join(dir, "previews");
    fs.mkdirSync(previews, { recursive: true });
    let frames = 0;
    for (const story of manifest) {
      const p = M.assertValid(JSON.parse(fs.readFileSync(path.join(dir, story.key + ".motion.json"))));
      await page.evaluate((p) => MotionForgeApp.setProject(p), p);
      for (let i = 0; i < p.scenes.length; i++) {
        const scene = p.scenes[i];
        for (const t of [0, 0.8, 2, 4, 5.9]) {
          await page.evaluate(([id, t]) => MotionForgeApp.renderFrame(id, t, { image: false }), [scene.id, t]);
          frames++;
        }
        await page.evaluate((id) => MotionForgeApp.renderFrame(id, 4, { image: false }), scene.id);
        const first = await page.locator("#stage").screenshot();
        await page.evaluate((id) => MotionForgeApp.renderFrame(id, 1, { image: false }), scene.id);
        await page.evaluate((id) => MotionForgeApp.renderFrame(id, 4, { image: false }), scene.id);
        const second = await page.locator("#stage").screenshot();
        assert.ok(first.equals(second), `${story.key}/${scene.id}: deterministic revisit`);
        fs.writeFileSync(path.join(previews, `${story.key}-${i + 1}.png`), second);
        // Inspect SVG text boxes even in hybrid mode using the deterministic hit overlay.
        const clipping = await page.evaluate(() => {
          const p = MotionForgeApp.getProject();
          const scene = p.scenes.find((s) => s.id === document.querySelector("#scene-name").value) || p.scenes.find((s) => s.name === document.querySelector("#scene-name").value);
          const host = document.createElement("div");
          host.style.cssText = "position:fixed;left:0;top:0;width:1600px;height:900px;visibility:hidden";
          host.innerHTML = MotionForge.renderSVG(p, scene.id, 4, { placeholders: true });
          document.body.append(host);
          const svg = host.querySelector("svg");
          const bad = [...host.querySelectorAll("text")].filter((el) => {
            const box = el.getBoundingClientRect(), stage = svg.getBoundingClientRect();
            return box.left < stage.left - 2 || box.right > stage.right + 2 ||
              box.top < stage.top - 2 || box.bottom > stage.bottom + 2;
          }).map((el) => el.textContent);
          host.remove();
          return bad;
        });
        assert.deepEqual(clipping, [], `${scene.id}: off-stage text`);
        console.log("PASS", story.key, scene.name, "five samples / deterministic revisit / text bounds");
      }
    }
    assert.deepEqual(errors, []);
    console.log(`Verified ${manifest.length} stories, 15 scenes, ${frames} timeline samples, no browser/renderer errors.`);
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
