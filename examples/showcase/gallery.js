/* Motion Forge original story gallery - local assets only. */
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const film = $("film");
  const keys = ["technology", "scenery", "food", "meeting", "social"];
  let stories = [], selected = 0;
  function report(message) {
    $("playback-error").hidden = false;
    $("playback-error").textContent = message;
  }
  async function play() {
    try { await film.play(); }
    catch (error) {
      if (error.name === "NotAllowedError") report("Press Play to start the film; automatic playback is blocked by this browser.");
      else if (error.name !== "AbortError") report(`Playback failed: ${error.message}`);
    }
  }
  function show(index, autoplay) {
    selected = index;
    const story = stories[index];
    $("playback-error").hidden = true;
    $("category").textContent = `${story.key.toUpperCase()} / ORIGINAL FICTION / 18 SECONDS`;
    $("title").textContent = story.title;
    $("logline").textContent = story.logline;
    $("open-editor").href = `../../?demo=${story.key}`;
    $("open-prompt").href = `../../docs/showcase-prompts/${story.key}.md`;
    $("download-project").href = `${story.key}.motion.json`;
    $("download-mp4").href = `renders/${story.key}.mp4`;
    $("download-webm").href = `renders/${story.key}.webm`;
    document.querySelectorAll("nav button").forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    $("shots").replaceChildren();
    story.beats.forEach((beat, i) => {
      const card = document.createElement("article");
      card.className = "shot";
      const image = document.createElement("img");
      image.src = `previews/${story.key}-${i + 1}.png`;
      image.alt = `${story.title}: shot ${i + 1}`;
      const body = document.createElement("div");
      const heading = document.createElement("h3");
      heading.textContent = `SHOT ${i + 1} / ${i * 6}-${(i + 1) * 6}s`;
      const p = document.createElement("p"); p.textContent = beat;
      const button = document.createElement("button");
      button.textContent = "Play from this shot";
      button.onclick = () => { film.currentTime = i * 6; play(); };
      body.append(heading, p, button); card.append(image, body); $("shots").append(card);
    });
    film.pause();
    film.poster = `previews/${story.key}-1.png`;
    film.replaceChildren();
    const mp4 = document.createElement("source"); mp4.src = `renders/${story.key}.mp4`; mp4.type = "video/mp4";
    const webm = document.createElement("source"); webm.src = `renders/${story.key}.webm`; webm.type = "video/webm";
    film.append(mp4, webm); film.load();
    history.replaceState(null, "", `?story=${story.key}`);
    if (autoplay) play();
  }
  film.onended = () => {
    if ($("autoplay-next").checked) show((selected + 1) % stories.length, true);
  };
  film.onerror = () => report("The video could not load. Run scripts/render-showcase.cjs with a local FFmpeg to build the reels, or use Open editable story.");
  fetch("manifest.json").then((response) => {
    if (!response.ok) throw new Error(`Story manifest returned HTTP ${response.status}.`);
    return response.json();
  }).then((data) => {
    if (!Array.isArray(data) || data.length !== 5 || data.some((story, i) => story.key !== keys[i]))
      throw new Error("Unexpected showcase manifest.");
    stories = data;
    data.forEach((story, i) => {
      const button = document.createElement("button");
      button.textContent = story.key === "food" ? "Food / Recipe" : story.key[0].toUpperCase() + story.key.slice(1);
      button.setAttribute("aria-pressed", "false");
      button.onclick = () => show(i, true);
      $("stories").append(button);
    });
    const requested = new URLSearchParams(location.search).get("story");
    show(Math.max(0, keys.indexOf(requested)), true);
  }).catch((error) => report(error.message));
})();
