"use strict";
const fs = require("node:fs");
const path = require("node:path");
const M = require("../src/engine.js");
const root = path.resolve(__dirname, "..");
const out = path.join(root, "examples", "showcase");
const prompts = path.join(root, "docs", "showcase-prompts");
fs.mkdirSync(out, { recursive: true });
fs.mkdirSync(prompts, { recursive: true });
let serial = 0;
const id = (prefix = "layer") => `${prefix}-${++serial}`;
const track = (property, values, easing = "easeInOut", loop = false) => ({
  property, loop, keyframes: values.map(([time, value], i) => ({ time, value, easing: i ? easing : "linear" })),
});
const text = (value, x, y, size = 28, extra = {}) => ({
  id: id("type"), type: "text", text: value, x, y, width: 1440 - x, height: size * (value.split("\n").length * 1.25),
  fontSize: size, fill: "$text", enter: "rise", enterDuration: 0.8, ...extra,
});
const rect = (x, y, width, height, fill, extra = {}) => ({
  id: id("panel"), type: "rect", x, y, width, height, fill, radius: 20,
  enter: "fade", enterDuration: 0.7, ...extra,
});
const circle = (x, y, size, fill, extra = {}) => ({
  id: id("orb"), type: "circle", x, y, width: size, height: size, fill, enter: "scale", enterDuration: 0.9, ...extra,
});
const symbol = (name, x, y, size = 40, extra = {}) => ({
  id: id("symbol"), type: "symbol", symbol: name, x, y, width: size, height: size, fill: "$accent", ...extra,
});
const svgPath = (d, fill, extra = {}) => ({
  id: id("path"), type: "path", d, x: 0, y: 0, width: 1600, height: 900,
  fill, stroke: "none", enter: "none", ...extra,
});
function particles(count = 25, color = "$secondary", yMin = 180, yMax = 700) {
  return Array.from({ length: count }, (_, i) => {
    const x = 70 + (i * 193) % 1470;
    const y = yMin + (i * 137) % (yMax - yMin);
    return circle(x, y, 2 + i % 4, color, {
      opacity: 0.25 + (i % 5) * 0.1, enter: "none",
      tracks: [track("y", [[0, y + 20], [6, y - 25]], "linear"),
        track("opacity", [[0, 0.1], [1 + (i % 3), 0.7], [6, 0.15]])],
    });
  });
}
function rails(chapter, name, subtitle, number) {
  return [
    rect(64, 54, 42, 4, "$accent", { radius: 0, enter: "none" }),
    text(chapter.toUpperCase(), 122, 39, 18, { fill: "$accent", fontWeight: 700, enter: "fade", width: 1000 }),
    text(name, 70, 112, 82, { fontWeight: 700, width: 1400, height: 200 }),
    text(subtitle, 74, 820, 22, { fill: "$muted", width: 1330, enter: "fade", start: 0.5 }),
    text(number, 1460, 43, 19, { fill: "$muted", width: 70, fontFamily: "mono" }),
    rect(74, 788, 1450, 1, "$line", { radius: 0, opacity: 0.7 }),
    rect(74, 788, 20, 2, "$accent", { radius: 0, tracks: [track("width", [[0, 20], [6, 1450]], "linear")] }),
  ];
}
function scene(sceneId, name, layers, background = {}) {
  return {
    id: sceneId, name, duration: 6,
    background: { type: "radial", color: "$background", color2: "$surface", ...background },
    layers,
  };
}
function stage(objects, extra = {}) {
  return {
    id: id("stage"), type: "scene3d", x: 630, y: 220, width: 900, height: 540,
    cameraDistance: 6, cameraAzimuth: 20, cameraElevation: 18, fov: 40,
    lightIntensity: 4, ground: false, objects, enter: "fade", enterDuration: 0.8,
    tracks: [track("cameraAzimuth", [[0, -18], [4.5, 24], [6, 24]])],
    ...extra,
  };
}
const object = (geometry, color, extra = {}) => ({
  id: id("object"), geometry, color, material: "standard", roughness: 0.25, ...extra,
});
function card(x, y, title, caption, glyph, start = 0) {
  const group = id("card");
  return [
    { id: group, type: "group", x, y, width: 430, height: 108, enter: "rise", start, enterDuration: 0.7,
      tracks: [track("x", [[0, x - 25], [2, x], [6, x]])] },
    rect(0, 0, 430, 108, "$surface", { parentId: group, stroke: "$line", strokeWidth: 1, radius: 18, enter: "none" }),
    symbol(glyph, 24, 27, 44, { parentId: group, enter: "none" }),
    text(title, 88, 17, 26, { parentId: group, width: 320, enter: "none", fontWeight: 700 }),
    text(caption, 88, 57, 19, { parentId: group, width: 320, fill: "$muted", enter: "none" }),
  ];
}
const assets = {
  seal: { name: "Original Forge mark", src: "data:image/png;base64," +
    fs.readFileSync(path.join(root, "examples", "assets", "forge-mark.png")).toString("base64"), credit: "Original project asset, MIT" },
  city: { name: "Synthetic motion plate", src: "data:video/webm;base64," +
    fs.readFileSync(path.join(root, "examples", "assets", "catalog-source.webm")).toString("base64"), credit: "Original generated abstract footage, MIT, silent" },
};
const stories = [];
const RAILS_LAYERS = 7; // rails() layer count; checked below via the 42px accent rule that starts the rails.
// Optional illustration depth plan. Filenames only: the artwork is the user's own local unDraw download in
// assets/undraw-local/ (git-ignored) and is never embedded in committed examples. Boxes are fitted, bottom-centred.
// layer "front" sits just below the chapter/title rails; "back" sits behind the scene at the given index.
const ILLUSTRATIONS = {
  technology: [
    { scene: "technology-awakening", file: "undraw_starry-window_yiga.svg", role: "a figure at a night window, ghosted behind the waking core", x: 600, y: 240, width: 300, height: 530, opacity: 0.12, layer: "back", index: 0 },
    { scene: "technology-awakening", file: "undraw_morning-work_v5jo.svg", role: "a person starting the day at a desk: the human beside the waking city", x: 1080, y: 60, width: 370, height: 143, start: 0.9 },
    { scene: "technology-awakening", file: "undraw_notify_drs8.svg", role: "the first signal arrives as a giant notification beside the core", x: 1300, y: 470, width: 220, height: 290, start: 2.2, motion: "sway", enter: "scale" },
    { scene: "technology-routing", file: "undraw_agentic-network_02v5.svg", role: "a faint network schematic that deepens the SENSE / DECIDE / RESPOND map", x: 330, y: 240, width: 940, height: 540, opacity: 0.13, layer: "back", index: 0 },
    { scene: "technology-routing", file: "undraw_connect-the-dots_4p4i.svg", role: "a person joining points of light, echoing the routed signal", x: 1230, y: 60, width: 220, height: 152, start: 1.2 },
    { scene: "technology-launch", file: "undraw_deploy-globally_2k9s.svg", role: "a global rollout scene ghosted behind the reflective knot", x: 760, y: 220, width: 780, height: 540, opacity: 0.22, layer: "back", index: 2 },
    { scene: "technology-launch", file: "undraw_around-the-world_1p8h.svg", role: "someone sending the signal around the globe: the shared future", x: 570, y: 520, width: 300, height: 250, start: 1.8 },
  ],
  scenery: [
    { scene: "scenery-dawn", file: "undraw_wind-turbines_sq2c.svg", role: "turbines turning on a far ridge, half hidden by the mountains for atmospheric depth", x: 820, y: 290, width: 230, height: 190, opacity: 0.45, layer: "mid", index: 1, distant: true, start: 0.6 },
    { scene: "scenery-dawn", file: "undraw_autumn-walk_x17u.svg", role: "a walker on the near ridge giving the valley human scale", x: 1150, y: 440, width: 370, height: 330, start: 1 },
    { scene: "scenery-crossing", file: "undraw_travel-destination_d2a9.svg", role: "the far shore: a village and pin across the water", x: 90, y: 400, width: 360, height: 140, opacity: 0.55, layer: "mid", index: 14, distant: true, start: 1.2 },
    { scene: "scenery-crossing", file: "undraw_exploring_d1vd.svg", role: "an explorer on the far shore where the paper bird lands", x: 1200, y: 470, width: 330, height: 300, start: 2.4 },
    { scene: "scenery-observatory", file: "undraw_finding-the-way_qp1z.svg", role: "a traveller looking up at the floating observatory", x: 540, y: 470, width: 170, height: 300, start: 1.2 },
    { scene: "scenery-observatory", file: "undraw_travel-mode_103y.svg", role: "a newcomer arriving with a suitcase, staying to protect the valley", x: 1350, y: 520, width: 180, height: 250, start: 2.2, enter: "slide" },
  ],
  food: [
    { scene: "food-market", file: "undraw_garden-harvest_r6yu.svg", role: "the harvest behind the basket, ghosted into the warm background", x: 640, y: 230, width: 880, height: 500, opacity: 0.16, layer: "back", index: 0 },
    { scene: "food-market", file: "undraw_food-truck_my6o.svg", role: "a market stall pulling up with the day's produce", x: 1260, y: 610, width: 270, height: 160, start: 1.8, enter: "slide" },
    { scene: "food-skillet", file: "undraw_plants_md5c.svg", role: "fresh herbs waiting on the windowsill", x: 545, y: 610, width: 260, height: 150, start: 1.2, motion: "sway" },
    { scene: "food-skillet", file: "undraw_hot-cocoa_64a7.svg", role: "the cook leaning in, warmed by the steam", x: 1330, y: 520, width: 200, height: 250, start: 2.2 },
    { scene: "food-table", file: "undraw_breakfast-together_vev0.svg", role: "two friends sharing the finished meal", x: 600, y: 560, width: 330, height: 210, start: 1.4 },
    { scene: "food-table", file: "undraw_special-occasion_ffh6.svg", role: "a dinner under string lights: the table keeps filling", x: 1350, y: 560, width: 180, height: 210, start: 2.4 },
  ],
  meeting: [
    { scene: "meeting-arrival", file: "undraw_meet-the-team_fau8.svg", role: "the team portrait that introduces the four voices", x: 1120, y: 60, width: 330, height: 157, start: 0.8 },
    { scene: "meeting-arrival", file: "undraw_sharing-ideas_toje.svg", role: "someone pinning the first idea to the wall", x: 540, y: 540, width: 270, height: 230, start: 1.9 },
    { scene: "meeting-decision", file: "undraw_decision-point_yhu3.svg", role: "a person choosing a path above the decision map", x: 1200, y: 70, width: 250, height: 240, start: 1.6 },
    { scene: "meeting-decision", file: "undraw_sorting-thoughts_b0kt.svg", role: "a facilitator sorting notes beneath the constraint", x: 600, y: 625, width: 400, height: 150, start: 2.4 },
    { scene: "meeting-action", file: "undraw_handshake-deal_nwk6.svg", role: "the hand-off sealed: a handshake above the plan", x: 1250, y: 60, width: 200, height: 148, start: 1, enter: "scale", motion: "none" },
    { scene: "meeting-action", file: "undraw_next-task_jtbr.svg", role: "the owner reaching for the next task", x: 540, y: 560, width: 300, height: 210, start: 2 },
    { scene: "meeting-action", file: "undraw_shared-goals_ijlg.svg", role: "the team leaving with a shared goal", x: 1150, y: 560, width: 380, height: 210, start: 1.2 },
  ],
  social: [
    { scene: "social-invitation", file: "undraw_message-sent_iyz6.svg", role: "a paper plane carrying the note across the skyline", x: 1190, y: 60, width: 200, height: 170, start: 2.4, motion: "drift", drift: 60, enter: "slide" },
    { scene: "social-invitation", file: "undraw_walking-the-dog_cjob.svg", role: "a neighbour passing by just as the note arrives", x: 470, y: 580, width: 220, height: 190, start: 1.6 },
    { scene: "social-invitation", file: "undraw_mail-sent_dagx.svg", role: "the invitation being sent beside the paper note", x: 1320, y: 500, width: 210, height: 230, start: 1.5 },
    { scene: "social-ripple", file: "undraw_group-chat_nze2.svg", role: "neighbours talking as the kindness spreads", x: 1200, y: 60, width: 250, height: 164, start: 1.8 },
    { scene: "social-ripple", file: "undraw_love-note_c4fs.svg", role: "A NOTE: the handwritten card", x: 160, y: 640, width: 170, height: 135, start: 1.0, motion: "sway" },
    { scene: "social-ripple", file: "undraw_casual-chat_4byz.svg", role: "A CONVERSATION: two people on a bench", x: 500, y: 640, width: 170, height: 135, start: 1.6, motion: "sway" },
    { scene: "social-ripple", file: "undraw_order-delivered_gy61.svg", role: "A LITTLE HELP: a delivery to a neighbour's door", x: 840, y: 640, width: 170, height: 135, start: 2.2, motion: "sway" },
    { scene: "social-ripple", file: "undraw_sweet-home_b054.svg", role: "A PLACE TO MEET: the house with the light on", x: 1180, y: 640, width: 170, height: 135, start: 2.8, motion: "sway" },
    { scene: "social-table", file: "undraw_together_gsr6.svg", role: "people gathered at the shared evening table", x: 1250, y: 60, width: 200, height: 156, start: 1.4 },
    { scene: "social-table", file: "undraw_dancing_lvv0.svg", role: "someone dancing as the evening warms up", x: 590, y: 540, width: 220, height: 230, start: 2.4, motion: "sway" },
    { scene: "social-table", file: "undraw_group-selfie_uih0.svg", role: "friends taking a group photo at the end of the table", x: 1370, y: 480, width: 160, height: 290, start: 1.8 },
  ],
};
function illustrationPlan(key, scenes) {
  return (ILLUSTRATIONS[key] || []).map(({ role, ...p }) => {
    const s = scenes.find((x) => x.id === p.scene);
    if (!s) throw new Error(`Illustration plan references unknown scene ${p.scene}`);
    const layer = p.layer || "front";
    if (!["front", "mid", "back"].includes(layer)) throw new Error(`Bad illustration layer in ${p.scene}`);
    const index = layer === "front" ? s.layers.length - RAILS_LAYERS : p.index;
    if (layer === "front" && s.layers[index]?.width !== 42) throw new Error(`Could not find the rails in ${p.scene}`);
    if (!Number.isInteger(index) || index < 0 || index > s.layers.length) throw new Error(`Bad illustration index in ${p.scene}`);
    if (p.end !== undefined && !(p.end > (p.start ?? 0) && p.end <= s.duration)) throw new Error(`Bad illustration end in ${p.scene}`);
    if (p.library !== undefined && p.library !== "undraw") throw new Error(`Bad illustration library in ${p.scene}`);
    return { ...p, layer, index, role };
  });
}
function placementBrief(p) {
  const motion = p.motion || (p.layer === "back" || p.distant ? "drift" : "float");
  const drift = p.drift ?? (p.layer === "back" ? 36 : p.distant ? 22 : 18);
  const move = {
    float: "a 3.5% height float on y (0 → mid-scene → 6s, easeInOut)",
    sway: "a gentle sway, rotation -1.6° → 1.6° → -1.6° (easeInOut)",
    drift: `a slow linear parallax drift of ${drift}px on x across the scene`,
    none: "no idle motion",
  }[motion];
  const timing = `enters at ${p.start ?? 0}s with a ${p.enter || (p.layer === "back" || p.distant ? "fade" : "rise")}` +
    (p.end ? `, exits at ${p.end}s (.6s)` : "");
  const where = p.layer === "back" ? `background plate at layer index ${p.index}` : p.layer === "mid" ? `mid-ground at layer index ${p.index}` : "foreground just beneath the chapter/title rails";
  const look = p.layer === "back" || p.distant
    ? `opacity ${p.opacity ?? 1}, no shadow`
    : "soft drop shadow (blur 28, Y 18, #00000040)" + (motion === "float" ? " and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1)" : " and a still ellipse ground shadow (#0000002e)");
  return `- **${p.scene}** / \`${p.file}\` / ${p.role}. Box x${p.x} y${p.y} ${p.width}x${p.height}; ${where}, ${timing}; ${look}; ${move}.`;
}
function illustrationBrief(plan) {
  if (!plan.length) return "";
  return `
## Illustration depth layer (optional, your local unDraw files)

These shots gain a hand-drawn human layer from flat unDraw illustrations that
**you download yourself** from https://undraw.co and place in
\`assets/undraw-local/\` (git-ignored; never commit, bundle or redistribute them,
and never fetch them automatically). If a file is missing, skip that placement
and keep the rest of the shot unchanged.

For each placement: import the SVG through the editor (Image source → unDraw),
recolour unDraw's \`#6C63FF\` accent to the palette accent, keep the asset credit
"Illustration from unDraw (https://undraw.co), used under the unDraw License",
and fit it inside the box, bottom-centred, without stretching. Rasterise each
file at 2.4x its largest box so 4K exports stay crisp, and reuse one asset when
a file appears twice.

${plan.map(placementBrief).join("\n")}

Depth order, back to front: background illustration plates, atmosphere and 3D,
distant shadowless figures that drift slowly (parallax), cards and diagrams,
foreground illustrations with ground shadows, then the chapter rail, title and
progress bar. Stagger entrances so each shot reads in order: headline, hero,
supporting copy, then the human vignettes. Illustrations never cover headlines,
card copy or the 3D hero. Open \`?demo=<story>\` with \`npm start\` to see the
plan applied automatically; add \`&illustrations=0\` to compare without it.
`;
}
function story(key, title, logline, theme, scenes, beats, direction, physics, checklist) {
  const project = { version: 1, name: title, width: 1600, height: 900, fps: 24, theme, assets: M.clone(assets), scenes };
  M.assertValid(project);
  fs.writeFileSync(path.join(out, key + ".motion.json"), JSON.stringify(project, null, 2) + "\n");
  const illustrations = illustrationPlan(key, scenes);
  const entry = { key, title, logline, beats, direction, physics, checklist, sceneIds: scenes.map((s) => s.id),
    illustrations: illustrations.map(({ role, ...p }) => p) };
  stories.push(entry);
  const prompt = `# ${title}

## Copyable creative brief

You are an original motion designer and procedural 3D art director working in
Motion Forge. Create the following fictional short as a complete editable
version-1 project JSON. This is an invented story, not a claim about a real
product, landscape, meal, meeting or social campaign.

**Premise:** ${logline}

**Delivery:** 1600x900, 24fps, three six-second shots (18 seconds total).
Keep shot order exactly as below. Preserve all embedded media markers and IDs.
Use original vector art, actual bundled symbols and editable procedural objects.
Output complete JSON, never scripts, pseudo-code or imaginary capabilities.
For final video render at 1280x720 or 1920x1080 with the deterministic exporter.

## Art direction

${direction}

Palette: ${JSON.stringify(theme)}.
Use the seven palette tokens, not scattered arbitrary colours. Headlines:
72-82px, bold; hero metric: 120-150px; supporting copy: 24-30px; micro labels:
18-22px. Keep live text within 80px safe margins. Limit body copy to two lines.
Use explicit line breaks. Frame a left narrative column and right hero in the
technical/meeting/recipe scenes; scenery/social may use full-frame composition.
Use contrasting negative space, a consistent top chapter rail and a thin
bottom progress rail. No selection outlines in renders. Do not copy a brand.

## Storyboard, animation and timing

${beats.map((beat, i) => `### Shot ${i + 1} / ${scenes[i].id} / global ${i * 6}-${(i + 1) * 6}s\n\n${beat}\n\nLocal timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.\n`).join("\n")}

## Choreography rules

1. Recompute every frame from absolute scene time. All layer/object keyframes
   are local to the six-second scene, including their first and last holds.
2. Put atmosphere and root connectors behind cards. Cards are parent groups
   with local child positions; 3D/video/effect/line layers stay at root level.
3. Use slow camera arcs (approximately -18 to 24 degrees over 4.5s) and a final hold,
   not a spinning camera competing with typography. Object turns are degrees;
   automatic object Y speed is radians/second.
4. EaseOut for reveals, easeInOut for camera/shape changes, linear for particles
   and progress. Matching loop endpoints prevent a jump; no random per-frame state.
5. Avoid entering the whole scene at once: stage at 0, title at .2, card 1 at .6,
   card 2 at 1.1, card 3 at 1.6. Maintain final visible details through 6s.
6. Layer shadows: use blur 16-32px, offsetY 8-16px and restrained alpha. Keep
   glass behind labels rather than lowering their contrast. 3D cast shadows
   require ground:true; planar mirror is one optional reflected-camera pass.
7. Respect exact schema fields. Use no external URLs, CSS, executable
   expressions, arbitrary mesh imports, sound/music tracks or unimplemented physics.

## Materials, optics and physics-style effects

${physics}

These are deterministic shader/material treatments, not a gravity/collision
solver, fluid dynamics, real volumetric smoke or recursive ray tracing.
Glass transmission/IOR refracts other objects in its own 3D viewport, not an
arbitrary video layer beneath it. Default geometry sizes are about 1 world unit.
The mirror is a horizontal plane at Y=-1.6; frame subjects above it.
Do not promise audio: the engine does not mix source-video sound.

## Required editable details

${checklist.map((item) => `- ${item}`).join("\n")}

## Assets and references

- Working source: [${key}.motion.json](../../examples/showcase/${key}.motion.json).
- Current format: [scene-format.md](../../references/scene-format.md).
- Exact schema: [project.schema.json](../../references/project.schema.json).
- Agent workflow: [SKILL.md](../../agent/motion-forge/SKILL.md).
- \`seal\` is the original supplied PNG mark; keep its embedded bytes/marker.
- \`city\` is an original silent synthetic moving plate, not real location footage.
  Keep its embedded bytes/marker. Use only if this shot calls for video.
- Choose real Material icon IDs or Lucide names from the editor-generated prompt.
${illustrationBrief(illustrations)}
## Quality and acceptance checks

Validate the complete JSON, then render all shots at 0/.8/2/4/5.9 seconds.
Revisit 4 seconds after seeking backwards; the image must be stable on the same
renderer. Check titles at actual delivery size, ensure cards are not clipped,
objects are not hidden by their own viewport, shadows do not crush detail,
connectors follow the intended nodes and label ordering matches the story.
Keep narrative claims explicitly fictional or illustrative. No unsupported
effect may be silently substituted. Deliver editable JSON plus a silent
MP4/WebM reel, and accurately report the checks actually performed.

## Reproduce the supplied implementation

\`\`\`powershell
node scripts\\validate.cjs examples\\showcase\\${key}.motion.json
node scripts\\render.cjs --project examples\\showcase\\${key}.motion.json --scene all --out renders\\${key}.mp4 --format mp4 --width 1280 --height 720 --fps 24 --crf 18
\`\`\`

FFmpeg must be installed locally. This file is a detailed human/LLM brief;
the accompanying JSON is a deterministic implementation authored with the
current engine. No external model service was called to generate it.
`;
  fs.writeFileSync(path.join(prompts, key + ".md"), prompt);
}
// TECHNOLOGY: a shared-depth exploded assembly, routing diagram and launch plate.
{
  const theme = { ...M.THEMES.midnight, background: "#070d1d", surface: "#13223b", accent: "#8da9ff", secondary: "#43edcc", line: "#28415c" };
  const chip = [];
  for (let i = 0; i < 5; i++) chip.push(object("box", i % 2 ? "$secondary" : "$accent", {
    scaleX: 2.3 - i * 0.2, scaleY: 0.14, scaleZ: 1.8 - i * 0.15, y: -0.8 + i * 0.38,
    material: i === 4 ? "glass" : "standard", transmission: i === 4 ? 0.9 : 0,
    tracks: [track("y", [[0, -0.8 + i * 0.52], [4, -0.8 + i * 0.26], [6, -0.8 + i * 0.26]])],
  }));
  for (let i = 0; i < 12; i++) chip.push(object("box", "$secondary", {
    x: (i % 6 - 2.5) * 0.42, y: -1.02, z: i < 6 ? -1.05 : 1.05,
    scaleX: 0.16, scaleY: 0.12, scaleZ: 0.32, metalness: 0.8,
  }));
  const nodes = [rect(155, 400, 290, 170, "$surface", { id: "sense", stroke: "$secondary", strokeWidth: 2 }),
    rect(655, 400, 290, 170, "$surface", { id: "decide", stroke: "$accent", strokeWidth: 2 }),
    rect(1155, 400, 290, 170, "$surface", { id: "act", stroke: "$secondary", strokeWidth: 2 })];
  const scenes = [
    scene("technology-awakening", "01 / The sleeping core", [
      ...particles(28), stage(chip, { cameraDistance: 6.7, cameraElevation: 30, mirror: true, x: 590, width: 950 }),
      text("One signal.\nA thousand possibilities.", 80, 320, 46, { width: 550, height: 130 }),
      ...card(80, 510, "LUMEN / NODE 01", "Fictional adaptive processor", "cpu", 0.6),
      { id: id("icon"), type: "icon", icon: "memory", x: 91, y: 675, width: 42, height: 42, fill: "$secondary", start: 1 },
      text("SENSE  /  CONNECT  /  RESPOND", 155, 680, 19, { fill: "$muted", width: 530, start: 1.2 }),
      ...rails("Technology / fictional product film", "The city wakes.", "An imagined machine that turns a quiet signal into collective action.", "01 / 03"),
    ]),
    scene("technology-routing", "02 / Signal becomes meaning", [
      ...particles(20), ...[["sense", "decide"], ["decide", "act"]].map(([from, to], i) => ({
        id: id("link"), type: "line", from, to, fromAnchor: "right", toAnchor: "left", curve: "bezier",
        arrow: true, particles: 6, stroke: "$secondary", fill: "$text", strokeWidth: 4,
        enter: "draw", enterDuration: 1.5, start: 0.6 + i * 0.3,
      })), ...nodes,
      symbol("radio", 265, 425, 58), symbol("brain-circuit", 765, 425, 58), symbol("zap", 1265, 425, 58),
      text("SENSE", 240, 505, 27, { width: 220 }), text("DECIDE", 730, 505, 27, { width: 220 }),
      text("RESPOND", 1225, 505, 27, { width: 220 }),
      svgPath("M 160 680 L 360 680 L 405 625 L 455 730 L 505 650 L 550 680 L 1440 680", "none",
        { stroke: "$accent", strokeWidth: 3, enter: "draw", enterDuration: 3 }),
      text("A sensor notices. A network listens. A shared response begins.", 80, 270, 32, { width: 1440, fill: "$muted" }),
      ...rails("Technology / signal choreography", "Intelligence is a connection.", "Illustrative architecture only. Particles describe direction, not measured throughput.", "02 / 03"),
    ]),
    scene("technology-launch", "03 / The living network", [
      { id: id("video"), type: "video", asset: "city", x: 0, y: 0, width: 1600, height: 900, fit: "cover", loop: true, opacity: 0.22, enter: "none" },
      rect(0, 0, 1600, 900, "#070d1dbb", { radius: 0, enter: "none" }),
      stage([object("knot", "$accent", { material: "liquidMetal", amplitude: 0.08, scaleX: 1.5, scaleY: 1.5, scaleZ: 1.5, speed: 0.3 }),
        object("torus", "$secondary", { rotationX: 70, scaleX: 2.4, scaleY: 2.4, scaleZ: 2.4, material: "glass", transmission: 0.9 })],
      { x: 730, cameraDistance: 6, mirror: true }),
      { id: id("counter"), type: "counter", x: 80, y: 300, width: 600, height: 180, fontSize: 140, valueFrom: 0, valueTo: 100, suffix: "%", fill: "$secondary", enterDuration: 3 },
      text("CONCEPT NETWORK ONLINE", 88, 485, 24, { fill: "$accent", width: 600, start: 1 }),
      { id: id("chart"), type: "chart", x: 90, y: 565, width: 460, height: 150, values: [30, 55, 75, 100], labels: ["01", "02", "03", "04"], maxValue: 100, fill: "$accent", fontSize: 18, enterDuration: 2.5 },
      ...rails("Technology / imagined launch", "Small signals. Shared futures.", "LUMEN is fictional. Percentages and chart values are illustrative design devices.", "03 / 03"),
    ]),
  ];
  story("technology", "LUMEN / The city wakes", "At dawn, a sleeping processor hears the first signal of a city and transforms isolated sensors into a living network.", theme, scenes,
    ["A suspended exploded chip descends into alignment. Fine cyan pins and transparent top layer catch reflected light; dust drifts behind the headline. A slow camera arc reveals the layered construction.",
      "Cut from the assembled core to three wide cards: SENSE, DECIDE, RESPOND. Connectors draw left to right, travelling particles continue the signal and an original ECG-like path writes beneath the architecture.",
      "The concept network comes online over a subtle synthetic moving plate. A reflective knot sits inside a glass orbital ring. A 0-100% illustrative counter and four-bar progression resolve, then hold."],
    "Premium technical editorial: midnight navy, ice-blue machined layers, restrained mint signal accents. Use spacious Swiss-style typography, thin schematic lines and reflected hero geometry; no cluttered dashboard wallpaper.",
    "Use standard hard-surface boxes, a transparent glass top plate, reflective liquid-metal knot, torus glass refraction, soft procedural environment light and a single ground mirror. Keep shader amplitude subtle so the structure remains legible.",
    ["Actual Material memory icon and Lucide cpu/radio/brain-circuit/zap glyphs.", "Root linked connectors with six travelling particles, editable wave path.", "Grouped caption card, text, rounded rectangles, circle particles, embedded video, counter and chart.", "Physical glass/metal, procedural geometry, object tracks, camera tracks and planar mirror."]);
}
// SCENERY: original layered vector landscape, water and floating observatory.
{
  const theme = { ...M.THEMES.ocean, background: "#081c2c", surface: "#153e50", accent: "#f7c882", secondary: "#6de3cf", muted: "#a7c7c9", line: "#32606c" };
  function landscape(sunset = false) {
    return [
      circle(1120, 170, 230, sunset ? "#ffba76" : "#cbeae0", { opacity: 0.9, enter: "fade", tracks: [track("y", [[0, 205], [6, 165]])] }),
      svgPath("M 0 510 L 200 330 L 360 475 L 580 280 L 810 470 L 1020 300 L 1320 490 L 1600 320 L 1600 900 L 0 900 Z", "#214d60",
        { tracks: [track("x", [[0, -20], [6, 0]], "linear")] }),
      svgPath("M 0 620 L 210 470 L 420 590 L 690 390 L 960 600 L 1280 430 L 1600 590 L 1600 900 L 0 900 Z", "#123a4a",
        { tracks: [track("x", [[0, 15], [6, -15]], "linear")] }),
      svgPath("M 0 780 Q 220 640 440 760 T 900 750 T 1600 740 L 1600 900 L 0 900 Z", "#0b2936"),
      ...Array.from({ length: 10 }, (_, i) => svgPath(`M ${80 + i * 150} ${520 + i % 3 * 20} l 14 -8 l 14 8`, "none",
        { stroke: "$secondary", strokeWidth: 2, opacity: 0.4, tracks: [track("x", [[0, -20], [6, 40]], "linear")] })),
    ];
  }
  const water = stage([object("plane", "$secondary", { material: "water", scaleX: 20, scaleY: 10, rotationX: -90, amplitude: 0.08, frequency: 6 })],
    { x: 0, y: 520, width: 1600, height: 270, cameraDistance: 5.3, cameraAzimuth: 0, cameraElevation: 50, tracks: [], enterDuration: 1.2 });
  const observatory = [
    object("cylinder", "#f0e2c7", { y: -0.8, scaleX: 1.6, scaleY: 0.18, scaleZ: 1.6, roughness: 0.35 }),
    object("sphere", "$secondary", { y: -0.1, scaleX: 1.1, scaleY: 0.75, scaleZ: 1.1, material: "glass", transmission: 0.9, ior: 1.4 }),
    object("torus", "$accent", { rotationX: 90, y: -0.6, scaleX: 1.8, scaleY: 1.8, scaleZ: 1.8, metalness: 0.8 }),
    object("cone", "$accent", { y: 0.65, scaleX: 0.3, scaleY: 0.6, scaleZ: 0.3 }),
  ];
  story("scenery", "AER / The valley that remembers", "A paper bird follows the first light across a quiet valley and discovers an observatory floating above a luminous lake.", theme, [
    scene("scenery-dawn", "01 / A valley of light", [
      ...landscape(), ...particles(22, "$accent", 180, 600),
      rect(0, 0, 780, 330, "#081c2c77", { radius: 0 }),
      ...rails("Scenery / an imaginary expedition", "Where silence\nlearns to glow.", "AER VALLEY / A fictional landscape drawn from light, layered silhouettes and motion.", "01 / 03"),
    ], { type: "linear", color: "#102e43", color2: "#347a80", angle: 90 }),
    scene("scenery-crossing", "02 / Across the mirror lake", [
      ...landscape(true), water,
      svgPath("M 160 480 C 450 250 760 640 1330 400", "none", { stroke: "$accent", strokeWidth: 3, enter: "draw", enterDuration: 3 }),
      svgPath("M 0 15 L 60 0 L 35 35 L 24 20 Z", "$text", { x: 300, y: 450, width: 60, height: 40,
        tracks: [track("x", [[0, 180], [4.8, 1260], [6, 1260]]), track("y", [[0, 490], [2.4, 380], [4.8, 440], [6, 440]])] }),
      { id: id("mist"), type: "effect", effect: "gas", x: 580, y: 330, width: 900, height: 340, intensity: 0.2, speed: 0.18, seed: 7, fill: "#98dad5", opacity: 0.22 },
      ...rails("Scenery / the crossing", "Follow the quiet current.", "A paper bird, procedural mist and a stylized water surface. No fluid solver is used.", "02 / 03"),
    ], { type: "linear", color: "#173949", color2: "#648b89", angle: 90 }),
    scene("scenery-observatory", "03 / The sky keeper", [
      ...particles(35, "$accent"), stage(observatory, { x: 600, y: 210, width: 950, height: 560, mirror: true, cameraDistance: 5.5,
        tracks: [track("cameraAzimuth", [[0, -25], [4.5, 30], [6, 30]]), track("cameraDistance", [[0, 6.5], [4.5, 5.5], [6, 5.5]])] }),
      text("A place to watch.\nA reason to protect.", 80, 350, 45, { width: 600, height: 150 }),
      ...card(80, 570, "THE SKY KEEPER", "An imagined floating observatory", "telescope", 0.9),
      ...rails("Scenery / arrival", "The valley remembers.", "A fictional place. Shared light, refractive glass and one planar reflection.", "03 / 03"),
    ]),
  ], ["Establish three layered mountain silhouettes, a pale sun and distant bird marks. The far ridge shifts 20px while the closer ridge shifts 30px oppositely: depth comes from measured parallax, not a random zoom. The title occupies sky, not the mountains.",
    "A warmer sun settles above the lake. A small original paper-bird path travels on a curved route; a fine golden trail writes behind it. Low-opacity seeded gas creates mist while a separate water viewport ripples across the lower composition.",
    "The camera reveals a cream circular platform, teal glass dome, gold orbital ring and beacon. Stars drift behind; glass and a horizontal mirror catch light. A left-aligned two-line statement resolves beside the artifact."],
  "Poetic illustrated travel film. Deep teal atmosphere, warm paper-gold sunrise, mint lake light. Prioritize a layered graphic landscape over photorealism. Keep mountain silhouettes clean; do not put text over busy wave detail.",
  "Lake waves are deterministic vertex deformation on a horizontal water plane. Mist is a low-opacity seeded shader proxy, not volumetric simulation. The observatory uses cylinder/sphere/torus/cone geometry, glass transmission and one mirror pass; the bird follows authored keyframes rather than aerodynamics.",
  ["Original landscape SVG paths with near/far parallax.", "Circle sun, drifting firefly particles, authored paper-bird path and curved trail.", "Standalone gas atmosphere and shared-scene water material.", "Multi-part procedural observatory, glass dome, camera approach and mirror."]);
}
// FOOD: a fictional illustrated recipe, safe high-level instructions.
{
  const theme = { ...M.THEMES.ember, background: "#201515", surface: "#412a25", accent: "#ffbd72", secondary: "#b9d98a", text: "#fff2df", muted: "#d0b4a0", line: "#6b4636" };
  const bowl = [
    object("sphere", "#f0dfc9", { y: -0.55, scaleX: 2.5, scaleY: 0.45, scaleZ: 2.5, roughness: 0.22 }),
    object("torus", "#e7d4b8", { y: -0.3, rotationX: 90, scaleX: 2.5, scaleY: 2.5, scaleZ: 2.5 }),
    object("sphere", "#e7964c", { y: -0.25, scaleX: 2.1, scaleY: 0.12, scaleZ: 2.1, roughness: 0.3 }),
  ];
  for (let i = 0; i < 9; i++) bowl.push(object("sphere", i % 2 ? "#e85435" : "#f5bf63", {
    x: Math.cos(i * 2.4) * 0.9, z: Math.sin(i * 2.4) * 0.7, y: -0.08, scaleX: 0.13, scaleY: 0.08, scaleZ: 0.15,
    tracks: [track("y", [[0, 1.3 + i * 0.1], [1.8 + i * 0.12, -0.08], [6, -0.08]], "easeOut")],
  }));
  for (let i = 0; i < 4; i++) bowl.push(object("sphere", "$secondary", { x: (i - 1.5) * 0.35, z: 0.1 + (i % 2) * 0.25, y: 0.05, scaleX: 0.3, scaleY: 0.025, scaleZ: 0.12, rotationY: i * 30 }));
  const scenes = [
    scene("food-market", "01 / The last market basket", [
      ...particles(18, "$accent"), stage([
        object("sphere", "#e85e40", { x: -0.9, y: 0.1, scaleX: 1, scaleY: 0.85, scaleZ: 1, roughness: 0.35 }),
        object("sphere", "#f0bd62", { x: 0.9, y: -0.45, scaleX: 0.9, scaleY: 0.7, scaleZ: 0.9 }),
        object("cone", "$secondary", { x: -0.9, y: 0.85, scaleX: 0.23, scaleY: 0.25, scaleZ: 0.23 }),
        object("cylinder", "#d0af7d", { x: 0.3, y: -0.7, scaleX: 0.25, scaleY: 1.5, scaleZ: 0.25, rotationZ: 65 }),
      ], { ground: true, cameraDistance: 5.6 }),
      ...card(80, 320, "TOMATO + CHICKPEA", "A bright, comforting skillet", "salad", 0.5),
      ...card(80, 450, "PANTRY / 2 SERVINGS", "Tomato 400g / cooked chickpeas 240g", "cooking-pot", 1),
      ...card(80, 580, "FINISH", "Olive oil / garlic / lemon / herbs", "leaf", 1.5),
      ...rails("Food / an imagined kitchen story", "One basket. One good meal.", "Fictional illustrated recipe / use cooked chickpeas and wash produce before preparing.", "01 / 03"),
    ]),
    scene("food-skillet", "02 / Build the warm centre", [
      stage(bowl, { cameraDistance: 5.6, cameraElevation: 40, ground: true, x: 600, y: 230, width: 960, height: 530 }),
      { id: id("steam"), type: "effect", effect: "gas", x: 865, y: 190, width: 420, height: 360, intensity: 0.15, seed: 31, speed: 0.25, fill: "#fff2df", opacity: 0.25 },
      ...card(80, 310, "01 / SOFTEN", "Garlic in oil, gently, about 30 sec", "flame", 0.4),
      ...card(80, 440, "02 / SIMMER", "Add tomatoes; stir until softened", "cooking-pot", 1),
      ...card(80, 570, "03 / WARM THROUGH", "Add cooked chickpeas; season", "timer", 1.6),
      ...rails("Food / the skillet", "Colour becomes comfort.", "Illustrative animation, not a cooking timer. Cook gently; avoid burning garlic.", "02 / 03"),
    ]),
    scene("food-table", "03 / Set another place", [
      stage(bowl.map((o) => ({ ...o, tracks: [] })), { cameraDistance: 5.2, cameraElevation: 45, ground: true }),
      circle(1090, 285, 340, "#f7ca8020", { enter: "fade" }),
      text("Finish with lemon.\nScatter the herbs.\nShare while warm.", 80, 335, 46, { width: 650, height: 220 }),
      { id: id("image"), type: "image", asset: "seal", x: 85, y: 643, width: 60, height: 60, radius: 0, fit: "contain" },
      text("THE LITTLE TABLE / ORIGINAL STORY", 165, 664, 19, { fill: "$accent", width: 700 }),
      ...rails("Food / the shared table", "The best ingredient is company.", "2 illustrative servings. Adjust seasoning and check individual dietary needs.", "03 / 03"),
    ]),
  ];
  story("food", "THE LITTLE TABLE / Golden-hour skillet", "Mira returns from an imagined evening market with one small basket and turns it into a warm tomato-chickpea skillet for a friend.", theme, scenes,
    ["Introduce the basket ingredients as glossy but illustrated procedural produce. Three staggered recipe cards establish cooked chickpeas, tomatoes, olive oil, garlic, lemon and herbs; state 2 servings without inventing health claims.",
      "A stylized cream bowl/pan assembles from flattened sphere and torus geometry. Tomato/chickpea pieces descend on authored easeOut trajectories; herb shapes settle on top. Warm seeded steam lifts above, without obscuring recipe steps.",
      "Present the completed dish with a slower overhead camera angle. A restrained warm halo frames the plate. The left column reveals finish instructions: lemon, herbs, share while warm. An original supplied image mark closes the editorial recipe."],
    "Warm cookbook editorial. Cocoa background, terracotta-red produce, golden oil, pale ceramic, sage herbs. Macro-inspired framing with ample space, tactile shadows and one readable action per recipe card; never render fake food photography.",
    "Food geometry is a deliberately stylized composition of spheres, a torus rim, cone stem and cylinder tool. Ingredient drops are keyframed, not collision simulation. Steam uses the gas shader. Physical lighting and ceramic roughness create depth; no actual heat transfer or cooking simulation is implied.",
    ["Grouped ingredient and process cards with real Lucide salad/cooking-pot/leaf/flame/timer glyphs.", "Procedural ingredients, shallow bowl, rim, garnish and staged falling motion.", "Gas steam with fixed seed, cast shadows and warm environment reflections.", "Editable recipe typography, halo circle and original supplied PNG seal."]);
}
// MEETING: a fictional team decision represented as spatial diagrams.
{
  const theme = { ...M.THEMES.midnight, background: "#111326", surface: "#222741", accent: "#b6a2ff", secondary: "#77e3d8", text: "#f7f4ff", muted: "#acb4d2", line: "#45496b" };
  const avatars = [];
  for (let i = 0; i < 4; i++) {
    avatars.push(object("sphere", i % 2 ? "$secondary" : "$accent", { x: (i - 1.5) * 0.85, y: 0.3, scaleX: 0.35, scaleY: 0.35, scaleZ: 0.35 }));
    avatars.push(object("cylinder", i % 2 ? "#2e7775" : "#66558e", { x: (i - 1.5) * 0.85, y: -0.2, scaleX: 0.4, scaleY: 0.45, scaleZ: 0.4 }));
  }
  avatars.push(object("box", "$accent", { y: -0.8, scaleX: 4.5, scaleY: 0.15, scaleZ: 1.6, material: "glass", transmission: 0.7 }));
  const decisions = [["question", "constraint"], ["constraint", "decision"]].map(([from, to], i) => ({
    id: id("connector"), type: "line", from, to, fromAnchor: "right", toAnchor: "left", curve: "step", particles: 3,
    stroke: "$secondary", fill: "$text", strokeWidth: 4, arrow: true, enter: "draw", enterDuration: 1.5, start: i * 0.5,
  }));
  story("meeting", "ROOM 04 / One clear decision", "Four fictional teammates enter a meeting with separate ideas and leave with one visible decision, an owner and a next step.", theme, [
    scene("meeting-arrival", "01 / Many perspectives", [
      ...particles(20), stage(avatars, { ground: true, cameraDistance: 6.4, cameraElevation: 25 }),
      ...card(80, 320, "NOVA / PRODUCT", "What problem are we solving?", "lightbulb", 0.4),
      ...card(80, 450, "ELI / ENGINEERING", "What can we build responsibly?", "code", 0.9),
      ...card(80, 580, "JUNE + SOL / DESIGN + OPS", "How will it feel and work?", "users", 1.4),
      ...rails("Meeting / a fictional team", "Four minds. One room.", "Stylized figures represent invented characters, not real attendees or recorded meeting data.", "01 / 03"),
    ]),
    scene("meeting-decision", "02 / Align the question", [
      ...decisions,
      rect(120, 385, 360, 220, "$surface", { id: "question", stroke: "$accent", strokeWidth: 2 }),
      rect(620, 385, 360, 220, "$surface", { id: "constraint", stroke: "$line", strokeWidth: 2 }),
      rect(1120, 385, 360, 220, "$surface", { id: "decision", stroke: "$secondary", strokeWidth: 2 }),
      symbol("circle-help", 155, 415, 44), symbol("sliders-horizontal", 655, 415, 44), symbol("check-check", 1155, 415, 44),
      text("QUESTION", 150, 490, 23, { fill: "$accent", width: 300 }),
      text("Can the first step\nbe simpler?", 150, 530, 27, { width: 300, height: 80 }),
      text("CONSTRAINT", 650, 490, 23, { fill: "$accent", width: 300 }),
      text("One week.\nOne small experiment.", 650, 530, 27, { width: 300, height: 80 }),
      text("DECISION", 1150, 490, 23, { fill: "$secondary", width: 300 }),
      text("Prototype the\nwelcome flow.", 1150, 530, 27, { width: 300, height: 80 }),
      ...rails("Meeting / visual facilitation", "Clarity is a sequence.", "A fictional decision map. Draw the reasoning before revealing the chosen next step.", "02 / 03"),
    ]),
    scene("meeting-action", "03 / Leave with momentum", [
      stage([object("box", "$secondary", { rotationY: 25, scaleX: 1.4, scaleY: 1.4, scaleZ: 0.2, material: "glass", transmission: 0.8 }),
        object("torus", "$accent", { rotationY: 30, scaleX: 2.3, scaleY: 2.3, scaleZ: 2.3, material: "liquidMetal", amplitude: 0.06, speed: 0.2 })], { mirror: true, cameraDistance: 5.3 }),
      ...card(80, 320, "DECISION", "Prototype one welcome screen", "check", 0.4),
      ...card(80, 450, "OWNER / NOVA", "Bring the first draft tomorrow", "user-check", 0.9),
      ...card(80, 580, "SUCCESS SIGNAL", "Learn what the next test needs", "target", 1.4),
      ...rails("Meeting / the hand-off", "No more invisible next steps.", "ROOM 04 / invented team, fictional plan / decisions remain editable and traceable.", "03 / 03"),
    ]),
  ], ["Reveal four abstract head-and-body figures around a transparent table. Differently coloured teammates share a camera frame, not separate fake video-call feeds. Left cards give each discipline a concrete question.",
    "Replace the meeting room with a three-part decision map: question, constraint, decision. Step connectors draw first, cards appear in order and travelling dots imply thought moving toward action. Preserve legible long-form labels in 80px-safe framing.",
    "A glass decision tile and a reflective ring become a quiet emblem of alignment. Three final cards state the decision, owner and learning goal. Stop the camera at 4.5s and hold the final hand-off through 6s."],
    "Refined strategy presentation, not a busy SaaS dashboard. Ink-violet space, lavender emphasis, mint completion. Use consistent card sizes, large readable editorial titles and a thin shared progress rail.",
    "Abstract people use sphere/cylinder primitives. The table and final decision tile use transmission glass; the closing ring uses restrained liquidMetal reflection and a single mirror. All spatial motion is keyframed. No emotion recognition, real attendee analysis or real meeting recording is implied.",
    ["Eight-part procedural team plus glass table with shared 3D lighting.", "Groups, text and rectangular decision cards; root step connectors and travelling particles.", "Real Lucide team/question/controls/check/owner/target symbols.", "Glass tile, reflective ring, camera orbit, cast shadows and mirror."]);
}
// SOCIAL: fictional community narrative with original vector city and social graph.
{
  const theme = { ...M.THEMES.graphite, background: "#0f2022", surface: "#20383a", accent: "#ffe08a", secondary: "#92e6c6", text: "#fff9e9", muted: "#b6ccc2", line: "#42605b" };
  function city() {
    return Array.from({ length: 12 }, (_, i) => {
      const height = 100 + (i * 41) % 190;
      return rect(i * 140 - 20, 700 - height, 120, height + 80, i % 2 ? "#183538" : "#224447", { radius: 4, enter: "none" });
    });
  }
  const people = [circle(185, 420, 120, "$accent", { id: "a" }), circle(525, 335, 120, "$secondary", { id: "b" }),
    circle(865, 420, 120, "$accent", { id: "c" }), circle(1205, 335, 120, "$secondary", { id: "d" })];
  story("social", "THE LONG TABLE / A small kindness travels", "A handwritten invitation in an imaginary neighborhood travels from one doorway to the next until strangers build a shared evening table.", theme, [
    scene("social-invitation", "01 / One open door", [
      ...city(), ...particles(20, "$accent"),
      rect(760, 270, 550, 385, "#fff0cb", { rotation: -6, shadowBlur: 34, shadowY: 20,
        tracks: [track("rotation", [[0, -12], [3, -4], [6, -4]])] }),
      text("COME AS\nYOU ARE.", 820, 330, 76, { fill: "#214447", width: 500, height: 190, rotation: -4 }),
      text("SATURDAY / THE COURTYARD", 817, 560, 20, { fill: "#49675d", width: 500, rotation: -4 }),
      text("An invitation is small.\nWhat it opens is not.", 80, 355, 45, { width: 620, height: 160 }),
      ...rails("Social / a fictional neighborhood", "It started with a note.", "Original imagined community story / no real campaign or participation statistics.", "01 / 03"),
    ]),
    scene("social-ripple", "02 / From person to person", [
      ...particles(25),
      ...[["a", "b"], ["b", "c"], ["c", "d"]].map(([from, to], i) => ({
        id: id("connection"), type: "line", from, to, fromAnchor: "right", toAnchor: "left", curve: "bezier",
        arrow: false, particles: 4, stroke: "$secondary", strokeWidth: 3, fill: "$text", enter: "draw", enterDuration: 1.5, start: i * 0.5,
      })), ...people,
      symbol("heart-handshake", 220, 455, 48, { fill: "$background" }),
      symbol("message-circle", 560, 370, 48, { fill: "$background" }),
      symbol("sprout", 900, 455, 48, { fill: "$background" }),
      symbol("house", 1240, 370, 48, { fill: "$background" }),
      text("A NOTE", 185, 600, 22, { width: 230 }), text("A CONVERSATION", 500, 600, 22, { width: 300 }),
      text("A LITTLE HELP", 850, 600, 22, { width: 280 }), text("A PLACE TO MEET", 1170, 600, 22, { width: 330 }),
      ...rails("Social / connection choreography", "Kindness has a direction.", "Connected nodes and travelling particles are narrative devices, not measured social impact.", "02 / 03"),
    ]),
    scene("social-table", "03 / A place for everyone", [
      ...city(), ...particles(30, "$accent"),
      stage([
        object("box", "#e2b875", { y: -0.65, scaleX: 3.5, scaleY: 0.16, scaleZ: 1.3, roughness: 0.45 }),
        ...Array.from({ length: 6 }, (_, i) => object("sphere", i % 2 ? "$secondary" : "$accent", {
          x: (i % 3 - 1) * 0.95, z: i < 3 ? -0.85 : 0.85, y: -0.25, scaleX: 0.28, scaleY: 0.35, scaleZ: 0.28,
          tracks: [track("y", [[0, -0.55], [2 + i * 0.2, -0.25], [6, -0.25]])],
        })),
        object("sphere", "$accent", { y: 0.5, scaleX: 0.25, scaleY: 0.45, scaleZ: 0.25, material: "glass", transmission: 0.75 }),
      ], { x: 660, y: 240, width: 900, height: 520, cameraDistance: 5.8, cameraElevation: 30, ground: true }),
      text("Bring a story.\nMake some room.\nStay a little longer.", 80, 330, 45, { width: 650, height: 240 }),
      ...card(80, 615, "THE LONG TABLE", "An invitation, not a campaign", "heart", 1.3),
      ...rails("Social / the shared ending", "There is room for one more.", "An imagined evening / original visual story / no real-world outcome is claimed.", "03 / 03"),
    ]),
  ], ["Show a warmly lit note floating over a geometric neighborhood silhouette. The paper rotates slowly into place, with a large dark invitation headline. Keep the handwritten-story feeling without requiring external fonts.",
    "The invitation moves into a wide social graph of four contrasting circular nodes. Draw connections in three phases; each node carries a real local symbol for care, conversation, growth or home. Use measured travelling particles and meaningful labels.",
    "Reveal a stylized shared table and six abstract neighbors arriving at staggered times. A small refractive lantern marks the centre, warm particles suggest evening, and the final line holds: There is room for one more."],
    "Warm community editorial. Forest-green ink, cream paper, honey-gold light and fresh mint. Use human-scale objects, gentle easing and generous breathing room; no fake platform metrics, notification spam or political advocacy.",
    "Paper movement and seating arrivals are authored transforms, not rigid-body simulation. A shared 3D scene supplies physical light, a glass lantern and cast shadows. Connection dots and warm motes are deterministic visual metaphors, not a real social-network simulation.",
    ["Original vector skyline, rotating invitation card and oversized editable text.", "Circle nodes, Lucide heart-handshake/message-circle/sprout/house glyphs and linked Bezier paths.", "Multi-part 3D table/people/lantern, group cards and warm particle atmosphere.", "Fiction labels and a final hold preserve narrative clarity without fabricated impact claims."]);
}
fs.writeFileSync(path.join(out, "manifest.json"), JSON.stringify(stories, null, 2) + "\n");
const layers = stories.flatMap((story) => {
  const p = JSON.parse(fs.readFileSync(path.join(out, story.key + ".motion.json")));
  return p.scenes.flatMap((s) => s.layers);
});
const objects = layers.flatMap((layer) => layer.objects || []);
for (const [label, expected, actual] of [
  ["element types", M.TYPES, layers.map((layer) => layer.type)],
  ["geometries", M.GEOMETRIES, objects.map((object) => object.geometry)],
  ["material/effect families", M.MATERIALS,
    [...objects.map((object) => object.material), ...layers.filter((layer) => layer.type === "effect").map((layer) => layer.effect)]],
]) {
  const covered = new Set(actual);
  const missing = expected.filter((value) => !covered.has(value));
  if (missing.length) throw new Error(`Missing showcase ${label}: ${missing.join(", ")}`);
}
console.log(`Built ${stories.length} original story projects, 15 shots, five separate detailed prompts; all ${M.TYPES.length} layer types, seven geometries and five material/effect families covered.`);
