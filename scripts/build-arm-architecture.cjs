"use strict";
// Builds examples/arm-architecture.motion.json: an original 9-scene explainer of the Arm architecture.
// Pure vector + procedural 3D (no third-party art). Run: node scripts/build-arm-architecture.cjs
const fs = require("node:fs");
const path = require("node:path");
const M = require("../src/engine.js");

const W = 1600, H = 900;
const theme = { background: "#060f1a", surface: "#0e1d2c", accent: "#13c8e6", secondary: "#ffb547", text: "#eef6fb", muted: "#8aa3b8", line: "#25405a" };
const COMMON = ["name", "start", "end", "enter", "enterDuration", "exitDuration", "opacity", "tracks", "parentId", "shadowBlur", "shadowX",
  "shadowY", "shadowColor", "rotation", "scale", "stroke", "strokeWidth", "radius", "align", "lineHeight", "fontFamily", "hidden"];
let seq = 0;
const uid = (p) => `${p}-${++seq}`;
const pick = (o) => Object.fromEntries(COMMON.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const r3 = (n) => Math.round(n * 1000) / 1000;
const track = (property, keys, loop) => ({ property, ...(loop ? { loop: true } : {}),
  keyframes: keys.map(([time, value, easing]) => ({ time: r3(time), value, ...(easing ? { easing } : {}) })) });

function text(t, x, y, size, o = {}) {
  const lines = t.split("\n"), longest = Math.max(...lines.map((s) => s.length));
  return { id: o.id || uid("txt"), type: "text", x, y,
    width: o.width ?? Math.ceil(longest * size * (o.fontFamily === "mono" ? 0.62 : 0.58) + 12),
    height: o.height ?? Math.ceil(lines.length * size * (o.lineHeight || 1.2) + 8),
    text: t, fontSize: size, fontWeight: o.weight ?? 500, fill: o.fill ?? "$text", ...pick({ name: lines[0].slice(0, 48), ...o }) };
}
const rect = (x, y, width, height, fill, o = {}) => ({ id: o.id || uid("rect"), type: "rect", x, y, width, height, fill, ...pick(o) });
const circle = (x, y, size, fill, o = {}) => ({ id: o.id || uid("dot"), type: "circle", x, y, width: size, height: o.height ?? size, fill, ...pick(o) });
const symbol = (name, x, y, size, o = {}) => ({ id: o.id || uid("sym"), type: "symbol", symbol: name, x, y, width: size, height: size, fill: o.fill ?? "$accent", ...pick(o) });
const group = (id, x, y, width, height, o = {}) => ({ id, type: "group", x, y, width, height, ...pick(o) });
const line = (o) => ({ id: o.id || uid("line"), type: "line", stroke: o.stroke ?? "$accent", strokeWidth: o.strokeWidth ?? 3,
  ...Object.fromEntries(["x", "y", "x2", "y2", "from", "to", "fromAnchor", "toAnchor", "curve", "arrow", "particles", "dash", "progress"]
    .filter((k) => o[k] !== undefined).map((k) => [k, o[k]])), ...pick({ enter: "draw", enterDuration: 0.8, ...o }) });
const counter = (x, y, w, h, o) => ({ id: o.id || uid("count"), type: "counter", x, y, width: w, height: h,
  valueFrom: o.from, valueTo: o.to, decimals: 0, prefix: o.prefix || "", suffix: o.suffix || "", fontSize: o.size, fontWeight: o.weight ?? 700,
  fill: o.fill ?? "$text", ...pick({ enter: "none", ...o, fontFamily: undefined }) });
const pathL = (d, x, y, w, h, o = {}) => ({ id: o.id || uid("path"), type: "path", d, x, y, width: w, height: h, fill: o.fill ?? "none", ...pick(o) });
// Card = group + panel; children use local coordinates.
function card(id, x, y, w, h, o = {}) {
  return [group(id, x, y, w, h, { start: o.start ?? 0.4, enter: o.enter ?? "rise", enterDuration: 0.7, name: o.name || id }),
    rect(0, 0, w, h, o.fill ?? "$surface", { parentId: id, stroke: o.stroke ?? "$line", strokeWidth: o.strokeWidth ?? 1.5, radius: o.radius ?? 16,
      shadowBlur: 24, shadowY: 12, shadowColor: "#00000066", enter: "none", name: `${o.name || id} panel` })];
}
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

const CHAPTERS = ["INTRODUCTION", "BUSINESS MODEL", "LOAD / STORE", "REGISTERS", "PIPELINE", "MEMORY HIERARCHY", "SYSTEM ON CHIP", "PRIVILEGE & SECURITY", "SUMMARY"];
function atmosphere(i, d) {
  const rand = rng(97 + i * 31), side = i % 2;
  const out = [
    circle(-220 + side * 1150, 360, 760, "$accent", { name: "Glow", opacity: 0.05, enter: "fade", enterDuration: 1.5,
      tracks: [track("x", [[0, -220 + side * 1150], [d, -160 + side * 1150]], )] }),
    circle(980 - side * 900, -300, 620, "$secondary", { name: "Warm glow", opacity: 0.035, enter: "fade", enterDuration: 1.5 }),
  ];
  for (let k = 0; k < 14; k++) {
    const x = Math.round(60 + rand() * 1480), y = Math.round(140 + rand() * 660), s = 3 + Math.round(rand() * 4);
    out.push(circle(x, y, s, k % 3 ? "$accent" : "$secondary", { name: "Particle", opacity: 0.35, enter: "fade", enterDuration: 1.2, start: r3(rand() * 1.2),
      tracks: [track("y", [[0, y], [d / 2, y - 26 - Math.round(rand() * 30), "easeInOut"], [d, y, "easeInOut"]])] }));
  }
  return out;
}
function rails(i, d, total) {
  const out = [
    rect(100, 52, 28, 4, "$accent", { name: "Chapter mark", radius: 2, enter: "fade" }),
    text(`${String(i + 1).padStart(2, "0")} · ${CHAPTERS[i]}`, 140, 40, 17, { weight: 700, fill: "$accent", name: "Chapter", enter: "fade" }),
    text(`${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, 1400, 40, 16, { width: 100, align: "right", fill: "$muted", fontFamily: "mono", name: "Counter", enter: "fade" }),
    rect(100, 840, 1400, 2, "$line", { name: "Timeline", radius: 1, enter: "none" }),
    rect(100, 840, 0, 2, "$accent", { name: "Progress", radius: 1, enter: "none", tracks: [track("width", [[0, 0], [d, 1400]], )] }),
  ];
  if (i) out.push(rect(0, 0, W, H, "$accent", { name: "Wipe", radius: 0, enter: "none", end: 0.7,
    tracks: [track("x", [[0, 0], [0.6, W, "easeInOut"]])] }));
  return out;
}
const heading = (title, sub) => [
  text(title, 100, 84, 54, { weight: 800, name: "Heading", enter: "rise", start: 0.25, shadowBlur: 18, shadowY: 6, shadowColor: "#00000080" }),
  ...(sub ? [text(sub, 102, 156, 23, { fill: "$muted", name: "Subheading", enter: "fade", start: 0.55 })] : []),
];
function chip(label, x, y, o = {}) {
  const w = Math.round(label.length * (o.size ?? 18) * 0.58 + 40), h = o.h ?? 44;
  return { w, layers: [rect(x, y, w, h, o.fill ?? "$surface", { name: `Chip ${label}`, radius: h / 2, stroke: o.stroke ?? "$line", strokeWidth: 1.5, start: o.start, enter: "scale" }),
    text(label, x, y + (h - (o.size ?? 18) * 1.2) / 2 - 2, o.size ?? 18, { width: w, align: "center", weight: 600, fill: o.color ?? "$text", start: o.start, enter: "fade" })] };
}
function chipRow(labels, x, y, o = {}) {
  const out = [];
  labels.forEach((l, k) => { const c = chip(l, x, y, { ...o, start: (o.start ?? 0.8) + k * 0.15 }); out.push(...c.layers); x += c.w + 14; });
  return out;
}
const float = (y, d, amp = 10) => track("y", [[0, y], [d / 2, y - amp, "easeInOut"], [d, y, "easeInOut"]]);
function chip3d(d, opts = {}) {
  const pins = [];
  for (const side of [-1, 1]) for (const off of [-0.9, -0.3, 0.3, 0.9]) {
    pins.push({ id: `pinx${side > 0 ? "p" : "n"}${pins.length}`, geometry: "box", material: "liquidMetal", color: "#c9d6e2", x: side * 1.42, y: -0.22, z: off, scaleX: 0.24, scaleY: 0.05, scaleZ: 0.12 });
    pins.push({ id: `pinz${side > 0 ? "p" : "n"}${pins.length}`, geometry: "box", material: "liquidMetal", color: "#c9d6e2", x: off, y: -0.22, z: side * 1.42, scaleX: 0.12, scaleY: 0.05, scaleZ: 0.24 });
  }
  const a = opts.assemble ?? 0.4;
  return [
    { id: "pcb", geometry: "box", material: "standard", color: "#10283c", y: -0.2, scaleX: 2.6, scaleY: 0.16, scaleZ: 2.6, roughness: 0.6 },
    { id: "die", geometry: "box", material: "liquidMetal", color: "$accent", y: -0.04, scaleX: 1.3, scaleY: 0.14, scaleZ: 1.3,
      ...(a < 0 ? {} : { tracks: [track("y", [[0, 1.6], [a + 1.4, -0.04, "easeOut"]])] }) },
    { id: "lid", geometry: "box", material: "glass", color: "#dff6ff", y: 0.12, scaleX: 1.75, scaleY: 0.1, scaleZ: 1.75,
      ...(a < 0 ? {} : { tracks: [track("y", [[0, 2.6], [a + 0.8, 2.6], [a + 2.4, 0.12, "easeOut"]]), track("opacity", [[0, 0], [a + 0.8, 0], [a + 1.6, 1]])] }) },
    ...pins,
    ...(opts.orbs ? [0, 1, 2, 3].map((k) => ({ id: `orb${k}`, geometry: "sphere", material: k % 2 ? "glass" : "liquidMetal", color: k % 2 ? "#e6fbff" : "$secondary",
      x: [-1.9, 1.9, 1.7, -1.7][k], z: [1.2, -1.2, 1.4, -1.4][k], y: 0.9, scaleX: 0.28, scaleY: 0.28, scaleZ: 0.28,
      tracks: [track("y", [[0, 0.9 + k * 0.1], [d / 2, 1.3 + k * 0.1], [d, 0.9 + k * 0.1]], )] })) : []),
  ];
}

const scenes = [];
const TOTAL = 9;
const BG = { type: "linear", color: "#050d17", color2: "#0b2236", angle: 35, grid: true, gridSize: 40, gridOpacity: 0.045 };
function scene(id, name, d, content) {
  const i = scenes.length;
  scenes.push({ id, name: `${String(i + 1).padStart(2, "0")} ${name}`, duration: d, background: BG, layers: [...atmosphere(i, d), ...content, ...rails(i, d, TOTAL)] });
}

// 1. Introduction: a chip assembles in 3D while the title builds.
{
  const d = 9;
  scene("intro", "ARM architecture", d, [
    { id: "chip3d", type: "scene3d", name: "Assembling chip", x: 720, y: 110, width: 840, height: 680, objects: chip3d(d),
      cameraDistance: 7.6, cameraAzimuth: -32, cameraElevation: 30, fov: 40, lightIntensity: 3.4, lightColor: "#ffffff", mirror: true, ground: true,
      start: 0, enter: "fade", enterDuration: 1.2,
      tracks: [track("cameraAzimuth", [[0, -32], [d, 24, "easeInOut"]]), track("cameraDistance", [[0, 8.4], [d, 6.6, "easeInOut"]])] },
    text("ARM", 96, 190, 124, { weight: 800, fill: "$accent", enter: "rise", start: 0.3, shadowBlur: 30, shadowY: 0, shadowColor: "#13c8e680" }),
    text("Architecture", 100, 330, 84, { weight: 800, enter: "rise", start: 0.6, shadowBlur: 18, shadowY: 8, shadowColor: "#00000080" }),
    rect(104, 450, 0, 6, "$secondary", { name: "Underline", radius: 3, enter: "none", start: 1.1, tracks: [track("width", [[1.1, 0], [1.9, 280, "easeOut"]])] }),
    text("The RISC design inside billions of phones,\nlaptops, cars and cloud servers.", 102, 486, 28, { fill: "$muted", lineHeight: 1.35, start: 1.3, enter: "fade" }),
    ...chipRow(["RISC", "Load / Store", "64-bit AArch64", "Energy-efficient"], 100, 610, { start: 1.8 }),
    text("Originally Acorn RISC Machine (1985), later Advanced RISC Machines.", 102, 728, 18, { fill: "$muted", start: 2.6, enter: "fade" }),
    ...[["cpu", 790, 160], ["smartphone", 1460, 190], ["laptop", 1470, 640], ["server", 800, 690], ["car", 1140, 120]].map(([s, x, y], k) =>
      symbol(s, x, y, 46, { fill: k % 2 ? "$secondary" : "$accent", opacity: 0.85, start: 2 + k * 0.25, enter: "scale", tracks: [float(y, d, 12)] })),
  ]);
}

// 2. Business model: Arm licenses designs; partners ship chips.
{
  const d = 10;
  const devices = [["smartphone", "Phones & tablets", "Cortex-A application SoCs"], ["laptop", "Laptops & PCs", "Arm-based PC processors"],
    ["server", "Cloud servers", "Neoverse data-centre CPUs"], ["car", "Cars & IoT", "Cortex-R real-time · Cortex-M MCUs"]];
  const layers = [
    ...heading("One architecture, many chips", "Arm designs the blueprint; partners build and ship the silicon."),
    ...card("arm", 100, 330, 330, 220, { stroke: "$accent", start: 0.5 }),
    symbol("cpu", 26, 26, 48, { parentId: "arm", enter: "none" }),
    text("Arm", 26, 88, 38, { parentId: "arm", weight: 800, enter: "none" }),
    text("Designs the instruction set\narchitecture (ISA) and the\nCPU core IP", 26, 140, 18, { parentId: "arm", fill: "$muted", lineHeight: 1.3, enter: "none" }),
    ...card("licence", 560, 330, 390, 220, { start: 1.2 }),
    symbol("scroll-text", 26, 26, 48, { parentId: "licence", fill: "$secondary", enter: "none" }),
    text("Licence", 26, 88, 38, { parentId: "licence", weight: 800, enter: "none" }),
    text("Architecture licence → own cores\nCore licence → Cortex / Neoverse IP", 26, 144, 18, { parentId: "licence", fill: "$muted", lineHeight: 1.4, enter: "none" }),
    line({ from: "arm", to: "licence", fromAnchor: "right", toAnchor: "left", arrow: true, particles: 6, start: 1.0 }),
  ];
  devices.forEach(([s, t, sub], k) => {
    const id = `dev${k}`, at = 2.1 + k * 0.35;
    layers.push(...card(id, 1080, 230 + k * 140, 420, 112, { start: at, enter: "slide" }),
      symbol(s, 22, 32, 46, { parentId: id, fill: k % 2 ? "$secondary" : "$accent", enter: "none" }),
      text(t, 90, 22, 26, { parentId: id, weight: 700, enter: "none" }),
      text(sub, 90, 62, 17, { parentId: id, fill: "$muted", enter: "none" }),
      line({ from: "licence", to: id, fromAnchor: "right", toAnchor: "left", curve: "bezier", arrow: true, particles: 4, stroke: "$secondary", strokeWidth: 2, start: at - 0.2 }));
  });
  layers.push(text("Arm licenses designs rather than manufacturing chips. Partners integrate the cores into their own systems-on-chip.", 100, 790, 19, { fill: "$muted", start: 3.8 }));
  scene("business", "Licensing model", d, layers);
}

// 3. Load / store: only loads and stores touch memory; arithmetic works on registers.
{
  const d = 10;
  const layers = [
    ...heading("Load / store architecture", "Arithmetic works on registers. Only LDR and STR touch memory."),
    ...card("mem", 100, 240, 300, 430, { start: 0.4 }),
    text("Memory", 24, 20, 26, { parentId: "mem", weight: 800, enter: "none" }),
  ];
  ["0x1000", "0x1008", "0x1010", "0x1018", "0x1020"].forEach((a, k) => {
    const hot = k === 2;
    layers.push(rect(24, 76 + k * 66, 252, 54, hot ? "#13c8e622" : "#ffffff08", { parentId: "mem", radius: 10, stroke: hot ? "$accent" : "$line", strokeWidth: 1.5, enter: "none" }),
      text(a, 40, 90 + k * 66, 19, { parentId: "mem", fontFamily: "mono", fill: "$muted", enter: "none" }));
    if (!hot) layers.push(text(["17", "903", "", "0", "256"][k], 190, 88 + k * 66, 22, { parentId: "mem", width: 70, align: "right", fontFamily: "mono", enter: "none" }));
  });
  layers.push(counter(160, 88 + 2 * 66, 100, 32, { parentId: "mem", from: 41, to: 42, size: 22, fill: "$accent", fontFamily: "mono",
      tracks: [track("progress", [[0, 0], [6.5, 0], [6.8, 1]])] }),
    ...card("regs", 620, 240, 300, 220, { start: 0.7 }),
    text("Registers", 24, 20, 26, { parentId: "regs", weight: 800, enter: "none" }),
    text("X0", 24, 86, 22, { parentId: "regs", fontFamily: "mono", fill: "$muted", enter: "none" }),
    text("0x1010", 150, 86, 22, { parentId: "regs", fontFamily: "mono", enter: "none" }),
    text("X1", 24, 146, 22, { parentId: "regs", fontFamily: "mono", fill: "$muted", enter: "none" }),
    counter(150, 144, 120, 32, { parentId: "regs", from: 41, to: 42, size: 24, fill: "$secondary", fontFamily: "mono", tracks: [track("progress", [[0, 0], [4.5, 0], [4.8, 1]])] }),
    rect(1080, 250, 0, 0, "none", { name: "spacer", enter: "none", opacity: 0 }),
    pathL("M0 0 L80 0 L110 50 L140 0 L220 0 L170 150 L50 150 Z", 1120, 260, 220, 150, { name: "ALU", fill: "#ffb54722", stroke: "$secondary", strokeWidth: 3, enter: "draw", start: 1.0 }),
    text("ALU", 1200, 360, 28, { weight: 800, fill: "$secondary", start: 1.4, enter: "fade" }),
    line({ x: 405, y: 400, x2: 615, y2: 340, arrow: true, start: 1.8, particles: 3 }),
    text("LDR", 470, 318, 20, { fontFamily: "mono", weight: 700, fill: "$accent", start: 2.0, enter: "fade" }),
    line({ x: 925, y: 380, x2: 1135, y2: 330, arrow: true, stroke: "$secondary", start: 3.2 }),
    text("ADD", 990, 300, 20, { fontFamily: "mono", weight: 700, fill: "$secondary", start: 3.4, enter: "fade" }),
    line({ x: 1180, y: 415, x2: 925, y2: 440, arrow: true, stroke: "$secondary", curve: "bezier", start: 4.0 }),
    line({ x: 615, y: 420, x2: 405, y2: 430, arrow: true, start: 5.4, particles: 3 }),
    text("STR", 470, 440, 20, { fontFamily: "mono", weight: 700, fill: "$accent", start: 5.6, enter: "fade" }),
    circle(370, 390, 22, "$accent", { name: "Data token", enter: "scale", start: 1.8, end: 7.2, shadowBlur: 20, shadowColor: "#13c8e6",
      tracks: [track("x", [[1.8, 370], [3.0, 760, "easeInOut"], [3.6, 760], [4.2, 1220, "easeInOut"], [4.6, 1220], [5.2, 800, "easeInOut"], [5.5, 760], [6.5, 370, "easeInOut"]]),
        track("y", [[1.8, 390], [3.0, 380, "easeInOut"], [3.6, 380], [4.2, 380, "easeInOut"], [4.6, 400], [5.2, 390, "easeInOut"], [5.5, 400], [6.5, 410, "easeInOut"]])] }),
    ...card("code", 620, 530, 880, 190, { start: 1.0 }),
    rect(16, 26, 848, 40, "#13c8e622", { parentId: "code", name: "Highlight", radius: 8, enter: "none",
      tracks: [track("y", [[0, 26], [3.3, 26], [3.6, 72, "easeInOut"], [5.2, 72], [5.5, 118, "easeInOut"]])] }),
    text("LDR  X1, [X0]        // load the word at 0x1010\nADD  X1, X1, #1      // compute in a register\nSTR  X1, [X0]        // write the result back", 32, 30, 24,
      { parentId: "code", fontFamily: "mono", lineHeight: 1.9, enter: "none", width: 820 }),
    text("Every A64 instruction is a fixed 32 bits wide, which keeps decoding simple and fast.", 100, 760, 19, { fill: "$muted", start: 6.8 }));
  scene("loadstore", "Load / store", d, layers.filter((l) => l.name !== "spacer"));
}

// 4. Registers: the AArch64 general-purpose and SIMD register files.
{
  const d = 10;
  const roleOf = (n) => n <= 7 ? ["$accent", "args"] : n === 8 ? ["#7fd1ff", "ind"] : n <= 15 ? ["$muted", "temp"] : n <= 17 ? ["#b48cff", "ip"]
    : n === 18 ? ["#ff7a90", "plat"] : n <= 28 ? ["$secondary", "saved"] : n === 29 ? ["#7dffb0", "FP"] : n === 30 ? ["#7dffb0", "LR"] : ["#ff7a90", "SP"];
  const layers = [...heading("31 general-purpose registers", "X0–X30 are 64 bits wide; W0–W30 name their lower 32 bits.")];
  for (let n = 0; n < 32; n++) {
    const c = n % 8, r = Math.floor(n / 8), [col] = roleOf(n), x = 100 + c * 148, y = 230 + r * 78, at = 0.6 + (c + r) * 0.07;
    layers.push(rect(x, y, 136, 66, "#ffffff08", { name: `Reg ${n}`, radius: 12, stroke: col, strokeWidth: 2, start: at, enter: "scale" }),
      text(n === 31 ? "SP / XZR" : `X${n}`, x, y + 8, n === 31 ? 20 : 24, { width: 136, align: "center", weight: 700, fontFamily: "mono", start: at, enter: "fade" }),
      text(n === 29 ? "frame ptr" : n === 30 ? "link reg" : n === 31 ? "reg 31" : roleOf(n)[1], x, y + 38, 14, { width: 136, align: "center", fill: col, start: at, enter: "fade" }));
  }
  const legend = [["$accent", "X0–X7\narguments / results"], ["$muted", "X9–X15\ntemporaries"], ["$secondary", "X19–X28\ncallee-saved"], ["#7dffb0", "X29 frame pointer\nX30 link register"]];
  legend.forEach(([c, t], k) => layers.push(circle(1310, 238 + k * 76, 14, c, { start: 2.2 + k * 0.15, enter: "scale" }),
    text(t, 1336, 230 + k * 76, 15, { width: 170, fill: "$muted", start: 2.2 + k * 0.15, enter: "fade" })));
  layers.push(text("V0–V31 · 128-bit SIMD & floating point (NEON)", 100, 570, 24, { weight: 700, start: 3.4, enter: "rise" }));
  for (let k = 0; k < 32; k++) {
    layers.push(rect(100 + k * 43.5, 620, 36, 0, k % 4 ? "$accent" : "$secondary", { name: `V${k}`, radius: 6, opacity: 0.85, start: 3.6, enter: "none",
      tracks: [track("height", [[3.6 + k * 0.04, 0], [4.3 + k * 0.04, 110, "easeOut"]]), track("opacity", [[5, 0.85], [6 + (k % 8) * 0.12, 0.35, "easeInOut"], [7.4, 0.85, "easeInOut"]])] }));
  }
  layers.push(text("V0", 100, 740, 15, { fill: "$muted", fontFamily: "mono", start: 4 }), text("V31", 1450, 740, 15, { fill: "$muted", fontFamily: "mono", start: 4 }),
    text("SVE / SVE2 extend vectors to any length from 128 to 2048 bits, so the same code scales across implementations.", 100, 780, 19, { fill: "$muted", start: 5.2 }));
  scene("registers", "Registers", d, layers);
}

// 5. Pipeline: the classic five-stage pipeline overlaps instructions.
{
  const d = 10;
  const stages = [["F", "Fetch", "$accent"], ["D", "Decode", "#7fd1ff"], ["E", "Execute", "$secondary"], ["M", "Memory", "#b48cff"], ["W", "Write back", "#7dffb0"]];
  const instrs = ["LDR X1,[X0]", "ADD X2,X3,X4", "SUB X5,X6,#8", "STR X7,[X0,#16]", "CBZ X5,done"];
  const tAt = (c) => 0.8 + c * 0.6;
  const layers = [...heading("Pipelining", "A new instruction starts every cycle, so five are in flight at once.")];
  for (let c = 0; c < 9; c++) layers.push(text(`C${c + 1}`, 330 + c * 126, 226, 17, { width: 112, align: "center", fill: "$muted", fontFamily: "mono", start: 0.4 + c * 0.04, enter: "fade" }));
  layers.push(rect(324, 220, 124, 440, "#ffffff0d", { name: "Cycle cursor", radius: 12, stroke: "$accent", strokeWidth: 1.5, start: 0.8, enter: "fade",
    tracks: [track("x", [[tAt(0), 324], [tAt(8), 324 + 8 * 126]])] }));
  instrs.forEach((ins, r) => {
    layers.push(text(ins, 100, 286 + r * 78, 19, { width: 220, fontFamily: "mono", weight: 600, start: 0.5 + r * 0.1, enter: "slide" }));
    stages.forEach(([s, , col], k) => {
      const x = 330 + (r + k) * 126, y = 270 + r * 78, at = tAt(r + k);
      layers.push(rect(x, y, 112, 62, col, { name: `I${r + 1} ${s}`, radius: 10, opacity: 0.88, start: at, enter: "scale", enterDuration: 0.35 }),
        text(s, x, y + 14, 26, { width: 112, align: "center", weight: 800, fill: "#06121e", start: at, enter: "fade", enterDuration: 0.3 }));
    });
  });
  stages.forEach(([s, name, col], k) => {
    const x = 100 + k * 220;
    layers.push(rect(x, 700, 30, 30, col, { radius: 8, start: 1 + k * 0.1, enter: "scale" }),
      text(`${s}  ${name}`, x + 42, 702, 18, { weight: 600, start: 1 + k * 0.1, enter: "fade" }));
  });
  layers.push(text("completed", 1300, 690, 16, { width: 200, align: "right", fill: "$muted", start: 3 }),
    counter(1300, 712, 200, 44, { from: 0, to: 5, size: 38, fill: "$accent", align: "right", suffix: " / 5", start: 3, enter: "fade",
      tracks: [track("progress", [[tAt(4) + 0.3, 0], [tAt(8) + 0.3, 1]])] }),
    text("Modern Arm cores go further: superscalar, out-of-order execution and much deeper pipelines.", 100, 780, 19, { fill: "$muted", start: 6.2 }));
  scene("pipeline", "Pipeline", d, layers);
}

// 6. Memory hierarchy: small fast caches hide slow DRAM.
{
  const d = 10, cx = 620;
  const levels = [["Registers", 260, "$accent"], [null, 440, "#7fd1ff"], ["L2 cache · per core or cluster", 640, "$secondary"],
    ["L3 / system-level cache · shared", 820, "#b48cff"], ["DRAM · main memory", 1000, "#7dffb0"]];
  const layers = [...heading("Memory hierarchy", "Caches keep hot data close to the core.")];
  levels.forEach(([label, w, col], k) => {
    const y = 226 + k * 104, at = 0.5 + k * 0.25;
    if (label) {
      layers.push(rect(cx - w / 2, y, w, 88, `${col.startsWith("$") ? theme[col.slice(1)] : col}1a`, { name: label, radius: 14, stroke: col, strokeWidth: 2, start: at, enter: "scale" }),
        text(label, cx - w / 2, y + 28, 24, { width: w, align: "center", weight: 700, start: at, enter: "fade" }));
    } else {
      ["L1 I-cache", "L1 D-cache"].forEach((t, j) => layers.push(
        rect(cx - w / 2 + j * (w / 2 + 6), y, w / 2 - 6, 88, "#7fd1ff1a", { name: t, radius: 14, stroke: col, strokeWidth: 2, start: at, enter: "scale" }),
        text(t, cx - w / 2 + j * (w / 2 + 6), y + 28, 22, { width: w / 2 - 6, align: "center", weight: 700, start: at, enter: "fade" })));
    }
  });
  layers.push(line({ x: 1200, y: 236, x2: 1200, y2: 720, stroke: "$line", strokeWidth: 3, start: 1.6 }),
    text("Faster · smaller", 1224, 230, 20, { weight: 700, fill: "$accent", start: 1.8 }),
    text("Larger · slower", 1224, 700, 20, { weight: 700, fill: "#7dffb0", start: 1.8 }),
    text("per core", 1224, 360, 17, { fill: "$muted", start: 2 }), text("shared", 1224, 568, 17, { fill: "$muted", start: 2 }),
    circle(cx - 14, 680, 28, "$secondary", { name: "Miss packet", start: 2.6, end: 5.6, enter: "scale", shadowBlur: 22, shadowColor: "#ffb547",
      tracks: [track("y", [[2.6, 680], [5.0, 256, "easeInOut"]])] }),
    text("Cache miss: data travels all the way up from DRAM", 100, 780, 20, { fill: "$secondary", weight: 600, start: 2.6, end: 5.8 }),
    circle(cx + 80, 360, 28, "$accent", { name: "Hit packet", start: 6.0, end: 8.4, enter: "scale", shadowBlur: 22, shadowColor: "#13c8e6",
      tracks: [track("y", [[6.0, 360], [6.6, 256, "easeOut"]])] }),
    text("Cache hit: the next access is served from L1 almost immediately", 100, 780, 20, { fill: "$accent", weight: 600, start: 6.0 }));
  scene("memory", "Memory hierarchy", d, layers);
}

// 7. System on chip: cores, accelerators and memory share one coherent fabric.
{
  const d = 11;
  const blk = (id, x, y, w, h, label, col, at, size = 21) => [
    rect(x, y, w, h, `${col.startsWith("$") ? theme[col.slice(1)] : col}22`, { id, name: label, radius: 12, stroke: col, strokeWidth: 2, start: at, enter: "scale" }),
    text(label, x, y + (h - size * 1.2) / 2 - 2, size, { width: w, align: "center", weight: 700, start: at, enter: "fade" })];
  const layers = [
    ...heading("System on chip", "The CPU is one block among many on a modern Arm SoC."),
    rect(100, 210, 1080, 550, "#ffffff05", { name: "Die", radius: 22, stroke: "$accent", strokeWidth: 2, dash: undefined, start: 0.3, enter: "draw", shadowBlur: 40, shadowColor: "#13c8e633" }),
    ...card("cluster", 140, 250, 520, 300, { start: 0.7, stroke: "$accent" }),
    text("CPU cluster · DynamIQ", 20, 16, 20, { parentId: "cluster", weight: 800, fill: "$accent", enter: "none" }),
    ...[20, 150].flatMap((x, k) => [rect(x, 60, 110, 110, "#ffb54733", { parentId: "cluster", name: `big ${k}`, radius: 12, stroke: "$secondary", strokeWidth: 2, enter: "none" }),
      text("big", x, 98, 22, { parentId: "cluster", width: 110, align: "center", weight: 800, fill: "$secondary", enter: "none" })]),
    ...[[280, 60], [360, 60], [280, 140], [360, 140]].flatMap(([x, y], k) => [rect(x, y, 70, 70, "#13c8e622", { parentId: "cluster", name: `LITTLE ${k}`, radius: 10, stroke: "$accent", strokeWidth: 2, enter: "none" }),
      text("LITTLE", x, y + 26, 13, { parentId: "cluster", width: 70, align: "center", weight: 700, fill: "$accent", enter: "none" })]),
    rect(20, 228, 480, 52, "#ffffff0d", { parentId: "cluster", name: "DSU", radius: 10, stroke: "$line", strokeWidth: 1.5, enter: "none" }),
    text("Shared L3 · DSU", 20, 242, 19, { parentId: "cluster", width: 480, align: "center", weight: 700, fill: "$muted", enter: "none" }),
    ...[["acc0", "GPU · graphics", "#7fd1ff"], ["acc1", "NPU · machine learning", "#b48cff"], ["acc2", "ISP & media engines", "#7dffb0"], ["acc3", "Security enclave", "#ff7a90"]]
      .flatMap(([id, l, c], k) => blk(id, 700, 250 + k * 76, 440, 60, l, c, 1.3 + k * 0.2, 20)),
    ...blk("noc", 140, 580, 1000, 56, "Coherent interconnect · AMBA AXI / CHI", "$secondary", 2.2, 21),
    ...blk("io", 140, 670, 380, 64, "I/O · USB · PCIe · display", "$muted", 2.6, 19),
    ...blk("memctl", 760, 670, 380, 64, "Memory controller", "#7dffb0", 2.8, 20),
    ...blk("dram", 1270, 670, 230, 64, "External DRAM", "#7dffb0", 3.2, 20),
    line({ x: 400, y: 552, x2: 400, y2: 578, particles: 2, start: 2.4, enter: "fade" }),
    line({ x: 920, y: 540, x2: 920, y2: 578, particles: 2, stroke: "#b48cff", start: 2.5, enter: "fade" }),
    line({ x: 330, y: 638, x2: 330, y2: 668, particles: 2, stroke: "$muted", strokeWidth: 2, start: 2.8, enter: "fade" }),
    line({ x: 950, y: 638, x2: 950, y2: 668, particles: 2, stroke: "#7dffb0", strokeWidth: 2, start: 3.0, enter: "fade" }),
    line({ from: "memctl", to: "dram", fromAnchor: "right", toAnchor: "left", arrow: true, particles: 4, stroke: "#7dffb0", start: 3.4 }),
    symbol("zap", 1240, 250, 40, { fill: "$secondary", start: 4, enter: "scale" }),
    text("big.LITTLE", 1294, 252, 26, { weight: 800, fill: "$secondary", start: 4, enter: "fade" }),
    text("Heavy, bursty work moves\nto big cores; background\ntasks stay on efficient\nLITTLE cores, saving\nbattery.", 1240, 310, 19, { fill: "$muted", lineHeight: 1.4, start: 4.3, enter: "fade" }),
    circle(441, 401, 28, "$accent", { name: "Task", start: 4.6, enter: "scale", shadowBlur: 24, shadowColor: "#13c8e6",
      tracks: [track("x", [[5.4, 441], [6.4, 331, "easeInOut"]]), track("y", [[5.4, 401], [6.4, 351, "easeInOut"]]), track("opacity", [[6.4, 1], [8, 1], [8.4, 0]])] }),
    text("task", 422, 444, 15, { width: 60, align: "center", weight: 700, fill: "$accent", start: 4.6, end: 5.4, enter: "fade" }),
  ];
  scene("soc", "System on chip", d, layers);
}

// 8. Privilege and security: exception levels and TrustZone.
{
  const d = 11;
  const box = (x, y, w, lvl, label, col, at) => [
    rect(x, y, w, 76, `${col.startsWith("$") ? theme[col.slice(1)] : col}1c`, { name: lvl, radius: 14, stroke: col, strokeWidth: 2, start: at, enter: "scale" }),
    text(lvl, x + 22, y + 22, 26, { width: 120, weight: 800, fontFamily: "mono", fill: col, start: at, enter: "fade" }),
    text(label, x + 150, y + 24, 21, { width: w - 170, weight: 600, start: at, enter: "fade" })];
  const rows = [["EL0", "Applications", "S-EL0", "Trusted applications"], ["EL1", "OS kernel", "S-EL1", "Trusted OS"], ["EL2", "Hypervisor", "S-EL2", "Secure partition mgr (v8.4-A+)"]];
  const layers = [
    ...heading("Exception levels & TrustZone", "Privilege rises from EL0 to EL3; TrustZone splits a Normal and a Secure world."),
    text("NORMAL WORLD", 100, 204, 18, { weight: 800, fill: "$accent", start: 0.5 }),
    symbol("lock", 860, 198, 26, { fill: "#ff7a90", start: 0.6, enter: "scale" }),
    text("SECURE WORLD", 896, 204, 18, { weight: 800, fill: "#ff7a90", start: 0.6 }),
    rect(800, 236, 2, 330, "$line", { name: "World divider", enter: "fade", start: 0.6 }),
  ];
  rows.forEach(([a, la, b, lb], k) => layers.push(...box(100, 240 + k * 110, 560, a, la, "$accent", 0.8 + k * 0.2), ...box(860, 240 + k * 110, 640, b, lb, "#ff7a90", 1.0 + k * 0.2)));
  layers.push(...box(100, 590, 1400, "EL3", "Secure monitor · switches between the worlds (trusted firmware)", "$secondary", 1.8),
    line({ x: 690, y: 278, x2: 690, y2: 380, arrow: true, strokeWidth: 2.5, start: 2.2 }),
    text("SVC", 702, 312, 17, { fontFamily: "mono", weight: 700, fill: "$accent", start: 2.2 }),
    line({ x: 690, y: 400, x2: 690, y2: 490, arrow: true, strokeWidth: 2.5, stroke: "#7fd1ff", start: 2.4 }),
    text("HVC", 702, 428, 17, { fontFamily: "mono", weight: 700, fill: "#7fd1ff", start: 2.4 }),
    line({ x: 760, y: 388, x2: 760, y2: 600, arrow: true, strokeWidth: 2.5, stroke: "$secondary", curve: "bezier", start: 2.6 }),
    text("SMC", 724, 540, 17, { fontFamily: "mono", weight: 700, fill: "$secondary", start: 2.6 }),
    circle(366, 264, 30, "#ffffff", { name: "Request", start: 3, enter: "scale", shadowBlur: 26, shadowColor: "#13c8e6",
      tracks: [track("y", [[3.4, 264], [4.2, 374, "easeInOut"], [5.4, 374], [6.2, 614, "easeInOut"], [7.0, 614], [8.0, 374, "easeInOut"]]),
        track("x", [[4.6, 366], [5.4, 760, "easeInOut"], [6.2, 760], [6.6, 830, "easeInOut"], [7.0, 860], [8.0, 1166, "easeInOut"]])] }));
  const caps = [[3.0, 4.6, "An app makes a system call: SVC traps from EL0 into the OS at EL1.", "$accent"],
    [4.6, 6.6, "The OS needs a trusted service: SMC traps to the secure monitor at EL3.", "$secondary"],
    [6.6, d, "EL3 switches worlds and enters the Trusted OS at S-EL1; ERET returns down a level.", "#ff7a90"]];
  caps.forEach(([s, e, t, c]) => layers.push(text(t, 100, 700, 22, { weight: 600, fill: c, start: s, end: e, enter: "fade", exitDuration: 0.25 })));
  layers.push(text("Higher exception levels have more privilege. Secure memory and peripherals stay invisible to the Normal world.", 100, 780, 19, { fill: "$muted", start: 4 }));
  scene("privilege", "Privilege & TrustZone", d, layers);
}

// 9. Summary.
{
  const d = 9;
  const bullets = ["Load / store RISC with fixed 32-bit A64 instructions", "31 × 64-bit registers plus NEON and SVE vectors",
    "Pipelined, superscalar, out-of-order cores", "Cache hierarchy on a coherent SoC fabric", "big.LITTLE efficiency for every workload", "Exception levels and TrustZone security"];
  const layers = [
    { id: "chip3dEnd", type: "scene3d", name: "Finale chip", x: 860, y: 120, width: 700, height: 640, objects: chip3d(d, { assemble: -2, orbs: true }),
      cameraDistance: 7, cameraAzimuth: 20, cameraElevation: 26, fov: 40, lightIntensity: 3.4, lightColor: "#ffffff", mirror: true, ground: true, enter: "fade", enterDuration: 1,
      tracks: [track("cameraAzimuth", [[0, 20], [d, 80, "easeInOut"]])] },
    text("Simple instructions.\nEfficient by design.", 100, 120, 62, { weight: 800, lineHeight: 1.15, start: 0.3, enter: "rise", shadowBlur: 20, shadowY: 8, shadowColor: "#00000080" }),
  ];
  bullets.forEach((b, k) => layers.push(symbol("circle-check", 100, 324 + k * 60, 32, { fill: k % 2 ? "$secondary" : "$accent", start: 1 + k * 0.3, enter: "scale" }),
    text(b, 148, 324 + k * 60, 23, { weight: 600, start: 1 + k * 0.3, enter: "slide" })));
  layers.push(text("From microcontrollers to supercomputers.", 100, 720, 32, { weight: 800, fill: "$accent", start: 3.4, enter: "rise", shadowBlur: 24, shadowColor: "#13c8e680" }));
  scene("summary", "Summary", d, layers);
}

const project = { version: 1, name: "ARM Architecture", width: W, height: H, fps: 30, theme, assets: {}, scenes };
M.assertValid(project);
const out = path.join(__dirname, "..", "examples", "arm-architecture.motion.json");
fs.writeFileSync(out, JSON.stringify(project, null, 2) + "\n");
console.log(`Wrote ${path.relative(process.cwd(), out)}: ${scenes.length} scenes, ${scenes.reduce((s, x) => s + x.duration, 0)}s, ` +
  `${scenes.reduce((s, x) => s + x.layers.length, 0)} layers.`);
