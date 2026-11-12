/* Motion Forge — MIT. Browser real-time video recording. */
(function (root, factory) {
  const api = factory(root);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MotionVideo = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (root) {
  "use strict";
  const FORMATS = [
    { value: "webm", label: "WebM", types: ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"] },
    { value: "mp4", label: "MP4", types: ["video/mp4;codecs=avc1.42E01E", "video/mp4"] },
  ];

  function supportedFormats() {
    if (!root.MediaRecorder || typeof root.MediaRecorder.isTypeSupported !== "function") return [];
    return FORMATS.flatMap(({ value, label, types }) => {
      const mimeType = types.find((type) => root.MediaRecorder.isTypeSupported(type));
      return mimeType ? [{ value, label, mimeType }] : [];
    });
  }
  async function verifyRecording(blob) {
    if (!root.document?.createElement) return;
    const video = root.document.createElement("video");
    const url = root.URL.createObjectURL(blob);
    try {
      await new Promise((resolve, reject) => {
        const timer = root.setTimeout(() => reject(new Error("Timed out decoding the recorded video.")), 15000);
        video.onloadeddata = () => {
          root.clearTimeout(timer);
          if (video.videoWidth > 0 && video.videoHeight > 0) resolve();
          else reject(new Error("The browser produced a recording with no video frames."));
        };
        video.onerror = () => {
          root.clearTimeout(timer);
          reject(new Error("The browser produced an undecodable video. Use the local FFmpeg exporter."));
        };
        video.muted = true;
        video.src = url;
      });
    } finally { video.removeAttribute("src"); video.load(); root.URL.revokeObjectURL(url); }
  }

  async function record({
    canvas, paint, duration, fps = 30, format = "webm",
    bitrate = 12000000, onProgress = () => {}, isCancelled = () => false,
  } = {}) {
    if (!canvas || typeof canvas.captureStream !== "function" || typeof paint !== "function")
      throw new Error("Video recording requires a captureStream canvas and async paint(t).");
    if (!Number.isFinite(duration) || duration <= 0 ||
        !Number.isInteger(fps) || fps < 1 || fps > 60)
      throw new Error("Use a positive finite duration and integer fps 1–60.");
    if (![canvas.width, canvas.height].every((n) => Number.isInteger(n) && n > 0 && n <= 4096))
      throw new Error("Video canvas dimensions must be integers from 1 to 4096.");
    if (!Number.isInteger(bitrate) || bitrate < 1000000 || bitrate > 100000000)
      throw new Error("Video bitrate must be an integer from 1000000 to 100000000 bits/second.");
    const selected = supportedFormats().find((item) => item.value === format);
    if (!selected) throw new Error(`Video format ${format} is not supported by this browser.`);
    if (format === "mp4" && (canvas.width % 2 || canvas.height % 2))
      throw new Error("MP4 recording requires even canvas dimensions.");
    let stream, recorder, monitor, timer, rejectFailure, failed = false;
    const chunks = [], document = root.document;
    const failure = new Promise((_, reject) => { rejectFailure = reject; });
    // Cancellation may arrive while paint() or MediaRecorder.stop() is pending.
    failure.catch(() => {});
    function fail(error) {
      if (!failed) { failed = true; rejectFailure(error); }
    }
    function check() {
      try {
        if (document && document.hidden)
          fail(new Error("Recording cancelled: keep the recording tab visible."));
        else if (isCancelled()) fail(new Error("Recording cancelled."));
      } catch (error) { fail(error); }
    }
    const wait = (ms) => Promise.race([
      new Promise((resolve) => { timer = root.setTimeout(resolve, Math.max(0, ms)); }),
      failure,
    ]);
    const guarded = (operation) => Promise.race([Promise.resolve().then(operation), failure]);
    const onData = (event) => { if (!failed && event.data && event.data.size) chunks.push(event.data); };
    const onError = (event) => fail(new Error(`Video recorder failed: ${event.error?.message || "encoding error"}`));
    let onStop;
    try {
      document?.addEventListener("visibilitychange", check);
      monitor = root.setInterval(check, 25);
      check();
      await guarded(() => paint(0));
      stream = canvas.captureStream(fps);
      recorder = new root.MediaRecorder(stream, {
        mimeType: selected.mimeType, videoBitsPerSecond: bitrate,
      });
      recorder.addEventListener("dataavailable", onData);
      recorder.addEventListener("error", onError);
      const stopped = new Promise((resolve) => {
        onStop = resolve;
        recorder.addEventListener("stop", onStop);
      });
      const now = () => root.performance.now();
      recorder.start();
      const start = now(), frameMs = 1000 / fps, count = Math.ceil(duration * fps);
      onProgress(0);
      for (let i = 1; i < count; i++) {
        await wait(start + i * frameMs - now());
        check();
        await guarded(() => paint(i / fps));
        if (now() - (start + i * frameMs) > Math.max(250, frameMs * 3))
          throw new Error("Rendering is too slow for real-time recording. Use the deterministic CLI exporter.");
        for (const track of stream.getVideoTracks()) track.requestFrame?.();
        onProgress(Math.min(1, (now() - start) / (duration * 1000)));
      }
      await wait(start + duration * 1000 - now());
      check();
      await guarded(() => { recorder.stop(); return stopped; });
      if (!chunks.length) throw new Error("The browser produced an empty recording.");
      const actualType = recorder.mimeType || selected.mimeType;
      if (actualType.split(";")[0].toLowerCase() !== `video/${format}`)
        throw new Error("The browser returned a different video container; recording discarded.");
      const blob = new root.Blob(chunks, { type: actualType });
      await guarded(() => verifyRecording(blob));
      onProgress(1);
      return { blob, extension: selected.value, mimeType: actualType };
    } finally {
      root.clearInterval(monitor);
      root.clearTimeout(timer);
      document?.removeEventListener("visibilitychange", check);
      if (recorder) {
        recorder.removeEventListener("dataavailable", onData);
        recorder.removeEventListener("error", onError);
        if (onStop) recorder.removeEventListener("stop", onStop);
        if (recorder.state !== "inactive") {
          try { recorder.stop(); } catch {}
        }
      }
      if (stream) for (const track of stream.getTracks()) track.stop();
      chunks.length = 0;
    }
  }
  return { supportedFormats, record };
});
