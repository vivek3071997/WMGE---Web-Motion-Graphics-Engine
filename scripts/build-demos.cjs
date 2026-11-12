#!/usr/bin/env node
"use strict";
// Builds the demo gallery (examples/demos): manifest, Smart-director demo projects, poster frames and optional MP4s.
//   node scripts/build-demos.cjs                         manifest + director projects + posters
//   node scripts/build-demos.cjs --video --ffmpeg <path>  also render missing MP4s (1280x720) into examples/demos/renders
//   options: --only key1,key2   --force (re-render existing videos)   --no-posters
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const M = require("../src/engine.js");
const D = require("../src/director.js");

const root = path.resolve(__dirname, "..");
const out = path.join(root, "examples", "demos");
const rel = (p) => path.relative(root, p).split(path.sep).join("/");
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const option = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : undefined);
const only = option("only")?.split(",");

const stories = JSON.parse(fs.readFileSync(path.join(root, "examples", "showcase", "manifest.json"), "utf8"));
const storyLabel = { technology: "Technology", scenery: "Scenery", food: "Food / Recipe", meeting: "Meeting", social: "Social" };

const BRIEFS = [
  ["director-launch", "Launch video for our AI code review app", "Product launch"],
  ["director-recipe", "Recipe for fluffy pancakes: flour, eggs, milk, butter", "Recipe"],
  ["director-travel", "Weekend in Kyoto", "Travel"],
  ["director-results", "Quarterly results: revenue grew 42% to $3.5m, 1200 new customers", "Results"],
  ["director-community", "Celebrate 10k followers with our community", "Community"],
];

const DEMOS = [
  { key: "arm-architecture", category: "Explainers", title: "ARM Architecture",
    summary: "A 90-second technical film: a 3D chip assembles, then load/store, registers, pipelining, caches, the SoC and TrustZone explained step by step.",
    project: "examples/arm-architecture.motion.json", prompt: "docs/ARM_ARCHITECTURE.md", poster: { scene: 0, t: 7 }, tags: ["3D", "Glass", "Liquid metal", "Diagrams"] },
  ...stories.map((s) => ({ key: s.key, category: "Stories", title: s.title, summary: s.logline,
    project: `examples/showcase/${s.key}.motion.json`, prompt: `docs/showcase-prompts/${s.key}.md`,
    posterFile: `examples/showcase/previews/${s.key}-1.png`, video: `examples/showcase/renders/${s.key}.mp4`,
    tags: [storyLabel[s.key], "Original story", "Illustrated"] })),
  { key: "systems-in-motion", category: "Templates", title: "Systems in Motion",
    summary: "Six editable technical templates: compute pipeline, layered architecture, data comparison, signal processing, timeline and an evidence card.",
    project: "examples/systems-in-motion.motion.json", prompt: "docs/EXAMPLE_COOKBOOK.md", poster: { scene: 1, t: 6 }, tags: ["Charts", "Connectors", "Counters"] },
  { key: "advanced", category: "Materials & 3D", title: "Material Studies",
    summary: "Glass and mirror reflection, liquid metal, a water surface, atmospheric gas and animated shadows, each as its own study.",
    project: "examples/advanced.motion.json", prompt: "docs/EXAMPLE_COOKBOOK.md", poster: { scene: 0, t: 5 }, tags: ["Glass", "Water", "Gas", "Shadows"] },
  { key: "image-logo", category: "Templates", title: "Custom Logo Reveal",
    summary: "Brings your own image asset into an animated brand reveal.",
    project: "examples/image-logo.motion.json", poster: { scene: 0, t: 5 }, tags: ["Images", "Branding"] },
  { key: "catalog", category: "Catalog", title: "Complete Element Catalog",
    summary: "All 35 reference scenes: every element type, 3D geometry and material, background and technical layout, each with its prompt in the cookbook.",
    project: "examples/catalog.motion.json", prompt: "docs/EXAMPLE_COOKBOOK.md", poster: { scene: 19, t: 5 }, noVideo: true, tags: ["Reference", "Every element"] },
  ...BRIEFS.map(([key, brief, label]) => ({ key, category: "Smart director", title: `“${brief}”`, brief,
    summary: `${label}: a complete multi-scene film the Smart Director built from this one-line brief. Open it in the studio to add your local illustrations.`,
    project: `examples/demos/projects/${key}.motion.json`, poster: { scene: 0, t: 3 }, tags: ["One-line brief", label] })),
];

function writeDirectorProjects() {
  fs.mkdirSync(path.join(out, "projects"), { recursive: true });
  for (const d of DEMOS.filter((x) => x.brief)) {
    const { project } = D.build(d.brief, { library: [] });
    M.assertValid(project);
    fs.writeFileSync(path.join(root, d.project), JSON.stringify(project, null, 2) + "\n");
  }
}

function manifest() {
  return DEMOS.map((d) => {
    const p = M.assertValid(JSON.parse(fs.readFileSync(path.join(root, d.project), "utf8")));
    return {
      key: d.key, category: d.category, title: d.title, summary: d.summary, tags: d.tags,
      scenes: p.scenes.length, duration: p.scenes.reduce((s, x) => s + x.duration, 0),
      project: d.project, poster: d.posterFile || `examples/demos/posters/${d.key}.jpg`,
      video: d.noVideo ? null : d.video || `examples/demos/renders/${d.key}.mp4`,
      ...(d.prompt ? { prompt: d.prompt } : {}), ...(d.brief ? { brief: d.brief } : {}),
    };
  });
}

async function posters(list) {
  const { chromium } = require("playwright");
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(path.join(root, "index.html")).href + "?export=1");
    await page.waitForFunction(() => window.ready);
    await page.addStyleTag({ content: "#toast { display:none !important }" });
    fs.mkdirSync(path.join(out, "posters"), { recursive: true });
    for (const d of DEMOS.filter((x) => x.poster && (!only || only.includes(x.key)))) {
      const p = JSON.parse(fs.readFileSync(path.join(root, d.project), "utf8"));
      await page.evaluate((p) => MotionForgeApp.setProject(p), p);
      const s = p.scenes[d.poster.scene];
      await page.evaluate(([id, t]) => MotionForgeApp.renderFrame(id, t, { image: false }), [s.id, Math.min(d.poster.t, s.duration)]);
      await page.locator("#stage").screenshot({ path: path.join(out, "posters", `${d.key}.jpg`), type: "jpeg", quality: 84 });
      console.log("poster", d.key);
    }
  } finally { await browser.close(); }
  return list;
}

function videos(list) {
  const ffmpeg = option("ffmpeg");
  if (!ffmpeg) throw new Error("--video needs --ffmpeg <path-to-ffmpeg>");
  for (const d of list.filter((x) => x.video && x.video.startsWith("examples/demos/") && (!only || only.includes(x.key)))) {
    const file = path.join(root, d.video);
    if (fs.existsSync(file) && !flag("force")) { console.log("video exists", d.key); continue; }
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const r = spawnSync(process.execPath, [path.join(__dirname, "render.cjs"), "--project", path.join(root, d.project), "--out", file,
      "--format", "mp4", "--width", "1280", "--height", "720", "--crf", "20", "--preset", "medium", "--ffmpeg", ffmpeg], { stdio: "inherit" });
    if (r.status !== 0) throw new Error(`Video render failed for ${d.key}`);
  }
}

(async () => {
  writeDirectorProjects();
  const list = manifest();
  fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(list, null, 2) + "\n");
  console.log(`Wrote ${rel(path.join(out, "manifest.json"))}: ${list.length} demos.`);
  if (!flag("no-posters")) await posters(list);
  if (flag("video")) videos(list);
})().catch((e) => { console.error(e); process.exitCode = 1; });
