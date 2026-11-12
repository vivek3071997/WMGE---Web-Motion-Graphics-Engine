"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  M = require("../src/engine.js");

const root = path.join(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "examples/demos/manifest.json"), "utf8"));
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const app = fs.readFileSync(path.join(root, "src/app.js"), "utf8");

test("demos manifest lists unique, complete entries", () => {
  assert.ok(Array.isArray(manifest) && manifest.length >= 10);
  const keys = manifest.map((d) => d.key);
  assert.equal(new Set(keys).size, keys.length);
  for (const d of manifest) {
    assert.match(d.key, /^[a-z0-9-]+$/);
    for (const field of ["category", "title", "summary", "project", "poster"]) assert.ok(d[field], `${d.key}.${field}`);
    assert.ok(Array.isArray(d.tags), `${d.key}.tags`);
    for (const rel of [d.project, d.poster, d.prompt].filter(Boolean))
      assert.ok(fs.existsSync(path.join(root, rel)), `${d.key}: missing ${rel}`);
  }
});

test("every demo project validates and matches its manifest summary", () => {
  for (const d of manifest) {
    const p = JSON.parse(fs.readFileSync(path.join(root, d.project), "utf8"));
    assert.doesNotThrow(() => M.assertValid(p), d.key);
    assert.equal(p.scenes.length, d.scenes, `${d.key} scene count`);
  }
});

test("generated director demos carry no third-party images", () => {
  for (const d of manifest.filter((x) => x.brief)) {
    const p = JSON.parse(fs.readFileSync(path.join(root, d.project), "utf8"));
    assert.ok(!p.scenes.some((s) => s.layers.some((l) => l.type === "image")), d.key);
  }
});

test("studio exposes the demos button and starts playback at zero", () => {
  assert.match(html, /id="demos-open"[^>]*href="examples\/demos\/"/);
  assert.match(app, /time\s*=\s*0/);
  assert.doesNotMatch(app, /\btime\s*=\s*(?:2|2\.5|3)\s*[,;]/);
});
