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
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9"><style>@import url(https://example.com/x.css);</style><rect width="9" height="9"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9"><style>rect{fill:red}</style><rect width="9" height="9"/></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 9"><style>.a{background:url(https://example.com/x.png)}</style><rect class="a" width="9" height="9"/></svg>',
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
    // Synthetic fixture shaped like an unDraw export (metadata attributes, inline style, #6C63FF accent).
    const undrawStyle =
      '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-name="Layer 1" width="100" height="50" viewBox="0 0 100 50"><title>fixture</title>' +
      '<rect data-name="Path 1" width="100" height="50" fill="#6C63FF"/><circle cx="80" cy="25" r="10" style="fill:#ffffff;isolation:isolate"/></svg>';
    const recoloured = await page.evaluate(async (svg) => {
      const asset = await MotionForgeApp.importImage(
        new File([svg], "fixture.svg", { type: "image/svg+xml" }),
        { recolor: { from: "#6c63ff", to: "#ff8800" } },
      );
      const img = new Image();
      img.src = asset.src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      return { w: c.width, h: c.height, px: [...g.getImageData(40, 40, 1, 1).data] };
    }, undrawStyle);
    assert.deepEqual([recoloured.w, recoloured.h], [2048, 1024]);
    assert.ok(
      Math.abs(recoloured.px[0] - 255) < 3 &&
        Math.abs(recoloured.px[1] - 136) < 3 &&
        recoloured.px[2] < 3,
      `accent recoloured: ${recoloured.px}`,
    );
    await page.click("#tab-assets");
    await page.selectOption("#image-source", "undraw");
    assert.ok(await page.isVisible("#undraw-options"));
    await page.setInputFiles("#image-upload", {
      name: "illustration.svg",
      mimeType: "image/svg+xml",
      buffer: Buffer.from(undrawStyle),
    });
    await page.waitForFunction(
      () => Object.keys(MotionForgeApp.getProject().assets).length === 3,
    );
    const undrawId = await page.evaluate(() => {
      const [id, a] = Object.entries(MotionForgeApp.getProject().assets).at(-1);
      return a.credit.includes("unDraw") && a.source.includes("undraw.co") ? id : null;
    });
    assert.ok(undrawId, "unDraw import records credit and source");
    const before = await page.evaluate(
      () => MotionForgeApp.getProject().scenes[0].layers.length,
    );
    await page
      .locator(".asset-card")
      .last()
      .locator("button", { hasText: /^Depth$/ })
      .click();
    await page.waitForFunction(
      (n) => MotionForgeApp.getProject().scenes[0].layers.length === n + 2,
      before,
    );
    const depth = await page.evaluate(
      (n) => MotionForgeApp.getProject().scenes[0].layers.slice(n),
      before,
    );
    assert.deepEqual(depth.map((l) => l.type), ["circle", "image"]);
    assert.equal(depth[1].asset, undrawId);
    assert.ok(depth[1].shadowBlur > 0 && depth[1].tracks[0].property === "y");
    await page.selectOption("#image-source", "own");
    ok("unDraw-style SVGs import with accent recolour, credit and one-click depth");
    const served = await browser.newPage({ viewport: { width: 1400, height: 900 } });
    served.on("pageerror", (e) => errors.push(e.message));
    // Synthetic fixtures shaped like illustration-tool exports (class-based <style>, PNG), not third-party art.
    const classSvg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 50"><defs><style>/* tool export */.cls-1{fill:#12ab34;}.cls-2,.cls-3{fill:#ffffff}</style></defs>' +
      '<rect class="cls-1" width="100" height="50"/><circle class="cls-2" cx="80" cy="25" r="10"/></svg>';
    const dotPng = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    await served.route("http://mf.test/**", (r) => {
      const rel = decodeURIComponent(new URL(r.request().url()).pathname);
      if (rel === "/assets/undraw-local/index.json")
        return r.fulfill({
          contentType: "application/json",
          body: '["undraw_fixture-scene_ab12.svg","Team Chart.svg","dot.png","../escape.svg"]',
        });
      if (rel === "/assets/undraw-local/undraw_fixture-scene_ab12.svg")
        return r.fulfill({
          contentType: "image/svg+xml",
          body: undrawStyle.replace('data-name="Layer 1"', 'role="img" artist="Fixture" source="https://example.invalid/"'),
        });
      if (rel === "/assets/undraw-local/Team Chart.svg")
        return r.fulfill({ contentType: "image/svg+xml", body: classSvg });
      if (rel === "/assets/undraw-local/dot.png")
        return r.fulfill({ contentType: "image/png", body: dotPng });
      let file = path.join(root, rel === "/" ? "index.html" : rel);
      if (file.startsWith(root) && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory())
        return r.fulfill({ status: 404, body: "Not found" });
      return r.fulfill({ path: file });
    });
    await served.goto("http://mf.test/");
    await served.waitForFunction(() => window.ready);
    await served.waitForSelector("#local-illustration-grid button", { state: "attached" });
    await served.click("#tab-assets");
    const localBefore = await served.evaluate(() => MotionForgeApp.getProject().scenes[0].layers.length);
    await served.click('#local-illustration-grid button[data-file="undraw_fixture-scene_ab12.svg"]');
    await served.waitForFunction(
      (n) => MotionForgeApp.getProject().scenes[0].layers.length === n + 2,
      localBefore,
    );
    assert.equal(
      await served.evaluate(() => MotionForgeApp.getProject().scenes[0].layers.at(-1).name),
      "fixture scene",
    );
    const planned = await served.evaluate(async () => {
      const s = MotionForgeApp.getProject().scenes[0];
      const before = s.layers.length;
      const added = await MotionForgeApp.applyIllustrationPlan([
        { scene: s.id, file: "undraw_fixture-scene_ab12.svg", x: 100, y: 100, width: 200, height: 150, index: 0, layer: "back", distant: true, start: 0.5, end: 2 },
        { scene: s.id, file: "undraw_fixture-scene_ab12.svg", x: 400, y: 100, width: 200, height: 150, motion: "sway" },
      ]);
      const layers = MotionForgeApp.getProject().scenes[0].layers;
      return {
        added,
        grew: layers.length - before,
        back: layers[0],
        sway: layers.slice(before + 1).find((l) => l.type === "image"),
      };
    });
    assert.equal(planned.added, 2);
    assert.equal(planned.grew, 3, "distant placement has no ground shadow; front placement has one");
    assert.ok(!(planned.back.shadowBlur > 0) && planned.back.end === 2 && planned.back.tracks.some((k) => k.property === "x"));
    assert.ok(planned.sway.tracks.some((k) => k.property === "rotation"));
    assert.equal(planned.sway.asset, planned.back.asset, "one file is imported once per plan");
    const local = await served.evaluate(async () => {
      const all = [...document.querySelectorAll("#local-illustration-grid button")].map((b) => b.dataset.file);
      document.querySelector('#local-illustration-grid button[data-file="Team Chart.svg"]').click();
      await new Promise((r) => {
        const t = setInterval(() => {
          if (Object.values(MotionForgeApp.getProject().assets).some((a) => a.name === "Team Chart")) {
            clearInterval(t);
            r();
          }
        }, 50);
      });
      const asset = Object.values(MotionForgeApp.getProject().assets).find((a) => a.name === "Team Chart");
      const img = new Image();
      img.src = asset.src;
      await img.decode();
      const c = document.createElement("canvas");
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      const px = (x, y) => [...g.getImageData(Math.round(x * c.width), Math.round(y * c.height), 1, 1).data.slice(0, 3)];
      const s = MotionForgeApp.getProject().scenes[0];
      const added = await MotionForgeApp.applyIllustrationPlan([
        { scene: s.id, file: "dot.png", x: 10, y: 10, width: 80, height: 80 },
      ]);
      return { all, bg: px(0.1, 0.5), dot: px(0.8, 0.5), added };
    });
    assert.deepEqual(local.all, ["undraw_fixture-scene_ab12.svg", "Team Chart.svg", "dot.png"], "unsafe index entries are dropped");
    assert.deepEqual(local.bg, [0x12, 0xab, 0x34], "class-based <style> fills are applied");
    assert.deepEqual(local.dot, [0xff, 0xff, 0xff], "grouped class selectors are applied");
    assert.equal(local.added, 1, "plans can place PNG files from the local library");
    const directed = await served.evaluate(async () => {
      const r = await MotionForgeApp.direct("Team meeting to review the quarterly chart: wins, roadmap, hiring");
      const p = MotionForgeApp.getProject();
      return { genre: r.analysis.genre, scenes: p.scenes.length, placed: r.placed, images: p.scenes.flatMap((s) => s.layers).filter((l) => l.type === "image").length };
    });
    assert.equal(directed.genre, "meeting");
    assert.ok(directed.scenes >= 3 && directed.placed >= 1 && directed.images === directed.placed, JSON.stringify(directed));
    await served.click("#ai-open");
    await served.fill("#ai-brief", "Recipe for pancakes");
    await served.waitForFunction(() => /Food \/ recipe/.test(document.getElementById("director-readout").textContent));
    const smart = await served.evaluate(() => MotionForgeApp.agentPrompt());
    for (const part of ["DIRECTOR'S EXPANDED BRIEF", "ILLUSTRATION DEPTH", "DIRECTOR DRAFT PROJECT", "QUALITY CHECKLIST"])
      assert.ok(smart.includes(part), `smart prompt has ${part}`);
    const wrapped = await served.evaluate(() => {
      const p = MotionForgeApp.getProject();
      p.name = "Wrapped plan";
      return JSON.stringify({ project: p, illustrations: [{ scene: p.scenes[0].id, file: "dot.png", x: 40, y: 40, width: 90, height: 90, index: 0, layer: "back", distant: true }] });
    });
    const imagesBefore = await served.evaluate(() => MotionForgeApp.getProject().scenes[0].layers.filter((l) => l.type === "image").length);
    await served.fill("#json-editor", wrapped);
    await served.click("#json-apply");
    await served.waitForFunction(
      (n) => MotionForgeApp.getProject().name === "Wrapped plan" && MotionForgeApp.getProject().scenes[0].layers.filter((l) => l.type === "image").length === n + 1,
      imagesBefore,
    );
    await served.evaluate(() => MotionForgeApp.setProject(MotionExamples.project()));
    await served.click("#tab-assets");
    await served.click("#auto-depth");
    await served.waitForFunction(() => /Added \d+ matched illustration/.test(document.getElementById("toast").textContent));
    assert.ok(await served.evaluate(() => MotionForgeApp.getProject().scenes.some((s) => s.layers.some((l) => l.type === "image"))));
    ok("smart director builds illustrated projects, writes smart prompts and auto-adds depth");
    assert.equal(await served.getAttribute("#demos-open", "href"), "examples/demos/");
    await served.goto("http://mf.test/examples/demos/");
    await served.waitForFunction(() => window.demosReady);
    const demoCount = JSON.parse(fs.readFileSync(path.join(root, "examples/demos/manifest.json"), "utf8")).length;
    assert.equal(await served.locator(".card").count(), demoCount);
    await served.goto("http://mf.test/?demo=systems-in-motion&play=1&export=1&illustrations=0");
    await served.waitForFunction(() => window.ready);
    const start = await served.evaluate(() => ({ t: MotionForgeApp.getTime(), scene: document.querySelector(".scene.active")?.textContent || "" }));
    assert.ok(start.t >= 0 && start.t < 1.5, `demo should start at 0, got ${start.t}`);
    assert.match(start.scene, /01/);
    ok("demos gallery lists every demo and ?demo=&play=1 starts at 0:00 on scene 1");
    await served.close();
    ok("local illustration folder lists, searches and adds SVG/PNG files with depth");
    const videoFallback = await page.evaluate(async () => {
      const p = structuredClone(MotionForgeApp.getProject());
      p.assets.badvideo = { name: "bad", src: "data:video/webm;base64,AAAA" };
      p.scenes[0].layers.push({ id: "badv", type: "video", name: "bad", asset: "badvideo", x: 0, y: 0, width: 200, height: 120, start: 0 });
      const c = document.createElement("canvas");
      c.width = p.width;
      c.height = p.height;
      const skipped = [];
      const preview = new MotionCompositor.Compositor({ skipFailedVideo: true, onVideoSkipped: (l) => skipped.push(l.id) });
      await preview.paint(c, p, p.scenes[0].id, 0.5);
      preview.dispose();
      const strict = new MotionCompositor.Compositor();
      const rejected = await strict.paint(c, p, p.scenes[0].id, 0.5).then(() => false, () => true);
      strict.dispose();
      return { skipped, rejected };
    });
    assert.deepEqual(videoFallback.skipped, ["badv"]);
    assert.ok(videoFallback.rejected, "export compositor stays strict about undecodable video");
    ok("preview skips undecodable video while export stays strict");
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
