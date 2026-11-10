"use strict";
const assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto"),
  { pathToFileURL } = require("node:url"),
  { chromium } = require("playwright");
const root = path.resolve(__dirname, ".."),
  out = path.join(root, "test-output");
fs.mkdirSync(out, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.BROWSER_PATH
      ? { executablePath: process.env.BROWSER_PATH }
      : {}),
  });
  let checks = 0;
  const ok = (msg) => {
    checks++;
    console.log("PASS", msg);
  };
  try {
    const page = await browser.newPage({
        viewport: { width: 1600, height: 1000 },
      }),
      errors = [],
      requests = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("request", (r) => {
      if (/^https?:/.test(r.url())) requests.push(r.url());
    });
    await page.goto(pathToFileURL(path.join(root, "index.html")).href);
    await page.waitForFunction(() => window.ready);
    assert.equal(
      await page.evaluate(
        () => MotionForge.validate(MotionForgeApp.getProject()).length,
      ),
      0,
    );
    await page.screenshot({
      path: path.join(out, "studio.png"),
      fullPage: true,
    });
    ok("editor starts offline with valid templates");
    await page.click("#tab-scene");
    await page.click('[data-theme="paper"]');
    assert.equal(
      await page.evaluate(() => MotionForgeApp.getProject().theme.background),
      "#f0efe9",
    );
    await page
      .locator('#scene-inspector [data-key="bg-color"]')
      .fill("#123456");
    await page
      .locator('#scene-inspector [data-key="bg-color"]')
      .dispatchEvent("change");
    assert.equal(
      await page.evaluate(
        () => MotionForgeApp.getProject().scenes[0].background.color,
      ),
      "#123456",
    );
    await page.click("#undo");
    assert.equal(
      await page.evaluate(
        () => MotionForgeApp.getProject().scenes[0].background.color,
      ),
      "$background",
    );
    await page.click("#redo");
    assert.equal(
      await page.evaluate(
        () => MotionForgeApp.getProject().scenes[0].background.color,
      ),
      "#123456",
    );
    ok("palette, background and undo/redo work through UI");
    await page.click("#tab-assets");
    await page.fill("#icon-search", "memory");
    assert.equal(await page.locator("#icon-grid button").count(), 1);
    await page.click("#icon-grid button");
    let selected = await page.evaluate(
      () => MotionForgeApp.getProject().scenes[0].layers.at(-1).id,
    );
    assert.equal(
      await page.evaluate(
        () => MotionForgeApp.getProject().scenes[0].layers.at(-1).icon,
      ),
      "memory",
    );
    await page.click("#tab-element");
    await page.locator('#element-inspector [data-key="fill"]').fill("#ff8800");
    await page
      .locator('#element-inspector [data-key="fill"]')
      .dispatchEvent("change");
    assert.equal(
      await page.evaluate(
        () => MotionForgeApp.getProject().scenes[0].layers.at(-1).fill,
      ),
      "#ff8800",
    );
    await page.fill("#kf-time", "2");
    await page.fill("#kf-value", "900");
    await page.click("#key-add");
    assert.equal(
      await page.evaluate(
        () =>
          MotionForgeApp.getProject().scenes[0].layers.at(-1).tracks[0]
            .keyframes.length,
      ),
      2,
    );
    ok("icon search, per-element colour and keyframe editor work");
    await page.setInputFiles(
      "#image-upload",
      path.join(root, "examples/assets/forge-mark.png"),
    );
    await page.waitForFunction(
      () => Object.keys(MotionForgeApp.getProject().assets).length === 1,
    );
    await page
      .locator(".asset-card button")
      .filter({ hasText: /^Add$/ })
      .first()
      .click();
    assert.equal(
      await page.evaluate(
        () => MotionForgeApp.getProject().scenes[0].layers.at(-1).type,
      ),
      "image",
    );
    await page.setInputFiles(
      "#image-upload",
      path.join(root, "examples/assets/forge-mark.svg"),
    );
    await page.waitForFunction(
      () => Object.keys(MotionForgeApp.getProject().assets).length === 2,
    );
    ok("PNG and allowlisted SVG imports create portable raster assets");
    const rejected = await page.evaluate(async () => {
      const cases = [
        '<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"/>',
        '<svg xmlns="http://www.w3.org/2000/svg"><image href="https://example.com/x"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg"><rect style="fill:url(https://example.com)"/></svg>',
      ];
      return Promise.all(
        cases.map(async (s) => {
          try {
            await MotionForgeApp.importImage(
              new File([s], "bad.svg", { type: "image/svg+xml" }),
            );
            return false;
          } catch {
            return true;
          }
        }),
      );
    });
    assert.ok(rejected.every(Boolean));
    ok(
      "scripts, event attributes, remote images and CSS are rejected in SVG imports",
    );
    const prompt = await page.evaluate(() => MotionForgeApp.agentPrompt());
    assert.ok(prompt.includes("KEEP_EXISTING_EMBEDDED_ASSET"));
    assert.ok(!prompt.includes("data:image/png;base64,"));
    const marked = await page.evaluate(() => {
      const p = MotionForgeApp.getProject();
      for (const a of Object.values(p.assets))
        a.src = "KEEP_EXISTING_EMBEDDED_ASSET";
      p.name = "AI round-trip";
      return p;
    });
    await page.click("#ai-open");
    await page.fill("#json-editor", JSON.stringify(marked));
    await page.click("#json-apply");
    assert.equal(
      await page.evaluate(() => MotionForgeApp.getProject().name),
      "AI round-trip",
    );
    assert.ok(
      await page.evaluate(() =>
        Object.values(MotionForgeApp.getProject().assets).every((a) =>
          a.src.startsWith("data:image/png;base64,"),
        ),
      ),
    );
    ok("LLM prompt omits image bytes and JSON import restores them");
    await page.click("#tab-layers");
    await page.evaluate(() => MotionForgeApp.select("input"));
    await page.click("#layer-remove");
    assert.equal(
      await page.evaluate(
        () => MotionForge.validate(MotionForgeApp.getProject()).length,
      ),
      0,
    );
    assert.ok(
      await page.evaluate(
        () =>
          !MotionForgeApp.getProject().scenes[0].layers.some(
            (l) => l.id === "input-panel" || l.from === "input",
          ),
      ),
    );
    ok("deleting a group cleans descendants and dependent connectors");
    await page.click("#tab-scene");
    await page.locator('#scene-inspector [data-key="duration"]').fill("1");
    await page
      .locator('#scene-inspector [data-key="duration"]')
      .dispatchEvent("change");
    assert.equal(
      await page.evaluate(
        () => MotionForge.validate(MotionForgeApp.getProject()).length,
      ),
      0,
    );
    ok("shorter scene duration keeps timings and tracks valid");
    // Render a small image scene, then inspect actual downloaded formats.
    await page.evaluate(() => {
      const p = MotionExamples.project(),
        assets = MotionForgeApp.getProject().assets,
        id = Object.keys(assets)[0];
      p.name = "Export fixture";
      p.width = 400;
      p.height = 300;
      p.fps = 10;
      p.assets = assets;
      p.scenes = [
        {
          id: "image",
          name: "Image fixture",
          duration: 0.6,
          background: { type: "transparent" },
          layers: [
            {
              id: "image",
              type: "image",
              asset: id,
              x: 70,
              y: 20,
              width: 260,
              height: 260,
              radius: 0,
              fit: "contain",
              enter: "none",
            },
          ],
        },
      ];
      MotionForgeApp.setProject(p);
      MotionForgeApp.renderFrame("image", 0.3);
    });
    await page.click("#export-open");
    async function getDownload(selector, name) {
      const promise = page.waitForEvent("download", { timeout: 30000 });
      await page.click(selector);
      const d = await promise;
      const f = path.join(out, name);
      await d.saveAs(f);
      return f;
    }
    const jsonFile = await getDownload(
      "#save-project",
      "round-trip.motion.json",
    );
    assert.equal(
      JSON.parse(fs.readFileSync(jsonFile)).scenes[0].layers[0].type,
      "image",
    );
    const svgFile = await getDownload("#export-svg", "frame.svg");
    assert.ok(
      fs.readFileSync(svgFile, "utf8").includes("data:image/png;base64,"),
    );
    const pngFile = await getDownload("#export-png", "frame.png");
    const png = fs.readFileSync(pngFile);
    assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
    assert.equal(png.readUInt32BE(16), 400);
    assert.equal(png.readUInt32BE(20), 300);
    const pixels = await page.evaluate(async (b64) => {
      const i = new Image();
      i.src = "data:image/png;base64," + b64;
      await i.decode();
      const c = document.createElement("canvas");
      c.width = 400;
      c.height = 300;
      const x = c.getContext("2d");
      x.drawImage(i, 0, 0);
      return {
        corner: [...x.getImageData(0, 0, 1, 1).data],
        centre: [...x.getImageData(200, 150, 1, 1).data],
      };
    }, png.toString("base64"));
    assert.equal(pixels.corner[3], 0);
    assert.equal(pixels.centre[3], 255);
    ok("project, SVG and PNG exports preserve images and transparent pixels");
    const videoFile = await getDownload("#export-video", "preview.webm"),
      video = fs.readFileSync(videoFile);
    assert.equal(video.subarray(0, 4).toString("hex"), "1a45dfa3");
    assert.ok(video.length > 1000);
    ok("real browser WebM recording produces an encoded file");
    await page.locator("#export-dialog .dialog-head button").click();
    // Isolate rendered frames from editor scroll/focus, resizing and notifications.
    const renderPage = await browser.newPage({
      viewport: { width: 1600, height: 900 },
    });
    renderPage.on("pageerror", (e) => errors.push(e.message));
    renderPage.on("request", (r) => {
      if (/^https?:/.test(r.url())) requests.push(r.url());
    });
    await renderPage.goto(
      pathToFileURL(path.join(root, "index.html")).href + "?export=1",
    );
    await renderPage.waitForFunction(() => window.ready);
    await renderPage.evaluate(() => document.fonts.ready);
    await renderPage.evaluate(() => {
      MotionForgeApp.setProject(MotionExamples.project());
    });
    const scenes = await renderPage.evaluate(() =>
      MotionForgeApp.getProject().scenes.map((s) => s.id),
    );
    const clipping = [];
    for (const id of scenes) {
      await renderPage.evaluate((id) => MotionForgeApp.renderFrame(id, 4), id);
      const first = await renderPage.locator("#stage").screenshot({
        path: path.join(out, id + "-first.png"),
      });
      await renderPage.evaluate((id) => MotionForgeApp.renderFrame(id, 0.2), id);
      await renderPage.evaluate((id) => MotionForgeApp.renderFrame(id, 4), id);
      const second = await renderPage
        .locator("#stage")
        .screenshot({ path: path.join(out, id + ".png") });
      assert.equal(
        crypto.createHash("sha256").update(first).digest("hex"),
        crypto.createHash("sha256").update(second).digest("hex"),
        id,
      );
      const bad = await renderPage.evaluate(() => {
        const stage = document
          .querySelector("#stage svg")
          .getBoundingClientRect();
        return [...document.querySelectorAll("#stage text")]
          .filter((el) => {
            const r = el.getBoundingClientRect();
            return (
              r.left < stage.left - 2 ||
              r.right > stage.right + 2 ||
              r.top < stage.top - 2 ||
              r.bottom > stage.bottom + 2
            );
          })
          .map((el) => el.textContent);
      });
      clipping.push(...bad.map((x) => id + ": " + x));
    }
    assert.deepEqual(clipping, []);
    ok("six templates have stable revisit frames and no off-stage text");
    const mobile = await browser.newPage({viewport:{width:390,height:844}});
    mobile.on('pageerror',e=>errors.push(e.message));
    mobile.on('request',r=>{if(/^https?:/.test(r.url()))requests.push(r.url());});
    await mobile.goto(pathToFileURL(path.join(root,'index.html')).href);
    await mobile.waitForFunction(()=>window.ready);
    await mobile.screenshot({
      path: path.join(out, "mobile.png"),
    });
    assert.equal(await mobile.locator('.topbar').count(),1);
    assert.ok(
      await mobile.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    );
    await mobile.locator('.library').scrollIntoViewIfNeeded();
    await mobile.screenshot({path:path.join(out,'mobile-library.png')});
    ok("mobile layout does not overflow horizontally");
    assert.deepEqual(errors, []);
    assert.deepEqual(requests, []);
    ok("no browser exceptions or external network requests");
    fs.writeFileSync(
      path.join(out, "browser-report.json"),
      JSON.stringify(
        {
          checks,
          errors,
          externalRequests: requests,
          browser: await browser.version(),
        },
        null,
        2,
      ),
    );
    console.log(`Completed ${checks} browser checks.`);
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
