"use strict";
const test = require("node:test"),
  assert = require("node:assert/strict"),
  fs = require("node:fs"),
  path = require("node:path"),
  vm = require("node:vm"),
  { createRequire } = require("node:module"),
  { EventEmitter } = require("node:events"),
  { args, settings, encodingArgs, runFFmpeg } = require("../scripts/render.cjs");

const project = { width: 1920, height: 1080, fps: 30 };
const options = (extra = {}) => ({ project: "scene.json", out: "clip.mp4", format: "mp4", ...extra });

test("CLI strictly parses named options without consuming executable arguments", () => {
  assert.deepEqual(args(["--project", "a.json", "--out", "my frames"]), {
    project: "a.json", out: "my frames",
  });
  for (const argv of [
    ["--oops", "x"], ["--project"], ["--project", "--out", "x"],
    ["--out", "x"], ["--project", "a", "--out", "x", "--out", "y"],
  ]) assert.throws(() => args(argv));
});

test("CLI validates dimensions, fps, format, codec quality and presets", () => {
  assert.equal(settings(options(), project).crf, 18);
  assert.equal(settings(options({ format: "webm", out: "clip.webm" }), project).crf, 30);
  for (const extra of [
    { fps: "0" }, { fps: "61" }, { fps: "NaN" }, { width: "4097" },
    { height: "255" }, { width: "1921" }, { height: "1081" },
    { crf: "-1" }, { crf: "52" }, { crf: "1.5" },
    { preset: "slow;bad" }, { format: "mov" }, { out: "clip.webm" },
    { format: "webm", out: "clip.webm", crf: "64" },
    { format: "webm", out: "clip.webm", preset: "slow" },
    { format: undefined, crf: "18" }, { format: undefined, ffmpeg: "tool" },
  ]) assert.throws(() => settings(options(extra), project), JSON.stringify(extra));
  assert.equal(settings(options({ width: "4096", height: "2160", crf: "0", preset: "slow" }), project).width, 4096);
  assert.equal(settings({ out: "frames", width: "1921" }, project).width, 1921);
});

test("FFmpeg argument arrays encode correct containers without shell interpolation", () => {
  const folder = path.join("folder with spaces", "frames"),
    output = "clip & literal.mp4",
    mp4 = encodingArgs(settings(options(), project), folder, output);
  assert.equal(mp4.at(-1), output);
  assert.ok(mp4.includes(path.join(folder, "frame-%06d.png")));
  for (const value of ["-n", "-nostdin", "-an", "libx264", "yuv420p", "+faststart"])
    assert.ok(mp4.includes(value));
  assert.ok(!mp4.includes("-y"));
  const webm = encodingArgs(settings(options({ format: "webm", out: "clip.webm" }), project), folder, "clip.webm");
  assert.ok(webm.includes("libvpx-vp9"));
  assert.ok(!webm.includes("libx264"));
  assert.ok(!webm.includes("-preset"));
  assert.deepEqual(webm.slice(webm.indexOf("-b:v"), webm.indexOf("-b:v") + 2), ["-b:v", "0"]);
});

test("FFmpeg missing executable and failed encodes report actionable errors", async () => {
  await assert.rejects(runFFmpeg(path.join(__dirname, "nonexistent-ffmpeg.exe"), ["-version"]),
    /FFmpeg executable not found.*Install FFmpeg.*--ffmpeg/);
  function fakeSpawn(executable, argv, config) {
    assert.equal(executable, "ffmpeg with spaces.exe");
    assert.deepEqual(argv, ["literal & argument"]);
    assert.equal(config.shell, false);
    const child = new EventEmitter();
    child.stderr = new EventEmitter();
    process.nextTick(() => {
      child.stderr.emit("data", Buffer.from("Unknown encoder 'libx264'"));
      child.emit("close", 1, null);
    });
    return child;
  }
  await assert.rejects(runFFmpeg("ffmpeg with spaces.exe", ["literal & argument"], fakeSpawn),
    /FFmpeg failed \(exit 1\).*Unknown encoder 'libx264'/);
});

function cliHarness({ encodingFails = false } = {}) {
  const filename = path.resolve(__dirname, "../scripts/render.cjs"),
    realRequire = createRequire(filename),
    calls = [];
  let ready = false, rendered = 0, closed = 0;
  const page = {
    async goto(url) { assert.ok(url.endsWith("?export=1")); },
    async waitForFunction() {},
    async addStyleTag() {},
    async evaluate(fn, value) {
      if (Array.isArray(value)) {
        assert.ok(fn.constructor.name === "AsyncFunction");
        calls.push(value);
        await new Promise((resolve) => setImmediate(resolve));
        ready = true;
      }
    },
    async screenshot() {
      assert.equal(ready, true, "renderFrame must finish before screenshot");
      ready = false;
      rendered++;
      return Buffer.from("test frame");
    },
  };
  const playwright = { chromium: { async launch() {
    return {
      async newPage({ viewport }) {
        assert.deepEqual({ ...viewport }, { width: 256, height: 256 });
        return page;
      },
      async close() { closed++; },
    };
  } } };
  const childProcess = { spawn(executable, argv, config) {
    assert.equal(config.shell, false);
    const child = new EventEmitter();
    child.stderr = new EventEmitter();
    process.nextTick(() => {
      if (!argv.includes("-version")) {
        assert.ok(rendered > 0);
        fs.writeFileSync(argv.at(-1), "encoded video", { flag: "wx" });
        if (encodingFails) {
          child.stderr.emit("data", Buffer.from("encoder failed"));
          child.emit("close", 1, null);
          return;
        }
      }
      child.emit("close", 0, null);
    });
    return child;
  } };
  const context = {
    require(name) {
      if (name === "playwright") return playwright;
      if (name === "node:child_process") return childProcess;
      return realRequire(name);
    },
    module: { exports: {} }, __dirname: path.dirname(filename),
    process, console: { log() {} },
  };
  vm.runInNewContext(fs.readFileSync(filename, "utf8"), context, { filename });
  return { main: context.module.exports.main, calls, closed: () => closed };
}

async function withProject(run) {
  const output = path.resolve(__dirname, "../test-output");
  fs.mkdirSync(output, { recursive: true });
  const dir = fs.mkdtempSync(path.join(output, "export-test-")),
    file = path.join(dir, "project.json"),
    project = require("../src/examples.js").project();
  project.scenes = project.scenes.slice(0, 2);
  for (const scene of project.scenes) {
    scene.duration = 0.1;
    scene.layers = [];
  }
  fs.writeFileSync(file, JSON.stringify(project));
  try { await run({ dir, file, project }); }
  finally { fs.rmSync(dir, { recursive: true, force: true }); }
}

test("CLI frame mode awaits every frame, concatenates scenes and preserves existing folders", async () => {
  await withProject(async ({ dir, file, project }) => {
    const h = cliHarness(), out = path.join(dir, "frames"),
      argv = ["--project", file, "--out", out, "--fps", "10", "--width", "256", "--height", "256"];
    await h.main(argv);
    assert.equal(h.closed(), 1);
    assert.deepEqual(h.calls.map(([id, t]) => [id, t]), project.scenes.map((s) => [s.id, 0]));
    const manifest = JSON.parse(fs.readFileSync(path.join(out, "render-manifest.json")));
    assert.equal(manifest.frames, 2);
    assert.equal(manifest.scenes[1].firstFrame, 1);
    await assert.rejects(h.main(argv), /empty directory/);
    assert.equal(fs.readFileSync(path.join(out, "frame-000000.png"), "utf8"), "test frame");
  });
});

test("CLI publishes only completed videos and cleans only its own working directories", async () => {
  await withProject(async ({ dir, file, project }) => {
    const unrelated = path.join(dir, ".motion-render-user");
    fs.mkdirSync(unrelated);
    fs.writeFileSync(path.join(unrelated, "keep"), "user data");
    for (const encodingFails of [false, true]) {
      const h = cliHarness({ encodingFails }),
        out = path.join(dir, encodingFails ? "failure.mp4" : "success.mp4"),
        argv = ["--project", file, "--out", out, "--format", "mp4",
          "--scene", project.scenes[0].id, "--fps", "10", "--width", "256", "--height", "256"];
      if (encodingFails) {
        await assert.rejects(h.main(argv), /FFmpeg failed.*encoder failed/);
        assert.equal(fs.existsSync(out), false);
      } else {
        await h.main(argv);
        assert.equal(fs.readFileSync(out, "utf8"), "encoded video");
        await assert.rejects(h.main(argv), /already exists/);
      }
      assert.equal(h.calls.length, 1);
      assert.equal(h.closed(), 1);
      assert.deepEqual(fs.readdirSync(dir).filter((name) => name.startsWith(".motion-render-")), [".motion-render-user"]);
      assert.equal(fs.readFileSync(path.join(unrelated, "keep"), "utf8"), "user data");
    }
  });
});

function browserHarness({ support = ["video/webm;codecs=vp9"], recorderError = false, actualMime } = {}) {
  let stoppedTracks = 0, recorderStops = 0;
  class Recorder extends EventTarget {
    static isTypeSupported(type) { return support.includes(type); }
    constructor(stream, config) {
      super();
      this.mimeType = actualMime || config.mimeType;
      this.state = "inactive";
    }
    start() {
      this.state = "recording";
      if (recorderError) queueMicrotask(() => {
        const event = new Event("error");
        event.error = new Error("encoder unavailable");
        this.dispatchEvent(event);
      });
    }
    stop() {
      recorderStops++;
      this.state = "inactive";
      queueMicrotask(() => {
        const event = new Event("dataavailable");
        event.data = new Blob(["video"], { type: this.mimeType });
        this.dispatchEvent(event);
        this.dispatchEvent(new Event("stop"));
      });
    }
  }
  const document = new EventTarget();
  document.hidden = false;
  const track = { stop() { stoppedTracks++; }, requestFrame() {} };
  const canvas = {
    width: 1920, height: 1080,
    captureStream: () => ({ getTracks: () => [track], getVideoTracks: () => [track] }),
  };
  const context = vm.createContext({
    MediaRecorder: Recorder, Blob, document, performance,
    setTimeout, clearTimeout, setInterval, clearInterval,
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "../src/video-export.js"), "utf8"), context);
  return {
    api: context.MotionVideo, canvas, document,
    stoppedTracks: () => stoppedTracks, recorderStops: () => recorderStops,
  };
}

test("browser only exposes actually supported containers and never relabels WebM", async () => {
  const h = browserHarness();
  assert.equal(h.api.supportedFormats().length, 1);
  assert.equal(h.api.supportedFormats()[0].value, "webm");
  await assert.rejects(h.api.record({ canvas: h.canvas, paint() {}, duration: 1, format: "mp4" }), /not supported/);
  const none = browserHarness({ support: [] });
  assert.equal(none.api.supportedFormats().length, 0);
});

test("browser recording awaits exact-time paints, returns a blob and cleans tracks", async () => {
  const h = browserHarness(), times = [], progress = [];
  const result = await h.api.record({
    canvas: h.canvas, duration: 0.06, fps: 30,
    async paint(t) { await Promise.resolve(); times.push(t); },
    onProgress: (p) => progress.push(p),
  });
  assert.deepEqual(times, [0, 1 / 30]);
  assert.equal(result.extension, "webm");
  assert.ok(result.mimeType.startsWith("video/webm"));
  assert.ok(result.blob.size > 0);
  assert.equal(progress.at(-1), 1);
  assert.equal(h.stoppedTracks(), 1);
  assert.equal(h.recorderStops(), 1);
});

test("supported browser MP4 is returned as MP4, not a renamed WebM", async () => {
  const h = browserHarness({ support: ["video/mp4"] });
  const result = await h.api.record({ canvas: h.canvas, paint() {}, duration: 0.01, format: "mp4" });
  assert.equal(result.extension, "mp4");
  assert.equal(result.mimeType, "video/mp4");
  assert.equal(h.stoppedTracks(), 1);
});

test("browser cancellation, hidden tabs and recorder/paint failures discard recordings", async () => {
  for (const mode of ["cancel", "hidden", "paint", "recorder"]) {
    const h = browserHarness({ recorderError: mode === "recorder" });
    let cancel = false;
    await assert.rejects(h.api.record({
      canvas: h.canvas, duration: 0.1, fps: 30,
      isCancelled: () => cancel,
      paint(t) {
        if (t > 0) {
          if (mode === "cancel") cancel = true;
          if (mode === "hidden") {
            h.document.hidden = true;
            h.document.dispatchEvent(new Event("visibilitychange"));
          }
          if (mode === "paint") throw new Error("paint failed");
        }
      },
    }), /cancelled|paint failed|encoder unavailable/);
    assert.equal(h.stoppedTracks(), 1, mode);
    assert.equal(h.recorderStops(), 1, mode);
  }
});

test("browser cancellation interrupts a pending paint and enforces bitrate bounds", async () => {
  const h = browserHarness();
  let cancel = false;
  await assert.rejects(h.api.record({
    canvas: h.canvas, duration: 1,
    paint(t) {
      if (t > 0) {
        cancel = true;
        return new Promise(() => {});
      }
    },
    isCancelled: () => cancel,
  }), /cancelled/);
  assert.equal(h.stoppedTracks(), 1);
  assert.equal(h.recorderStops(), 1);
  for (const bitrate of [0, 999999, 100000001, NaN]) {
    await assert.rejects(h.api.record({ canvas: h.canvas, duration: 1, paint() {}, bitrate }), /bitrate/);
  }
  const mismatch = browserHarness({ actualMime: "video/mp4" });
  await assert.rejects(mismatch.api.record({ canvas: mismatch.canvas, duration: 0.01, paint() {} }), /different video container/);
  assert.equal(mismatch.stoppedTracks(), 1);
});

test("slow real-time rendering is explicitly rejected instead of returning a truncated clip", async () => {
  const h = browserHarness();
  await assert.rejects(h.api.record({
    canvas: h.canvas, duration: 0.1, fps: 30,
    async paint(t) {
      if (t > 0) await new Promise((resolve) => setTimeout(resolve, 300));
    },
  }), /too slow.*deterministic CLI/);
  assert.equal(h.stoppedTracks(), 1);
  assert.equal(h.recorderStops(), 1);
});
