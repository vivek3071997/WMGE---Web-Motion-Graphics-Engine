"use strict";
const fs = require("node:fs");
const path = require("node:path");
const M = require("../src/engine.js");
const E = require("../src/examples.js");
const P = require("../src/presets.js");
const root = path.resolve(__dirname, "..");
const image = fs.readFileSync(path.join(root, "examples", "assets", "forge-mark.png")).toString("base64");
const videoPath = path.join(root, "examples", "assets", "catalog-source.webm");
if (!fs.existsSync(videoPath)) throw new Error("Generate examples/assets/catalog-source.webm with scripts/build-demo-video.cjs first.");
const video = fs.readFileSync(videoPath).toString("base64");
const project = {
  version: 1, name: "Motion Forge - complete example catalog",
  width: 1600, height: 900, fps: 30, theme: M.clone(M.THEMES.midnight),
  assets: {
    logo: { name: "Original Forge mark", src: `data:image/png;base64,${image}`, credit: "Original project asset, MIT" },
    footage: { name: "Original synthetic demonstration footage", src: `data:video/webm;base64,${video}`, credit: "Generated original abstract test animation, MIT; no audio" },
  },
  scenes: [],
};
const entries = [];
const commonPrompt = `Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.`;
function heading(name, subtitle) {
  return [
    { id: "heading", type: "text", text: name, x: 80, y: 55, width: 1440, height: 90, fontSize: 64, fill: "$text", enter: "rise" },
    { id: "subtitle", type: "text", text: subtitle, x: 80, y: 790, width: 1440, height: 55, fontSize: 25, fill: "$muted", enter: "fade" },
  ];
}
function add(category, name, layers, prompt, notes, background = { type: "radial", color: "$background", color2: "$surface" }) {
  const id = "demo-" + String(entries.length + 1).padStart(2, "0");
  const s = { id, name, duration: 8, background, layers: [...layers, ...heading(name, notes)] };
  project.scenes.push(s);
  entries.push({ category, name, id, prompt: `${commonPrompt}\n\n${prompt}`, notes });
}
const move = (property, a, b) => ({ property, keyframes: [{ time: 0, value: a }, { time: 3, value: b, easing: "easeInOut" }, { time: 8, value: b }] });
const base = { x: 500, y: 300, width: 600, height: 280, fill: "$accent", enter: "scale" };
add("Elements", "Text", [{ ...base, id: "subject", type: "text", text: "Ideas in motion\nEditable typography", fontSize: 70, lineHeight: 1.3, fill: "$text", width: 1100, x: 250, enter: "rise", enterDuration: 0.8 }],
  "Create a two-line headline 'Ideas in motion\\nEditable typography' at x250/y300, width1100, fontSize70, lineHeight1.3. Reveal with rise over .8s, keep text editable, hold until 8s. Do not rely on automatic wrapping.", "Text uses explicit line breaks; width does not wrap it.");
add("Elements", "Rectangle", [{ ...base, id: "subject", type: "rect", radius: 40, shadowBlur: 32, shadowY: 18, tracks: [move("width", 200, 600)] }],
  "Build a rounded accent card at x500/y300, height280, radius40. Animate width200 to600 from0 to3s, then hold. Add shadowBlur32/shadowY18 and a .6s scale entrance. Preserve editable shape geometry.", "Width keyframes + rounded corners + drop shadow.");
add("Elements", "Circle", [{ ...base, id: "subject", type: "circle", x: 640, width: 320, height: 320, tracks: [move("fill", "$accent", "$secondary")] }],
  "Place an editable 320x320 circle at640/300. Animate fill from $accent at0s to $secondary at3s and hold. Use equal width/height; add a scale entrance, not a rasterized image.", "Equal width and height creates a circle; colours interpolate.");
add("Elements", "Material icon", [{ ...base, id: "subject", type: "icon", icon: "memory", x: 650, width: 300, height: 300, tracks: [move("rotation", -20, 20)] }],
  "Use the bundled Material memory icon at650/300,300x300, accent fill. Rotate -20 to20 degrees over3s; hold. Choose an actual catalog ID, never a remote image.", "131 Material icons / Apache-2.0.");
add("Elements", "Lucide symbol", [{ ...base, id: "subject", type: "symbol", symbol: "rocket", x: 650, width: 300, height: 300, fill: "$secondary", tracks: [{ property: "y", keyframes: [{ time: 0, value: 430 }, { time: 3, value: 250, easing: "easeOut" }, { time: 8, value: 250 }] }] }],
  "Add Lucide symbol rocket at650/430,300x300. Move y430 to250 over3s with easeOut. Use $secondary as stroke colour through fill; keep vector output.", "1,544 Lucide elements / ISC / editable stroke glyphs.");
add("Elements", "Image", [{ ...base, id: "subject", type: "image", asset: "logo", fit: "contain", radius: 0 }],
  "Use existing logo asset ID logo in an image layer at500/300,600x280, fit contain,radius0. Reveal via scale without stretching or replacing the logo. Preserve its media marker.", "Supplied original logo embedded as PNG; contain preserves aspect.");
add("Elements", "Connector", [
  { id: "wire", type: "line", from: "left", to: "right", curve: "bezier", fromAnchor: "right", toAnchor: "left", arrow: true, particles: 4, stroke: "$secondary", fill: "$text", strokeWidth: 6, enter: "draw", enterDuration: 2 },
  { id: "left", type: "rect", x: 250, y: 350, width: 260, height: 180, radius: 25, fill: "$accent", tracks: [move("y", 350, 280)] },
  { id: "right", type: "rect", x: 1090, y: 350, width: 260, height: 180, radius: 25, fill: "$secondary" },
], "Create two rounded nodes: left250/350/260x180, right1090/350/260x180. Put a root Bezier connector behind them using from:left,to:right, right/left anchors, arrow:true, four travelling particles, strokeWidth6. Draw it over2s while left y moves350 to280 over3s. Verify the endpoints follow nodes.", "Root connectors follow animated node anchors.");
add("Elements", "SVG path", [{ id: "subject", type: "path", x: 300, y: 360, width: 1000, height: 260, d: "M 0 120 C 160 -100 320 340 500 120 S 820 -100 1000 120", fill: "none", stroke: "$secondary", strokeWidth: 10, enter: "draw", enterDuration: 3 }],
  "Draw an original wave path M0 120 C160 -100 320 340 500 120 S820 -100 1000 120 at300/360. Set fill none,secondary stroke,width10,enter draw,duration3s. Use SVG commands only, no markup or scripts.", "Path drawing reveals stroke; declared box does not rewrite path.");
add("Elements", "Counter", [{ ...base, id: "subject", type: "counter", valueFrom: 0, valueTo: 100, suffix: "%", decimals: 0, fontSize: 150, enterDuration: 3 }],
  "Create an illustrative counter from0 to100 with suffix %,fontSize150, at500/300. Drive its progress over3s then hold. Label the values illustrative; do not imply a measured metric.", "Illustrative values only / progress drives the number.");
add("Elements", "Chart", [{ ...base, id: "subject", type: "chart", x: 350, y: 240, width: 900, height: 450, values: [25, 45, 70, 90], labels: ["A", "B", "C", "D"], colors: ["$accent", "$secondary"], maxValue: 100, fontSize: 28, enterDuration: 3 }],
  "Build an illustrative bar chart at350/240,900x450,values25/45/70/90,labelsA/B/C/D,maxValue100. Alternate accent/secondary. Grow bars over3s and hold; label synthetic data explicitly. Keep scale honest and fixed.", "Synthetic values / fixed 0-100 maximum.");
add("Elements", "Group", [
  { id: "assembly", type: "group", x: 550, y: 280, width: 500, height: 300, enter: "none", tracks: [move("rotation", -12, 12)] },
  { id: "card", type: "rect", parentId: "assembly", x: 0, y: 0, width: 500, height: 300, radius: 28, fill: "$surface", stroke: "$accent", strokeWidth: 4 },
  { id: "glyph", type: "symbol", symbol: "layers", parentId: "assembly", x: 175, y: 70, width: 150, height: 150, fill: "$secondary" },
], "Compose a500x300 group at550/280 with a rounded surface card and Lucide layers symbol at local175/70. Rotate the parent -12 to12 degrees over3s. Children use local coordinates. Do not parent connectors/video/effect/scene3d.", "Children share the parent transform and stacking context.");
add("Elements", "Video overlay", [
  { id: "footage", type: "video", asset: "footage", x: 0, y: 0, width: 1600, height: 900, fit: "cover", trim: 0, loop: true, playbackRate: 1, enter: "none" },
  { id: "panel", type: "rect", x: 80, y: 280, width: 900, height: 260, radius: 24, fill: "#101828dd", shadowBlur: 24 },
  { id: "copy", type: "text", text: "Your footage.\nYour motion graphics.", x: 120, y: 320, width: 820, height: 180, fontSize: 64, fill: "$text", enter: "rise" },
], "Use existing footage video asset as a full1600x900 cover layer, loop:true,trim0,rate1,enter none. Overlay a translucent dark panel80/280/900x260 and editable two-line title120/320/820x180,font64. Keep video first in layer order and title above. Preserve marker; do not invent video bytes. Audio is not mixed.", "Original synthetic footage / muted / video behind editable graphics.");
for (const geometry of M.GEOMETRIES) {
  add("3D geometry", "3D " + geometry, [{
    id: "subject", type: "scene3d", x: 250, y: 160, width: 1100, height: 600,
    cameraDistance: 4.5, cameraAzimuth: 20, cameraElevation: 20,
    objects: [{ id: "model", geometry, material: "standard", color: "$accent", roughness: 0.25, speed: geometry === "plane" ? 0 : 0.35,
      tracks: geometry === "plane" ? [move("rotationY", -30, 30)] : [] }],
  }], `Create a scene3d viewport250/160/1100x600 with one ${geometry} object at world origin,standard material,$accent,roughness.25. Set cameraDistance4.5,azimuth20,elevation20. ${geometry === "plane" ? "Animate object rotationY -30 to30 degrees over3s." : "Use object speed.35 radians/sec around Y."} Keep labels as separate SVG overlays. Render PNG/video, not SVG.`, "World-space model / physical light / object motion.");
}
for (const name of P.names) {
  const original = P.scene(name);
  const prompt = {
    "Glass & mirror": "Compose a glass knot at world x-.85 and liquidMetal sphere at1.2/-.4. Use glass transmission.95,IOR1.5,roughness.06. Enable mirror:true for one planar reflection. Set cameraDistance6,azimuth20,elevation18,lightIntensity4. Rotate objects slowly and keep readable SVG labels above. Glass refracts other 3D objects, not background video.",
    "Liquid metal": "Animate a sphere with liquidMetal material,$accent,amplitude.25,frequency3,speed.6. Add rotationY keys0deg at0s and360deg at8s,linear,loop:true. Use cameraDistance6. Verify deterministic deformation on backward seeking. This is a stylized shader, not fluid dynamics.",
    "Water surface": "Build a plane with water material,$secondary,scaleX/Y2.4,rotationX-90,amplitude.2,frequency6. Hide ground. Use cameraDistance6,azimuth0,elevation40. Show absolute-time wave deformation and reflected environment highlights. This is a stylized surface, not a fluid simulation.",
    "Atmospheric gas": "Use a sphere volume proxy with gas material,$secondary,scaleX2.4,scaleY2,amplitude.3,seed42. Hide ground and use cameraDistance6,azimuth0,elevation0. Show translucent deterministic noise; keep the silhouette soft and typography readable. Do not claim volumetric fluid simulation.",
    "Animated shadows": "Combine a standard torus with editable SVG title. Animate title shadowX -24 at0s to24 at4s back to-24 at8s and shadowBlur8 to40 to8,loop:true. Use shadowY6,colour#00000080. Keep the 3D ground visible to demonstrate cast/received shadows too.",
  }[name];
  add("Materials and physics-style effects", name, original.layers.filter((l) => !["heading", "caption"].includes(l.id)), prompt,
    name === "Glass & mirror" ? "One planar reflection / physical transmission / no recursive ray tracing." : "Stylized deterministic visual effect, not a physics simulation.");
}
add("Elements", "Effect layer", M.EFFECTS.map((effect, i) => ({
  id: "effect-" + i, type: "effect", effect, x: 80 + i * 370, y: 260,
  width: 350, height: 400, fill: i % 2 ? "$secondary" : "$accent", intensity: 0.3, speed: 0.6, seed: 42,
})), "Create four root effect layers across the canvas: gas,water,liquidMetal,glass. Give each a350x400 viewport at x80/450/820/1190,y260. Set intensity.3,speed.6,seed42,alternate palette colours. These are isolated effect viewports; use scene3d instead when objects need shared lighting/depth/refraction.", "Standalone presets: gas / water / liquidMetal / glass.");
for (const type of ["solid", "linear", "radial", "transparent"]) {
  add("Backgrounds", type + " background", [{ ...base, id: "subject", type: "symbol", symbol: "palette", x: 650, width: 300, height: 300, fill: "$text" }],
    `Create an8s scene with background type ${type},${type === "transparent" ? "no opaque background fill" : "color $background,color2 $surface,angle35"}. Add a centered editable Lucide palette symbol. ${type === "transparent" ? "Export PNG and verify corner alpha0; video does not retain alpha." : "Add a subtle grid,size80,opacity.08; preserve readable text contrast."}`,
    type === "transparent" ? "PNG preserves alpha; normal MP4/WebM does not." : "Editable scene background and independent grid.",
    { type, color: "$background", color2: "$surface", angle: 35, grid: type !== "transparent", gridSize: 80, gridOpacity: 0.08 });
}
for (const s of E.project().scenes) {
  const id = "template-" + s.id;
  project.scenes.push({ ...s, id });
  entries.push({
    category: "Technical scene compositions", name: s.name, id,
    notes: "Original editable technical template; inspect its layer structure and timing.",
    prompt: `${commonPrompt}\n\nUse the ${s.name} scene in examples/catalog.motion.json as structural reference. Preserve its factual subject and label demonstration values illustrative. Rebuild the grouped cards, editable typography, actual bundled icons, root connectors/charts and staggered reveals. Establish the main subjects first, connections/data second, then hold the completed explanation for at least2s. Keep source labels visible; do not invent claims. Match the reference scene duration rather than forcing8s. Return a complete self-contained project.`,
  });
}
M.assertValid(project);
const expected = new Set(M.TYPES);
for (const s of project.scenes) for (const l of s.layers) expected.delete(l.type);
if (expected.size) throw new Error("Missing element coverage: " + [...expected]);
fs.writeFileSync(path.join(root, "examples", "catalog.motion.json"), JSON.stringify(project, null, 2) + "\n");
let doc = `# Complete example and prompt cookbook

Open [the live catalog](http://127.0.0.1:4173/?demo=catalog) after running
\`npm start\`, or import [catalog.motion.json](../examples/catalog.motion.json)
through **AI workspace -> Open JSON -> Apply**. Every section below points to
an actual editable scene, not just a hypothetical prompt.

## How to use the prompts

1. Select the corresponding catalog scene.
2. Open **AI workspace**, paste its detailed prompt as the creative brief.
3. Use **Copy prompt + current project** so your LLM gets the exact schema,
   available element names and media-preservation markers.
4. Paste the complete returned JSON, Validate, then Apply. Save Project JSON.
5. Inspect start/reveal/middle/end and revisit a timestamp before export.

The shared brief is included in each prompt below so each is independently
copyable. It does not replace the exact schema/reference attached by the app.
Original synthetic video and the Forge mark are already embedded in the
catalog; replace them with your own footage/logo through Assets.

## Coverage and physics boundaries

- All ${M.TYPES.length} layer types: ${M.TYPES.join(", ")}.
- All seven procedural geometries, five material models, four standalone
  effects, four background types, five advanced starters and six technical templates.
- “Physics” here means physical-material rendering and deterministic visual
  effects: lighting, cast/receive shadows, transmission/IOR, reflective materials,
  one planar reflection, shader deformation and procedural noise.
- No rigid-body collisions, gravity integration, fluid solver, true volumetric
  gas, caustics or recursive multi-bounce ray tracing. Glass refracts objects
  within its own 3D scene, not arbitrary video underneath.
- 2D coordinates are pixels, 3D object coordinates are world units. Object
  rotation keys are degrees; automatic Y speed is radians/second.
- Video is muted; original sound is not exported. Browser export is real-time;
  final MP4/WebM should use the [deterministic exporter](EXPORT.md).

## Index

| Category | Example | Scene ID |
| --- | --- | --- |
`;
for (const entry of entries) doc += `| ${entry.category} | [${entry.name}](#${entry.id}) | \`${entry.id}\` |\n`;
for (const entry of entries) {
  const scene = project.scenes.find((s) => s.id === entry.id);
  doc += `\n<a id="${entry.id}"></a>\n\n## ${entry.name}\n\n**Category:** ${entry.category}. **Scene:** \`${entry.id}\`. **Duration:** ${scene.duration}s.\n\n${entry.notes}\n\n### Detailed prompt\n\n\`\`\`text\n${entry.prompt}\n\`\`\`\n\n### Working scene JSON\n\nCopy this scene into a version-1 project with the catalog theme/assets, or use\nthe complete [catalog project](../examples/catalog.motion.json). This scene\nfragment is not a standalone project.\n\n\`\`\`json\n${JSON.stringify(scene, null, 2)}\n\`\`\`\n`;
}
doc += `\n## Animation recipes shared by all examples

- **Entrance:** \`none\` for explicitly keyed motion; \`fade\`, \`rise\`,
  \`slide\`, \`scale\` for reveals; \`draw\` for path/connector strokes.
- **Easing:** \`linear\` for steady travel; \`easeIn\` for acceleration;
  \`easeOut\` for settling; \`easeInOut\` for camera moves; \`backOut\` for
  restrained overshoot; \`step\` for discrete states. Avoid overshoot on bounded
  properties such as opacity, IOR and camera distance.
- **Loop:** at least two strictly increasing keys, one track/property.
  Match endpoints for continuous position/colour loops; a360-degree rotation
  can intentionally wrap to0. Layer/object times are scene-relative.
- **Opacity/colour:** animate \`opacity\`0..1 and \`fill\`/\`stroke\` using
  hex or palette tokens. Object colour is static, not an object-track property.
- **Camera/light:** on the scene3d layer animate cameraDistance,
  cameraAzimuth, cameraElevation, fov or lightIntensity. Objects separately
  animate position, rotation, scale and numeric material properties.

Detailed combined prompt:

\`\`\`text
Create an8s scene3d study with a standard box and glass sphere. Orbit cameraAzimuth
from-20deg at0s to30deg at5s using easeInOut, hold through8s. Move the box x-1 to1
over3s using easeOut. Animate the glass sphere ior1.2 to1.5 over4s without
overshoot. Add an SVG title with rise entrance. Keep labels fixed and readable.
Use one track/property with strictly increasing scene-relative keys. Render at
0/2/4/7.9s and compare4s before/after backward seeking. Return complete validated
Motion Forge version-1 JSON, preserving existing asset markers.
\`\`\`

## Export the catalog

\`\`\`powershell
npm start
node scripts\\validate.cjs examples\\catalog.motion.json
node scripts\\render.cjs --project examples\\catalog.motion.json --scene demo-20 --out renders\\glass-frames --fps 30 --width 1920 --height 1080
node scripts\\render.cjs --project examples\\catalog.motion.json --scene demo-20 --out renders\\glass.mp4 --format mp4 --width 3840 --height 2160 --fps 30 --crf 18
\`\`\`

Install local FFmpeg for direct MP4/WebM encoding. Pick scene IDs from the
index rather than assuming a template name is its ID. Rebuild this cookbook
and portable catalog with \`node scripts/build-catalog.cjs\`; generate the
original synthetic source first with \`node scripts/build-demo-video.cjs\`.
`;
fs.writeFileSync(path.join(root, "docs", "EXAMPLE_COOKBOOK.md"), doc);
console.log(`Built ${project.scenes.length} scenes; covered all ${M.TYPES.length} element types.`);
