/* Motion Forge editor — MIT. All processing stays in this browser. */
(() => {
  "use strict";
  const M = window.MotionForge,
    E = window.MotionExamples,
    $ = (id) => document.getElementById(id),
    esc = M.esc;
  const params = new URLSearchParams(location.search),
    exportMode = params.get("export") === "1";
  let project = E.project(),
    sceneId = project.scenes[0].id,
    selected = null,
    time = 0,
    playing = false,
    sequence = params.get("play") === "1",
    last = 0,
    undo = [],
    redo = [],
    toastTimer,
    recordCancel = false;
  const storageKey = "motion-forge-project-v1";
  if (!exportMode) {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && !M.validate(saved).length) {
        project = saved;
        sceneId = project.scenes[0].id;
      }
    } catch {}
  }
  const scene = () =>
    project.scenes.find((s) => s.id === sceneId) || project.scenes[0];
  const currentLayer = () => scene().layers.find((l) => l.id === selected);
  const skippedVideos = new Set();
  const previewCompositor = new window.MotionCompositor.Compositor({
    skipFailedVideo: true,
    onVideoSkipped: (layer, e) => {
      if (skippedVideos.has(layer.asset)) return;
      skippedVideos.add(layer.asset);
      console.warn(`Preview skipped video ${layer.asset}: ${e.message}`);
      toast(`This browser cannot decode the video "${project.assets[layer.asset]?.name || layer.asset}"; the preview shows the scene without it. Export still requires a decodable video.`);
    },
  });
  const exportCompositor = new window.MotionCompositor.Compositor();
  let pendingFrame = null, paintTask = null, frameError = null, frameVersion = 0;
  const previewCanvas = document.createElement("canvas");
  const previewBuffer = document.createElement("canvas");
  const overlay = document.createElement("div");
  overlay.className = "stage-overlay";
  function queueFrame(p, id, t) {
    pendingFrame = { p, id, t, version: ++frameVersion };
    if (paintTask) return paintTask;
    paintTask = (async () => {
      while (pendingFrame) {
        const job = pendingFrame;
        pendingFrame = null;
        try {
          previewBuffer.width = exportMode ? window.innerWidth : job.p.width;
          previewBuffer.height = exportMode ? window.innerHeight : job.p.height;
          await previewCompositor.paint(previewBuffer, job.p, job.id, job.t);
          if (job.p === project && job.id === scene().id && $("stage").contains(previewCanvas)) {
            previewCanvas.width = previewBuffer.width;
            previewCanvas.height = previewBuffer.height;
            previewCanvas.getContext("2d").drawImage(previewBuffer, 0, 0);
            $("stage").querySelector(".stage-error")?.remove();
          }
          if (job.version === frameVersion) frameError = null;
        } catch (e) {
          if (job.version === frameVersion) frameError = e;
          if (job.version === frameVersion && $("stage").contains(previewCanvas)) {
            previewCanvas.getContext("2d").clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            let error = $("stage").querySelector(".stage-error");
            if (!error) { error = document.createElement("div"); error.className = "stage-error"; $("stage").append(error); }
            if (error.textContent !== e.message) toast(e.message);
            error.textContent = e.message;
          }
        }
      }
    })().finally(() => { paintTask = null; });
    return paintTask;
  }
  const uid = (prefix = "layer") =>
    prefix + "-" + Math.random().toString(36).slice(2, 9);
  function toast(msg) {
    $("toast").textContent = msg;
    $("toast").classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $("toast").classList.remove("visible"), 4200);
  }
  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(project));
      $("save-status").textContent = "Saved in this browser";
    } catch {
      $("save-status").textContent = "Download JSON to save";
    }
  }
  function snapshot(previous) {
    undo.push(previous);
    while (
      undo.length > 30 ||
      (undo.length > 1 && undo.reduce((n, s) => n + s.length, 0) > 32000000)
    )
      undo.shift();
    redo = [];
  }
  function repairSelection() {
    if (!project.scenes.some((s) => s.id === sceneId))
      sceneId = project.scenes[0].id;
    if (!scene().layers.some((l) => l.id === selected)) selected = null;
    time = Math.min(time, scene().duration);
  }
  function change(fn) {
    const previous = JSON.stringify(project);
    try {
      fn();
      M.assertValid(project);
    } catch (e) {
      project = JSON.parse(previous);
      toast(e.message);
      renderUI();
      return false;
    }
    if (JSON.stringify(project) === previous) return true;
    snapshot(previous);
    repairSelection();
    save();
    renderUI();
    return true;
  }
  function select(id) {
    selected = id;
    renderLayers();
    renderInspector();
    draw();
    renderTimeline();
  }
  function stop() {
    playing = false;
    $("play").textContent = "▶";
  }
  function formatTime(t) {
    return `${String(Math.floor(t / 60)).padStart(2, "0")}:${(t % 60).toFixed(2).padStart(5, "0")}`;
  }
  function draw() {
    const s = scene();
    const renderOptions = {
      selected:
        exportMode || document.body.classList.contains("presentation")
          ? null
          : selected,
      safeArea:
        !exportMode &&
        !document.body.classList.contains("presentation") &&
        $("safe-area").checked,
    };
    const hybrid = window.MotionCompositor.hasMedia(s);
    $("stage").classList.toggle("hybrid-stage", hybrid);
    if (hybrid) {
      if (!$("stage").contains(previewCanvas)) $("stage").replaceChildren(previewCanvas, overlay);
      overlay.innerHTML = M.renderSVG(project, s.id, time, { ...renderOptions, hitOnly: true });
      queueFrame(project, s.id, time);
    } else {
      frameVersion++;
      pendingFrame = null;
      frameError = null;
      $("stage").innerHTML = M.renderSVG(project, s.id, time, renderOptions);
    }
    $("seek").value = time;
    $("clock").textContent = formatTime(time);
    document.querySelectorAll("[data-object-key-add]").forEach((button) => {
      button.textContent = `Add / update key at ${time.toFixed(2)}s`;
    });
    document
      .querySelectorAll(".time-head")
      .forEach((h) => (h.style.left = `${(time / s.duration) * 100}%`));
  }
  function renderScenes() {
    const host = $("scenes");
    host.replaceChildren();
    project.scenes.forEach((s, i) => {
      const b = document.createElement("button");
      b.className = "scene" + (s.id === scene().id ? " active" : "");
      b.innerHTML = `<span class="scene-number">${String(i + 1).padStart(2, "0")}</span>${esc(s.name)}`;
      b.onclick = () => {
        stop();
        sceneId = s.id;
        selected = null;
        time = 0;
        renderUI();
      };
      host.append(b);
    });
    $("scene-remove").disabled = project.scenes.length === 1;
  }
  const symbols = {
    text: "T",
    rect: "▱",
    circle: "○",
    line: "↗",
    chart: "▥",
    counter: "#",
    group: "▧",
    path: "⌁",
    icon: "◇",
    image: "▣",
    symbol: "L",
    scene3d: "3D",
    effect: "FX",
    video: "V",
  };
  function renderLayers() {
    const host = $("layers");
    host.replaceChildren();
    [...scene().layers].reverse().forEach((l) => {
      const b = document.createElement("button");
      b.className =
        "layer-row" +
        (l.id === selected ? " active" : "") +
        (l.parentId ? " indent" : "");
      b.innerHTML = `<span class="layer-type">${symbols[l.type]}</span><span class="layer-name">${esc(l.name || l.id)}</span>${l.hidden ? "<span>◌</span>" : ""}`;
      b.title = `${l.id} · ${l.type}${l.parentId ? " · in " + l.parentId : ""}`;
      b.onclick = () => select(l.id);
      host.append(b);
    });
    $("layer-count").textContent = scene().layers.length;
    for (const id of ["layer-copy", "layer-up", "layer-down", "layer-remove"])
      $(id).disabled = !currentLayer();
  }
  function renderTimeline() {
    const s = scene(),
      host = $("timeline");
    host.replaceChildren();
    s.layers
      .filter((l) => !l.parentId)
      .forEach((l) => {
        const row = document.createElement("div");
        row.className = "time-row" + (l.id === selected ? " active" : "");
        row.onclick = () => select(l.id);
        const start = ((l.start || 0) / s.duration) * 100,
          end = ((l.end ?? s.duration) / s.duration) * 100;
        row.innerHTML = `<span class="time-label">${esc(l.name || l.id)}</span><div class="time-bar-bg"><div class="time-bar" style="left:${start}%;width:${Math.max(0, end - start)}%"></div>${(
          [...(l.tracks || []), ...(l.objects || []).flatMap((object) => object.tracks || [])]
        )
          .flatMap((tr) => tr.keyframes)
          .map(
            (k) =>
              `<span class="time-key" style="left:${(k.time / s.duration) * 100}%"></span>`,
          )
          .join(
            "",
          )}<div class="time-head" style="left:${(time / s.duration) * 100}%"></div></div>`;
        host.append(row);
      });
  }
  function input(label, key, value, type = "number", extra = "") {
    return `<label>${esc(label)}<input data-key="${key}" type="${type}" value="${esc(value ?? "")}" ${extra}></label>`;
  }
  function options(values, value) {
    return values
      .map((v) => {
        const [k, l] = Array.isArray(v) ? v : [v, v];
        return `<option value="${esc(k)}" ${String(k) === String(value) ? "selected" : ""}>${esc(l)}</option>`;
      })
      .join("");
  }
  function dropdown(label, key, value, values) {
    return `<label>${esc(label)}<select data-key="${key}">${options(values, value)}</select></label>`;
  }
  function colour(label, key, value) {
    const resolved = M.color(value || "$accent", project.theme),
      hex = /^#[a-f\d]{6}$/i.test(resolved) ? resolved : "#ffffff";
    return `<label>${esc(label)}<div class="colour-control"><input type="color" data-colour="${key}" aria-label="${esc(label)} colour picker" value="${hex}"><input type="text" data-key="${key}" aria-label="${esc(label)} colour value" value="${esc(value ?? "none")}" placeholder="$accent or #aabbcc"></div></label>`;
  }
  function renderInspector() {
    const l = currentLayer(),
      host = $("element-inspector");
    if (!l) {
      host.innerHTML =
        '<h2>Choose an element</h2><p class="field-help">Select a layer or click on the stage. Use Assets to add icons and custom images.</p><h3>QUICK START</h3><p class="field-help">1. Choose a template.<br>2. Change the palette in Scene &amp; theme.<br>3. Add images or icons.<br>4. Set entrances and keyframes.<br>5. Export the scene.</p>';
      return;
    }
    let html = `<h2>${esc(l.name || l.id)}</h2><p class="micro">${esc(l.type.toUpperCase())} · ${esc(l.id)}</p><h3>CONTENT</h3>${input("Layer name", "name", l.name || l.id, "text")}`;
    if (l.type === "text")
      html += `<label>Text<textarea data-key="text" rows="3">${esc(l.text)}</textarea></label>`;
    if (["text", "counter"].includes(l.type))
      html += `<div class="row">${input("Font size", "fontSize", l.fontSize || 40, "number", 'min="1" max="500"')}${dropdown(
        "Weight",
        "fontWeight",
        l.fontWeight || 500,
        [
          [400, "Regular"],
          [500, "Medium"],
          [700, "Bold"],
          [900, "Heavy"],
        ],
      )}</div>${dropdown("Alignment", "align", l.align || "left", ["left", "center", "right"])}`;
    if (l.type === "text")
      html += dropdown("Typeface", "fontFamily", l.fontFamily || "sans", [
        "sans",
        "mono",
        "serif",
      ]);
    if (l.type === "icon")
      html += dropdown(
        "Material icon",
        "icon",
        l.icon,
        Object.keys(M.icons).sort(),
      );
    if (l.type === "image")
      html +=
        dropdown(
          "Image asset",
          "asset",
          l.asset,
          Object.entries(project.assets).map(([id, a]) => [id, a.name]),
        ) +
        dropdown("Image fit", "fit", l.fit || "contain", [
          "contain",
          "cover",
          "stretch",
        ]);
    if (l.type === "counter")
      html += `<div class="row">${input("From", "valueFrom", l.valueFrom || 0)}${input("To", "valueTo", l.valueTo ?? 100)}</div><div class="row">${input("Decimals", "decimals", l.decimals || 0, "number", 'min="0" max="6"')}${input("Suffix", "suffix", l.suffix || "", "text")}</div>${input("Prefix", "prefix", l.prefix || "", "text")}`;
    if (l.type === "chart")
      html += `<label>Values (comma separated)<input data-list="values" value="${esc(l.values.join(", "))}"></label><label>Labels (comma separated)<input data-list="labels" value="${esc((l.labels || []).join(", "))}"></label>${input("Axis maximum", "maxValue", l.maxValue || Math.max(...l.values, 1), "number", 'min="0.001"')}`;
    if (l.type === "path")
      html += `<label>SVG path commands<textarea data-key="d" rows="3">${esc(l.d)}</textarea></label>`;
    if (l.type === "line") {
      const choices = [
        ["", "Free endpoint"],
        ...scene()
          .layers.filter((n) => n.type !== "line" && !n.parentId)
          .map((n) => [n.id, n.name || n.id]),
      ];
      html +=
        dropdown("From layer", "from", l.from || "", choices) +
        dropdown("To layer", "to", l.to || "", choices) +
        `<div class="row">${dropdown("From side", "fromAnchor", l.fromAnchor || "right", ["left", "right", "top", "bottom", "center"])}${dropdown("To side", "toAnchor", l.toAnchor || "left", ["left", "right", "top", "bottom", "center"])}</div>` +
        dropdown("Connection style", "curve", l.curve || "straight", [
          "straight",
          "bezier",
          "step",
        ]) +
        `<div class="row">${input("End X", "x2", l.x2 ?? (l.x || 0) + (l.width || 180))}${input("End Y", "y2", l.y2 ?? (l.y || 0) + (l.height || 100))}</div>${input("Travelling particles", "particles", l.particles || 0, "number", 'min="0" max="20"')}<label><input type="checkbox" data-key="arrow" ${l.arrow ? "checked" : ""}> Arrowhead</label>`;
    }
    if (l.type === "video")
      html += dropdown("Fit", "fit", l.fit || "contain", ["contain", "cover", "stretch"]) +
        input("Source trim (s)", "trim", l.trim ?? 0, "number", 'min="0" step="0.1"') +
        input("Playback rate", "playbackRate", l.playbackRate ?? 1, "number", 'min="0.1" max="8" step="0.1"') +
        `<label><input data-key="loop" type="checkbox" ${l.loop ? "checked" : ""}> Loop source video</label><p class="micro">Video is composited silently. Add graphic layers above it.</p>`;
    if (l.type === "effect")
      html += dropdown("Effect", "effect", l.effect, M.EFFECTS) +
        input("Intensity", "intensity", l.intensity ?? 0.25, "number", 'min="0" max="1" step="0.05"') +
        input("Speed", "speed", l.speed ?? 0.5, "number", 'min="-10" max="10" step="0.1"') +
        input("Seed", "seed", l.seed ?? 1, "number", 'min="0" max="65535" step="1"');
    if (l.type === "scene3d") {
      html += `<h3>CAMERA &amp; LIGHT</h3>` +
        input("Camera distance", "cameraDistance", l.cameraDistance ?? 6, "number", 'min="2" max="30" step="0.1"') +
        input("Camera azimuth", "cameraAzimuth", l.cameraAzimuth ?? 25) +
        input("Camera elevation", "cameraElevation", l.cameraElevation ?? 15, "number", 'min="-85" max="85"') +
        input("Field of view", "fov", l.fov ?? 45, "number", 'min="15" max="100"') +
        input("Light intensity", "lightIntensity", l.lightIntensity ?? 3, "number", 'min="0" max="20" step="0.1"') +
        colour("Light", "lightColor", l.lightColor || "#ffffff") +
        `<label><input data-key="mirror" type="checkbox" ${l.mirror ? "checked" : ""}> Single planar mirror reflection</label><label><input data-key="ground" type="checkbox" ${l.ground !== false ? "checked" : ""}> Shadow-receiving ground</label><h3>PROCEDURAL OBJECTS</h3>`;
      l.objects.forEach((object, i) => {
        const sampled = M.sampleObject({ ...object, tracks: [] }, time, project.theme);
        const objectInput = (label, key, value, type = "number", extra = "") =>
          input(label, key, value, type, extra).replace('data-key=', `data-object="${i}" data-object-key=`);
        const objectDropdown = (label, key, value, values) =>
          dropdown(label, key, value, values).replace('data-key=', `data-object="${i}" data-object-key=`);
        html += `<details class="object-controls" ${i === 0 ? "open" : ""}><summary>${esc(object.id)}</summary>` +
          objectDropdown("Geometry", "geometry", object.geometry, M.GEOMETRIES) +
          objectDropdown("Material", "material", object.material || "standard", M.MATERIALS) +
          objectInput("Colour", "color", object.color || "$accent", "text") +
          Object.keys(M.OBJECT_RANGES).map((key) => objectInput(key, key, sampled[key], "number",
            `min="${M.OBJECT_RANGES[key][0]}" max="${M.OBJECT_RANGES[key][1]}" step="0.05"`)).join("") +
          objectInput("Rotation speed (rad/s)", "speed", object.speed ?? 0, "number", 'min="-10" max="10" step="0.1"') +
          objectInput("Seed", "seed", object.seed ?? 1, "number", 'min="0" max="65535"') +
          `<label>Animated property<select data-object-property="${i}">${options(Object.keys(M.OBJECT_RANGES), "rotationY")}</select></label>` +
          `<label>Value at playhead<input data-object-value="${i}" type="number" value="180" step="0.05"></label>` +
          `<button data-object-key-add="${i}">Add / update key at ${time.toFixed(2)}s</button>` +
          `<p class="micro">${(object.tracks || []).map((track) => `${esc(track.property)}: ${track.keyframes.length} keys`).join(" / ") || "No object keyframes"}</p>` +
          `<button data-object-tracks-clear="${i}">Clear object keyframes</button> <button data-object-remove="${i}" ${l.objects.length === 1 ? "disabled" : ""}>Remove object</button></details>`;
      });
      html += `<button id="object-add" ${l.objects.length === 40 ? "disabled" : ""}>Add 3D object</button>`;
    }
    html += `<h3>TRANSFORM</h3><div class="row">${input("X", "x", l.x || 0)}${input("Y", "y", l.y || 0)}</div><div class="row">${input("Width", "width", l.width ?? 180, "number", 'min="0"')}${input("Height", "height", l.height ?? 100, "number", 'min="0"')}</div><div class="row">${input("Rotation °", "rotation", l.rotation || 0)}${input("Scale", "scale", l.scale ?? 1, "number", 'min="0" step="0.05"')}</div>${dropdown(
      "Parent group",
      "parentId",
      l.parentId || "",
      [
        ["", "Stage (no parent)"],
        ...scene()
          .layers.filter((n) => n.type === "group" && n.id !== l.id)
          .map((n) => [n.id, n.name || n.id]),
      ],
    )}<label><input type="checkbox" data-key="hidden" ${l.hidden ? "checked" : ""}> Hide layer</label><h3>APPEARANCE</h3>${colour("Fill", "fill", l.fill || "$accent")}${colour("Stroke", "stroke", l.stroke || "none")}<div class="swatch-row">${Object.entries(
      project.theme,
    )
      .map(
        ([k, v]) =>
          `<button data-token="${k}" style="background:${v}" title="Use $${k} for fill"></button>`,
      )
      .join(
        "",
      )}</div><div class="row">${input("Stroke width", "strokeWidth", l.strokeWidth ?? 2, "number", 'min="0" max="100"')}${input("Corner radius", "radius", l.radius ?? 20, "number", 'min="0"')}</div>${input("Opacity", "opacity", l.opacity ?? 1, "number", 'min="0" max="1" step="0.05"')}<h3>MOTION</h3><div class="row">${input("Start (s)", "start", l.start || 0, "number", `min="0" max="${scene().duration}" step="0.1"`)}${input("End (s)", "end", l.end ?? scene().duration, "number", `min="0" max="${scene().duration}" step="0.1"`)}</div>${dropdown("Entrance", "enter", l.enter || "fade", ["none", "fade", "rise", "slide", "scale", "draw"])}<div class="row">${input("Entrance (s)", "enterDuration", l.enterDuration ?? 0.6, "number", 'min="0" step="0.1"')}${input("Exit fade (s)", "exitDuration", l.exitDuration || 0, "number", 'min="0" step="0.1"')}</div><h3>KEYFRAMES</h3><p class="field-help">Seek to a time, choose a property and value, then add a key. Times are relative to this scene.</p><div class="row"><label>Property<select id="kf-property">${options(["x", "y", "rotation", "scale", "opacity", "width", "height", "fill", "stroke", "progress"], "x")}</select></label><label>Value<input id="kf-value" value="${l.x || 0}"></label></div><div class="row"><label>At time (s)<input id="kf-time" type="number" min="0" max="${scene().duration}" step="0.1" value="${time.toFixed(2)}"></label><label>Easing<select id="kf-easing">${options(Object.keys(M.EASINGS), "easeInOut")}</select></label></div><button id="key-add" class="keyframe-action">＋ Add / update keyframe</button><div id="tracks">${(l.tracks || []).map((tr, i) => `<div class="track-item"><span>${esc(tr.property)} · ${tr.keyframes.length} keys ${tr.loop ? "↻" : ""}<br><small>${tr.keyframes.map((k) => k.time + "s").join(" · ")}</small></span><button data-track-loop="${i}" title="Toggle looping">↻</button><button data-track-remove="${i}" title="Remove track">×</button></div>`).join("")}</div><p class="micro">Edit individual keyframes in AI workspace → current JSON. Destination keyframes set the easing.</p>`;
    html += `<h3>SHADOW</h3>${input("Blur", "shadowBlur", l.shadowBlur ?? 0, "number", 'min="0" max="100"')}<div class="row">${input("Offset X", "shadowX", l.shadowX ?? 0)}${input("Offset Y", "shadowY", l.shadowY ?? 10)}</div>${colour("Shadow colour", "shadowColor", l.shadowColor || "#00000080")}`;
    host.innerHTML = html;
    $("kf-property").innerHTML = options(
      [...M.NUM_PROPS.filter((property) =>
        (!["intensity", "speed"].includes(property) || l.type === "effect") &&
        (!["cameraDistance", "cameraAzimuth", "cameraElevation", "fov", "lightIntensity"].includes(property) || l.type === "scene3d")),
      "fill", "stroke"], "x");
    if (["video", "scene3d", "effect", "line"].includes(l.type)) {
      host.querySelector('[data-key="parentId"]').disabled = true;
    }
    if (l.type === "scene3d") {
      $("object-add").onclick = () => change(() => currentLayer().objects.push({
        id: uid("object"), geometry: "sphere", material: "standard", color: "$secondary", x: 1.5,
      }));
      host.querySelectorAll("[data-object-key]").forEach((el) => {
        el.onchange = () => change(() => {
          currentLayer().objects[Number(el.dataset.object)][el.dataset.objectKey] =
            el.type === "number" ? Number(el.value) : el.value;
        });
      });
      host.querySelectorAll("[data-object-remove]").forEach((el) => {
        el.onclick = () => change(() => currentLayer().objects.splice(Number(el.dataset.objectRemove), 1));
      });
      host.querySelectorAll("[data-object-tracks-clear]").forEach((el) => {
        el.onclick = () => change(() => { delete currentLayer().objects[Number(el.dataset.objectTracksClear)].tracks; });
      });
      host.querySelectorAll("[data-object-key-add]").forEach((el) => {
        el.onclick = () => change(() => {
          const i = Number(el.dataset.objectKeyAdd);
          const object = currentLayer().objects[i];
          const property = host.querySelector(`[data-object-property="${i}"]`).value;
          const value = Number(host.querySelector(`[data-object-value="${i}"]`).value);
          object.tracks ??= [];
          let track = object.tracks.find((track) => track.property === property);
          if (!track) {
            track = { property, keyframes: [{
              time: time === 0 ? scene().duration : 0,
              value: M.sampleObject({ ...object, tracks: [] }, 0, project.theme)[property],
            }] };
            object.tracks.push(track);
          }
          track.keyframes = track.keyframes.filter((key) => key.time !== time);
          track.keyframes.push({ time, value, easing: "easeInOut" });
          track.keyframes.sort((a, b) => a.time - b.time);
        });
      });
    }
    host.querySelectorAll("[data-key]").forEach(
      (el) =>
        (el.onchange = () =>
          change(() => {
            const key = el.dataset.key;
            if (
              (key === "parentId" || key === "from" || key === "to") &&
              !el.value
            )
              delete currentLayer()[key];
            else
              currentLayer()[key] =
                el.type === "checkbox"
                  ? el.checked
                  : el.type === "number" || key === "fontWeight"
                    ? Number(el.value)
                    : el.value;
          })),
    );
    host
      .querySelectorAll("[data-colour]")
      .forEach(
        (el) =>
          (el.onchange = () =>
            change(() => (currentLayer()[el.dataset.colour] = el.value))),
      );
    host
      .querySelectorAll("[data-token]")
      .forEach(
        (el) =>
          (el.onclick = () =>
            change(() => (currentLayer().fill = "$" + el.dataset.token))),
      );
    host.querySelectorAll("[data-list]").forEach(
      (el) =>
        (el.onchange = () =>
          change(() => {
            currentLayer()[el.dataset.list] = el.value
              .split(",")
              .map((x) =>
                el.dataset.list === "values" ? Number(x.trim()) : x.trim(),
              );
          })),
    );
    host
      .querySelectorAll("[data-track-remove]")
      .forEach(
        (el) =>
          (el.onclick = () =>
            change(() =>
              currentLayer().tracks.splice(Number(el.dataset.trackRemove), 1),
            )),
      );
    host.querySelectorAll("[data-track-loop]").forEach(
      (el) =>
        (el.onclick = () =>
          change(() => {
            const tr = currentLayer().tracks[Number(el.dataset.trackLoop)];
            tr.loop = !tr.loop;
          })),
    );
    $("kf-property").onchange = () => {
      const k = $("kf-property").value;
      $("kf-value").value =
        M.sample(currentLayer(), time, scene(), project.theme)[k] ?? 0;
    };
    $("key-add").onclick = () =>
      change(() => {
        const prop = $("kf-property").value,
          at = Number($("kf-time").value),
          value = ["fill", "stroke"].includes(prop)
            ? $("kf-value").value
            : Number($("kf-value").value),
          ease = $("kf-easing").value,
          layer = currentLayer();
        layer.tracks ??= [];
        let tr = layer.tracks.find((t) => t.property === prop);
        if (!tr) {
          tr = { property: prop, keyframes: [] };
          layer.tracks.push(tr);
          const base =
            M.sample({ ...layer, tracks: [] }, 0, scene(), project.theme)[
              prop
            ] ?? 0;
          tr.keyframes.push({
            time: at === 0 ? scene().duration : 0,
            value: base,
            easing: "linear",
          });
        }
        tr.keyframes = tr.keyframes.filter((k) => k.time !== at);
        tr.keyframes.push({ time: at, value, easing: ease });
        tr.keyframes.sort((a, b) => a.time - b.time);
      });
  }
  function renderSceneInspector() {
    const s = scene(),
      bg = s.background,
      host = $("scene-inspector");
    host.innerHTML = `<h2>Scene &amp; palette</h2><p class="micro">Theme tokens update linked elements across every scene.</p><h3>PROJECT</h3><div class="row">${input("Width", "width", project.width, "number", 'min="256" max="4096"')}${input("Height", "height", project.height, "number", 'min="256" max="4096"')}</div>${input("Frame rate", "fps", project.fps, "number", 'min="1" max="60"')}${input("Scene duration (s)", "duration", s.duration, "number", 'min="0.1" max="600" step="0.1"')}<p class="micro">Changing canvas size does not rescale layers. Shortening a scene trims out-of-range keys and layer timings.</p><h3>BACKGROUND</h3>${dropdown("Style", "bg-type", bg.type, ["solid", "linear", "radial", "transparent"])}${colour("Background", "bg-color", bg.color || "$background")}${colour("Gradient end", "bg-color2", bg.color2 || "$surface")}${input("Gradient angle °", "bg-angle", bg.angle ?? 45)}<label><input type="checkbox" data-key="bg-grid" ${bg.grid ? "checked" : ""}> Technical grid</label><div class="row">${input("Grid size", "bg-gridSize", bg.gridSize || 60, "number", 'min="10" max="400"')}${input("Grid opacity", "bg-gridOpacity", bg.gridOpacity ?? 0.1, "number", 'min="0" max="1" step="0.01"')}</div><h3>COLOUR THEMES</h3><div class="theme-buttons">${Object.keys(
      M.THEMES,
    )
      .map((k) => `<button data-theme="${k}">${esc(k)}</button>`)
      .join("")}</div><h3>CUSTOM PALETTE</h3>${Object.entries(project.theme)
      .map(([k, v]) => colour(k, "theme-" + k, v))
      .join(
        "",
      )}<p class="field-help">Use $accent, $secondary, $text and other palette tokens on layers to keep them linked. A custom hex colour overrides the theme.</p>`;
    function edit(key, value) {
      change(() => {
        if (key.startsWith("bg-")) s.background[key.slice(3)] = value;
        else if (key.startsWith("theme-")) project.theme[key.slice(6)] = value;
        else if (key === "duration") {
          s.duration = value;
          for (const l of s.layers) {
            if (l.start > value) l.start = value;
            if (l.end > value) l.end = value;
            for (const target of [l, ...(l.objects || [])]) {
              for (const tr of target.tracks || []) {
                tr.keyframes = tr.keyframes.filter((k) => k.time <= value);
                if (tr.keyframes.length === 1 && tr.keyframes[0].time < value)
                  tr.keyframes.push({ time: value, value: tr.keyframes[0].value });
              }
              if (target.tracks)
                target.tracks = target.tracks.filter((tr) => tr.keyframes.length > 1);
            }
          }
        } else project[key] = value;
      });
    }
    host
      .querySelectorAll("[data-key]")
      .forEach(
        (el) =>
          (el.onchange = () =>
            edit(
              el.dataset.key,
              el.type === "checkbox"
                ? el.checked
                : el.type === "number"
                  ? Number(el.value)
                  : el.value,
            )),
      );
    host
      .querySelectorAll("[data-colour]")
      .forEach((el) => (el.onchange = () => edit(el.dataset.colour, el.value)));
    host
      .querySelectorAll("[data-theme]")
      .forEach(
        (el) =>
          (el.onclick = () =>
            change(
              () => (project.theme = M.clone(M.THEMES[el.dataset.theme])),
            )),
      );
  }
  function renderAssets() {
    const host = $("asset-library");
    host.replaceChildren();
    for (const [id, a] of Object.entries(project.assets)) {
      const card = document.createElement("div");
      card.className = "asset-card";
      const videoAsset = a.src.startsWith("data:video/");
      const img = document.createElement(videoAsset ? "video" : "img");
      img.src = a.src;
      if (videoAsset) { img.muted = true; img.preload = "metadata"; }
      else img.alt = a.name;
      const p = document.createElement("p");
      p.textContent = a.name;
      if (a.credit) p.title = a.credit;
      const add = document.createElement("button");
      add.textContent = "Add";
      add.onclick = () => addLayer(videoAsset ? "video" : "image", { asset: id, name: a.name });
      const depth = document.createElement("button");
      depth.textContent = "Depth";
      depth.title = "Add with floating motion, drop shadow and ground shadow";
      depth.hidden = videoAsset;
      depth.onclick = () => addWithDepth(id).catch((e) => toast(e.message));
      const replace = document.createElement("button");
      replace.textContent = "Replace";
      replace.title = "Replace the selected matching media layer";
      replace.onclick = () => {
        if (currentLayer()?.type !== (videoAsset ? "video" : "image"))
          return toast(`Select a ${videoAsset ? "video" : "image"} layer first.`);
        change(() => (currentLayer().asset = id));
      };
      const remove = document.createElement("button");
      remove.textContent = "×";
      remove.title = "Remove unused asset";
      remove.onclick = () => {
        if (project.scenes.some((s) => s.layers.some((l) => l.asset === id)))
          return toast(
            "This asset is in use. Delete or replace its media layers first.",
          );
        change(() => delete project.assets[id]);
      };
      card.append(img, p, add, depth, replace, remove);
      host.append(card);
    }
    $("asset-count").textContent = Object.keys(project.assets).length;
    renderIcons();
  }
  function renderIcons() {
    const lucide = $("icon-library").value === "lucide",
      library = lucide ? M.elements : M.icons,
      query = $("icon-search").value.trim().toLowerCase(),
      names = Object.keys(library).filter((n) =>
        n.replaceAll("_", " ").replaceAll("-", " ").includes(query.replaceAll("_", " ").replaceAll("-", " ")),
      );
    $("icon-count").textContent = `${names.length}`;
    const host = $("icon-grid");
    host.replaceChildren();
    names.forEach((name) => {
      const b = document.createElement("button");
      b.title = name;
      b.setAttribute("aria-label", "Add icon " + name);
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" ${lucide ? 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"' : ""}>${library[name]}</svg>`;
      b.onclick = () =>
        addLayer(lucide ? "symbol" : "icon", { [lucide ? "symbol" : "icon"]: name, name: name.replaceAll("_", " ").replaceAll("-", " ") });
      host.append(b);
    });
  }
  function renderUI() {
    repairSelection();
    $("project-name").value = project.name;
    $("scene-name").value = scene().name;
    $("resolution").textContent = `${project.width} × ${project.height}`;
    $("seek").max = scene().duration;
    $("duration-display").textContent = scene().duration.toFixed(1) + "s";
    $("stage").style.aspectRatio = `${project.width} / ${project.height}`;
    $("scene-summary").textContent =
      `${project.scenes.length} scenes · ${project.fps} fps`;
    $("undo").disabled = !undo.length;
    $("redo").disabled = !redo.length;
    renderScenes();
    renderLayers();
    renderTimeline();
    renderInspector();
    renderSceneInspector();
    renderAssets();
    draw();
  }
  function addLayer(type, extra = {}) {
    const id = uid(type);
    return change(() => {
      const common = {
        id,
        type,
        name: type[0].toUpperCase() + type.slice(1),
        x: project.width * 0.35,
        y: project.height * 0.4,
        width: 300,
        height: 150,
        fill: "$accent",
        enter: "rise",
        enterDuration: 0.6,
        start: 0,
      };
      const defaults = {
        text: {
          text: "Your headline",
          fontSize: 56,
          width: 650,
          height: 90,
          fill: "$text",
        },
        rect: { radius: 22 },
        circle: { width: 160, height: 160 },
        icon: { icon: "memory", width: 120, height: 120 },
        image: { width: 500, height: 300, fit: "contain", radius: 0 },
        line: {
          x: 300,
          y: 400,
          x2: 1100,
          y2: 400,
          curve: "bezier",
          arrow: true,
          stroke: "$secondary",
          strokeWidth: 4,
          particles: 2,
          enter: "draw",
          width: 800,
          height: 0,
        },
        path: {
          d: "M 0 100 Q 150 -70 300 100 T 600 100",
          width: 600,
          height: 200,
          fill: "none",
          stroke: "$secondary",
          strokeWidth: 4,
          enter: "draw",
          enterDuration: 2,
        },
        counter: {
          valueFrom: 0,
          valueTo: 100,
          suffix: "%",
          fontSize: 120,
          width: 450,
        },
        chart: {
          values: [20, 45, 65, 90],
          labels: ["A", "B", "C", "D"],
          width: 650,
          height: 350,
          fontSize: 24,
          enterDuration: 1.7,
        },
        group: { fill: "none", width: 500, height: 300, enter: "none" },
        symbol: { symbol: "box", width: 120, height: 120 },
        scene3d: {
          x: project.width * 0.1, y: project.height * 0.12,
          width: project.width * 0.8, height: project.height * 0.76,
          enter: "fade", cameraDistance: 6, mirror: false,
          objects: [{ id: uid("object"), geometry: "knot", material: "standard", color: "$accent", speed: 0.4 }],
        },
        effect: {
          effect: "gas", width: 600, height: 500, enter: "fade",
          x: project.width * 0.25, y: project.height * 0.2,
          intensity: 0.25, speed: 0.5, seed: 1,
        },
        video: { x: 0, y: 0, width: project.width, height: project.height, fit: "cover", enter: "none", trim: 0, playbackRate: 1, loop: false },
      };
      scene().layers[type === "video" ? "unshift" : "push"]({ ...common, ...defaults[type], ...extra });
      selected = id;
    });
  }
  function duplicateLayer() {
    const l = currentLayer();
    if (!l) return;
    change(() => {
      const descendants = new Set([l.id]);
      let n;
      do {
        n = descendants.size;
        scene().layers.forEach((x) => {
          if (descendants.has(x.parentId)) descendants.add(x.id);
        });
      } while (n !== descendants.size);
      const ids = new Map([...descendants].map((id) => [id, uid("copy")]));
      const copies = scene()
        .layers.filter((x) => descendants.has(x.id))
        .map((x) => {
          const c = M.clone(x);
          c.id = ids.get(x.id);
          c.name = (x.name || x.id) + " copy";
          if (c.id === ids.get(l.id)) {
            c.x = (c.x || 0) + 30;
            c.y = (c.y || 0) + 30;
          }
          if (ids.has(c.parentId)) c.parentId = ids.get(c.parentId);
          if (ids.has(c.from)) c.from = ids.get(c.from);
          if (ids.has(c.to)) c.to = ids.get(c.to);
          return c;
        });
      scene().layers.push(...copies);
      selected = ids.get(l.id);
    });
  }
  function removeLayer() {
    if (!currentLayer()) return;
    change(() => {
      const removed = new Set([selected]);
      let n;
      do {
        n = removed.size;
        scene().layers.forEach((l) => {
          if (removed.has(l.parentId)) removed.add(l.id);
        });
      } while (n !== removed.size);
      scene().layers = scene().layers.filter(
        (l) => !removed.has(l.id) && !removed.has(l.from) && !removed.has(l.to),
      );
      selected = null;
    });
  }
  document
    .querySelectorAll("[data-add]")
    .forEach((b) => (b.onclick = () => addLayer(b.dataset.add)));
  $("layer-copy").onclick = duplicateLayer;
  $("layer-remove").onclick = removeLayer;
  for (const [id, delta] of [
    ["layer-up", 1],
    ["layer-down", -1],
  ])
    $(id).onclick = () =>
      change(() => {
        const a = scene().layers,
          i = a.findIndex((l) => l.id === selected),
          j = i + delta;
        if (i >= 0 && j >= 0 && j < a.length) [a[i], a[j]] = [a[j], a[i]];
      });
  $("scene-add").onclick = () =>
    change(() => {
      const s = {
        id: uid("scene"),
        name: "Untitled scene",
        duration: 10,
        background: { type: "solid", color: "$background", grid: false },
        layers: [],
      };
      project.scenes.push(s);
      sceneId = s.id;
      selected = null;
      time = 0;
    });
  $("scene-copy").onclick = () =>
    change(() => {
      const s = M.clone(scene());
      s.id = uid("scene");
      s.name += " copy";
      project.scenes.splice(project.scenes.indexOf(scene()) + 1, 0, s);
      sceneId = s.id;
      selected = null;
    });
  $("scene-remove").onclick = () => {
    if (project.scenes.length > 1)
      change(() => {
        project.scenes = project.scenes.filter((s) => s.id !== sceneId);
        selected = null;
      });
  };
  E.templates().forEach((s, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = s.name;
    $("template-select").append(o);
  });
  $("template-add").onclick = () => {
    if ($("template-select").value === "")
      return toast("Choose a template first.");
    change(() => {
      const s = E.templates()[Number($("template-select").value)];
      s.id = uid("scene");
      project.scenes.push(s);
      sceneId = s.id;
      selected = null;
      time = 0;
    });
  };
  $("project-name").onchange = () =>
    change(() => (project.name = $("project-name").value));
  $("scene-name").onchange = () =>
    change(() => (scene().name = $("scene-name").value));
  $("undo").onclick = () => {
    if (!undo.length) return;
    redo.push(JSON.stringify(project));
    project = JSON.parse(undo.pop());
    save();
    renderUI();
  };
  $("redo").onclick = () => {
    if (!redo.length) return;
    undo.push(JSON.stringify(project));
    project = JSON.parse(redo.pop());
    save();
    renderUI();
  };
  function tabs(name) {
    const assets = name === "assets";
    $("layers-panel").hidden = assets;
    $("assets-panel").hidden = !assets;
    for (const id of ["layers", "assets"]) {
      $("tab-" + id).classList.toggle("active", name === id);
      $("tab-" + id).setAttribute("aria-selected", String(name === id));
    }
  }
  $("tab-layers").onclick = () => tabs("layers");
  $("tab-assets").onclick = () => tabs("assets");
  for (const name of ["element", "scene"])
    $("tab-" + name).onclick = () => {
      for (const n of ["element", "scene"]) {
        $(n + "-inspector").hidden = n !== name;
        $("tab-" + n).classList.toggle("active", n === name);
      }
    };
  $("icon-search").oninput = renderIcons;
  $("icon-library").onchange = renderIcons;
  document.querySelectorAll("[data-effect]").forEach((button) => {
    button.onclick = () => addLayer("effect", { effect: button.dataset.effect, name: button.dataset.effect });
  });
  $("advanced-select").innerHTML = options(window.MotionPresets.names, window.MotionPresets.names[0]);
  $("advanced-add").onclick = () => change(() => {
    const s = window.MotionPresets.scene($("advanced-select").value, project.width, project.height);
    s.id = uid("advanced");
    project.scenes.push(s);
    sceneId = s.id;
    selected = null;
    time = 0;
  });
  $("safe-area").onchange = draw;
  $("play").onclick = () => {
    playing = !playing;
    if (playing && time >= scene().duration) time = 0;
    last = performance.now();
    $("play").textContent = playing ? "Ⅱ" : "▶";
  };
  $("restart").onclick = () => {
    stop();
    time = 0;
    draw();
  };
  $("seek").oninput = () => {
    stop();
    time = Number($("seek").value);
    draw();
    if ($("kf-time")) $("kf-time").value = time.toFixed(2);
  };
  function tick(now) {
    if (playing) {
      time += Math.max(0, now - last) / 1000;
      const d = scene().duration;
      const next = project.scenes.findIndex((s) => s.id === sceneId) + 1;
      if (time >= d && sequence && (next < project.scenes.length || params.get("loop") === "1")) {
        // Demo playback runs the whole film: continue into the next scene from zero.
        sceneId = project.scenes[next % project.scenes.length].id;
        time = 0;
        selected = null;
        renderUI();
      } else if (time >= d) {
        if ($("loop").checked) time %= d;
        else {
          time = d;
          stop();
        }
      }
      draw();
    }
    last = now;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
  $("presentation").onclick = () => {
    document.body.classList.add("presentation");
    draw();
    toast("Clean preview · Escape to return");
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.body.classList.remove("presentation");
      draw();
    }
    if (
      ["INPUT", "TEXTAREA", "SELECT"].includes(
        document.activeElement.tagName,
      ) ||
      document.querySelector("dialog[open]")
    )
      return;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      $(e.shiftKey ? "redo" : "undo").click();
    }
    if (e.code === "Space") {
      e.preventDefault();
      $("play").click();
    }
    if (["Delete", "Backspace"].includes(e.key)) {
      e.preventDefault();
      removeLayer();
    }
    if (
      ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key) &&
      currentLayer()
    ) {
      e.preventDefault();
      const d = e.shiftKey ? 10 : 1;
      change(() => {
        const l = currentLayer();
        if (e.key === "ArrowLeft") l.x = (l.x || 0) - d;
        if (e.key === "ArrowRight") l.x = (l.x || 0) + d;
        if (e.key === "ArrowUp") l.y = (l.y || 0) - d;
        if (e.key === "ArrowDown") l.y = (l.y || 0) + d;
      });
    }
  });
  let drag = null;
  $("stage").addEventListener("pointerdown", (e) => {
    if (
      exportMode ||
      document.body.classList.contains("presentation") ||
      e.button !== 0
    )
      return;
    const node = e.target.closest("[data-layer]");
    if (!node) return;
    let id = node.dataset.layer;
    const clicked = scene().layers.find((l) => l.id === id);
    if (e.altKey && clicked.parentId) id = clicked.parentId;
    const chosen = scene().layers.find((l) => l.id === id);
    stop();
    select(id);
    if (chosen.type === "line") return;
    const dom = $("stage").querySelector(`[data-layer="${id}"]`);
    const inv = dom.parentNode.getScreenCTM().inverse();
    const start = new DOMPoint(e.clientX, e.clientY).matrixTransform(inv);
    drag = {
      id,
      inv,
      start,
      x: chosen.x || 0,
      y: chosen.y || 0,
      before: JSON.stringify(project),
      moved: false,
    };
    $("stage").setPointerCapture(e.pointerId);
  });
  $("stage").addEventListener("pointermove", (e) => {
    if (!drag) return;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(drag.inv),
      l = scene().layers.find((l) => l.id === drag.id);
    l.x = Math.round((drag.x + p.x - drag.start.x) * 10) / 10;
    l.y = Math.round((drag.y + p.y - drag.start.y) * 10) / 10;
    drag.moved = true;
    draw();
  });
  function endDrag() {
    if (!drag) return;
    if (drag.moved) {
      const errors = M.validate(project);
      if (errors.length) {
        project = JSON.parse(drag.before);
        toast(errors[0]);
      } else if (JSON.stringify(project) !== drag.before) {
        snapshot(drag.before);
        save();
      }
    }
    drag = null;
    renderUI();
  }
  $("stage").addEventListener("pointerup", endDrag);
  $("stage").addEventListener("pointercancel", endDrag);
  function download(data, name, type) {
    const blob = data instanceof Blob ? data : new Blob([data], { type }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  const slug = (s) =>
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "motion-forge";
  async function imageFrom(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Unable to decode this image."));
      img.src = src;
    });
  }
  async function dataURI(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result);
      r.onerror = () => reject(new Error("Could not read image."));
      r.readAsDataURL(file);
    });
  }
  const UNDRAW_ACCENT = "#6c63ff";
  const UNDRAW_CREDIT = "Illustration from unDraw (https://undraw.co), used under the unDraw License";
  // SVG imports use a deliberately small allowlist and are rasterised once, never inserted into the DOM.
  // options.recolor = {from, to} swaps one exact hex colour (e.g. unDraw's accent) before rasterising.
  async function importImage(file, options = {}) {
    if (file.size > 10000000)
      throw new Error(`${file.name}: maximum image size is 10 MB.`);
    let src;
    if (
      file.type === "image/svg+xml" ||
      file.name.toLowerCase().endsWith(".svg")
    ) {
      const raw = await file.text();
      if (raw.length > 2000000 || /<!DOCTYPE|<!ENTITY/i.test(raw))
        throw new Error(
          "SVG too large or contains a document type. Export a PNG instead.",
        );
      const doc = new DOMParser().parseFromString(raw, "image/svg+xml");
      if (
        doc.querySelector("parsererror") ||
        doc.documentElement.localName !== "svg"
      )
        throw new Error("Invalid SVG.");
      const tags = new Set([
        "svg",
        "g",
        "path",
        "rect",
        "circle",
        "ellipse",
        "line",
        "polyline",
        "polygon",
        "defs",
        "linearGradient",
        "radialGradient",
        "stop",
        "clipPath",
        "title",
        "desc",
      ]);
      const attrs = new Set([
        "xmlns",
        "width",
        "height",
        "viewBox",
        "x",
        "y",
        "x1",
        "y1",
        "x2",
        "y2",
        "cx",
        "cy",
        "r",
        "rx",
        "ry",
        "d",
        "points",
        "fill",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "stroke-dasharray",
        "stroke-dashoffset",
        "fill-rule",
        "clip-rule",
        "opacity",
        "fill-opacity",
        "stroke-opacity",
        "transform",
        "id",
        "gradientUnits",
        "gradientTransform",
        "offset",
        "stop-color",
        "stop-opacity",
        "clip-path",
        "preserveAspectRatio",
        "href",
      ]);
      // Inline style declarations commonly emitted by illustration tools; converted to attributes.
      const styleProps = new Set([
        "fill",
        "stroke",
        "stroke-width",
        "stroke-linecap",
        "stroke-linejoin",
        "stroke-miterlimit",
        "fill-rule",
        "clip-rule",
        "opacity",
        "fill-opacity",
        "stroke-opacity",
        "stop-color",
        "stop-opacity",
      ]);
      const declarations = (text) => {
        const out = [];
        for (const decl of text.split(";")) {
          if (!decl.trim()) continue;
          const i = decl.indexOf(":"),
            prop = decl.slice(0, i).trim().toLowerCase(),
            value = decl.slice(i + 1).trim();
          if (i < 1 || ["isolation", "mix-blend-mode"].includes(prop)) continue;
          if (
            !styleProps.has(prop) ||
            /[<>"'\\]/.test(value) ||
            (/url\(/i.test(value) && !/^url\(#[a-zA-Z][\w-]*\)$/.test(value))
          )
            throw new Error(
              `Unsupported SVG style ${prop || decl.trim()}. Export a flattened PNG instead.`,
            );
          out.push([prop, value]);
        }
        return out;
      };
      // Simple ".class { fill: … }" rules from illustration tools become attributes; other CSS is rejected.
      const classRules = new Map();
      for (const st of [...doc.querySelectorAll("style")]) {
        const css = st.textContent.replace(/\/\*[\s\S]*?\*\//g, ""),
          rule = /([^{}]+)\{([^{}]*)\}/g;
        if (css.replace(rule, "").trim())
          throw new Error("Unsupported SVG style block. Export a flattened PNG instead.");
        for (const m of css.matchAll(rule)) {
          const selectors = m[1].split(",").map((s) => s.trim());
          if (!selectors.every((s) => /^\.[A-Za-z_][\w-]*$/.test(s)))
            throw new Error(
              `Unsupported SVG style selector ${m[1].trim()}. Export a flattened PNG instead.`,
            );
          const decls = declarations(m[2]);
          for (const s of selectors)
            classRules.set(s.slice(1), [...(classRules.get(s.slice(1)) || []), ...decls]);
        }
        st.remove();
      }
      if (classRules.size)
        for (const el of doc.querySelectorAll("[class]"))
          for (const c of el.getAttribute("class").trim().split(/\s+/))
            for (const [prop, value] of classRules.get(c) || []) el.setAttribute(prop, value);
      const recolor =
        options.recolor &&
        /^#[\da-f]{6}$/i.test(options.recolor.from) &&
        /^#[\da-f]{6}$/i.test(options.recolor.to)
          ? {
              from: options.recolor.from.toLowerCase(),
              to: options.recolor.to.toLowerCase(),
            }
          : null;
      for (const el of doc.querySelectorAll("*")) {
        if (!tags.has(el.localName))
          throw new Error(
            `SVG ${el.localName} is unsupported. Convert text to paths and export a simple SVG or PNG.`,
          );
        for (const a of [...el.attributes]) {
          // Inert metadata from design tools (data-name="Layer 1", xlink namespace, class names, unDraw role/artist/source).
          if (
            a.name.startsWith("data-") ||
            ["xmlns:xlink", "xml:space", "class", "isolation", "version", "role", "artist", "source"].includes(a.name)
          ) {
            el.removeAttribute(a.name);
            continue;
          }
          // Gradient inheritance: only same-document fragment references are kept.
          if (a.name === "xlink:href" || a.name === "href") {
            el.removeAttribute(a.name);
            if (el.localName !== "linearGradient" && el.localName !== "radialGradient")
              throw new Error(`Unsupported SVG link on ${el.localName}. Export a flattened PNG instead.`);
            if (!/^#[a-zA-Z][\w-]*$/.test(a.value))
              throw new Error("SVG gradients may only reference gradients in the same file.");
            el.setAttribute("href", a.value);
            continue;
          }
          if (a.name === "style") {
            el.removeAttribute("style");
            for (const [prop, value] of declarations(a.value)) el.setAttribute(prop, value);
          }
        }
        for (const a of [...el.attributes]) {
          if (
            recolor &&
            ["fill", "stroke", "stop-color"].includes(a.name) &&
            a.value.trim().toLowerCase() === recolor.from
          )
            el.setAttribute(a.name, recolor.to);
          if (
            !attrs.has(a.name) ||
            (/javascript:|data:|https?:|\/\//i.test(a.value) &&
              a.name !== "xmlns") ||
            (/url\(/i.test(a.value) &&
              !/^url\(#[a-zA-Z][\w-]*\)$/.test(a.value))
          )
            throw new Error(
              `Unsupported SVG attribute ${a.name}. Export a flattened PNG instead.`,
            );
        }
      }
      const svg = doc.documentElement,
        vb = (svg.getAttribute("viewBox") || "")
          .trim()
          .split(/[ ,]+/)
          .map(Number);
      let w = parseFloat(svg.getAttribute("width")),
        h = parseFloat(svg.getAttribute("height"));
      if (!w || !h) {
        if (
          vb.length !== 4 ||
          !vb.every(Number.isFinite) ||
          vb[2] <= 0 ||
          vb[3] <= 0
        )
          throw new Error("SVG needs a valid width/height or viewBox.");
        w = vb[2];
        h = vb[3];
      }
      // Vectors are resolution-independent: rasterise at a 2048 px long side for crisp 1080p/4K export,
      // or at options.rasterSide (256-2048) when the caller knows the placement is small.
      const side = Number.isFinite(options.rasterSide)
          ? Math.max(256, Math.min(2048, Math.round(options.rasterSide)))
          : 2048,
        scale = side / Math.max(w, h);
      w = Math.max(1, Math.round(w * scale));
      h = Math.max(1, Math.round(h * scale));
      svg.setAttribute("width", w);
      svg.setAttribute("height", h);
      svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      const safe = new XMLSerializer().serializeToString(svg),
        url = URL.createObjectURL(new Blob([safe], { type: "image/svg+xml" }));
      try {
        const img = await imageFrom(url),
          canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        src = canvas.toDataURL("image/png");
      } finally {
        URL.revokeObjectURL(url);
      }
    } else {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type))
        throw new Error("Use PNG, JPEG, WebP or a simple SVG.");
      src = await dataURI(file);
    }
    const img = await imageFrom(src);
    if (
      img.naturalWidth > 8192 ||
      img.naturalHeight > 8192 ||
      img.naturalWidth * img.naturalHeight > 32000000
    )
      throw new Error(
        "Resize the image to at most 8192 px per side and 32 megapixels.",
      );
    const asset = { name: file.name, src };
    if (options.credit) asset.credit = String(options.credit).slice(0, 1000);
    if (options.source) asset.source = String(options.source).slice(0, 2048);
    return asset;
  }
  function importOptions() {
    if ($("image-source").value !== "undraw") return {};
    return {
      recolor: $("undraw-recolor").checked
        ? { from: UNDRAW_ACCENT, to: project.theme.accent }
        : null,
      credit: UNDRAW_CREDIT,
      source: "https://undraw.co/illustrations",
    };
  }
  // Builds an illustration with layered depth: a breathing ground shadow plus a floating, drop-shadowed image.
  // The image is fitted inside box (bottom-centred). Background placements skip shadows and float.
  const ENTER_STYLES = ["none", "fade", "rise", "slide", "scale"];
  // Builds an illustration with depth. opts: start, end, opacity, back (faded plate), distant (no shadows,
  // slow parallax), motion ("float" | "sway" | "drift" | "none"), drift (px over the scene), enter.
  function depthLayers(assetId, name, img, box, duration, opts = {}) {
    const k = Math.min(box.width / img.naturalWidth, box.height / img.naturalHeight),
      w = Math.max(1, Math.round(img.naturalWidth * k)),
      h = Math.max(1, Math.round(img.naturalHeight * k)),
      x = Math.round(box.x + (box.width - w) / 2),
      y = Math.round(box.y + box.height - h),
      d = duration,
      start = opts.start || 0,
      back = opts.back === true,
      distant = opts.distant === true,
      motion = opts.motion || (back || distant ? "drift" : "float"),
      drift = Number.isFinite(opts.drift) ? opts.drift : back ? 36 : distant ? 22 : 18,
      lift = Math.max(6, Math.round(h * 0.035)),
      imageId = uid("illustration");
    const image = {
      id: imageId,
      type: "image",
      name,
      asset: assetId,
      fit: "contain",
      radius: 0,
      x,
      y,
      width: w,
      height: h,
      start,
      opacity: opts.opacity ?? 1,
      enter: ENTER_STYLES.includes(opts.enter) ? opts.enter : back || distant ? "fade" : "rise",
      enterDuration: back ? 1.2 : distant ? 1 : 0.9,
    };
    if (Number.isFinite(opts.end) && opts.end > start) {
      image.end = Math.min(d, opts.end);
      image.exitDuration = 0.6;
    }
    const ease = (time, value) => ({ time, value, easing: "easeInOut" });
    if (motion === "drift")
      image.tracks = [{ property: "x", keyframes: [{ time: 0, value: x - drift / 2 }, { time: d, value: x + drift / 2, easing: "linear" }] }];
    else if (motion === "sway")
      image.tracks = [{ property: "rotation", keyframes: [{ time: 0, value: -1.6 }, ease(d / 2, 1.6), ease(d, -1.6)] }];
    else if (motion === "float")
      image.tracks = [{ property: "y", keyframes: [{ time: 0, value: y }, ease(d / 2, y - lift), ease(d, y)] }];
    if (back || distant) return { imageId, layers: [image] };
    Object.assign(image, {
      shadowBlur: 28,
      shadowX: 0,
      shadowY: 18,
      shadowColor: "#00000040",
    });
    const ground = {
      id: uid("ground"),
      type: "circle",
      name: `${name} ground shadow`,
      x: Math.round(x + w * 0.15),
      y: y + h - Math.round(h * 0.03),
      width: Math.round(w * 0.7),
      height: Math.max(10, Math.round(h * 0.07)),
      fill: "#0000002e",
      opacity: 0.9,
      start,
      enter: "fade",
      enterDuration: 0.8,
      tracks: motion === "float" ? [
        {
          property: "scale",
          keyframes: [
            { time: 0, value: 1 },
            { time: d / 2, value: 0.86, easing: "easeInOut" },
            { time: d, value: 1, easing: "easeInOut" },
          ],
        },
      ] : [],
    };
    if (image.end) Object.assign(ground, { end: image.end, exitDuration: image.exitDuration });
    return { imageId, layers: [ground, image] };
  }
  async function addWithDepth(id) {
    const a = project.assets[id];
    if (!a || !a.src.startsWith("data:image/")) return false;
    const img = await imageFrom(a.src),
      side = Math.min(project.width * 0.42, project.height * 0.62),
      box = {
        x: project.width * 0.62 - side / 2,
        y: project.height * 0.48 - side / 2,
        width: side,
        height: side,
      },
      built = depthLayers(id, a.name, img, box, scene().duration);
    const ok = change(() => {
      scene().layers.push(...built.layers);
      selected = built.imageId;
    });
    if (ok) toast(`Added ${a.name} with depth: float, drop shadow and ground shadow.`);
    return ok;
  }
  // Applies a placement plan of local illustrations (filenames only) to the open project in one undoable step.
  // Placements: {scene, file, x, y, width, height, start?, end?, opacity?, layer?: "front"|"mid"|"back",
  // index?, distant?, motion?, drift?, enter?}. "front" (default) appends unless an index is given;
  // "mid" keeps full depth styling at a given index; "back" is a faded plate at a given index.
  async function applyIllustrationPlan(plan) {
    if (!Array.isArray(plan)) return 0;
    // Plans may come from an LLM: drop malformed placements before touching the project.
    plan = plan.filter((p) => p && typeof p === "object" && typeof p.file === "string" && typeof p.scene === "string" &&
      [p.x, p.y, p.width, p.height].every(Number.isFinite) && p.width > 0 && p.height > 0 &&
      (p.index === undefined || Number.isInteger(p.index)));
    if (!plan.length) return 0;
    const key = (lib, file) => `${lib || "undraw"}/${file}`,
      available = new Set(localIllustrations.map((e) => key(e.library, e.file))),
      imported = new Map(),
      prepared = [];
    for (const p of plan) {
      const k = key(p.library, p.file);
      if (!available.has(k) || !project.scenes.some((s) => s.id === p.scene)) continue;
      try {
        if (!imported.has(k)) {
          // Size each file for its largest placement at 4K (3840 px wide output).
          const side = Math.max(...plan.filter((q) => key(q.library, q.file) === k).map((q) => Math.max(q.width, q.height)));
          const asset = await localIllustrationAsset(
            { library: p.library || "undraw", file: p.file },
            { recolor: true, rasterSide: Math.ceil((side * 3840) / (project.width || 1600) / 128) * 128 },
          );
          imported.set(k, { asset, img: await imageFrom(asset.src), id: uid("asset") });
        }
        prepared.push({ p, ...imported.get(k) });
      } catch (e) {
        console.warn(`Skipped ${p.file}: ${e.message}`);
      }
    }
    if (!prepared.length) return 0;
    // Insert from the highest index down so earlier placements keep their planned positions.
    prepared.sort((a, b) => (b.p.index ?? 1e9) - (a.p.index ?? 1e9));
    const ok = change(() => {
      for (const { p, asset, img, id } of prepared) {
        const s = project.scenes.find((x) => x.id === p.scene);
        project.assets[id] = asset;
        const built = depthLayers(id, asset.name, img, p, s.duration, {
          start: p.start,
          end: p.end,
          opacity: p.opacity,
          back: p.layer === "back",
          distant: p.distant === true,
          motion: p.motion,
          drift: p.drift,
          enter: p.enter,
        });
        const at = Math.max(0, Math.min(s.layers.length, p.index ?? s.layers.length));
        s.layers.splice(at, 0, ...built.layers);
      }
    });
    return ok ? prepared.length : 0;
  }
  $("image-source").onchange = () =>
    ($("undraw-options").hidden = $("image-source").value !== "undraw");
  // Optional local folders of the user's own downloads; absent in a clean checkout and never committed.
  const LOCAL_LIBRARIES = {
    undraw: {
      dir: "assets/undraw-local/",
      label: "unDraw",
      credit: UNDRAW_CREDIT,
      source: "https://undraw.co/illustrations",
      recolor: true,
    },
  };
  const IMAGE_TYPES = { svg: "image/svg+xml", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp" };
  let localIllustrations = [];
  function illustrationLabel(file) {
    return window.MotionDirector.label(file);
  }
  const localUrl = (e) => LOCAL_LIBRARIES[e.library].dir + encodeURIComponent(e.file);
  async function localIllustrationAsset(entry, { recolor, rasterSide } = {}) {
    const lib = LOCAL_LIBRARIES[entry.library];
    if (!lib) throw new Error(`Unknown illustration library ${entry.library}.`);
    const res = await fetch(localUrl(entry));
    if (!res.ok) throw new Error(`${entry.file} is missing. Run npm run index:illustrations.`);
    const type = IMAGE_TYPES[entry.file.split(".").pop().toLowerCase()],
      asset = await importImage(new File([await res.blob()], entry.file, { type }), {
        recolor: lib.recolor && recolor ? { from: UNDRAW_ACCENT, to: project.theme.accent } : null,
        credit: lib.credit,
        source: lib.source,
        rasterSide,
      });
    asset.name = illustrationLabel(entry.file);
    return asset;
  }
  function renderLocalIllustrations() {
    const host = $("local-illustration-grid"),
      q = $("local-illustration-search").value.trim().toLowerCase(),
      only = $("local-illustration-library").value,
      hits = localIllustrations.filter(
        (e) => (only === "all" || e.library === only) && illustrationLabel(e.file).toLowerCase().includes(q),
      );
    host.replaceChildren();
    for (const entry of hits.slice(0, 60)) {
      const b = document.createElement("button"),
        img = document.createElement("img"),
        label = illustrationLabel(entry.file);
      img.src = localUrl(entry);
      img.alt = label;
      img.loading = "lazy";
      b.title = `${label} (${LOCAL_LIBRARIES[entry.library].label}) — add with depth`;
      b.dataset.file = entry.file;
      b.dataset.library = entry.library;
      b.append(img);
      b.onclick = () => addLocalIllustration(entry).catch((e) => toast(e.message));
      host.append(b);
    }
    $("local-illustration-count").textContent =
      hits.length > 60 ? `60 of ${hits.length}` : hits.length;
  }
  async function addLocalIllustration(entry) {
    if (typeof entry === "string") entry = { library: "undraw", file: entry };
    const asset = await localIllustrationAsset(entry, { recolor: $("undraw-recolor").checked }),
      id = uid("asset");
    if (!change(() => (project.assets[id] = asset))) return false;
    return addWithDepth(id);
  }
  async function loadLocalIllustrations() {
    const found = [];
    for (const [library, lib] of Object.entries(LOCAL_LIBRARIES)) {
      try {
        const res = await fetch(lib.dir + "index.json", { cache: "no-store" });
        const list = res.ok ? await res.json() : [];
        if (Array.isArray(list))
          for (const f of list)
            if (typeof f === "string" && /^[\w .()-]+\.(svg|png|jpe?g|webp)$/i.test(f)) found.push({ library, file: f });
      } catch {
        // Folder absent: nothing to list for this library.
      }
    }
    localIllustrations = found;
    const libs = new Set(found.map((e) => e.library)),
      select = $("local-illustration-library");
    for (const o of select.options) o.hidden = o.value !== "all" && !libs.has(o.value);
    if (select.selectedOptions[0]?.hidden) select.value = "all";
    select.hidden = libs.size < 2;
    $("local-illustrations").hidden = !found.length;
    if (found.length) renderLocalIllustrations();
    return found.length;
  }
  $("local-illustration-search").oninput = renderLocalIllustrations;
  $("local-illustration-library").onchange = renderLocalIllustrations;
  loadLocalIllustrations();
  $("image-upload").onchange = async (e) => {
    const opts = importOptions();
    for (const file of e.target.files) {
      try {
        const asset = await importImage(file, opts),
          id = uid("asset");
        if (change(() => (project.assets[id] = asset)))
          toast(`Added ${file.name}. Click Add or Depth in your asset library.`);
      } catch (err) {
        toast(`${file.name}: ${err.message}`);
      }
    }
    e.target.value = "";
  };
  async function importVideo(file) {
    if (file.size > 100000000) throw new Error("Maximum video size is 100 MB.");
    const mime = /\.webm$/i.test(file.name) ? "video/webm" :
      /\.mp4$/i.test(file.name) ? "video/mp4" : file.type;
    if (!["video/mp4", "video/webm"].includes(mime))
      throw new Error("Use an MP4 or WebM video.");
    const src = await dataURI(new Blob([file], { type: mime }));
    const probe = document.createElement("video");
    probe.muted = true;
    const url = URL.createObjectURL(file);
    try {
      await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error("Timed out reading video.")), 15000);
        probe.onloadeddata = () => { clearTimeout(timer); resolve(); };
        probe.onerror = () => { clearTimeout(timer); reject(new Error("The browser could not decode this video. Convert it to H.264 MP4 or VP9 WebM.")); };
        probe.src = url;
      });
      if (!Number.isFinite(probe.duration) || probe.duration <= 0 ||
          probe.videoWidth > 8192 || probe.videoHeight > 8192)
        throw new Error("Use a finite-duration video up to 8192 pixels per side.");
      return { name: file.name, src };
    } finally { probe.removeAttribute("src"); probe.load(); URL.revokeObjectURL(url); }
  }
  $("video-upload").onchange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const asset = await importVideo(file), id = uid("video");
        if (change(() => { project.assets[id] = asset; }) &&
            addLayer("video", { asset: id, name: asset.name }))
          toast("Video added behind your graphics. Export JSON to save large media.");
      } catch (error) { toast(error.message); }
    }
    e.target.value = "";
  };
  $("ai-open").onclick = () => {
    stop();
    $("ai-dialog").showModal();
  };
  $("export-open").onclick = () => {
    stop();
    $("export-dialog").showModal();
  };
  function jsonValue() {
    const raw = $("json-editor").value;
    if (raw.length > 170000000)
      throw new Error("Project exceeds the 170 MB import limit.");
    const p = JSON.parse(raw);
    M.assertValid(p);
    return p;
  }
  $("json-current").onclick = () => {
    $("json-editor").value = JSON.stringify(project, null, 2);
    $("json-errors").textContent = "";
  };
  $("json-validate").onclick = () => {
    try {
      jsonValue();
      $("json-errors").textContent = "Valid project. Ready to apply.";
    } catch (e) {
      $("json-errors").textContent = e.message;
    }
  };
  $("json-apply").onclick = async () => {
    try {
      const p = jsonValue(),
        plan = pendingIllustrations;
      if (
        change(() => {
          project = p;
          sceneId = p.scenes[0].id;
          selected = null;
          time = 0;
        })
      ) {
        $("ai-dialog").close();
        const placed = plan?.length ? await applyIllustrationPlan(plan) : 0;
        toast(plan?.length
          ? `Project loaded with ${placed} of ${plan.length} planned illustrations. Undo steps back.`
          : "Project loaded. Undo restores the previous project.");
      }
    } catch (e) {
      $("json-errors").textContent = e.message;
    }
  };
  $("json-file").onchange = async (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 170000000) {
        $("json-errors").textContent =
          "Project exceeds the 170 MB import limit.";
        return;
      }
      $("json-editor").value = await f.text();
      $("json-validate").click();
    }
    e.target.value = "";
  };
  function agentPrompt() {
    const compact = M.clone(project);
    for (const a of Object.values(compact.assets))
      a.src = "KEEP_EXISTING_EMBEDDED_ASSET";
    const brief = $("ai-brief").value.trim(),
      director = brief ? D.expandBrief(brief, { library: localIllustrations }) : null,
      draft = director && $("prompt-draft").checked ? D.build(brief, { library: localIllustrations }) : null,
      hasLibrary = localIllustrations.length > 0,
      picks = hasLibrary
        ? [...new Map([...(director?.plan || []), ...D.suggest(localIllustrations, `${brief} ${project.name} ${project.scenes.map((s) => s.name).join(" ")}`, 30)]
            .map((e) => [`${e.library || "undraw"}/${e.file}`, e])).values()].slice(0, 40)
        : [];
    const directorSection = director ? `
DIRECTOR'S EXPANDED BRIEF (inferred automatically from the short brief above; anything the user wrote explicitly wins)
${director.text}
` : "";
    const illustrationSection = hasLibrary ? `
ILLUSTRATION DEPTH (the user's local library: ${localIllustrations.length} files; never embed, fetch or invent illustration bytes)
To add illustrations return {"project": <complete project>, "illustrations": [placements]} instead of the bare project. The editor imports each file, recolours its accent to theme.accent, adds credit and builds depth layers.
Placement: {scene:"<scene id>",file:"<exact filename below>",library:"undraw",x,y,width,height,start?,end?,opacity?,layer?:"front"|"mid"|"back",index?,motion?:"float"|"sway"|"drift"|"none",distant?,enter?}. The box is in stage pixels; the image is fitted inside it, bottom-centred. front/mid get a drop shadow, a ground shadow and a gentle float; back/distant become faded plates (opacity about 0.16) with slow drift; index inserts at that layer position (back plates go just after background atmosphere layers; front placements just before rails/overlays).
Depth rules: at most one front illustration and two back plates per scene; boxes never overlap text, cards, charts or 3D viewports; keep 5% margins; vary files across scenes; match the scene's subject.
Matching files: ${picks.map((e) => `${e.file} (${illustrationLabel(e.file)})`).join("; ")}
` : "";
    const base = draft
      ? `DIRECTOR DRAFT PROJECT (valid, generated from the brief; refine copy, timing and motion rather than starting over; keep scene ids and the free areas reserved for illustrations)
${JSON.stringify(draft.project)}${hasLibrary ? `
DRAFT ILLUSTRATION PLAN (return it, improved if needed, as "illustrations")
${JSON.stringify(draft.plan)}` : ""}`
      : `CURRENT PROJECT (embedded media bytes replaced by preservation markers)
${JSON.stringify(compact, null, 2)}`;
    return `You are a Motion Forge technical motion designer and procedural 3D art director.
BRIEF: ${brief || "Improve this project while preserving its subject."}
Return JSON only, no fences, scripts, HTML, expressions or remote URLs: ${hasLibrary ? 'a complete version-1 project, or {"project": <project>, "illustrations": [placements]}' : "a complete version-1 project"}.
Short briefs are normal: infer the missing decisions (genre, audience, beats, copy, palette, pacing, 3D, depth) like a senior motion designer instead of asking questions, and stay within what the user said. Never invent factual claims, statistics, quotes or asset bytes.
Plan a clear shot progression with foreground typography, midground subjects, background atmosphere and readable holds. Use nested 2D components and multiple 3D objects, staggered keyframes, camera choreography and controlled lighting when useful; do not add effects without purpose.
Canvas ${project.width}x${project.height}, ${project.fps} fps. Use 5% safe margins. All tracks use scene-relative seconds; no accumulated simulation. Preserve existing asset IDs and KEEP_EXISTING_EMBEDDED_ASSET markers; the editor restores image/video bytes. Request missing video rather than inventing it.
${directorSection}
QUALITY CHECKLIST
Every scene: background atmosphere (light orbs, particles, grid, mist or effect), midground subject (illustration, 3D or diagram) and foreground typography with soft shadows. Stagger entrances 0.2-0.5s apart; nothing static for more than 2s (float, drift, camera orbit, counters, drawn connectors); hold the final composition at least 1.5s. One idea per scene, short headlines (at most 8 words), body copy at least 20px, wrap text manually with \\n. Recurring rails (chapter label, scene counter, progress bar) and a quick accent transition wipe at scene starts give a produced feel.
${illustrationSection}
SCHEMA GUIDE
Project: {version:1,name,width,height,fps,theme:{background,surface,accent,secondary,text,muted,line},assets:{id:{name,src,credit?,source?}},scenes:[{id,name,duration,background:{type:"solid|linear|radial|transparent",color,color2?,angle?,grid?,gridSize?,gridOpacity?},layers:[]}]}
Palette: six-digit hex. Layer colours: hex, none or $themeToken. IDs: letter then letters/digits/_/-. Limits: 60 scenes, 400 layers/scene, 40 objects/3D layer. Layers back-to-front.
Common fields: id,type,name,x,y,width,height,rotation,scale,opacity,fill,stroke,strokeWidth,radius,start,end,enter,enterDuration,exitDuration,parentId,hidden,tracks,shadowBlur(0..100),shadowX/shadowY(-500..500),shadowColor.
Stage positions: pixels, top-left. Text y is line-box top, no auto-wrap. Groups: local coordinates; transform about declared width/height centre. Connectors, video, scene3d and effect must be root layers.
Entrances: none,fade,rise,slide,scale,draw. Use enter:none for entirely keyframed motion.
Types:
text: text,fontSize,fontWeight,align(left|center|right),lineHeight,fontFamily(sans|mono|serif).
rect,circle,group: common fields.
icon: icon (Material name). symbol: symbol (Lucide name).
image: asset,fit(contain|cover|stretch).
line: from,to,fromAnchor,toAnchor(left|right|top|bottom|center),x2,y2,curve(straight|bezier|step),arrow,particles,dash,progress.
path: d(SVG commands),progress.
counter: valueFrom,valueTo,decimals,prefix,suffix,fontSize,fontWeight,align.
chart: values,labels,colors,maxValue,barGap,fontSize,progress.
video: asset(MP4/WebM),fit,trim(source seconds),playbackRate(0.1..8),loop(boolean). Place before graphic layers for overlays. Source audio is not mixed. Hold last frame unless loop:true.
effect: effect(${M.EFFECTS.join("|")}),intensity(0..1),speed(-10..10),seed(integer0..65535). Fill sets colour. These are stylized WebGL effects, not fluid simulations.
scene3d: objects,cameraDistance(2..30),cameraAzimuth(degrees),cameraElevation(-85..85),fov(15..100),lightIntensity(0..20),lightColor,mirror(boolean single horizontal planar reflection). Its x/y/width/height is a pixel viewport; objects inside use world units around origin. Camera looks at origin.
3D object: id,geometry(${M.GEOMETRIES.join("|")}),material(${M.MATERIALS.join("|")}),color,speed(Y rad/sec),seed,tracks,${Object.keys(M.OBJECT_RANGES).join(",")}. Object range map: ${JSON.stringify(M.OBJECT_RANGES)}.
Glass uses physical transmission/IOR and procedural environment highlights, not ray-traced recursive glass. Water/metal deform from absolute time; gas is a procedural shader. Modeling is procedural primitives, not arbitrary mesh editing.
Layer tracks: [{property:"x",loop:false,keyframes:[{time:0,value:100},{time:2,value:400,easing:"easeOut"}]}].
Layer numeric properties: ${M.NUM_PROPS.join(",")}; colours fill,stroke. Camera/light properties apply to scene3d, intensity/speed to effects. Object tracks use only keys from the object range map; rotations are degrees, scale defaults1.
2..100 strictly increasing keys per track, one track/property, <=20 tracks/layer and <=18/object. Easings: ${Object.keys(M.EASINGS).join(",")}. Destination key controls easing. Seeded effects and exact seeking must remain deterministic.
DELIVERY: validate schema AND semantic references/timing. Preview start, reveals, middle and end; revisit a timestamp. Check text contrast, occlusion, 3D framing, video trim and loop boundaries. Mixed 3D/video scenes export to PNG/MP4/WebM, not editable SVG. High-quality deterministic MP4/WebM requires the included CLI plus local FFmpeg; browser recording is best effort. No audio timeline or external model loading.
AVAILABLE MATERIAL ICONS
${Object.keys(M.icons).join(", ")}
AVAILABLE LUCIDE SYMBOLS
${Object.keys(M.elements).join(", ")}
ADVANCED COMPOSITION EXAMPLE
${JSON.stringify(window.MotionPresets.scene("Glass & mirror", project.width, project.height))}
${base}
For repository authoring read agent/motion-forge/SKILL.md and references/scene-format.md. Validate: node scripts/validate.cjs project.json. Return only complete JSON.`;
  }
  // AI prompts omit large image payloads; only known asset IDs may recover their existing bytes.
  function expandMarkers(p) {
    for (const [id, a] of Object.entries(p.assets || {})) {
      if (a.src === "KEEP_EXISTING_EMBEDDED_ASSET") {
        if (!project.assets[id])
          throw new Error(`Missing existing asset ${id}; upload it first.`);
        a.src = project.assets[id].src;
      }
    }
    return p;
  }
  let pendingIllustrations = null;
  jsonValue = function () {
    const raw = $("json-editor").value;
    if (raw.length > 170000000)
      throw new Error("Project exceeds the 170 MB import limit.");
    let p = JSON.parse(raw);
    pendingIllustrations = null;
    // Agents may return {"project": {...}, "illustrations": [placements]} to add local illustration depth.
    if (p && typeof p === "object" && !Array.isArray(p) && p.project && typeof p.project === "object") {
      if (p.illustrations !== undefined && !Array.isArray(p.illustrations))
        throw new Error("illustrations must be an array of placements.");
      pendingIllustrations = p.illustrations || null;
      p = p.project;
    }
    return M.assertValid(expandMarkers(p));
  };
  // Smart director: one-line brief -> analysis readout, complete project, illustration depth.
  const D = window.MotionDirector;
  function directorReadout() {
    const brief = $("ai-brief").value.trim(), out = $("director-readout");
    if (!brief) {
      out.replaceChildren();
      return null;
    }
    const r = D.build(brief, { library: localIllustrations }), a = r.analysis;
    const labels = [...new Set(r.plan.map((p) => illustrationLabel(p.file)))];
    out.innerHTML =
      `<b>${esc(a.genreLabel)}</b> · “${esc(a.title)}” · ${a.duration}s in ${a.beats.length} scenes · ${esc(a.themeName)} theme` +
      `${a.colours.length ? ` + ${esc(a.colours.join("/"))}` : ""}<br>` +
      `Beats: ${a.beats.map((b) => esc(D.CHAPTERS[b] || b)).join(" → ")}<br>` +
      `Items: ${esc(a.items.join(", "))}${a.numbers.length ? ` · Figures: ${esc(a.numbers.map((n) => `${n.prefix}${n.value}${n.suffix}`).join(", "))}` : ""}<br>` +
      (r.plan.length
        ? `Depth: ${r.plan.length} illustrations, e.g. ${esc(labels.slice(0, 5).join(", "))}`
        : "Depth: no local illustrations found. Import some with npm run import:illustrations to add depth.");
    return r;
  }
  $("ai-brief").oninput = directorReadout;
  for (const b of $("brief-starters").querySelectorAll("button"))
    b.onclick = () => {
      $("ai-brief").value = b.dataset.brief;
      directorReadout();
    };
  async function directProject(brief) {
    brief = String(brief || "").trim();
    if (!brief) throw new Error("Describe your idea in a sentence first.");
    const r = D.build(brief, { library: localIllustrations });
    const ok = change(() => {
      project = r.project;
      sceneId = r.project.scenes[0].id;
      selected = null;
      time = 0;
    });
    if (!ok) return null;
    const placed = r.plan.length ? await applyIllustrationPlan(r.plan) : 0;
    return { analysis: r.analysis, scenes: r.project.scenes.length, placed };
  }
  async function autoDepth() {
    if (!localIllustrations.length) {
      toast("No local illustrations yet. Import your downloads with npm run import:illustrations first.");
      return 0;
    }
    const plan = D.depthPlan(project, localIllustrations, { brief: $("ai-brief").value });
    const placed = plan.length ? await applyIllustrationPlan(plan) : 0;
    toast(placed
      ? `Added ${placed} matched illustration${placed > 1 ? "s" : ""} with depth across ${new Set(plan.map((p) => p.scene)).size} scene(s).`
      : "Every scene already has illustrations, or nothing matched.");
    return placed;
  }
  $("director-build").onclick = async () => {
    try {
      const r = await directProject($("ai-brief").value);
      if (!r) return;
      $("ai-dialog").close();
      toast(`Built “${r.analysis.title}”: ${r.scenes} scenes, ${r.analysis.duration}s, ${r.placed} illustrations. Press play or refine any layer.`);
    } catch (e) {
      $("json-errors").textContent = e.message;
    }
  };
  $("director-depth").onclick = () => autoDepth().catch((e) => toast(e.message));
  $("auto-depth").onclick = () => autoDepth().catch((e) => toast(e.message));
  $("copy-prompt").onclick = async () => {
    const text = agentPrompt();
    try {
      await navigator.clipboard.writeText(text);
      toast("Prompt copied. Paste it into your preferred LLM.");
    } catch {
      download(text, "motion-forge-agent-prompt.txt", "text/plain");
      toast("Clipboard unavailable. Prompt downloaded instead.");
    }
  };
  $("download-prompt").onclick = () =>
    download(agentPrompt(), "motion-forge-agent-prompt.txt", "text/plain");
  $("save-project").onclick = () =>
    download(
      JSON.stringify(project, null, 2),
      slug(project.name) + ".motion.json",
      "application/json",
    );
  $("export-svg").onclick = () => {
    try {
      download(M.renderSVG(project, sceneId, time),
        `${slug(scene().name)}-${time.toFixed(2)}.svg`, "image/svg+xml");
    } catch (e) { toast(e.message); }
  };
  async function paint(canvas, p, id, t) {
    return exportCompositor.paint(canvas, p, id, t);
  }
  $("export-png").onclick = async () => {
    try {
      const c = document.createElement("canvas");
      c.width = project.width;
      c.height = project.height;
      await paint(c, project, sceneId, time);
      const blob = await new Promise((r) => c.toBlob(r, "image/png"));
      if (!blob) throw new Error("PNG encoding failed.");
      download(blob, `${slug(scene().name)}-${time.toFixed(2)}.png`);
    } catch (e) {
      toast(e.message);
    } finally { exportCompositor.dispose(); }
  };
  $("record-cancel").onclick = () => {
    recordCancel = true;
  };
  const videoFormats = window.MotionVideo.supportedFormats();
  $("video-format").innerHTML = options(videoFormats.map((format) => [format.value, format.label]), "webm");
  $("export-video").disabled = !videoFormats.length;
  $("video-support").textContent = videoFormats.some((format) => format.value === "mp4") ?
    "MP4 and WebM are available in this browser. Real-time recording may be slower with complex scenes." :
    "MP4 recording is not supported by this browser. Use the local FFmpeg exporter for MP4.";
  $("export-video").onclick = async () => {
    const p = M.clone(project),
      s = p.scenes.find((s) => s.id === sceneId);
    if (s.background.type === "transparent")
      s.background = { ...s.background, type: "solid", color: "$background" };
    const c = document.createElement("canvas");
    c.width = p.width;
    c.height = p.height;
    stop();
    recordCancel = false;
    $("record-cancel").hidden = false;
    const button = $("export-video");
    button.disabled = true;
    $("export-png").disabled = true;
    try {
      const result = await window.MotionVideo.record({
        canvas: c, paint: (t) => paint(c, p, s.id, t),
        duration: s.duration, fps: p.fps, format: $("video-format").value,
        bitrate: Number($("video-bitrate").value) * 1000000,
        isCancelled: () => recordCancel,
        onProgress: (progress) => { $("record-progress").value = progress; },
      });
      download(result.blob, `${slug(s.name)}.${result.extension}`);
      toast("Video exported. Use the CLI exporter for deterministic production output.");
    } catch (e) {
      toast(e.message);
    } finally {
      exportCompositor.dispose();
      button.disabled = false;
      $("export-png").disabled = false;
      $("record-cancel").hidden = true;
    }
  };
  window.MotionForgeApp = {
    getProject: () => M.clone(project),
    setProject: (p) => {
      M.assertValid(p);
      stop();
      project = M.clone(p);
      sceneId = project.scenes[0].id;
      selected = null;
      time = 0;
      renderUI();
    },
    renderFrame: async (id, t, options = {}) => {
      if (!project.scenes.some((s) => s.id === id) || !Number.isFinite(t))
        throw new Error("Render frame requires a valid scene ID and finite time.");
      stop();
      sceneId = id;
      time = Math.max(0, Math.min(t, scene().duration));
      draw();
      if (paintTask) await paintTask;
      if (frameError) throw frameError;
      if (options.image === false) return null;
      return window.MotionCompositor.hasMedia(scene()) ? previewCanvas.toDataURL("image/png") : M.renderSVG(project, sceneId, time);
    },
    importImage,
    addWithDepth,
    addLocalIllustration,
    applyIllustrationPlan,
    loadLocalIllustrations,
    importVideo,
    agentPrompt,
    direct: directProject,
    autoDepth,
    directorReadout: () => {
      const r = directorReadout();
      return r && { analysis: r.analysis, plan: r.plan, text: $("director-readout").textContent };
    },
    select,
    getTime: () => time,
  };
  window.renderFrame = window.MotionForgeApp.renderFrame;
  if (exportMode) {
    document.body.classList.add("presentation");
    document.documentElement.style.background = "transparent";
    document.body.style.background = "transparent";
  }
  if (
    params.has("scene") &&
    project.scenes.some((s) => s.id === params.get("scene"))
  )
    sceneId = params.get("scene");
  if (params.has("t"))
    time = Math.max(
      0,
      Math.min(scene().duration, Number(params.get("t")) || 0),
    );
  renderUI();
  const demo = params.get("demo");
  const showcaseKeys = ["technology", "scenery", "food", "meeting", "social"];
  const demoPath = !demo ? Promise.resolve(null) :
    demo === "catalog" ? Promise.resolve("examples/catalog.motion.json") :
    showcaseKeys.includes(demo) ? Promise.resolve(`examples/showcase/${demo}.motion.json`) :
    fetch("examples/demos/manifest.json").then((r) => (r.ok ? r.json() : [])).catch(() => [])
      .then((list) => list.find((d) => d.key === demo)?.project || null);
  demoPath.then((path) => {
    if (path) return loadDemo(path);
    if (demo) toast(`Unknown demo “${demo}”. Open examples/demos/ to browse all demos.`);
    if (params.get("brief")) {
      // ?brief=... builds a project from a one-line idea, e.g. for sharing or scripted previews.
      $("ai-brief").value = params.get("brief").slice(0, 2000);
      return loadLocalIllustrations()
        .then(() => directProject($("ai-brief").value))
        .then((r) => {
          if (r) toast(`Built “${r.analysis.title}”: ${r.scenes} scenes, ${r.placed} illustrations.`);
          if (r && sequence) startPlayback();
        })
        .catch((e) => toast(e.message))
        .finally(() => (window.ready = true));
    }
    window.ready = true;
  });
  function startPlayback() {
    sceneId = project.scenes[0].id;
    time = 0;
    playing = true;
    last = performance.now();
    $("play").textContent = "Ⅱ";
    renderUI();
  }
  function loadDemo(demoPath) {
    return fetch(demoPath)
      .then((response) => {
        if (!response.ok) throw new Error(`Example load failed (${response.status}).`);
        return response.json();
      })
      .then(async (catalog) => {
        window.MotionForgeApp.setProject(catalog);
        time = 0;
        if (params.has("scene") && project.scenes.some((s) => s.id === params.get("scene")))
          sceneId = params.get("scene");
        renderUI();
        // Story demos add the user's local illustrations (never committed) when the folder is present.
        if (showcaseKeys.includes(demo) && params.get("illustrations") !== "0" && await loadLocalIllustrations()) {
          try {
            const stories = await (await fetch("examples/showcase/manifest.json")).json(),
              plan = stories.find((s) => s.key === demo)?.illustrations || [],
              added = await applyIllustrationPlan(plan);
            if (added) toast(`Added ${added} local illustrations with depth. Undo or open with &illustrations=0 to compare.`);
          } catch (e) {
            console.warn(`Illustration plan skipped: ${e.message}`);
          }
        }
        if (sequence) startPlayback();
        window.ready = true;
      })
      .catch((error) => {
        toast(`${error.message} Run npm start to open this example, or import ${demoPath} manually.`);
        window.ready = true;
      });
  }
})();
