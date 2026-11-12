"use strict";
const test = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { importFiles, safeName } = require("../scripts/import-local-illustrations.cjs");

test("safeName keeps extensions and strips unsafe characters", () => {
  assert.equal(safeName("C:/x/Café Team & Chart!.SVG"), "Cafe Team - Chart.svg");
  assert.equal(safeName("/x/photo.JPEG"), "photo.jpg");
  assert.equal(safeName("/x/@@@.png"), "illustration.png");
});

test("import copies images into the library, skips duplicates and re-indexes", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "mf-lib-")),
    src = path.join(tmp, "downloads"),
    root = path.join(tmp, "assets");
  fs.mkdirSync(src);
  fs.writeFileSync(path.join(src, "Team Work.svg"), "<svg/>");
  fs.writeFileSync(path.join(src, "chart.png"), "png");
  fs.writeFileSync(path.join(src, "notes.txt"), "ignored");
  try {
    const first = importFiles({ library: "undraw", inputs: [src], root });
    assert.deepEqual(first, { copied: 2, duplicates: 0, renamed: 0, indexed: 2 });
    const index = JSON.parse(fs.readFileSync(path.join(root, "undraw-local", "index.json"), "utf8"));
    assert.deepEqual(index, ["chart.png", "Team Work.svg"]);
    const again = importFiles({ library: "undraw", inputs: [path.join(src, "*.svg")], root, move: true });
    assert.equal(again.duplicates, 1);
    assert.ok(!fs.existsSync(path.join(src, "Team Work.svg")), "--move removes the identical source");
    fs.writeFileSync(path.join(src, "chart.png"), "different");
    assert.equal(importFiles({ library: "undraw", inputs: [path.join(src, "chart.png")], root }).indexed, 3);
    assert.ok(fs.existsSync(path.join(root, "undraw-local", "chart (2).png")));
    assert.throws(() => importFiles({ library: "nope", inputs: [src], root }), /--library/);
  } finally {
    fs.rmSync(tmp, { recursive: true, force: true });
  }
});
