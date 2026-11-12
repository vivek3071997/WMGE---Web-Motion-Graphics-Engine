"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const Motion3D = require("../src/three-renderer.js");

test("exports supported scene3d geometry and material types", () => {
  assert.deepEqual(Motion3D.GEOMETRIES, [
    "box",
    "sphere",
    "torus",
    "knot",
    "cone",
    "cylinder",
    "plane",
  ]);
  assert.deepEqual(Motion3D.MATERIALS, [
    "standard",
    "glass",
    "water",
    "liquidMetal",
    "gas",
  ]);
  assert.equal(globalThis.Motion3D.Renderer, Motion3D.Renderer);
});

test("resolves theme tokens and short or alpha hex colours", () => {
  const theme = { accent: "#123456" };
  assert.deepEqual(Motion3D.resolveColor("$accent", theme), {
    color: "#123456",
    alpha: 1,
  });
  assert.deepEqual(Motion3D.resolveColor("#abc", theme), {
    color: "#aabbcc",
    alpha: 1,
  });
  assert.deepEqual(Motion3D.resolveColor("#12345680", theme), {
    color: "#123456",
    alpha: 128 / 255,
  });
});

test("reports the missing local Three.js bundle explicitly", () => {
  const renderer = new Motion3D.Renderer();
  assert.throws(
    () => renderer.render({}, 0, 320, 180, {}),
    /requires the locally bundled window\.THREE library/,
  );
  renderer.dispose();
});

test(
  "software WebGL supports all materials and deterministic reflected scrubbing",
  { skip: !process.env.BROWSER_PATH },
  async () => {
    const path = require("node:path");
    const { chromium } = require("playwright");
    const browser = await chromium.launch({
      executablePath: process.env.BROWSER_PATH,
      headless: true,
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"],
    });
    try {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.goto("about:blank");
      for (const file of [
        "assets/vendor/three.min.js",
        "src/engine.js",
        "src/three-renderer.js",
      ]) {
        await page.addScriptTag({ path: path.resolve(__dirname, "..", file) });
      }
      const results = await page.evaluate(() => {
        const renderer = new Motion3D.Renderer();
        const layer = {
          mirror: true,
          objects: Motion3D.MATERIALS.map((material, index) => ({
            id: `object${index}`,
            material,
            geometry: "sphere",
            x: (index - 2) * 1.1,
            speed: 0.6,
            seed: index + 1,
          })),
        };
        const canvas = renderer.render(layer, 1, 320, 180, {});
        const first = canvas.toDataURL();
        renderer.render(layer, 3, 320, 180, {});
        const moving = canvas.toDataURL();
        renderer.render(layer, 1, 320, 180, {});
        const sought = canvas.toDataURL();
        renderer.render({ ...layer, mirror: false }, 1, 320, 180, {});
        const noMirror = canvas.toDataURL();
        for (const geometry of Motion3D.GEOMETRIES) {
          renderer.render(
            { objects: [{ id: "shape", geometry, material: "glass" }] },
            1,
            320,
            180,
            {},
          );
        }
        renderer.dispose();
        renderer.dispose();
        return {
          deterministic: first === sought,
          animated: first !== moving,
          mirror: first !== noMirror,
          width: canvas.width,
          height: canvas.height,
        };
      });
      assert.deepEqual(errors, []);
      assert.deepEqual(results, {
        deterministic: true,
        animated: true,
        mirror: true,
        width: 320,
        height: 180,
      });
    } finally {
      await browser.close();
    }
  },
);
