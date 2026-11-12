/* Motion Forge - MIT. Ordered SVG, WebGL and local-video compositing. */
(() => {
  "use strict";
  const M = window.MotionForge;
  const advanced = (l) => ["scene3d", "effect", "video"].includes(l.type);
  const hasMedia = (scene) => scene.layers.some(advanced);
  function waitFor(target, success, failure, action, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const cleanup = () => {
        clearTimeout(timer);
        target.removeEventListener(success, ready);
        target.removeEventListener(failure, failed);
      };
      const ready = () => { cleanup(); resolve(); };
      const failed = () => { cleanup(); reject(new Error("Could not decode local video. Use a browser-supported MP4 or WebM.")); };
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error(`Timed out waiting for video ${success}.`));
      }, timeout);
      target.addEventListener(success, ready, { once: true });
      target.addEventListener(failure, failed, { once: true });
      try { action(); } catch (e) { cleanup(); reject(e); }
    });
  }
  class Compositor {
    constructor(options = {}) {
      this.videos = new Map();
      this.webgl = null;
      // Preview may skip a video the browser cannot decode; export stays strict so no layer is silently lost.
      this.skipFailedVideo = !!options.skipFailedVideo;
      this.onVideoSkipped = options.onVideoSkipped || null;
    }
    async svg(ctx, svg, width, height) {
      const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      try {
        const image = new Image();
        await new Promise((resolve, reject) => {
          image.onload = resolve;
          image.onerror = () => reject(new Error("Could not rasterize SVG frame."));
          image.src = url;
        });
        ctx.drawImage(image, 0, 0, width, height);
      } finally { URL.revokeObjectURL(url); }
    }
    async video(asset, id, layer, t) {
      let entry = this.videos.get(id);
      if (entry && entry.src !== asset.src) {
        entry.video.removeAttribute("src");
        entry.video.load();
        this.videos.delete(id);
        entry = null;
      }
      if (!entry) {
        const video = document.createElement("video");
        video.muted = true;
        video.playsInline = true;
        video.preload = "auto";
        const ready = waitFor(video, "loadeddata", "error", () => { video.src = asset.src; video.load(); });
        entry = { src: asset.src, video, ready };
        this.videos.set(id, entry);
      }
      await entry.ready;
      const video = entry.video;
      if (!Number.isFinite(video.duration) || video.duration <= 0)
        throw new Error("Video needs a finite, nonzero duration.");
      const trim = layer.trim ?? 0;
      if (trim >= video.duration) throw new Error("Video trim must be shorter than the source duration.");
      const elapsed = Math.max(0, t - (layer.start || 0)) * (layer.playbackRate ?? 1);
      const target = Math.min(video.duration - 0.00001,
        trim + (layer.loop ? elapsed % (video.duration - trim) : elapsed));
      if (Math.abs(video.currentTime - target) > 0.000001)
        await waitFor(video, "seeked", "error", () => { video.currentTime = target; });
      return video;
    }
    effect(layer) {
      const material = layer.effect;
      return {
        cameraDistance: 4, cameraAzimuth: 0,
        cameraElevation: material === "water" ? 35 : 0,
        lightIntensity: 4, ground: false, effectTimeScale: layer.speed ?? 0.5,
        objects: [{
          id: "effect", geometry: material === "water" ? "plane" : "sphere",
          material, color: layer.fill,
          scaleX: material === "gas" ? 1.6 : 1.3,
          scaleY: material === "gas" ? 1.3 : 1.3,
          scaleZ: 1.3, rotationX: material === "water" ? -90 : 0,
          speed: 0, amplitude: layer.intensity ?? 0.25,
          seed: layer.seed ?? 1,
        }],
      };
    }
    async paint(canvas, project, sceneId, t) {
      const s = project.scenes.find((s) => s.id === sceneId);
      if (!s) throw new Error(`Unknown scene ${sceneId}.`);
      t = Math.max(0, Math.min(t, s.duration));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D compositing is unavailable.");
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const opts = { placeholders: true };
      if (!hasMedia(s)) {
        await this.svg(ctx, M.renderSVG(project, s.id, t), canvas.width, canvas.height);
        return;
      }
      for (const [id, entry] of this.videos) {
        if (project.assets[id]?.src !== entry.src) {
          entry.video.removeAttribute("src");
          entry.video.load();
          this.videos.delete(id);
        }
      }
      await this.svg(ctx, M.renderSVG(project, s.id, t, { ...opts, rootIds: [] }), canvas.width, canvas.height);
      let batch = [];
      const flush = async () => {
        if (!batch.length) return;
        await this.svg(ctx, M.renderSVG(project, s.id, t, { ...opts, background: false, rootIds: batch }), canvas.width, canvas.height);
        batch = [];
      };
      for (const original of s.layers.filter((l) => !l.parentId)) {
        if (!advanced(original)) { batch.push(original.id); continue; }
        await flush();
        const l = M.sample(original, t, s, project.theme);
        if (l.opacity <= 0 || !l.width || !l.height || !l.scale) continue;
        let source;
        if (l.type === "video") {
          try { source = await this.video(project.assets[l.asset], l.asset, l, t); }
          catch (e) {
            if (!this.skipFailedVideo) throw e;
            this.onVideoSkipped?.(l, e);
            continue;
          }
        } else {
          this.webgl ??= new window.Motion3D.Renderer();
          const ratio = Math.min(1, 4096 / Math.max(l.width * canvas.width / project.width, l.height * canvas.height / project.height));
          source = this.webgl.render(l.type === "effect" ? this.effect(l) : l,
            t, Math.max(1, Math.round(l.width * canvas.width / project.width * ratio)),
            Math.max(1, Math.round(l.height * canvas.height / project.height * ratio)), project.theme);
        }
        ctx.save();
        try {
          ctx.scale(canvas.width / project.width, canvas.height / project.height);
          ctx.transform(...M.matrix(l));
          ctx.globalAlpha = l.opacity;
          if (l.shadowBlur) {
            ctx.shadowBlur = l.shadowBlur;
            ctx.shadowOffsetX = l.shadowX ?? 0;
            ctx.shadowOffsetY = l.shadowY ?? 10;
            ctx.shadowColor = M.color(l.shadowColor || "#00000080", project.theme);
          }
          if (l.type === "video") {
            const sw = source.videoWidth, sh = source.videoHeight;
            const fit = l.fit || "contain";
            if (fit === "stretch") ctx.drawImage(source, 0, 0, l.width, l.height);
            else {
              const scale = Math[fit === "cover" ? "max" : "min"](l.width / sw, l.height / sh);
              ctx.beginPath(); ctx.rect(0, 0, l.width, l.height); ctx.clip();
              ctx.drawImage(source, (l.width - sw * scale) / 2, (l.height - sh * scale) / 2, sw * scale, sh * scale);
            }
          } else ctx.drawImage(source, 0, 0, l.width, l.height);
        } finally { ctx.restore(); }
      }
      await flush();
    }
    dispose() {
      this.webgl?.dispose();
      this.webgl = null;
      for (const { video } of this.videos.values()) { video.removeAttribute("src"); video.load(); }
      this.videos.clear();
    }
  }
  window.MotionCompositor = { Compositor, hasMedia };
})();
