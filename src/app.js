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
    time = 3,
    playing = false,
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
    $("stage").innerHTML = M.renderSVG(project, s.id, time, {
      selected:
        exportMode || document.body.classList.contains("presentation")
          ? null
          : selected,
      safeArea:
        !exportMode &&
        !document.body.classList.contains("presentation") &&
        $("safe-area").checked,
    });
    $("seek").value = time;
    $("clock").textContent = formatTime(time);
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
        time = Math.min(3, s.duration);
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
          l.tracks || []
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
    host.innerHTML = html;
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
            for (const tr of l.tracks || []) {
              tr.keyframes = tr.keyframes.filter((k) => k.time <= value);
              if (tr.keyframes.length === 1 && tr.keyframes[0].time < value)
                tr.keyframes.push({
                  time: value,
                  value: tr.keyframes[0].value,
                });
            }
            if (l.tracks)
              l.tracks = l.tracks.filter((tr) => tr.keyframes.length > 1);
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
      const img = document.createElement("img");
      img.src = a.src;
      img.alt = a.name;
      const p = document.createElement("p");
      p.textContent = a.name;
      const add = document.createElement("button");
      add.textContent = "Add";
      add.onclick = () => addLayer("image", { asset: id, name: a.name });
      const replace = document.createElement("button");
      replace.textContent = "Replace";
      replace.title = "Replace the selected image layer";
      replace.onclick = () => {
        if (currentLayer()?.type !== "image")
          return toast("Select an image layer first.");
        change(() => (currentLayer().asset = id));
      };
      const remove = document.createElement("button");
      remove.textContent = "×";
      remove.title = "Remove unused asset";
      remove.onclick = () => {
        if (project.scenes.some((s) => s.layers.some((l) => l.asset === id)))
          return toast(
            "This asset is in use. Delete or replace its image layers first.",
          );
        change(() => delete project.assets[id]);
      };
      card.append(img, p, add, replace, remove);
      host.append(card);
    }
    $("asset-count").textContent = Object.keys(project.assets).length;
    renderIcons();
  }
  function renderIcons() {
    const query = $("icon-search").value.trim().toLowerCase(),
      names = Object.keys(M.icons).filter((n) =>
        n.replaceAll("_", " ").includes(query.replaceAll("_", " ")),
      );
    $("icon-count").textContent = `${names.length}`;
    const host = $("icon-grid");
    host.replaceChildren();
    names.forEach((name) => {
      const b = document.createElement("button");
      b.title = name;
      b.setAttribute("aria-label", "Add icon " + name);
      b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${M.icons[name]}</svg>`;
      b.onclick = () =>
        addLayer("icon", { icon: name, name: name.replaceAll("_", " ") });
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
    change(() => {
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
      };
      scene().layers.push({ ...common, ...defaults[type], ...extra });
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
      time = 3;
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
      time += (now - last) / 1000;
      const d = scene().duration;
      if (time >= d) {
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
  // SVG imports use a deliberately small allowlist and are rasterised once, never inserted into the DOM.
  async function importImage(file) {
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
      ]);
      for (const el of doc.querySelectorAll("*")) {
        if (!tags.has(el.localName))
          throw new Error(
            `SVG ${el.localName} is unsupported. Convert text to paths and export a simple SVG or PNG.`,
          );
        for (const a of [...el.attributes]) {
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
      const scale = Math.min(1, 2048 / Math.max(w, h));
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
    return { name: file.name, src };
  }
  $("image-upload").onchange = async (e) => {
    for (const file of e.target.files) {
      try {
        const asset = await importImage(file),
          id = uid("asset");
        change(() => (project.assets[id] = asset));
        toast(`Added ${file.name}. Click Add in your asset library.`);
      } catch (err) {
        toast(err.message);
      }
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
    if (raw.length > 45000000)
      throw new Error("Project exceeds the 45 MB import limit.");
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
  $("json-apply").onclick = () => {
    try {
      const p = jsonValue();
      if (
        change(() => {
          project = p;
          sceneId = p.scenes[0].id;
          selected = null;
          time = Math.min(3, p.scenes[0].duration);
        })
      ) {
        $("ai-dialog").close();
        toast("Project loaded. Undo restores the previous project.");
      }
    } catch (e) {
      $("json-errors").textContent = e.message;
    }
  };
  $("json-file").onchange = async (e) => {
    const f = e.target.files[0];
    if (f) {
      if (f.size > 45000000) {
        $("json-errors").textContent =
          "Project exceeds the 45 MB import limit.";
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
    return `You are a Motion Forge motion designer. Build or revise a factual, readable 2D motion graphic for this brief:\n${$("ai-brief").value || "Improve this project while preserving its subject."}\n\nReturn a complete version-1 Motion Forge project JSON, without JavaScript, HTML, Markdown fences or unsupported properties. Keep existing asset IDs. For existing image src strings output KEEP_EXISTING_EMBEDDED_ASSET; the editor restores those from this project. Do not invent images or facts. Ask for missing image assets only when essential; otherwise use named Material icons. All times are seconds within a scene. Canvas ${project.width}x${project.height}, ${project.fps} fps. Keep readable typography and 5% safe margins. Stage coordinates are top-left. Text y is top of line box; set width/height for selection. Groups use local child coordinates. Connectors use stage-space endpoints and must be root layers.\n\nSCHEMA GUIDE\nProject: {version:1,name,width,height,fps,theme:{background,surface,accent,secondary,text,muted,line},assets:{id:{name,src,credit?,source?}},scenes:[{id,name,duration,background:{type:"solid|linear|radial|transparent",color,color2?,angle?,grid?,gridSize?,gridOpacity?},layers:[]}]}\nUse six-digit hex palette colours. Layer fill/stroke can be hex, none, or $themeToken. IDs start with a letter and contain only letters, digits, _ or -.\nLayer types: text,rect,circle,icon,image,line,path,counter,chart,group. Common keys: id,type,name,x,y,width,height,rotation,scale,opacity,fill,stroke,strokeWidth,radius,start,end,enter,enterDuration,exitDuration,parentId,hidden,tracks. Entrance: none,fade,rise,slide,scale,draw. Text adds text,fontSize,fontWeight,align(left|center|right),lineHeight,fontFamily(sans|mono|serif). Icon adds icon. Image adds asset,fit(contain|cover|stretch). Line adds from,to,fromAnchor,toAnchor(left|right|top|bottom|center),x2,y2,curve(straight|bezier|step),arrow,particles,dash,progress. Path adds d,progress. Counter adds valueFrom,valueTo,decimals,prefix,suffix,fontSize,fontWeight,align. Chart adds values,labels,colors,maxValue,barGap,fontSize,progress. Group children have parentId.\nTracks: [{property:"x",loop:false,keyframes:[{time:0,value:100},{time:2,value:400,easing:"easeOut"}]}]. Need >=2 strictly increasing keys per track. Allowed properties x,y,width,height,rotation,scale,opacity,fontSize,strokeWidth,radius,progress,fill,stroke. Easings linear,easeIn,easeOut,easeInOut,backOut,step. One track per property. Destination key sets easing. There is no randomness, scripting, audio or 3D.\nAVAILABLE MATERIAL ICONS\n${Object.keys(M.icons).join(", ")}\n\nCURRENT PROJECT (embedded image payloads replaced by preservation markers):\n${JSON.stringify(compact, null, 2)}\n\nRead agent/motion-forge/SKILL.md and references/scene-format.md when working with the repository. Validate with node scripts/validate.cjs project.json. Preview beginning, middle and end; check text, contrast, timing and links. Return only the complete JSON.`;
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
  jsonValue = function () {
    const raw = $("json-editor").value;
    if (raw.length > 45000000)
      throw new Error("Project exceeds the 45 MB import limit.");
    return M.assertValid(expandMarkers(JSON.parse(raw)));
  };
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
  $("export-svg").onclick = () =>
    download(
      M.renderSVG(project, sceneId, time),
      `${slug(scene().name)}-${time.toFixed(2)}.svg`,
      "image/svg+xml",
    );
  async function paint(canvas, p, id, t) {
    const svg = M.renderSVG(p, id, t),
      url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
    try {
      const img = await imageFrom(url),
        ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } finally {
      URL.revokeObjectURL(url);
    }
  }
  $("export-png").onclick = async () => {
    try {
      const c = document.createElement("canvas");
      c.width = project.width;
      c.height = project.height;
      await paint(c, project, sceneId, time);
      const blob = await new Promise((r) => c.toBlob(r, "image/png"));
      download(blob, `${slug(scene().name)}-${time.toFixed(2)}.png`);
    } catch (e) {
      toast(e.message);
    }
  };
  $("record-cancel").onclick = () => {
    recordCancel = true;
  };
  $("export-video").onclick = async () => {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream)
      return toast(
        "Video recording is unavailable in this browser. Use Chrome or the frame export tool.",
      );
    const mime = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ].find((x) => MediaRecorder.isTypeSupported(x));
    if (!mime)
      return toast("WebM recording is unavailable. Use the frame export tool.");
    const p = M.clone(project),
      s = p.scenes.find((s) => s.id === sceneId);
    if (s.background.type === "transparent")
      s.background = { ...s.background, type: "solid", color: "$background" };
    const c = document.createElement("canvas");
    c.width = p.width;
    c.height = p.height;
    let stream, rec;
    recordCancel = false;
    $("record-cancel").hidden = false;
    const button = $("export-video");
    button.disabled = true;
    const cancelOnHide = () => {
      if (document.hidden) recordCancel = true;
    };
    document.addEventListener("visibilitychange", cancelOnHide);
    try {
      await paint(c, p, s.id, 0);
      stream = c.captureStream(p.fps);
      rec = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: 12000000,
      });
      const chunks = [];
      const done = new Promise((resolve, reject) => {
        rec.ondataavailable = (e) => {
          if (e.data.size) chunks.push(e.data);
        };
        rec.onstop = resolve;
        rec.onerror = () => reject(new Error("Video encoder failed."));
      });
      rec.start(250);
      const start = performance.now();
      let elapsed = 0;
      while (elapsed < s.duration && !recordCancel) {
        await paint(c, p, s.id, Math.min(elapsed, s.duration));
        $("record-progress").value = elapsed / s.duration;
        await new Promise((r) => requestAnimationFrame(r));
        elapsed = (performance.now() - start) / 1000;
      }
      if (rec.state !== "inactive") rec.stop();
      await done;
      if (recordCancel)
        toast("Recording stopped. No incomplete video was saved.");
      else {
        $("record-progress").value = 1;
        download(new Blob(chunks, { type: mime }), slug(s.name) + ".webm");
        toast(
          "Video exported. Use frame rendering for precise production output.",
        );
      }
    } catch (e) {
      toast(e.message);
    } finally {
      if (rec?.state === "recording") rec.stop();
      stream?.getTracks().forEach((t) => t.stop());
      document.removeEventListener("visibilitychange", cancelOnHide);
      button.disabled = false;
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
    renderFrame: (id, t) => {
      stop();
      sceneId = id;
      time = t;
      draw();
      return M.renderSVG(project, sceneId, time);
    },
    importImage,
    agentPrompt,
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
  window.ready = true;
})();
