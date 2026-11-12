"use strict";
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const root = path.resolve(__dirname, "..");
const dir = path.join(root, "examples", "showcase");
const ffmpeg = process.argv[2] || "ffmpeg";
function run(executable, args, capture = false) {
  const result = spawnSync(executable, args, {
    cwd: root, shell: false, windowsHide: true,
    stdio: capture ? ["ignore", "pipe", "pipe"] : "inherit", encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  if (result.error) throw result.error;
  if (result.status !== 0)
    throw new Error(`${path.basename(executable)} failed (${result.status}): ${result.stderr || "see diagnostics above"}`);
  return result;
}
try {
  run(ffmpeg, ["-version"], true);
  const manifest = JSON.parse(fs.readFileSync(path.join(dir, "manifest.json")));
  const renders = path.join(dir, "renders");
  fs.mkdirSync(renders, { recursive: true });
  for (const story of manifest) {
    for (const ext of ["mp4", "webm"]) {
      if (fs.existsSync(path.join(renders, story.key + "." + ext)))
        throw new Error(`Output already exists: ${story.key}.${ext}. Existing renders are never overwritten.`);
    }
  }
  const report = [];
  for (const story of manifest) {
    const mp4 = path.join(renders, story.key + ".mp4");
    const webm = path.join(renders, story.key + ".webm");
    run(process.execPath, [
      path.join(root, "scripts", "render.cjs"), "--project", path.join(dir, story.key + ".motion.json"),
      "--out", mp4, "--format", "mp4", "--width", "1280", "--height", "720",
      "--fps", "24", "--crf", "18", "--preset", "medium", "--ffmpeg", ffmpeg,
    ]);
    run(ffmpeg, ["-hide_banner", "-loglevel", "error", "-nostdin", "-n", "-i", mp4,
      "-an", "-c:v", "libvpx-vp9", "-crf", "28", "-b:v", "0", "-row-mt", "1",
      "-pix_fmt", "yuv420p", webm]);
    for (const [format, file] of [["mp4", mp4], ["webm", webm]]) {
      const decoded = run(ffmpeg, ["-hide_banner", "-loglevel", "error", "-nostdin",
        "-i", file, "-progress", "pipe:1", "-f", "null", "-"], true);
      const counts = [...decoded.stdout.matchAll(/^frame=(\d+)$/gm)];
      const frames = Number(counts.at(-1)?.[1]);
      if (frames !== 432) throw new Error(`${story.key}.${format}: expected 432 decoded frames, got ${frames}.`);
      report.push({ story: story.key, format, frames, duration: 18, width: 1280, height: 720,
        fps: 24, bytes: fs.statSync(file).size });
      console.log("VERIFIED", story.key, format, frames, "decoded frames / 18s / 1280x720");
    }
  }
  fs.writeFileSync(path.join(renders, "verification.json"), JSON.stringify(report, null, 2) + "\n");
  console.log("All five MP4 and WebM story reels rendered and decoded.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
