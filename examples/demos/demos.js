/* Motion Forge demo gallery - local files only. Every film plays from 0:00. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const ROOT = "../../";
  const film = $("film"), live = $("live"), dialog = $("player");
  let demos = [], filter = "All", current = null, mode = "video";
  const available = new Map();

  const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
  const el = (tag, props = {}, ...kids) => {
    const n = Object.assign(document.createElement(tag), props);
    n.append(...kids);
    return n;
  };
  const studioUrl = (d, extra = "") => `${ROOT}?demo=${encodeURIComponent(d.key)}&play=1${extra}`;

  async function hasVideo(d) {
    if (!d.video) return false;
    if (!available.has(d.key))
      available.set(d.key, fetch(ROOT + d.video, { method: "HEAD" }).then((r) => r.ok).catch(() => false));
    return available.get(d.key);
  }

  function rewind(video) {
    video.pause();
    try { video.currentTime = 0; } catch {}
  }

  async function play(video) {
    rewind(video);
    try { await video.play(); } catch (e) { if (e.name !== "AbortError" && e.name !== "NotAllowedError") console.warn(e); }
  }

  function setMode(next) {
    mode = next;
    $("mode-video").setAttribute("aria-pressed", String(mode === "video"));
    $("mode-live").setAttribute("aria-pressed", String(mode === "live"));
    film.hidden = mode !== "video";
    live.hidden = mode !== "live";
    if (mode === "video") {
      live.src = "about:blank";
      play(film);
    } else {
      rewind(film);
      // The studio in export mode plays the project from scene 1 at 0:00 through every scene.
      live.src = `${ROOT}index.html?demo=${encodeURIComponent(current.key)}&play=1&export=1&illustrations=0`;
    }
  }

  async function open(d) {
    current = d;
    $("player-category").textContent = `${d.category.toUpperCase()} / ${d.scenes} SCENE${d.scenes > 1 ? "S" : ""} / ${fmt(d.duration)}`;
    $("player-title").textContent = d.title;
    $("player-summary").textContent = d.summary;
    $("open-studio").href = studioUrl(d);
    $("open-prompt").hidden = !d.prompt;
    if (d.prompt) $("open-prompt").href = ROOT + d.prompt;
    $("download-project").href = ROOT + d.project;
    const video = await hasVideo(d);
    $("download-video").hidden = !video;
    $("mode-video").disabled = !video;
    if (video) {
      $("download-video").href = ROOT + d.video;
      film.poster = ROOT + d.poster;
      film.src = ROOT + d.video;
    } else film.removeAttribute("src");
    history.replaceState(null, "", `?demo=${d.key}`);
    if (!dialog.open) dialog.showModal();
    setMode(video ? "video" : "live");
  }

  function close() {
    rewind(film);
    live.src = "about:blank";
    current = null;
    history.replaceState(null, "", location.pathname);
  }

  function card(d) {
    const thumb = el("button", { className: "thumb", type: "button", title: `Watch ${d.title}` },
      el("img", { src: ROOT + d.poster, alt: "", loading: "lazy" }),
      el("span", { className: "play", textContent: "▶" }),
      el("span", { className: "badge left", textContent: d.category }),
      el("span", { className: "badge right", textContent: `${fmt(d.duration)} · ${d.scenes} scene${d.scenes > 1 ? "s" : ""}` }));
    thumb.onclick = () => open(d);
    const actions = el("div", { className: "actions" },
      Object.assign(el("button", { className: "watch", type: "button", textContent: "▶ Watch" }), { onclick: () => open(d) }),
      el("a", { href: studioUrl(d), textContent: "Open in studio" }),
      ...(d.prompt ? [el("a", { href: ROOT + d.prompt, textContent: "Prompt" })] : []),
      ...(d.brief ? [el("a", { href: `${ROOT}?brief=${encodeURIComponent(d.brief)}&play=1`, textContent: "Rebuild from brief" })] : []));
    const node = el("article", { className: "card" }, thumb,
      el("div", { className: "body" },
        el("h2", { textContent: d.title }),
        el("p", { textContent: d.summary }),
        el("div", { className: "tags" }, ...(d.tags || []).map((t) => el("span", { textContent: t }))),
        actions));
    node.dataset.key = d.key;
    // Hover preview: the rendered MP4 plays muted from 0:00 and rewinds when the pointer leaves.
    hasVideo(d).then((ok) => {
      if (!ok) {
        thumb.append(el("span", { className: "badge right live", textContent: "Live engine", style: "top:auto;bottom:10px" }));
        return;
      }
      const preview = el("video", { muted: true, playsInline: true, loop: true, preload: "none", src: ROOT + d.video });
      thumb.insertBefore(preview, thumb.children[1]);
      node.onmouseenter = () => { node.classList.add("previewing"); play(preview); };
      node.onmouseleave = () => { node.classList.remove("previewing"); rewind(preview); };
    });
    return node;
  }

  function render() {
    const q = $("search").value.trim().toLowerCase();
    const shown = demos.filter((d) => (filter === "All" || d.category === filter) &&
      (!q || [d.title, d.summary, d.category, ...(d.tags || [])].join(" ").toLowerCase().includes(q)));
    $("grid").replaceChildren(...shown.map(card));
    $("empty").hidden = shown.length > 0;
    document.querySelectorAll("#filters button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.category === filter)));
  }

  function filters() {
    const cats = ["All", ...new Set(demos.map((d) => d.category))];
    $("filters").replaceChildren(...cats.map((c) => {
      const n = c === "All" ? demos.length : demos.filter((d) => d.category === c).length;
      const b = el("button", { type: "button" }, c, el("span", { textContent: n }));
      b.dataset.category = c;
      b.onclick = () => { filter = c; render(); };
      return b;
    }));
  }

  $("mode-video").onclick = () => current && setMode("video");
  $("mode-live").onclick = () => current && setMode("live");
  $("restart").onclick = () => current && setMode(mode);
  $("player-close").onclick = () => dialog.close();
  dialog.addEventListener("close", close);
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  $("search").oninput = render;

  fetch("manifest.json").then((r) => {
    if (!r.ok) throw new Error(`Demo manifest returned HTTP ${r.status}. Run node scripts/build-demos.cjs.`);
    return r.json();
  }).then((data) => {
    demos = data;
    const scenes = data.reduce((s, d) => s + d.scenes, 0), seconds = data.reduce((s, d) => s + d.duration, 0);
    $("stats").innerHTML = `<b>${data.length}</b> demos · <b>${scenes}</b> scenes · <b>${Math.round(seconds / 60)}</b> minutes of motion`;
    filters();
    render();
    const wanted = data.find((d) => d.key === new URLSearchParams(location.search).get("demo"));
    if (wanted) open(wanted);
    window.demosReady = true;
  }).catch((e) => {
    $("grid").replaceChildren(el("p", { className: "empty", textContent: e.message }));
    window.demosReady = true;
  });
})();
