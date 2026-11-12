#!/usr/bin/env node
"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  M = require("../src/engine.js");
const n = (minimum, maximum) => ({ type: "number", minimum, maximum }),
  str = (maxLength) => ({ type: "string", maxLength }),
  en = (...v) => ({ enum: v }),
  bool = { type: "boolean" },
  ref = (name) => ({ $ref: "#/$defs/" + name }),
  obj = (properties, required = []) => ({
    type: "object",
    additionalProperties: false,
    properties,
    required,
  });
const id = { type: "string", pattern: "^[a-zA-Z][a-zA-Z0-9_-]{0,63}$" },
  colour = {
    type: "string",
    pattern:
      "^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}|\\$(background|surface|accent|secondary|text|muted|line)|none)$",
  };
const common = {
  id: ref("id"),
  name: str(160),
  x: n(-20000, 20000),
  y: n(-20000, 20000),
  width: n(0, 20000),
  height: n(0, 20000),
  rotation: n(-36000, 36000),
  scale: n(0, 100),
  opacity: n(0, 1),
  fill: ref("colour"),
  stroke: ref("colour"),
  strokeWidth: n(0, 100),
  radius: n(0, 20000),
  start: n(0, 600),
  end: n(0, 600),
  enter: en("none", "fade", "rise", "slide", "scale", "draw"),
  enterDuration: n(0, 60),
  exitDuration: n(0, 60),
  parentId: ref("id"),
  hidden: bool,
  shadowBlur: n(0, 100),
  shadowX: n(-500, 500),
  shadowY: n(-500, 500),
  shadowColor: ref("colour"),
  tracks: { type: "array", maxItems: 20, items: ref("track") },
};
const font = {
  fontSize: n(1, 500),
  fontWeight: n(100, 900),
  align: en("left", "center", "right"),
};
const specifics = {
  text: {
    ...font,
    text: str(5000),
    lineHeight: n(0.5, 3),
    fontFamily: en("sans", "mono", "serif"),
  },
  rect: {},
  circle: {},
  icon: { icon: en(...Object.keys(M.icons)) },
  image: { asset: ref("id"), fit: en("contain", "cover", "stretch") },
  line: {
    from: ref("id"),
    to: ref("id"),
    fromAnchor: en("left", "right", "top", "bottom", "center"),
    toAnchor: en("left", "right", "top", "bottom", "center"),
    x2: n(-20000, 20000),
    y2: n(-20000, 20000),
    curve: en("straight", "bezier", "step"),
    arrow: bool,
    particles: n(0, 20),
    dash: { type: "string", maxLength: 80, pattern: "^[0-9.,\\s]+$" },
    progress: n(0, 1),
  },
  path: {
    d: {
      type: "string",
      maxLength: 30000,
      pattern: "^[MmZzLlHhVvCcSsQqTtAaEe0-9.,+\\s-]+$",
    },
    progress: n(0, 1),
  },
  counter: {
    ...font,
    valueFrom: n(-1e12, 1e12),
    valueTo: n(-1e12, 1e12),
    decimals: n(0, 6),
    prefix: str(80),
    suffix: str(80),
  },
  chart: {
    values: { type: "array", minItems: 1, maxItems: 50, items: n(0, 1e12) },
    labels: { type: "array", maxItems: 50, items: str(80) },
    colors: { type: "array", maxItems: 50, items: ref("colour") },
    maxValue: n(0.001, 1e12),
    barGap: n(0, 0.9),
    fontSize: n(1, 500),
    progress: n(0, 1),
  },
  group: {},
  symbol: { symbol: en(...Object.keys(M.elements)) },
  video: {
    asset: ref("id"), fit: en("contain", "cover", "stretch"),
    trim: n(0, 36000), playbackRate: n(0.1, 8), loop: bool,
  },
  effect: { effect: en(...M.EFFECTS), intensity: n(0, 1), speed: n(-10, 10), seed: { type: "integer", minimum: 0, maximum: 65535 } },
  scene3d: {
    cameraDistance: n(2, 30), cameraAzimuth: n(-36000, 36000), cameraElevation: n(-85, 85),
    fov: n(15, 100), lightIntensity: n(0, 20), lightColor: ref("colour"), mirror: bool, ground: bool,
    objects: { type: "array", minItems: 1, maxItems: 40, items: ref("object3d") },
  },
};
const defs = {
  id,
  colour,
  theme: obj(
    Object.fromEntries(
      Object.keys(M.THEMES.midnight).map((k) => [
        k,
        { type: "string", pattern: "^#[0-9a-fA-F]{6}$" },
      ]),
    ),
    Object.keys(M.THEMES.midnight),
  ),
  asset: obj(
    {
      name: str(200),
      src: {
        type: "string",
        maxLength: 140000000,
        pattern: "^data:(image/(png|jpeg|webp)|video/(mp4|webm));base64,[A-Za-z0-9+/]+={0,2}$",
      },
      credit: str(1000),
      source: str(2048),
    },
    ["name", "src"],
  ),
  background: obj(
    {
      type: en("solid", "linear", "radial", "transparent"),
      color: ref("colour"),
      color2: ref("colour"),
      angle: n(-360, 360),
      grid: bool,
      gridSize: n(10, 400),
      gridOpacity: n(0, 1),
    },
    ["type"],
  ),
  track: obj(
    {
      property: en(...M.NUM_PROPS, "fill", "stroke"),
      loop: bool,
      keyframes: {
        type: "array",
        minItems: 2,
        maxItems: 100,
        items: obj(
          {
            time: n(0, 600),
            value: { oneOf: [n(-1e6, 1e6), ref("colour")] },
            easing: en(...Object.keys(M.EASINGS)),
          },
          ["time", "value"],
        ),
      },
    },
    ["property", "keyframes"],
  ),
};
defs.object3d = obj({
  id: ref("id"), geometry: en(...M.GEOMETRIES), material: en(...M.MATERIALS),
  color: ref("colour"), speed: n(-10, 10), seed: { type: "integer", minimum: 0, maximum: 65535 },
  ...Object.fromEntries(Object.entries(M.OBJECT_RANGES).map(([key, range]) => [key, n(...range)])),
  tracks: {
    type: "array", maxItems: 18,
    items: obj({
      property: en(...Object.keys(M.OBJECT_RANGES)), loop: bool,
      keyframes: {
        type: "array", minItems: 2, maxItems: 100,
        items: obj({ time: n(0, 600), value: n(-36000, 36000), easing: en(...Object.keys(M.EASINGS)) }, ["time", "value"]),
      },
    }, ["property", "keyframes"]),
  },
}, ["id", "geometry"]);
for (const [type, props] of Object.entries(specifics)) {
  const c = { ...common };
  if (["line", "video", "scene3d", "effect"].includes(type)) delete c.parentId;
  defs[type] = obj({ ...c, type: { const: type }, ...props }, [
    "id",
    "type",
    ...({
      text: ["text"],
      icon: ["icon"],
      image: ["asset"],
      video: ["asset"],
      symbol: ["symbol"],
      effect: ["effect"],
      scene3d: ["objects"],
      path: ["d"],
      chart: ["values"],
    }[type] || []),
  ]);
}
defs.layer = { oneOf: M.TYPES.map(ref) };
defs.scene = obj(
  {
    id: ref("id"),
    name: str(160),
    duration: n(0.1, 600),
    background: ref("background"),
    layers: { type: "array", maxItems: 400, items: ref("layer") },
  },
  ["id", "name", "duration", "background", "layers"],
);
const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "urn:motion-forge:project:v1",
  title: "Motion Forge project v1",
  description:
    "Run scripts/validate.cjs as well: references, cycles, unique IDs, time order, colour track types and combined asset limits require semantic checks.",
  ...obj(
    {
      version: { const: 1 },
      name: str(160),
      width: n(256, 4096),
      height: n(256, 4096),
      fps: n(1, 60),
      theme: ref("theme"),
      assets: {
        type: "object",
        maxProperties: 100,
        propertyNames: ref("id"),
        additionalProperties: ref("asset"),
      },
      scenes: { type: "array", minItems: 1, maxItems: 60, items: ref("scene") },
    },
    ["version", "name", "width", "height", "fps", "theme", "assets", "scenes"],
  ),
  $defs: defs,
};
fs.writeFileSync(
  path.resolve(__dirname, "../references/project.schema.json"),
  JSON.stringify(schema, null, 2) + "\n",
);
console.log("Updated references/project.schema.json");
