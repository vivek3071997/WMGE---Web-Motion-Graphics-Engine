#!/usr/bin/env node
"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  { spawn } = require("node:child_process"),
  { pathToFileURL } = require("node:url"),
  M = require("../src/engine.js");

const PRESETS = [
  "ultrafast", "superfast", "veryfast", "faster", "fast",
  "medium", "slow", "slower", "veryslow",
];
const OPTIONS = new Set([
  "project", "out", "scene", "fps", "width", "height", "browser",
  "format", "ffmpeg", "crf", "preset",
]);

function args(argv = process.argv.slice(2)) {
  const result = {};
  for (let i = 0; i < argv.length; i += 2) {
    const name = argv[i].slice(2);
    if (!argv[i].startsWith("--") || !OPTIONS.has(name))
      throw new Error(`Unknown option: ${argv[i]}`);
    if (!argv[i + 1] || argv[i + 1].startsWith("--"))
      throw new Error(`Option --${name} requires a value.`);
    if (Object.hasOwn(result, name))
      throw new Error(`Duplicate option: --${name}`);
    result[name] = argv[i + 1];
  }
  if (!result.project || !result.out)
    throw new Error("Usage: node scripts/render.cjs --project scene.motion.json --out folder-or-video [--format mp4|webm] [--scene id|all] [--fps 30] [--width 1920] [--height 1080] [--browser path] [--ffmpeg path] [--crf value] [--preset medium]");
  return result;
}

function settings(a, project) {
  const fps = Number(a.fps === undefined ? project.fps : a.fps),
    width = Number(a.width === undefined ? project.width : a.width),
    height = Number(a.height === undefined ? project.height : a.height);
  if (!Number.isInteger(fps) || fps < 1 || fps > 60 ||
      ![width, height].every((n) => Number.isInteger(n) && n >= 256 && n <= 4096))
    throw new Error("Use integer fps 1–60 and dimensions 256–4096.");
  if (a.format !== undefined && !["mp4", "webm"].includes(a.format))
    throw new Error("--format must be mp4 or webm.");
  if (!a.format && ["ffmpeg", "crf", "preset"].some((key) => a[key] !== undefined))
    throw new Error("--ffmpeg, --crf and --preset require --format.");
  if (a.format && path.extname(a.out).toLowerCase() !== `.${a.format}`)
    throw new Error(`--out must name a .${a.format} file.`);
  if (a.format === "mp4" && (width % 2 || height % 2))
    throw new Error("MP4 libx264/yuv420p requires even width and height.");
  if (a.preset !== undefined && (a.format !== "mp4" || !PRESETS.includes(a.preset)))
    throw new Error(`--preset is MP4-only; choose ${PRESETS.join(", ")}.`);
  const crf = Number(a.crf === undefined ? (a.format === "webm" ? 30 : 18) : a.crf),
    maxCrf = a.format === "webm" ? 63 : 51;
  if (!Number.isInteger(crf) || crf < 0 || crf > maxCrf)
    throw new Error(`--crf must be an integer from 0 to ${maxCrf}.`);
  return { fps, width, height, crf, format: a.format, preset: a.preset || "medium" };
}

function encodingArgs(config, frameDir, output) {
  const common = [
    "-hide_banner", "-loglevel", "error", "-nostdin", "-n",
    "-framerate", String(config.fps), "-start_number", "0",
    "-i", path.join(frameDir, "frame-%06d.png"), "-an",
  ];
  return common.concat(config.format === "mp4"
    ? ["-c:v", "libx264", "-crf", String(config.crf), "-preset", config.preset,
       "-pix_fmt", "yuv420p", "-movflags", "+faststart"]
    : ["-c:v", "libvpx-vp9", "-crf", String(config.crf), "-b:v", "0",
       "-pix_fmt", "yuv420p"], [output]);
}

function runFFmpeg(executable, argv, spawnProcess = spawn) {
  return new Promise((resolve, reject) => {
    let child, stderr = "";
    const failed = (error) => reject(new Error(error.code === "ENOENT"
      ? `FFmpeg executable not found: ${executable}. Install FFmpeg locally and add it to PATH, or pass --ffmpeg "C:\\path\\to\\ffmpeg.exe".`
      : `Unable to run FFmpeg (${executable}): ${error.message}`));
    try {
      child = spawnProcess(executable, argv, {
        shell: false, windowsHide: true, stdio: ["ignore", "ignore", "pipe"],
      });
    } catch (error) {
      failed(error);
      return;
    }
    child.stderr.on("data", (chunk) => {
      stderr = (stderr + chunk.toString()).slice(-16000);
    });
    child.once("error", failed);
    child.once("close", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg failed (${signal ? `signal ${signal}` : `exit ${code}`}): ${stderr.trim() || "no diagnostic output"}`));
    });
  });
}

function exists(file) {
  try { fs.lstatSync(file); return true; }
  catch (error) { if (error.code === "ENOENT") return false; throw error; }
}

async function main(argv = process.argv.slice(2)) {
  let browser, privateDir;
  try {
    const a = args(argv),
      project = M.assertValid(JSON.parse(fs.readFileSync(a.project, "utf8"))),
      config = settings(a, project),
      { fps, width, height } = config,
      out = path.resolve(a.out),
      scenes = !a.scene || a.scene === "all" ? project.scenes
        : project.scenes.filter((s) => s.id === a.scene);
    if (!scenes.length) throw new Error("Unknown scene id.");
    if (exists(out) && (a.format || !fs.lstatSync(out).isDirectory() || fs.readdirSync(out).length))
      throw new Error(a.format ? "Output file already exists; it will not be overwritten."
        : "Output folder must be an empty directory. Existing files will not be overwritten.");
    if (a.format) await runFFmpeg(a.ffmpeg || "ffmpeg", ["-version"]);
    let playwright;
    try { playwright = require("playwright"); }
    catch {
      throw new Error("Install render dependencies: npm install, then npx playwright install chromium.");
    }
    const executablePath = a.browser || process.env.BROWSER_PATH;
    browser = await playwright.chromium.launch({
      headless: true, ...(executablePath ? { executablePath } : {}),
    });
    const page = await browser.newPage({
      viewport: { width, height }, deviceScaleFactor: 1,
    });
    await page.goto(pathToFileURL(path.resolve(__dirname, "../index.html")).href + "?export=1");
    await page.waitForFunction(() => window.ready);
    await page.evaluate((p) => window.MotionForgeApp.setProject(p), project);
    await page.evaluate(() => document.fonts.ready);
    // Export has no editor chrome, margins, scrolling or responsive size limits.
    await page.addStyleTag({ content: `
      html, body { margin: 0 !important; padding: 0 !important; overflow: hidden !important; }
      body > :not(.workspace), .workspace > :not(.studio),
      .studio > :not(.canvas-wrap), .canvas-wrap > :not(#stage) { display: none !important; }
      .workspace, .studio, .canvas-wrap, #stage {
        position: static !important; margin: 0 !important; padding: 0 !important;
        width: 100vw !important; height: 100vh !important;
        min-width: 0 !important; min-height: 0 !important;
        max-width: none !important; max-height: none !important; border: 0 !important;
      }
      #stage > canvas, #stage > svg { width: 100% !important; height: 100% !important; }
    ` });
    let framesDir = out;
    if (a.format) {
      fs.mkdirSync(path.dirname(out), { recursive: true });
      privateDir = fs.mkdtempSync(path.join(path.dirname(out), ".motion-render-"));
      fs.chmodSync(privateDir, 0o700);
      framesDir = privateDir;
    } else fs.mkdirSync(out, { recursive: true });
    let index = 0;
    const manifest = { project: project.name, width, height, fps, frames: 0, scenes: [] };
    for (const scene of scenes) {
      const count = Math.ceil(scene.duration * fps);
      manifest.scenes.push({
        id: scene.id, name: scene.name, firstFrame: index, frameCount: count,
        requestedDuration: scene.duration, renderedDuration: count / fps,
      });
      for (let i = 0; i < count; i++) {
        await page.evaluate(async ([id, t]) => { await window.renderFrame(id, t, { image: false }); }, [scene.id, i / fps]);
        const frame = path.join(framesDir, `frame-${String(index++).padStart(6, "0")}.png`);
        // Exclusive creation also protects files added after the initial folder check.
        fs.writeFileSync(frame, await page.screenshot({ omitBackground: true }), { flag: "wx" });
      }
      console.log(`Rendered ${scene.id}: ${count} frames.`);
    }
    await browser.close();
    browser = null;
    if (a.format) {
      const encoded = path.join(privateDir, `encoded.${a.format}`);
      await runFFmpeg(a.ffmpeg || "ffmpeg", encodingArgs(config, framesDir, encoded));
      fs.copyFileSync(encoded, out, fs.constants.COPYFILE_EXCL);
      console.log(`Done: ${index} frames encoded to ${out}.`);
    } else {
      manifest.frames = index;
      fs.writeFileSync(path.join(out, "render-manifest.json"),
        JSON.stringify(manifest, null, 2) + "\n", { flag: "wx" });
      console.log(`Done: ${index} frames. See docs/EXPORT.md for encoding.`);
    }
  } finally {
    try { if (browser) await browser.close(); }
    finally { if (privateDir) fs.rmSync(privateDir, { recursive: true, force: true }); }
  }
}

module.exports = { args, settings, encodingArgs, runFFmpeg, main };
if (require.main === module) main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
