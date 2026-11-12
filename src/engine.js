/* Motion Forge — MIT. Pure, deterministic SVG renderer; no DOM or network required. */
(function (root, factory) {
  const api = factory(
    typeof module === "object" && module.exports
      ? require("./icons.js")
      : root.MotionIcons,
    typeof module === "object" && module.exports
      ? require("./elements.js")
      : root.MotionElements,
  );
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MotionForge = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (icons, elements) {
  "use strict";
  const VERSION = "1.1.0";
  const GEOMETRIES = ["box", "sphere", "torus", "knot", "cone", "cylinder", "plane"];
  const MATERIALS = ["standard", "glass", "water", "liquidMetal", "gas"];
  const EFFECTS = ["gas", "water", "liquidMetal", "glass"];
  const MATERIAL_DEFAULTS = {
    standard: { color: "#8d9bff", roughness: 0.55, metalness: 0.05, transmission: 0, ior: 1.5 },
    glass: { color: "#d8e6ff", roughness: 0.04, metalness: 0, transmission: 0.96, ior: 1.5 },
    water: { color: "#79d9ff", roughness: 0.08, metalness: 0.12, transmission: 0.82, ior: 1.33 },
    liquidMetal: { color: "#c5d0df", roughness: 0.16, metalness: 0.92, transmission: 0, ior: 1.5 },
    gas: { color: "#9da8ff", roughness: 0.48, metalness: 0, transmission: 0, ior: 1.2 },
  };
  const OBJECT_RANGES = {
    x: [-50, 50], y: [-50, 50], z: [-50, 50],
    rotationX: [-36000, 36000], rotationY: [-36000, 36000], rotationZ: [-36000, 36000],
    scaleX: [0.01, 50], scaleY: [0.01, 50], scaleZ: [0.01, 50],
    roughness: [0, 1], metalness: [0, 1], transmission: [0, 1],
    ior: [1, 2.5], amplitude: [0, 1], frequency: [0.1, 20], opacity: [0, 1],
  };
  const TYPES = [
    "text",
    "rect",
    "circle",
    "icon",
    "image",
    "line",
    "path",
    "counter",
    "chart",
    "group",
    "symbol",
    "scene3d",
    "effect",
    "video",
  ];
  const THEMES = {
    midnight: {
      background: "#0b1020",
      surface: "#182237",
      accent: "#8d9bff",
      secondary: "#56e0cf",
      text: "#f4f6ff",
      muted: "#91a0b8",
      line: "#34445e",
    },
    graphite: {
      background: "#101214",
      surface: "#23272c",
      accent: "#c4f56b",
      secondary: "#f8bb79",
      text: "#f5f5ef",
      muted: "#a1aaa9",
      line: "#41484b",
    },
    paper: {
      background: "#f0efe9",
      surface: "#ffffff",
      accent: "#4459d4",
      secondary: "#087e78",
      text: "#182033",
      muted: "#667086",
      line: "#c9cddd",
    },
    ember: {
      background: "#190f18",
      surface: "#332031",
      accent: "#ff9c72",
      secondary: "#e6a2ff",
      text: "#fff2ec",
      muted: "#bca0b5",
      line: "#62415a",
    },
    ocean: {
      background: "#041c2a",
      surface: "#0d3342",
      accent: "#42d2ff",
      secondary: "#b0e879",
      text: "#edfbff",
      muted: "#8eb5c5",
      line: "#255468",
    },
  };
  const EASINGS = {
    linear: (t) => t,
    easeIn: (t) => t * t * t,
    easeOut: (t) => 1 - Math.pow(1 - t, 3),
    easeInOut: (t) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
    backOut: (t) =>
      1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2),
    step: (t) => (t < 1 ? 0 : 1),
  };
  const NUM_PROPS = [
    "x",
    "y",
    "width",
    "height",
    "rotation",
    "scale",
    "opacity",
    "fontSize",
    "strokeWidth",
    "radius",
    "progress",
    "shadowBlur",
    "shadowX",
    "shadowY",
    "intensity",
    "speed",
    "cameraDistance",
    "cameraAzimuth",
    "cameraElevation",
    "fov",
    "lightIntensity",
  ];
  const COLOR_PROPS = ["fill", "stroke"];
  const COMMON = [
    "id",
    "type",
    "name",
    "x",
    "y",
    "width",
    "height",
    "rotation",
    "scale",
    "opacity",
    "fill",
    "stroke",
    "strokeWidth",
    "radius",
    "start",
    "end",
    "enter",
    "enterDuration",
    "exitDuration",
    "tracks",
    "parentId",
    "hidden",
    "shadowBlur",
    "shadowX",
    "shadowY",
    "shadowColor",
  ];
  const SPECIFIC = {
    text: [
      "text",
      "fontSize",
      "fontWeight",
      "align",
      "lineHeight",
      "fontFamily",
    ],
    rect: [],
    circle: [],
    icon: ["icon"],
    image: ["asset", "fit"],
    line: [
      "from",
      "to",
      "fromAnchor",
      "toAnchor",
      "x2",
      "y2",
      "curve",
      "arrow",
      "particles",
      "dash",
      "progress",
    ],
    path: ["d", "progress"],
    counter: [
      "valueFrom",
      "valueTo",
      "decimals",
      "prefix",
      "suffix",
      "fontSize",
      "fontWeight",
      "align",
    ],
    chart: [
      "values",
      "labels",
      "colors",
      "maxValue",
      "barGap",
      "fontSize",
      "progress",
    ],
    group: [],
    symbol: ["symbol"],
    scene3d: ["objects", "cameraDistance", "cameraAzimuth", "cameraElevation", "fov", "lightIntensity", "lightColor", "mirror", "ground"],
    effect: ["effect", "intensity", "speed", "seed"],
    video: ["asset", "fit", "trim", "playbackRate", "loop"],
  };
  const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[c],
    );
  const clamp = (n, a = 0, b = 1) => Math.max(a, Math.min(b, n));
  const num = (n, d = 0) => (Number.isFinite(n) ? n : d);
  const round = (n) => Math.round(n * 10000) / 10000;
  const colorValid = (v) =>
    typeof v === "string" &&
    /^(#[\da-f]{3}|#[\da-f]{6}|#[\da-f]{8}|\$(background|surface|accent|secondary|text|muted|line)|none)$/i.test(
      v,
    );
  const color = (v, theme) =>
    v?.startsWith("$") ? theme[v.slice(1)] || theme.text : v || "none";
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function validate(p) {
    const errors = [];
    const fail = (at, msg) => errors.push(`${at}: ${msg}`);
    const obj = (v) => v && typeof v === "object" && !Array.isArray(v);
    const keys = (v, allowed, at) => {
      for (const k of Object.keys(v))
        if (!allowed.includes(k)) fail(`${at}.${k}`, "unknown field");
    };
    const number = (v, lo, hi, at, optional = true) => {
      if (v === undefined && optional) return;
      if (!Number.isFinite(v) || v < lo || v > hi)
        fail(at, `expected a number from ${lo} to ${hi}`);
    };
    const string = (v, max, at, required = false) => {
      if (v === undefined && !required) return;
      if (typeof v !== "string" || v.length > max)
        fail(at, `expected text up to ${max} characters`);
    };
    const id = (v, at) => {
      if (typeof v !== "string" || !/^[a-zA-Z][a-zA-Z0-9_-]{0,63}$/.test(v))
        fail(at, "use a letter followed by up to 63 letters, digits, _ or -");
    };
    if (!obj(p)) return ["project: expected an object"];
    keys(
      p,
      [
        "version",
        "name",
        "width",
        "height",
        "fps",
        "theme",
        "assets",
        "scenes",
      ],
      "project",
    );
    if (p.version !== 1) fail("version", "expected 1");
    string(p.name, 160, "name", true);
    number(p.width, 256, 4096, "width", false);
    number(p.height, 256, 4096, "height", false);
    number(p.fps, 1, 60, "fps", false);
    if (!obj(p.theme)) fail("theme", "expected a palette object");
    else {
      keys(p.theme, Object.keys(THEMES.midnight), "theme");
      for (const k of Object.keys(THEMES.midnight))
        if (!/^#[\da-f]{6}$/i.test(p.theme[k] || ""))
          fail(`theme.${k}`, "use a six-digit hex colour");
    }
    if (!obj(p.assets)) fail("assets", "expected an object");
    else {
      if (Object.keys(p.assets).length > 100)
        fail("assets", "maximum 100 assets");
      let bytes = 0;
      for (const [k, a] of Object.entries(p.assets)) {
        id(k, `assets.${k}`);
        if (!obj(a)) {
          fail(`assets.${k}`, "expected an object");
          continue;
        }
        keys(a, ["name", "src", "credit", "source"], `assets.${k}`);
        string(a.name, 200, `assets.${k}.name`, true);
        string(a.credit, 1000, `assets.${k}.credit`);
        string(a.source, 2048, `assets.${k}.source`);
        const video = typeof a.src === "string" && a.src.startsWith("data:video/");
        if (typeof a.src !== "string" ||
          !/^data:(image\/(png|jpeg|webp)|video\/(mp4|webm));base64,[A-Za-z0-9+/]+={0,2}$/.test(a.src) ||
          a.src.length > (video ? 140000000 : 14000000))
          fail(
            `assets.${k}.src`,
            "embed PNG/JPEG/WebP (10 MB) or MP4/WebM (100 MB) as a base64 data URI",
          );
        bytes += a.src?.length || 0;
      }
      if (bytes > 160000000)
        fail("assets", "combined embedded assets exceed 160 MB encoded");
    }
    if (!Array.isArray(p.scenes) || p.scenes.length < 1 || p.scenes.length > 60)
      return [...errors, "scenes: provide 1–60 scenes"];
    const sceneIds = new Set();
    p.scenes.forEach((s, si) => {
      const at = `scenes[${si}]`;
      if (!obj(s)) {
        fail(at, "expected an object");
        return;
      }
      keys(s, ["id", "name", "duration", "background", "layers"], at);
      id(s.id, `${at}.id`);
      if (sceneIds.has(s.id)) fail(`${at}.id`, "duplicate scene id");
      sceneIds.add(s.id);
      string(s.name, 160, `${at}.name`, true);
      number(s.duration, 0.1, 600, `${at}.duration`, false);
      if (!obj(s.background)) fail(`${at}.background`, "expected an object");
      else {
        keys(
          s.background,
          [
            "type",
            "color",
            "color2",
            "angle",
            "grid",
            "gridSize",
            "gridOpacity",
          ],
          `${at}.background`,
        );
        if (
          !["solid", "linear", "radial", "transparent"].includes(
            s.background.type,
          )
        )
          fail(
            `${at}.background.type`,
            "use solid, linear, radial or transparent",
          );
        for (const k of ["color", "color2"])
          if (s.background[k] !== undefined && !colorValid(s.background[k]))
            fail(`${at}.background.${k}`, "invalid colour");
        number(s.background.angle, -360, 360, `${at}.background.angle`);
        number(s.background.gridSize, 10, 400, `${at}.background.gridSize`);
        number(s.background.gridOpacity, 0, 1, `${at}.background.gridOpacity`);
        if (
          s.background.grid !== undefined &&
          typeof s.background.grid !== "boolean"
        )
          fail(`${at}.background.grid`, "expected true or false");
      }
      if (!Array.isArray(s.layers) || s.layers.length > 400) {
        fail(`${at}.layers`, "expected up to 400 layers");
        return;
      }
      const ids = new Map();
      s.layers.forEach((l) => {
        if (obj(l)) {
          if (ids.has(l.id)) fail(at, `duplicate layer id ${l.id}`);
          ids.set(l.id, l);
        }
      });
      s.layers.forEach((l, li) => {
        const a = `${at}.layers[${li}]`;
        if (!obj(l)) {
          fail(a, "expected an object");
          return;
        }
        if (!TYPES.includes(l.type)) {
          fail(`${a}.type`, `use ${TYPES.join(", ")}`);
          return;
        }
        keys(l, [...COMMON, ...SPECIFIC[l.type]], a);
        id(l.id, `${a}.id`);
        string(l.name, 160, `${a}.name`);
        for (const k of ["x", "y", "x2", "y2"])
          number(l[k], -20000, 20000, `${a}.${k}`);
        for (const k of ["width", "height", "radius"])
          number(l[k], 0, 20000, `${a}.${k}`);
        number(l.rotation, -36000, 36000, `${a}.rotation`);
        number(l.scale, 0, 100, `${a}.scale`);
        number(l.opacity, 0, 1, `${a}.opacity`);
        number(l.strokeWidth, 0, 100, `${a}.strokeWidth`);
        number(l.shadowBlur, 0, 100, `${a}.shadowBlur`);
        number(l.shadowX, -500, 500, `${a}.shadowX`);
        number(l.shadowY, -500, 500, `${a}.shadowY`);
        if (l.shadowColor !== undefined && !colorValid(l.shadowColor))
          fail(`${a}.shadowColor`, "invalid shadow colour");
        number(l.start, 0, s.duration, `${a}.start`);
        number(l.end, 0, s.duration, `${a}.end`);
        if (l.end !== undefined && l.end < (l.start || 0))
          fail(a, "end must follow start");
        number(l.enterDuration, 0, 60, `${a}.enterDuration`);
        number(l.exitDuration, 0, 60, `${a}.exitDuration`);
        if (
          l.enter !== undefined &&
          !["none", "fade", "rise", "slide", "scale", "draw"].includes(l.enter)
        )
          fail(`${a}.enter`, "unknown entrance");
        for (const k of ["fill", "stroke"])
          if (l[k] !== undefined && !colorValid(l[k]))
            fail(`${a}.${k}`, "use hex, none or a theme token");
        if (l.hidden !== undefined && typeof l.hidden !== "boolean")
          fail(`${a}.hidden`, "expected true or false");
        if (l.parentId !== undefined) {
          if (!ids.has(l.parentId) || ids.get(l.parentId).type !== "group")
            fail(`${a}.parentId`, "must reference a group in this scene");
          let q = l;
          const seen = new Set([l.id]);
          let depth = 0;
          while (q.parentId && ids.has(q.parentId)) {
            if (seen.has(q.parentId)) {
              fail(a, "parent cycle");
              break;
            }
            seen.add(q.parentId);
            q = ids.get(q.parentId);
            if (++depth > 8) {
              fail(a, "maximum group depth is 8");
              break;
            }
          }
        }
        if (l.type === "text") {
          string(l.text, 5000, `${a}.text`, true);
          number(l.lineHeight, 0.5, 3, `${a}.lineHeight`);
          if (
            l.fontFamily !== undefined &&
            !["sans", "mono", "serif"].includes(l.fontFamily)
          )
            fail(`${a}.fontFamily`, "use sans, mono or serif");
        }
        if (["text", "counter", "chart"].includes(l.type)) {
          number(l.fontSize, 1, 500, `${a}.fontSize`);
          number(l.fontWeight, 100, 900, `${a}.fontWeight`);
          if (
            l.align !== undefined &&
            !["left", "center", "right"].includes(l.align)
          )
            fail(`${a}.align`, "use left, center or right");
        }
        if (l.type === "icon" && !Object.hasOwn(icons, l.icon))
          fail(
            `${a}.icon`,
            "unknown Material icon; see assets/material-icons/catalog.json",
          );
        if (l.type === "symbol" && !Object.hasOwn(elements, l.symbol))
          fail(`${a}.symbol`, "unknown Lucide symbol");
        if (["image", "video"].includes(l.type)) {
          if (!Object.hasOwn(p.assets || {}, l.asset))
            fail(`${a}.asset`, "missing asset id");
          else if (!p.assets[l.asset]?.src?.startsWith(`data:${l.type === "image" ? "image" : "video"}/`))
            fail(`${a}.asset`, `expected a ${l.type} asset`);
          if (
            l.fit !== undefined &&
            !["contain", "cover", "stretch"].includes(l.fit)
          )
            fail(`${a}.fit`, "use contain, cover or stretch");
        }
        if (l.type === "video") {
          number(l.trim, 0, 36000, `${a}.trim`);
          number(l.playbackRate, 0.1, 8, `${a}.playbackRate`);
          if (l.loop !== undefined && typeof l.loop !== "boolean")
            fail(`${a}.loop`, "expected true or false");
        }
        if (["scene3d", "effect", "video"].includes(l.type) && l.parentId !== undefined)
          fail(`${a}.parentId`, "composited layers must be root layers; group objects inside a 3D scene");
        if (l.type === "effect") {
          if (!EFFECTS.includes(l.effect)) fail(`${a}.effect`, "unknown effect preset");
          number(l.intensity, 0, 1, `${a}.intensity`);
          number(l.speed, -10, 10, `${a}.speed`);
          number(l.seed, 0, 65535, `${a}.seed`);
          if (l.seed !== undefined && !Number.isInteger(l.seed)) fail(`${a}.seed`, "expected an integer");
        }
        if (l.type === "scene3d") {
          for (const [k, lo, hi] of [
            ["cameraDistance", 2, 30], ["cameraAzimuth", -36000, 36000],
            ["cameraElevation", -85, 85], ["fov", 15, 100], ["lightIntensity", 0, 20],
          ]) number(l[k], lo, hi, `${a}.${k}`);
          if (l.lightColor !== undefined && !colorValid(l.lightColor)) fail(`${a}.lightColor`, "invalid colour");
          if (l.mirror !== undefined && typeof l.mirror !== "boolean") fail(`${a}.mirror`, "expected true or false");
          if (l.ground !== undefined && typeof l.ground !== "boolean") fail(`${a}.ground`, "expected true or false");
          if (!Array.isArray(l.objects) || !l.objects.length || l.objects.length > 40)
            fail(`${a}.objects`, "provide 1-40 procedural objects");
          else {
            const objectIds = new Set();
            l.objects.forEach((o, oi) => {
              const oa = `${a}.objects[${oi}]`;
              if (!obj(o)) { fail(oa, "expected an object"); return; }
              keys(o, ["id", "geometry", "material", "color", "speed", "seed", "tracks", ...Object.keys(OBJECT_RANGES)], oa);
              id(o.id, `${oa}.id`);
              if (objectIds.has(o.id)) fail(`${oa}.id`, "duplicate object id");
              objectIds.add(o.id);
              if (!GEOMETRIES.includes(o.geometry)) fail(`${oa}.geometry`, "unknown geometry");
              if (o.material !== undefined && !MATERIALS.includes(o.material)) fail(`${oa}.material`, "unknown material");
              if (o.color !== undefined && (!colorValid(o.color) || o.color === "none")) fail(`${oa}.color`, "invalid colour");
              for (const [k, [lo, hi]] of Object.entries(OBJECT_RANGES)) number(o[k], lo, hi, `${oa}.${k}`);
              number(o.speed, -10, 10, `${oa}.speed`);
              number(o.seed, 0, 65535, `${oa}.seed`);
              if (o.seed !== undefined && !Number.isInteger(o.seed)) fail(`${oa}.seed`, "expected an integer");
              if (o.tracks !== undefined) {
                if (!Array.isArray(o.tracks) || o.tracks.length > 18) { fail(`${oa}.tracks`, "maximum 18 tracks"); return; }
                const seen = new Set();
                o.tracks.forEach((tr, ti) => {
                  const ta = `${oa}.tracks[${ti}]`;
                  if (!obj(tr)) { fail(ta, "expected an object"); return; }
                  keys(tr, ["property", "loop", "keyframes"], ta);
                  const range = OBJECT_RANGES[tr.property];
                  if (!range) fail(`${ta}.property`, "unsupported 3D animated property");
                  if (seen.has(tr.property)) fail(ta, "one track per property");
                  seen.add(tr.property);
                  if (tr.loop !== undefined && typeof tr.loop !== "boolean") fail(`${ta}.loop`, "expected true or false");
                  if (!Array.isArray(tr.keyframes) || tr.keyframes.length < 2 || tr.keyframes.length > 100) { fail(ta, "provide 2-100 keyframes"); return; }
                  let previous = -1;
                  for (const kf of tr.keyframes) {
                    if (!obj(kf)) { fail(ta, "expected a keyframe object"); continue; }
                    keys(kf, ["time", "value", "easing"], ta);
                    number(kf.time, 0, s.duration, `${ta}.time`, false);
                    if (kf.time <= previous) fail(ta, "keyframe times must increase strictly");
                    previous = kf.time;
                    number(kf.value, ...(range || [-1e6, 1e6]), `${ta}.value`, false);
                    if (kf.easing !== undefined && !Object.hasOwn(EASINGS, kf.easing)) fail(ta, "unknown easing");
                  }
                });
              }
            });
          }
        }
        if (l.type === "line") {
          if (l.parentId !== undefined)
            fail(
              `${a}.parentId`,
              "connectors must be root layers in stage coordinates",
            );
          for (const k of ["from", "to"])
            if (
              l[k] !== undefined &&
              (!ids.has(l[k]) || ids.get(l[k]).type === "line")
            )
              fail(`${a}.${k}`, "must reference a non-line layer");
          for (const k of ["fromAnchor", "toAnchor"])
            if (
              l[k] !== undefined &&
              !["left", "right", "top", "bottom", "center"].includes(l[k])
            )
              fail(`${a}.${k}`, "unknown anchor");
          if (
            l.curve !== undefined &&
            !["straight", "bezier", "step"].includes(l.curve)
          )
            fail(`${a}.curve`, "use straight, bezier or step");
          number(l.particles, 0, 20, `${a}.particles`);
          if (l.arrow !== undefined && typeof l.arrow !== "boolean")
            fail(`${a}.arrow`, "expected true or false");
          string(l.dash, 80, `${a}.dash`);
          if (l.dash !== undefined && !/^[\d.,\s]+$/.test(l.dash))
            fail(`${a}.dash`, "use dash lengths only");
        }
        if (
          l.type === "path" &&
          (typeof l.d !== "string" ||
            l.d.length > 30000 ||
            !/^[MmZzLlHhVvCcSsQqTtAaEe\d.,+\s-]+$/.test(l.d))
        )
          fail(`${a}.d`, "use SVG path commands and numbers only");
        number(l.progress, 0, 1, `${a}.progress`);
        if (l.type === "counter") {
          for (const k of ["valueFrom", "valueTo"])
            number(l[k], -1e12, 1e12, `${a}.${k}`);
          number(l.decimals, 0, 6, `${a}.decimals`);
          string(l.prefix, 80, `${a}.prefix`);
          string(l.suffix, 80, `${a}.suffix`);
        }
        if (l.type === "chart") {
          if (
            !Array.isArray(l.values) ||
            !l.values.length ||
            l.values.length > 50 ||
            l.values.some((v) => !Number.isFinite(v) || v < 0 || v > 1e12)
          )
            fail(`${a}.values`, "provide 1–50 non-negative numbers");
          if (
            l.labels !== undefined &&
            (!Array.isArray(l.labels) ||
              l.labels.length !== l.values?.length ||
              l.labels.some((v) => typeof v !== "string" || v.length > 80))
          )
            fail(`${a}.labels`, "one short text label per value");
          if (
            l.colors !== undefined &&
            (!Array.isArray(l.colors) ||
              l.colors.length > 50 ||
              l.colors.some((v) => !colorValid(v)))
          )
            fail(`${a}.colors`, "provide colour values");
          number(l.maxValue, 0.001, 1e12, `${a}.maxValue`);
          number(l.barGap, 0, 0.9, `${a}.barGap`);
        }
        if (l.tracks !== undefined) {
          if (!Array.isArray(l.tracks) || l.tracks.length > 20) {
            fail(`${a}.tracks`, "maximum 20 animation tracks");
            return;
          }
          const props = new Set();
          l.tracks.forEach((tr, ti) => {
            const ta = `${a}.tracks[${ti}]`;
            if (!obj(tr)) {
              fail(ta, "expected an object");
              return;
            }
            keys(tr, ["property", "keyframes", "loop"], ta);
            if (![...NUM_PROPS, ...COLOR_PROPS].includes(tr.property))
              fail(`${ta}.property`, "unsupported animated property");
            if (props.has(tr.property)) fail(ta, "one track per property");
            props.add(tr.property);
            if (tr.loop !== undefined && typeof tr.loop !== "boolean")
              fail(`${ta}.loop`, "expected true or false");
            if (
              !Array.isArray(tr.keyframes) ||
              tr.keyframes.length < 2 ||
              tr.keyframes.length > 100
            ) {
              fail(`${ta}.keyframes`, "provide 2–100 keyframes");
              return;
            }
            let last = -1;
            tr.keyframes.forEach((kf, ki) => {
              const ka = `${ta}.keyframes[${ki}]`;
              if (!obj(kf)) {
                fail(ka, "expected an object");
                return;
              }
              keys(kf, ["time", "value", "easing"], ka);
              number(kf.time, 0, s.duration, `${ka}.time`, false);
              if (kf.time <= last)
                fail(ka, "keyframe times must increase strictly");
              last = kf.time;
              if (kf.easing !== undefined && !Object.hasOwn(EASINGS, kf.easing))
                fail(`${ka}.easing`, "unknown easing");
              if (COLOR_PROPS.includes(tr.property)) {
                if (!colorValid(kf.value) || kf.value === "none")
                  fail(`${ka}.value`, "use a colour or theme token");
              } else {
                number(kf.value, -1e6, 1e6, `${ka}.value`, false);
                if (["opacity", "progress", "intensity"].includes(tr.property))
                  number(kf.value, 0, 1, `${ka}.value`, false);
                const range = {
                  speed: [-10, 10], shadowBlur: [0, 100], shadowX: [-500, 500], shadowY: [-500, 500],
                  cameraDistance: [2, 30], cameraAzimuth: [-36000, 36000],
                  cameraElevation: [-85, 85], fov: [15, 100], lightIntensity: [0, 20],
                }[tr.property];
                if (range) number(kf.value, ...range, `${ka}.value`, false);
                if (
                  [
                    "width",
                    "height",
                    "radius",
                    "scale",
                    "strokeWidth",
                    "fontSize",
                    "shadowBlur",
                  ].includes(tr.property) &&
                  kf.value < 0
                )
                  fail(`${ka}.value`, "must not be negative");
              }
            });
          });
        }
      });
    });
    return errors;
  }
  function assertValid(p) {
    const e = validate(p);
    if (e.length) throw new Error(e.slice(0, 15).join("\n"));
    return p;
  }
  function rgb(c) {
    c = c.replace("#", "");
    if (c.length === 3)
      c = c
        .split("")
        .map((x) => x + x)
        .join("");
    if (c.length === 6) c += "ff";
    return [0, 2, 4, 6].map((i) => parseInt(c.slice(i, i + 2), 16));
  }
  function mix(a, b, t, theme) {
    if (typeof a === "number") return a + (b - a) * t;
    const aa = rgb(color(a, theme)),
      bb = rgb(color(b, theme));
    return (
      "#" +
      aa
        .map((v, i) =>
          Math.round(v + (bb[i] - v) * t)
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  }
  function trackValue(tr, t, theme) {
    const ks = tr.keyframes,
      first = ks[0],
      last = ks.at(-1);
    if (tr.loop && t > last.time)
      t = first.time + ((t - first.time) % (last.time - first.time));
    if (t <= first.time) return first.value;
    if (t >= last.time) return last.value;
    let i = 1;
    while (ks[i].time < t) i++;
    const a = ks[i - 1],
      b = ks[i];
    return mix(
      a.value,
      b.value,
      EASINGS[b.easing || "easeInOut"]((t - a.time) / (b.time - a.time)),
      theme,
    );
  }
  function sample(layer, t, scene, theme) {
    const l = {
      x: 0,
      y: 0,
      width: 180,
      height: 100,
      rotation: 0,
      scale: 1,
      opacity: 1,
      fill: "$accent",
      stroke: "none",
      strokeWidth: 2,
      start: 0,
      end: scene.duration,
      enter: "fade",
      enterDuration: 0.6,
      exitDuration: 0,
      radius: 20,
      fontSize: layer.type === "chart" ? 20 : 40,
      shadowBlur: 0,
      shadowX: 0,
      shadowY: 10,
      ...(layer.type === "scene3d" ? {
        cameraDistance: 6, cameraAzimuth: 25, cameraElevation: 15, fov: 45, lightIntensity: 3,
      } : {}),
      ...(layer.type === "effect" ? { intensity: 0.25, speed: 0.5 } : {}),
      ...layer,
    };
    for (const tr of l.tracks || []) l[tr.property] = trackValue(tr, t, theme);
    const u = clamp((t - l.start) / (l.enterDuration || 0.00001)),
      v = EASINGS.easeOut(u);
    l.progress = l.progress ?? v;
    if (t < l.start || t > l.end || l.hidden) l.opacity = 0;
    else if (l.enter !== "none") l.opacity *= v;
    if (l.exitDuration) l.opacity *= clamp((l.end - t) / l.exitDuration);
    if (l.enter === "rise") l.y += 32 * (1 - v);
    if (l.enter === "slide") l.x -= 60 * (1 - v);
    if (l.enter === "scale") l.scale *= 0.8 + 0.2 * v;
    return l;
  }
  function sampleObject(object, t, theme) {
    const sampled = {
      x: 0, y: 0, z: 0, rotationX: 0, rotationY: 0, rotationZ: 0,
      scaleX: 1, scaleY: 1, scaleZ: 1,
      roughness: 0.25, metalness: 0, transmission: 0, ior: 1.5,
      amplitude: 0.15, frequency: 2, opacity: 1,
      ...(MATERIAL_DEFAULTS[object.material] || MATERIAL_DEFAULTS.standard), ...object,
    };
    for (const track of object.tracks || [])
      sampled[track.property] = trackValue(track, t, theme);
    return sampled;
  }
  const mul = (a, b) => [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
  function matrix(l) {
    const a = (l.rotation * Math.PI) / 180,
      c = Math.cos(a) * l.scale,
      s = Math.sin(a) * l.scale,
      cx = l.width / 2,
      cy = l.height / 2;
    return [
      c,
      s,
      -s,
      c,
      l.x + cx - c * cx + s * cy,
      l.y + cy - s * cx - c * cy,
    ];
  }
  const point = (m, x, y) => ({
    x: m[0] * x + m[2] * y + m[4],
    y: m[1] * x + m[3] * y + m[5],
  });
  function renderSVG(project, sceneId, t, options = {}) {
    const p = project,
      s = p.scenes.find((s) => s.id === sceneId) || p.scenes[0],
      theme = p.theme;
    if (!options.placeholders && !options.hitOnly && s.layers.some((l) => ["scene3d", "effect", "video"].includes(l.type)))
      throw new Error("This scene contains WebGL/video layers. Use PNG/video export instead of SVG.");
    t = clamp(t, 0, s.duration);
    const layers = s.layers.map((l) => sample(l, t, s, theme)),
      map = new Map(layers.map((l) => [l.id, l])),
      matrices = new Map();
    function world(l) {
      if (matrices.has(l.id)) return matrices.get(l.id);
      let m = matrix(l);
      if (l.parentId && map.has(l.parentId))
        m = mul(world(map.get(l.parentId)), m);
      matrices.set(l.id, m);
      return m;
    }
    function anchor(id, side) {
      const l = map.get(id),
        m = world(l);
      const coords = {
        left: [0, l.height / 2],
        right: [l.width, l.height / 2],
        top: [l.width / 2, 0],
        bottom: [l.width / 2, l.height],
        center: [l.width / 2, l.height / 2],
      };
      return point(m, ...(coords[side] || coords.center));
    }
    const defs = [];
    let body = "";
    const bg = s.background;
    if (bg.type !== "transparent" && options.background !== false && !options.hitOnly) {
      let fill = color(bg.color || "$background", theme);
      if (["linear", "radial"].includes(bg.type)) {
        const c2 = color(bg.color2 || "$surface", theme);
        if (bg.type === "linear") {
          const a = ((bg.angle ?? 45) * Math.PI) / 180;
          defs.push(
            `<linearGradient id="mf-bg" x1="${50 - Math.cos(a) * 50}%" y1="${50 - Math.sin(a) * 50}%" x2="${50 + Math.cos(a) * 50}%" y2="${50 + Math.sin(a) * 50}%"><stop stop-color="${fill}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`,
          );
        } else
          defs.push(
            `<radialGradient id="mf-bg" cx="65%" cy="25%" r="90%"><stop stop-color="${c2}"/><stop offset="1" stop-color="${fill}"/></radialGradient>`,
          );
        fill = "url(#mf-bg)";
      }
      body += `<rect width="${p.width}" height="${p.height}" fill="${fill}"/>`;
    }
    if (bg.grid && options.background !== false && !options.hitOnly) {
      const size = bg.gridSize || 60;
      defs.push(
        `<pattern id="mf-grid" width="${size}" height="${size}" patternUnits="userSpaceOnUse"><path d="M ${size} 0 H 0 V ${size}" fill="none" stroke="${theme.muted}" stroke-width="1"/></pattern>`,
      );
      body += `<rect width="100%" height="100%" fill="url(#mf-grid)" opacity="${bg.gridOpacity ?? 0.1}"/>`;
    }
    function textSVG(l, txt) {
      const fs = l.fontSize || 40,
        a = l.align || "left",
        x = a === "center" ? l.width / 2 : a === "right" ? l.width : 0;
      const font = {
        sans: "Arial, Helvetica, sans-serif",
        mono: "monospace",
        serif: "Georgia, serif",
      }[l.fontFamily || "sans"];
      return `<text x="${x}" y="${fs}" font-family="${font}" font-size="${fs}" font-weight="${l.fontWeight || 500}" text-anchor="${{ left: "start", center: "middle", right: "end" }[a]}">${String(
        txt,
      )
        .split("\n")
        .map(
          (line, i) =>
            `<tspan x="${x}" dy="${i ? fs * (l.lineHeight || 1.2) : 0}">${esc(line)}</tspan>`,
        )
        .join("")}</text>`;
    }
    function shadowFilter(l) {
      if (!l.shadowBlur || options.hitOnly) return "";
      const shadowId = `mf-shadow-${l.id}`;
      defs.push(`<filter id="${shadowId}" x="-100%" y="-100%" width="300%" height="300%"><feDropShadow dx="${l.shadowX ?? 0}" dy="${l.shadowY ?? 10}" stdDeviation="${l.shadowBlur / 2}" flood-color="${color(l.shadowColor || "#00000080", theme)}"/></filter>`);
      return ` filter="url(#${shadowId})"`;
    }
    function draw(l) {
      let content = "",
        fill = color(l.fill, theme),
        stroke = color(l.stroke, theme),
        r = l.radius ?? 20;
      if (l.type === "rect")
        content = `<rect width="${l.width}" height="${l.height}" rx="${r}"/>`;
      if (l.type === "circle")
        content = `<ellipse cx="${l.width / 2}" cy="${l.height / 2}" rx="${l.width / 2}" ry="${l.height / 2}"/>`;
      if (l.type === "text") content = textSVG(l, l.text);
      if (l.type === "counter") {
        const v =
          num(l.valueFrom) +
          (num(l.valueTo, 100) - num(l.valueFrom)) * clamp(l.progress);
        content = textSVG(
          l,
          `${l.prefix || ""}${v.toFixed(Math.floor(l.decimals || 0))}${l.suffix || ""}`,
        );
      }
      if (l.type === "icon") {
        const side = Math.min(l.width, l.height);
        content = `<g transform="translate(${(l.width - side) / 2} ${(l.height - side) / 2}) scale(${side / 24})">${icons[l.icon] || ""}</g>`;
      }
      if (l.type === "symbol") {
        const side = Math.min(l.width, l.height);
        content = `<g transform="translate(${(l.width - side) / 2} ${(l.height - side) / 2}) scale(${side / 24})" fill="none" stroke="${fill}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${elements[l.symbol] || ""}</g>`;
      }
      if (l.type === "image") {
        const asset = p.assets[l.asset];
        if (asset) {
          const clip = `mf-clip-${l.id}`;
          defs.push(
            `<clipPath id="${clip}"><rect width="${l.width}" height="${l.height}" rx="${r}"/></clipPath>`,
          );
          content = `<image href="${esc(asset.src)}" width="${l.width}" height="${l.height}" preserveAspectRatio="${l.fit === "stretch" ? "none" : l.fit === "cover" ? "xMidYMid slice" : "xMidYMid meet"}" clip-path="url(#${clip})"/>`;
        }
      }
      if (l.type === "path")
        content = `<path d="${esc(l.d)}" pathLength="1" ${l.enter === "draw" ? `stroke-dasharray="1" stroke-dashoffset="${1 - clamp(l.progress)}"` : ""}/>`;
      if (l.type === "chart") {
        const vals = l.values,
          max = l.maxValue || Math.max(...vals, 1),
          step = l.width / vals.length,
          gap = l.barGap ?? 0.25,
          fs = l.fontSize || 20,
          h = l.height - fs * 2;
        content = vals
          .map((v, i) => {
            const bh = h * clamp(v / max) * clamp(l.progress);
            return `<g><rect x="${i * step + (step * gap) / 2}" y="${h - bh}" width="${step * (1 - gap)}" height="${bh}" rx="${Math.min(r, step / 4, bh / 2)}" fill="${color(l.colors?.[i % l.colors.length] || l.fill, theme)}"/><text x="${i * step + step / 2}" y="${h + fs * 1.4}" font-family="Arial, sans-serif" font-size="${fs}" fill="${theme.muted}" stroke="none" text-anchor="middle">${esc(l.labels?.[i] ?? String(i + 1))}</text></g>`;
          })
          .join("");
      }
      if (l.type === "group")
        content = layers
          .filter((c) => c.parentId === l.id)
          .map(draw)
          .join("");
      if (l.type === "line") {
        // Linked connectors are rendered in stage space. Their parent transform is intentionally excluded.
        const a = l.from
            ? anchor(l.from, l.fromAnchor || "right")
            : { x: l.x, y: l.y },
          b = l.to
            ? anchor(l.to, l.toAnchor || "left")
            : { x: l.x2 ?? l.x + l.width, y: l.y2 ?? l.y + l.height };
        const dx = b.x - a.x;
        let d = `M ${a.x} ${a.y} L ${b.x} ${b.y}`,
          pos = (u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
        if (l.curve === "bezier") {
          const c = { x: a.x + dx * 0.5, y: a.y },
            e = { x: b.x - dx * 0.5, y: b.y };
          d = `M ${a.x} ${a.y} C ${c.x} ${c.y} ${e.x} ${e.y} ${b.x} ${b.y}`;
          pos = (u) => ({
            x:
              (1 - u) ** 3 * a.x +
              3 * (1 - u) ** 2 * u * c.x +
              3 * (1 - u) * u * u * e.x +
              u ** 3 * b.x,
            y:
              (1 - u) ** 3 * a.y +
              3 * (1 - u) ** 2 * u * c.y +
              3 * (1 - u) * u * u * e.y +
              u ** 3 * b.y,
          });
        }
        if (l.curve === "step") {
          const mid = (a.x + b.x) / 2;
          d = `M ${a.x} ${a.y} H ${mid} V ${b.y} H ${b.x}`;
          const lengths = [
              Math.abs(mid - a.x),
              Math.abs(b.y - a.y),
              Math.abs(b.x - mid),
            ],
            total = lengths.reduce((a, b) => a + b, 0);
          pos = (u) => {
            let dist = u * total;
            if (dist <= lengths[0])
              return { x: a.x + Math.sign(mid - a.x) * dist, y: a.y };
            dist -= lengths[0];
            if (dist <= lengths[1])
              return { x: mid, y: a.y + Math.sign(b.y - a.y) * dist };
            dist -= lengths[1];
            return { x: mid + Math.sign(b.x - mid) * dist, y: b.y };
          };
        }
        const marker = `mf-arrow-${l.id}`;
        if (l.arrow)
          defs.push(
            `<marker id="${marker}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="${stroke === "none" ? fill : stroke}" stroke-width="1.5"/></marker>`,
          );
        content = `<path d="${d}" fill="none" stroke="${stroke === "none" ? fill : stroke}" stroke-width="${l.strokeWidth}" pathLength="1" stroke-dasharray="${l.enter === "draw" ? "1" : esc(l.dash || "none")}" stroke-dashoffset="${l.enter === "draw" ? 1 - clamp(l.progress) : 0}" ${l.arrow ? 'marker-end="url(#' + marker + ')"' : ""}/>`;
        for (let i = 0; i < (l.particles || 0); i++) {
          const u = ((t - l.start) * 0.22 + i / l.particles) % 1;
          if (u < 0 || u > l.progress) continue;
          const q = pos(u);
          content += `<circle cx="${q.x}" cy="${q.y}" r="${Math.max(3, l.strokeWidth * 1.6)}" fill="${fill}" stroke="none"/>`;
        }
        return `<g data-layer="${esc(l.id)}" opacity="${options.hitOnly ? 0 : round(l.opacity)}"${shadowFilter(l)}>${content}</g>`;
      }
      if (options.hitOnly && l.type !== "group")
        content = `<rect width="${l.width}" height="${l.height}" fill="transparent" stroke="none" pointer-events="all"/>`;
      const filter = shadowFilter(l);
      return `<g data-layer="${esc(l.id)}" transform="matrix(${matrix(l).map(round).join(" ")})" opacity="${round(l.opacity)}" fill="${fill}" stroke="${stroke}" stroke-width="${l.strokeWidth}"${filter}>${content}</g>`;
    }
    body += layers
      .filter((l) => !l.parentId && (!options.rootIds || options.rootIds.includes(l.id)))
      .map(draw)
      .join("");
    if (options.safeArea)
      body += `<rect x="${p.width * 0.05}" y="${p.height * 0.05}" width="${p.width * 0.9}" height="${p.height * 0.9}" rx="0" fill="none" stroke="#ffca66" stroke-width="2" stroke-dasharray="10 10" pointer-events="none"/>`;
    if (options.selected) {
      const l = map.get(options.selected);
      if (l && l.type !== "line")
        body += `<g transform="matrix(${world(l).map(round).join(" ")})" pointer-events="none"><rect x="-6" y="-6" width="${l.width + 12}" height="${l.height + 12}" rx="2" fill="none" stroke="#b4bdff" stroke-width="2" stroke-dasharray="8 4"/></g>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${p.width}" height="${p.height}" viewBox="0 0 ${p.width} ${p.height}" role="img" aria-label="${esc(s.name)}"><defs>${defs.join("")}</defs>${body}</svg>`;
  }
  return {
    VERSION,
    TYPES,
    THEMES,
    EASINGS,
    GEOMETRIES,
    MATERIALS,
    MATERIAL_DEFAULTS,
    EFFECTS,
    OBJECT_RANGES,
    NUM_PROPS,
    elements,
    icons,
    clone,
    validate,
    assertValid,
    renderSVG,
    sample,
    sampleObject,
    trackValue,
    color,
    esc,
    matrix,
  };
});
