"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  M = require("../src/engine.js"),
  E = require("../src/examples.js");
const p = () => E.project(),
  withLayer = (l) => ({
    ...p(),
    scenes: [
      {
        id: "test",
        name: "Test",
        duration: 10,
        background: { type: "transparent" },
        layers: [l],
      },
    ],
  });
test("all distributed example projects validate and render independently", () => {
  for (const file of fs
    .readdirSync(path.join(__dirname, "../examples"))
    .filter((f) => f.endsWith(".motion.json"))) {
    const q = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../examples", file)),
    );
    assert.deepEqual(M.validate(q), [], file);
    for (const s of q.scenes) {
      if (s.layers.some((layer) => ["scene3d", "video", "effect"].includes(layer.type))) {
        assert.throws(() => M.renderSVG(q, s.id, 2), /PNG\/video/);
        continue;
      }
      for (const t of [0, 0.5, s.duration / 2, s.duration]) {
        const svg = M.renderSVG(q, s.id, t);
        assert.ok(svg.startsWith("<svg"));
        assert.ok(!svg.includes("NaN") && !svg.includes("undefined"));
      }
    }
  }
});
test("seeking is deterministic and has no accumulated state", () => {
  const q = p();
  const first = M.renderSVG(q, "signal", 4.321);
  M.renderSVG(q, "signal", 0.1);
  M.renderSVG(q, "signal", 9.9);
  assert.equal(first, M.renderSVG(q, "signal", 4.321));
  assert.notEqual(first, M.renderSVG(q, "signal", 4.322));
});
test("numeric keyframes interpolate, hold, step and loop predictably", () => {
  const tr = {
    property: "x",
    keyframes: [
      { time: 1, value: 0 },
      { time: 3, value: 100, easing: "linear" },
    ],
  };
  assert.equal(M.trackValue(tr, 0, p().theme), 0);
  assert.equal(M.trackValue(tr, 2, p().theme), 50);
  assert.equal(M.trackValue(tr, 5, p().theme), 100);
  assert.equal(M.trackValue({ ...tr, loop: true }, 4, p().theme), 50);
  assert.equal(
    M.trackValue(
      {
        ...tr,
        keyframes: [tr.keyframes[0], { ...tr.keyframes[1], easing: "step" }],
      },
      2,
      p().theme,
    ),
    0,
  );
});
test("colour tracks resolve palette tokens and interpolate alpha", () => {
  const tr = {
    property: "fill",
    keyframes: [
      { time: 0, value: "#00000000" },
      { time: 2, value: "#ffffff", easing: "linear" },
    ],
  };
  assert.equal(M.trackValue(tr, 1, p().theme), "#80808080");
  assert.equal(
    M.trackValue(
      {
        property: "fill",
        keyframes: [
          { time: 0, value: "$accent" },
          { time: 2, value: "$secondary" },
        ],
      },
      0,
      p().theme,
    ),
    "$accent",
  );
});
test("node connections follow transformed parent groups", () => {
  const q = withLayer({
    id: "g",
    type: "group",
    x: 100,
    y: 50,
    width: 200,
    height: 100,
    scale: 2,
    enter: "none",
  });
  q.scenes[0].layers.push(
    {
      id: "child",
      type: "rect",
      parentId: "g",
      x: 20,
      y: 10,
      width: 40,
      height: 20,
      enter: "none",
    },
    {
      id: "target",
      type: "rect",
      x: 600,
      y: 200,
      width: 100,
      height: 100,
      enter: "none",
    },
    {
      id: "wire",
      type: "line",
      from: "child",
      to: "target",
      fromAnchor: "right",
      toAnchor: "left",
      enter: "none",
    },
  );
  M.assertValid(q);
  assert.match(M.renderSVG(q, "test", 3), /M 120 40 L 600 250/);
});
test("text and labels are escaped instead of treated as markup", () => {
  const q = withLayer({
    id: "title",
    type: "text",
    text: '<script>alert("x")</script> & evidence',
    enter: "none",
  });
  const svg = M.renderSVG(q, "test", 2);
  assert.ok(svg.includes("&lt;script&gt;"));
  assert.ok(!svg.includes("<script>"));
});
test("invalid references, cycles, duplicate IDs and unknown fields are rejected", () => {
  const q = p();
  q.scenes[0].layers[0].onload = "evil()";
  assert.ok(M.validate(q).some((e) => e.includes("unknown field")));
  const r = withLayer({ id: "a", type: "group", parentId: "b" });
  r.scenes[0].layers.push({ id: "b", type: "group", parentId: "a" });
  assert.ok(M.validate(r).some((e) => e.includes("cycle")));
  const z = p();
  z.scenes[0].layers.push({ ...z.scenes[0].layers[0] });
  assert.ok(M.validate(z).some((e) => e.includes("duplicate layer")));
  const v = p();
  v.scenes[0].layers.find((l) => l.type === "line").to = "missing";
  assert.ok(M.validate(v).some((e) => e.includes("reference")));
});
test("external and executable image sources never validate", () => {
  for (const src of [
    "https://example.com/logo.png",
    "file:///private/logo.png",
    "javascript:alert(1)",
    "data:image/svg+xml;base64,PHN2Zz4=",
  ]) {
    const q = p();
    q.assets.a = { name: "Unsafe image", src };
    assert.ok(M.validate(q).length, src);
  }
});
test("unsafe path strings, malformed colours and out-of-order keys are rejected", () => {
  const q = withLayer({
    id: "p",
    type: "path",
    d: 'M 0 0"/><script>alert(1)</script>',
  });
  assert.ok(M.validate(q).length);
  const r = withLayer({
    id: "r",
    type: "rect",
    fill: "url(https://example.com)",
  });
  assert.ok(M.validate(r).length);
  const s = withLayer({
    id: "r",
    type: "rect",
    tracks: [
      {
        property: "x",
        keyframes: [
          { time: 3, value: 2 },
          { time: 1, value: 7 },
        ],
      },
    ],
  });
  assert.ok(M.validate(s).some((e) => e.includes("increase")));
});
test("nested connectors and duplicate property tracks are rejected", () => {
  const q = withLayer({ id: "g", type: "group" });
  q.scenes[0].layers.push({ id: "line", type: "line", parentId: "g" });
  assert.ok(M.validate(q).some((e) => e.includes("root layers")));
  const track = {
    property: "x",
    keyframes: [
      { time: 0, value: 0 },
      { time: 1, value: 10 },
    ],
  };
  const r = withLayer({ id: "r", type: "rect", tracks: [track, track] });
  assert.ok(M.validate(r).some((e) => e.includes("one track per property")));
});
test("entrance, visibility and exit fade produce expected states", () => {
  const s = { duration: 10 },
    l = {
      id: "r",
      type: "rect",
      enter: "rise",
      start: 2,
      end: 8,
      enterDuration: 1,
      exitDuration: 2,
    };
  assert.equal(M.sample(l, 1, s, p().theme).opacity, 0);
  assert.equal(M.sample(l, 3, s, p().theme).y, 0);
  assert.equal(M.sample(l, 7, s, p().theme).opacity, 0.5);
  assert.equal(M.sample(l, 9, s, p().theme).opacity, 0);
});
test("bundled icon paths match the pinned upstream hash manifest", () => {
  const crypto = require("node:crypto"),
    root = path.join(__dirname, "../assets/material-icons"),
    cat = JSON.parse(fs.readFileSync(path.join(root, "catalog.json")));
  assert.equal(cat.icons.length, Object.keys(M.icons).length);
  for (const item of cat.icons) {
    const b = fs.readFileSync(path.join(root, item.file));
    assert.equal(
      crypto.createHash("sha256").update(b).digest("hex"),
      item.sha256,
    );
    assert.ok(!M.icons[item.name].includes("<script"));
  }
});
test("advanced presets validate and explicitly require composited exports", () => {
  const presets = require("../src/presets.js");
  for (const name of presets.names) {
    const q = { ...p(), scenes: [presets.scene(name)] };
    assert.deepEqual(M.validate(q), [], name);
    assert.throws(() => M.renderSVG(q, "advanced", 2), /PNG\/video/);
    assert.match(M.renderSVG(q, "advanced", 2, { hitOnly: true }), /data-layer="stage3d"/);
  }
});
test("Lucide elements render as local vector strokes", () => {
  assert.equal(Object.keys(M.elements).length, 1544);
  const q = withLayer({ id: "symbol", type: "symbol", symbol: "box", enter: "none" });
  assert.deepEqual(M.validate(q), []);
  assert.match(M.renderSVG(q, "test", 0), /stroke-linecap="round"/);
  q.scenes[0].layers[0].symbol = "invented-element";
  assert.ok(M.validate(q).some((error) => error.includes("Lucide")));
});
test("video asset MIME, references, timing and composited grouping are validated", () => {
  const q = withLayer({ id: "clip", type: "video", asset: "clip", trim: 0.5, playbackRate: 1.5 });
  q.assets.clip = { name: "Clip", src: "data:video/webm;base64,GkXfow==" };
  assert.deepEqual(M.validate(q), []);
  q.scenes[0].layers[0].type = "image";
  delete q.scenes[0].layers[0].trim;
  delete q.scenes[0].layers[0].playbackRate;
  assert.ok(M.validate(q).some((error) => error.includes("expected a image asset")));
  q.scenes[0].layers = [
    { id: "g", type: "group" },
    { id: "clip", type: "video", asset: "clip", parentId: "g" },
  ];
  assert.ok(M.validate(q).some((error) => error.includes("root layers")));
});
test("3D tracks enforce object ranges, IDs, key ordering and material names", () => {
  const q = withLayer({ id: "three", type: "scene3d", objects: [{ id: "a", geometry: "sphere", material: "glass",
    tracks: [{ property: "ior", keyframes: [{ time: 0, value: 1.2 }, { time: 2, value: 1.8 }] }],
  }] });
  assert.deepEqual(M.validate(q), []);
  assert.equal(M.sampleObject(q.scenes[0].layers[0].objects[0], 1, q.theme).ior, 1.5);
  assert.equal(M.sampleObject({ material: "glass" }, 0, q.theme).transmission, 0.96);
  q.scenes[0].layers[0].objects[0].tracks[0].keyframes[1].value = 8;
  assert.ok(M.validate(q).some((error) => error.includes("1 to 2.5")));
  q.scenes[0].layers[0].objects[0].material = "invented";
  assert.ok(M.validate(q).some((error) => error.includes("unknown material")));
  q.scenes[0].layers[0].objects.push({ id: "a", geometry: "sphere" });
  assert.ok(M.validate(q).some((error) => error.includes("duplicate object")));
});
test("animated shadows and cameras remain deterministic and bounded", () => {
  const q = withLayer({ id: "card", type: "rect", shadowBlur: 10, shadowColor: "#00000080",
    tracks: [{ property: "shadowX", keyframes: [{ time: 0, value: -10 }, { time: 10, value: 10, easing: "linear" }] }],
  });
  assert.deepEqual(M.validate(q), []);
  assert.match(M.renderSVG(q, "test", 5), /feDropShadow dx="0"/);
  q.scenes[0].layers[0].tracks[0].property = "cameraDistance";
  assert.ok(M.validate(q).some((error) => error.includes("2 to 30")));
  const camera = M.sample({ type: "scene3d" }, 0, { duration: 10 }, q.theme);
  assert.equal(camera.cameraDistance, 6);
  assert.equal(camera.fov, 45);
  assert.equal(M.sample({ type: "effect" }, 0, { duration: 10 }, q.theme).speed, 0.5);
});
