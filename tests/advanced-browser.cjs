"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { chromium } = require("playwright");
const root = path.resolve(__dirname, "..");
const out = path.join(root, "test-output", "advanced");
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_PATH ? { executablePath: process.env.BROWSER_PATH } : {}),
  });
  const errors = [], requests = [];
  let checks = 0;
  const pass = (message) => { checks++; console.log("PASS", message); };
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("request", (request) => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await page.goto(pathToFileURL(path.join(root, "index.html")).href);
    await page.waitForFunction(() => window.ready);
    await page.click("#tab-assets");
    await page.selectOption("#icon-library", "lucide");
    await page.fill("#icon-search", "box");
    assert.ok(await page.locator("#icon-grid button").count() > 0);
    await page.locator('#icon-grid button[title="box"]').click();
    assert.equal(await page.evaluate(() => MotionForgeApp.getProject().scenes[0].layers.at(-1).symbol), "box");
    pass("Lucide library adds editable vector elements offline");
    const names = await page.evaluate(() => MotionPresets.names);
    for (const name of names) {
      const state = await page.evaluate(async (name) => {
        const p = MotionExamples.project();
        p.width = 640; p.height = 360;
        p.assets = {};
        p.scenes = [MotionPresets.scene(name, p.width, p.height)];
        MotionForgeApp.setProject(p);
        const first = await MotionForgeApp.renderFrame("advanced", 2);
        const moving = await MotionForgeApp.renderFrame("advanced", 3);
        const revisited = await MotionForgeApp.renderFrame("advanced", 2);
        return { first, moving, revisited, errors: MotionForge.validate(p) };
      }, name);
      assert.deepEqual(state.errors, []);
      assert.equal(state.first, state.revisited, name + " deterministic seek");
      assert.notEqual(state.first, state.moving, name + " motion");
      await page.locator("#stage").screenshot({ path: path.join(out, name.replaceAll(" ", "-") + ".png") });
      pass(name + " renders with deterministic motion");
    }
    const beforePlayback = await page.evaluate(() => {
      const original = MotionCompositor.Compositor.prototype.paint;
      window.restorePaint = () => { MotionCompositor.Compositor.prototype.paint = original; };
      MotionCompositor.Compositor.prototype.paint = async function (...args) {
        await new Promise((resolve) => setTimeout(resolve, 80));
        return original.apply(this, args);
      };
      return document.querySelector("#stage > canvas").toDataURL();
    });
    await page.click("#play");
    await page.waitForFunction((before) =>
      document.querySelector("#stage > canvas").toDataURL() !== before, beforePlayback);
    await page.click("#play");
    await page.evaluate(() => { window.restorePaint(); delete window.restorePaint; });
    pass("slow hybrid playback publishes completed frames instead of starving behind the playhead");
    await page.evaluate(() => MotionForgeApp.select("stage3d"));
    await page.locator('[data-object="0"][data-object-key="x"]').fill("0.3");
    await page.locator('[data-object="0"][data-object-key="x"]').dispatchEvent("change");
    assert.equal(await page.evaluate(() => MotionForgeApp.getProject().scenes[0].layers[0].objects[0].x), 0.3);
    await page.locator('[data-object-key-add="0"]').click();
    assert.equal(await page.evaluate(() => MotionForgeApp.getProject().scenes[0].layers[0].objects[0].tracks.length), 1);
    await page.selectOption("#kf-property", "cameraDistance");
    await page.fill("#kf-value", "7");
    await page.click("#key-add");
    assert.deepEqual(await page.evaluate(() => MotionForge.validate(MotionForgeApp.getProject())), []);
    await page.click("#tab-scene");
    await page.locator('#scene-inspector [data-key="duration"]').fill("1");
    await page.locator('#scene-inspector [data-key="duration"]').dispatchEvent("change");
    assert.deepEqual(await page.evaluate(() => MotionForge.validate(MotionForgeApp.getProject())), []);
    pass("3D inspector, object keys and shortened duration remain valid");

    const bytes = await page.evaluate(async () => {
      const c = document.createElement("canvas");
      c.width = 320; c.height = 180;
      const result = await MotionVideo.record({
        canvas: c, duration: 1, fps: 10, format: "webm", bitrate: 2000000,
        paint: async (time) => {
          const ctx = c.getContext("2d");
          ctx.fillStyle = time < 0.5 ? "#ff0000" : "#0000ff";
          ctx.fillRect(0, 0, c.width, c.height);
        },
      });
      return [...new Uint8Array(await result.blob.arrayBuffer())];
    });
    const clip = path.join(out, "source.webm");
    fs.writeFileSync(clip, Buffer.from(bytes));
    await page.setInputFiles("#video-upload", clip);
    await page.waitForFunction(() => Object.values(MotionForgeApp.getProject().assets).some((a) => a.src.startsWith("data:video/")));
    const project = await page.evaluate(() => {
      const p = MotionForgeApp.getProject();
      const id = Object.keys(p.assets).find((id) => p.assets[id].src.startsWith("data:video/"));
      p.width = 640; p.height = 360; p.fps = 10;
      p.scenes = [{
        id: "composite", name: "Composite", duration: 2,
        background: { type: "solid", color: "#222222" },
        layers: [
          { id: "video", type: "video", asset: id, width: 640, height: 360, enter: "none", fit: "cover" },
          { id: "three", type: "scene3d", x: 200, y: 30, width: 260, height: 260, ground: false, enter: "none", objects: [{ id: "sphere", geometry: "sphere", material: "liquidMetal", speed: 0.2 }] },
          { id: "graphic", type: "rect", x: 10, y: 10, width: 80, height: 60, fill: "#00ff00", enter: "none", shadowBlur: 10 },
        ],
      }];
      MotionForgeApp.setProject(p);
      return p;
    });
    const pixel = async (time, x, y) => page.evaluate(async ([time, x, y]) => {
      await MotionForgeApp.renderFrame("composite", time);
      return [...document.querySelector("#stage > canvas").getContext("2d").getImageData(x, y, 1, 1).data];
    }, [time, x, y]);
    assert.ok((await pixel(0.2, 600, 300))[0] > 200);
    assert.ok((await pixel(0.8, 600, 300))[2] > 200);
    assert.ok((await pixel(0.2, 40, 40))[1] > 200);
    assert.ok((await pixel(1.7, 600, 300))[2] > 200);
    assert.ok((await pixel(0.2, 600, 300))[0] > 200);
    pass("custom video decodes/seeks, holds final frame and composites below 2D/3D");
    await page.evaluate(() => {
      const p = MotionForgeApp.getProject();
      p.scenes[0].layers[0].loop = true;
      MotionForgeApp.setProject(p);
    });
    assert.ok((await pixel(1.2, 600, 300))[0] > 200);
    await page.evaluate(() => {
      const p = MotionForgeApp.getProject();
      p.scenes[0].layers[0].trim = 0.6;
      p.scenes[0].layers[0].loop = false;
      MotionForgeApp.setProject(p);
    });
    assert.ok((await pixel(0, 600, 300))[2] > 200);
    pass("source trim and looping use decoded source timestamps");
    await page.evaluate((p) => MotionForgeApp.setProject(p), project);
    await page.evaluate(() => MotionForgeApp.renderFrame("composite", 0.2));
    await page.locator("#stage").screenshot({ path: path.join(out, "video-overlay.png") });
    await page.click("#export-open");
    const downloadReady = page.waitForEvent("download");
    await page.click("#export-png");
    const pngDownload = await downloadReady;
    await pngDownload.saveAs(path.join(out, "composited.png"));
    const png = fs.readFileSync(path.join(out, "composited.png"));
    assert.equal(png.readUInt32BE(16), 640);
    assert.equal(png.readUInt32BE(20), 360);
    assert.equal(pngDownload.suggestedFilename().endsWith(".png"), true);
    await page.click("#export-svg");
    assert.match(await page.locator("#toast").textContent(), /PNG\/video/);
    pass("mixed-scene PNG exports all layers and SVG rejects omitted content");
    await page.locator("#export-dialog .dialog-head button").click();
    const formats = await page.evaluate(() => MotionVideo.supportedFormats());
    if (formats.some((format) => format.value === "mp4")) {
      const mp4 = await page.evaluate(async () => {
        const c = document.createElement("canvas"); c.width = 320; c.height = 180;
        const result = await MotionVideo.record({
          canvas: c, duration: 0.3, fps: 10, format: "mp4",
          paint: async (t) => { const ctx = c.getContext("2d"); ctx.fillStyle = t < 0.1 ? "red" : "blue"; ctx.fillRect(0, 0, 320, 180); },
        });
        return [...new Uint8Array(await result.blob.arrayBuffer())];
      });
      assert.equal(Buffer.from(mp4).subarray(4, 8).toString(), "ftyp");
      fs.writeFileSync(path.join(out, "browser.mp4"), Buffer.from(mp4));
      pass("supported browser MP4 is a genuine encoded MP4 container");
    }
    const resolution = await page.evaluate(async () => {
      const c = document.createElement("canvas"); c.width = 3840; c.height = 2160;
      const p = MotionExamples.project(); p.width = 640; p.height = 360;
      p.scenes = [{ id: "hq", name: "HQ", duration: 1, background: { type: "transparent" }, layers: [
        { id: "three", type: "scene3d", width: 640, height: 360, enter: "none", ground: false, objects: [{ id: "object", geometry: "box" }] },
      ] }];
      let rendered;
      const original = Motion3D.Renderer.prototype.render;
      Motion3D.Renderer.prototype.render = function (...args) { rendered = [args[2], args[3]]; return original.apply(this, args); };
      const compositor = new MotionCompositor.Compositor();
      try {
        await compositor.paint(c, p, "hq", 0.2);
        return { rendered, centreAlpha: c.getContext("2d").getImageData(1920, 1080, 1, 1).data[3] };
      } finally { compositor.dispose(); Motion3D.Renderer.prototype.render = original; }
    });
    assert.deepEqual(resolution.rendered, [3840, 2160]);
    assert.ok(resolution.centreAlpha > 0);
    pass("4K compositing renders WebGL at native 3840x2160, not an upscaled preview");
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    fs.writeFileSync(path.join(out, "fixture.motion.json"), JSON.stringify(project));
    fs.writeFileSync(path.join(out, "report.json"), JSON.stringify({ checks, errors, requests, formats }, null, 2));
    pass("advanced editor has no browser errors or external requests");
    console.log(`Completed ${checks} advanced checks.`);
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exitCode = 1; });
