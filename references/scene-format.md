# Scene format — version 1

`src/engine.js` is the reference renderer and semantic validator. `project.schema.json` describes the shape of the data. Run `node scripts/validate.cjs file.motion.json` for cross-reference, timing, cycle and combined-size checks. Unknown fields are rejected so misspelled LLM output does not silently disappear.

## Project and scene

```json
{
  "version": 1,
  "name": "My explanation",
  "width": 1600,
  "height": 900,
  "fps": 30,
  "theme": {
    "background": "#0b1020", "surface": "#182237",
    "accent": "#8d9bff", "secondary": "#56e0cf",
    "text": "#f4f6ff", "muted": "#91a0b8", "line": "#34445e"
  },
  "assets": {},
  "scenes": [{
    "id": "intro", "name": "Introduction", "duration": 8,
    "background": {"type": "solid", "color": "$background"},
    "layers": [{
      "id": "title", "type": "text", "name": "Main title",
      "x": 100, "y": 120, "width": 1400, "height": 120,
      "text": "Systems in motion", "fontSize": 72, "fontWeight": 700,
      "fill": "$text", "start": 0.2, "enter": "rise", "enterDuration": 0.8
    }]
  }]
}
```

Project size: 256–4096 per dimension, 1–60 fps. Prefer integer dimensions and fps; the frame exporter requires them. There must be 1–60 scenes, each 0.1–600 seconds with at most 400 layers. A scene's duration is independent of project fps. Scene order is the storyboard/export order. Times restart at zero in each scene. Scene IDs must be unique across a project; layer IDs must be unique within their scene.

IDs start with a letter, followed by up to 63 letters, numbers, underscores or hyphens. Display names can contain normal text. `theme` requires the seven named six-digit hex colours shown above. A layer colour accepts `#RGB`, `#RRGGBB`, `#RRGGBBAA`, `none` or `$background`, `$surface`, `$accent`, `$secondary`, `$text`, `$muted`, `$line`.

Background types: `solid`, `linear`, `radial`, `transparent`. Optional fields: `color`, `color2`, `angle` (degrees), `grid` (boolean), `gridSize` (10–400), `gridOpacity` (0–1). Transparency applies to the scene canvas; a visible grid or elements still render. Linear gradient angle 0 runs left to right. The radial gradient is centred near the upper-right portion of the stage.

## Common layer fields

| Field | Meaning / default |
| --- | --- |
| `id`, `type` | Required; see supported types below |
| `name` | Optional display label |
| `x`, `y` | Top-left position in parent coordinates; default 0 |
| `width`, `height` | Declared local box; default 180×100. Text and paths do **not** automatically scale or wrap to it. |
| `rotation`, `scale` | Degrees / scalar, default 0 / 1. Applied about the declared box centre. |
| `opacity` | 0–1, default 1 |
| `fill`, `stroke`, `strokeWidth` | Default `$accent`, `none`, 2 |
| `radius` | Rounded-rectangle / image-crop radius; default 20 |
| `parentId` | Optional group ID, max depth 8, no cycles. Connectors, video, scene3d and effect must be root layers. |
| `start`, `end` | Visible interval in scene seconds; default 0 to scene duration |
| `enter` | `none`, `fade`, `rise`, `slide`, `scale`, `draw`; default `fade` |
| `enterDuration` | Entrance duration, default 0.6 seconds |
| `exitDuration` | Fade-out ending at `end`, default 0 |
| `hidden` | Boolean, default false |
| `tracks` | Array of keyframe tracks |
| `shadowBlur`, `shadowX`, `shadowY`, `shadowColor` | Blur 0-100 (0 disables), offsets -500..500 (defaults 0/10), colour default `#00000080`. Blur and offsets are keyframeable. |

`rise` adds a decaying 32 px Y offset; `slide` a decaying −60 px X offset; `scale` begins at 80% of the selected scale. Entrances except `none` also fade opacity. `draw` reveals strokes on paths and lines. Charts and counters use entrance progress for their values unless you animate `progress` explicitly. An entrance can therefore combine with a numeric track: use `enter:"none"` for fully explicit motion.

Root layers render in array order from back to front. Children render in their parent's group in sibling array order. Groups are stacking contexts: reordering a child cannot put it outside its parent in the overall stack. Deleting a group in the editor deletes its descendants and connectors referencing removed layers. Parent assignment preserves local numeric coordinates; it does not automatically compensate for the previous world position.

## Types

| Type | Additional fields |
| --- | --- |
| `text` | Required `text`; `fontSize` (default 40), `fontWeight` (default 500), `align` (`left`, `center`, `right`), `lineHeight` (default 1.2), `fontFamily` (`sans`, `mono`, `serif`). Use explicit newline characters. |
| `rect` | Uses common width, height and radius. |
| `circle` | An ellipse that fits width/height; equal values make a circle. |
| `icon` | Required `icon`: an exact name in the local Material catalog. Square glyph fits inside width/height. `fill` recolours it. |
| `image` | Required `asset` ID; `fit`: `contain` (default), `cover`, `stretch`. `radius` clips corners. Set radius 0 for an unrounded logo. |
| `line` | Free endpoint: common x/y and `x2`, `y2`. Connected endpoint: `from`, `to` layer IDs with `fromAnchor`, `toAnchor` (`left`, `right`, `top`, `bottom`, `center`). `curve`: `straight`, `bezier`, `step`; `arrow`: boolean; `particles`: 0–20; `dash`: numeric SVG dash string; `progress`: 0–1. |
| `path` | Required `d`: SVG path commands and numbers only. `progress`: 0–1. Path coordinates are local; resizing the declared box does not rewrite the path. Use common `scale` to scale it. |
| `counter` | `valueFrom` (default 0), `valueTo` (default 100), `decimals` (0–6, floored), `prefix`, `suffix`, `fontSize`, `fontWeight`, `align`. |
| `chart` | Required `values`: 1–50 non-negative numbers. `labels`: matching strings; `colors`: palette colours by bar; `maxValue`: positive fixed scale; `barGap`: 0–0.9; `fontSize`; `progress`: 0–1. Add separate text layers for units, source and axis labels. |
| `group` | Transform container for layers with this parentId. No visible shape of its own. |
| `symbol` | Required `symbol`: exact Lucide name in `src/elements.js`. Vector strokes use layer `fill` as colour. |
| `video` | Required video `asset`; `fit` contain/cover/stretch, `trim` 0-36000 source seconds, `playbackRate` .1-8 (1), `loop` boolean (false). Root layer. |
| `effect` | Required `effect`: gas/water/liquidMetal/glass. `intensity` 0-1 (.25), `speed` -10..10 (.5), integer `seed` 0-65535 (1). Fill sets colour. Root layer. |
| `scene3d` | Required `objects` (1-40). Camera/light/ground/mirror fields below. Root layer. |

Connectors render in **stage coordinates**. Their endpoints follow sampled world transforms of referenced nodes, including parent transforms. They cannot reference another connector. Line `x2/y2` are absolute stage endpoints; rotation/scale/width/height do not transform a connector. For a moving free line, animate x/y for the first endpoint or connect it to animated nodes. Connector endpoints still exist when the target is invisible: choreograph line `start/end` with node visibility. A Bézier or step line routes horizontally through the midpoint; for other routing use a custom path.

`chart.maxValue` clips taller values at the plot maximum. Choose and label an honest scale. The engine does not infer scientific units, percentages, source credibility or chart semantics.

## Keyframes

```json
{
  "property": "x",
  "loop": false,
  "keyframes": [
    {"time": 0, "value": 100},
    {"time": 2, "value": 500, "easing": "easeOut"},
    {"time": 5, "value": 500, "easing": "linear"}
  ]
}
```

Allowed numeric properties: `x`, `y`, `width`, `height`, `rotation`, `scale`, `opacity`, `fontSize`, `strokeWidth`, `radius`, `progress`, `shadowBlur`, `shadowX`, `shadowY`, `intensity`, `speed`, `cameraDistance`, `cameraAzimuth`, `cameraElevation`, `fov`, `lightIntensity`. Colour properties: `fill`, `stroke` (hex or palette tokens; `none` cannot be interpolated). Colours interpolate RGBA channels, not perceptual colour space.

Use 2–100 keys per track, strictly increasing, within the scene duration. Each property gets one track; maximum 20 tracks per layer. Values before/after the track hold at the first/last key. `loop:true` wraps after the last key over that track's time range. Matching first/last values produce a smooth loop. Supported easings: `linear`, `easeIn`, `easeOut`, `easeInOut` (default), `backOut`, `step`. Easing on a destination key controls the segment leading into it. `backOut` deliberately overshoots; avoid it on properties whose visual range should remain bounded.

Numeric tracks are absolute values, not offsets. Each frame recomputes from project data and timestamp. Procedural effects have fixed seeds; there is no accumulated simulation, arbitrary CSS animation or audio clock. This allows repeatable scrubbing and frame export. Different system fonts, GPUs or browsers can still produce different pixels across machines.

## Assets

```json
{
  "logo": {
    "name": "My logo",
    "src": "data:image/png;base64,...",
    "credit": "Supplied by the creator",
    "source": "Optional provenance URL or description"
  }
}
```

`...` above is documentation shorthand, not valid data. Assets support PNG/JPEG/WebP and MP4/WebM: at most 100 assets, 14 million encoded characters per image, 140 million per video and 160 million combined. Image upload limits: 10 MB, 8192 px per dimension and 32 megapixels. Video upload limits: 100 MB, finite positive duration and 8192 px per side. JSON import limit: 170 MB. Imported JSON checks format/size; corrupt or unsupported media may still fail decoding. Preview before delivery.

The SVG uploader is an allowlist for simple vector marks: shapes, paths, groups, gradients and clip paths. It rejects scripts, styles, external references, text, filters, embedded images and unsupported tags/attributes, then rasterises at a 2048 px long side. Inert design-tool metadata (`data-*`, `xmlns:xlink`, `class`, `version`) is stripped and simple inline `style` colour/stroke declarations become attributes. `importImage(file, {recolor:{from,to}, credit, source})` can swap one exact hex colour (the unDraw source mode swaps `#6C63FF` to the theme accent) and records credit/source on the asset. `addWithDepth(assetId)` adds a ground-shadow circle plus a floating, drop-shadowed image layer. Preserve an original high-resolution raster or vector source separately if needed. Do not include SVG strings directly in a project image asset.

`credit` and `source` are stored as metadata, never fetched or executed. They are not automatically visible; add explicit credit text layers. External image URLs and filesystem paths are not renderable project assets. Use `scripts/embed-assets.cjs` to embed files before distributing a project.

### Local illustration plans

When the editor serves a local illustration library (`assets/undraw-local/`), the AI import box also accepts a wrapper: `{"project": {...}, "illustrations": [placement, ...]}`. A placement is:

```json
{ "scene": "scene-2", "file": "undraw_example_ab12.svg", "x": 1000, "y": 240, "width": 520, "height": 510,
  "index": 20, "layer": "front", "motion": "float", "start": 0.4 }
```

| Field | Meaning |
| --- | --- |
| `scene` | Scene ID to place into. |
| `file` | A filename from the listed library; never a path or URL. |
| `x`, `y`, `width`, `height` | The box in stage pixels. |
| `index` | Insert position in the scene's root layers. |
| `layer` | `back` and `distant:true` give a fading, drifting plate with no shadows; set `opacity` (the director uses 0.16). `mid` and `front` get a drop shadow, a ground ellipse and the chosen motion. |
| `motion` | `float`, `sway`, `drift` or `none`. |
| `start` | Entrance time in seconds; optional `end` sets the exit. |

After applying the project, the editor imports each named file once, recolours its accent to `theme.accent` and inserts the layers. Malformed placements are skipped.

In code, `MotionDirector.build(brief, {library})` returns `{project, plan, analysis}` in this shape. `MotionDirector.depthPlan(project, library)` returns placements for an existing project. `MotionForgeApp.applyIllustrationPlan(plan)`, `direct(brief)` and `autoDepth()` apply them in the editor. `?brief=<text>` builds on startup.

## Engine and browser APIs

```js
const M = require('./src/engine.js'); // CommonJS, no dependencies
M.assertValid(project);
const svg = M.renderSVG(project, 'intro', 2.5);
```

In a browser, the same API is `window.MotionForge`. `validate(project)` returns error strings; `assertValid(project)` throws if invalid. Validate untrusted data before calling `renderSVG`; the low-level renderer assumes a validated project. `sample(layer,time,scene,theme)` and `trackValue(track,time,theme)` expose deterministic interpolation for integrations.

The editor exposes `MotionForgeApp.getProject()`, `setProject(project)` (validates), async `renderFrame(sceneId,seconds)`, `select(layerId)`, `getTime()`, `importImage(file)` and `importVideo(file)`. Always await `renderFrame` before capture: it returns SVG for 2D scenes or a PNG data URI for mixed scenes. `renderSVG` explicitly rejects mixed scenes instead of dropping content. `setProject` does not snapshot or autosave; save explicitly. `window.ready` indicates startup completion. `?export=1&scene=intro&t=2.5` opens clean rendering; IDs must exist. Escape leaves interactive clean preview.

## Procedural 3D

The version remains 1; extensions preserve existing fields. A `scene3d` layer's
x/y/width/height is a pixel viewport, composited in root layer order. Objects
use world units around the origin; positive Y is up. Cameras look at origin.
Typical primitive dimensions are about one unit; independent scaling builds
multi-part models.

| Layer field | Range / default |
| --- | --- |
| `cameraDistance` | 2-30 / 6 |
| `cameraAzimuth` | -36000..36000 degrees / 25 |
| `cameraElevation` | -85..85 degrees / 15 |
| `fov` | 15-100 degrees / 45 |
| `lightIntensity`, `lightColor` | 0-20 / 3; colour default `$text` |
| `ground` | boolean, true; shadow-receiving plane at Y=-1.6 |
| `mirror` | boolean, false; one planar reflection pass, also enables ground |

Camera fields and light intensity are animated on the layer's regular tracks.
Each object requires unique `id` and `geometry`:
`box`, `sphere`, `torus`, `knot`, `cone`, `cylinder`, `plane`.
Optional `material`: `standard` (default), `glass`, `water`, `liquidMetal`, `gas`;
`color`: hex or theme token (not `none`).

Object numeric fields: x/y/z -50..50 (default 0); rotationX/Y/Z
-36000..36000 degrees (0); scaleX/Y/Z .01..50 (1);
roughness/metalness/transmission 0..1; ior 1..2.5;
amplitude 0..1 (.15); frequency .1..20 (2); opacity 0..1 (1).
Material defaults differ: glass transmission .96/IOR 1.5, water .82/1.33,
metal metalness .92, standard roughness .55. `speed` (-10..10, default 0)
adds Y rotation in radians/second; integer `seed` (0..65535, default 1)
sets procedural phase.

Object `tracks` (maximum 18) animate the numeric object fields above, not
geometry/material/color/speed/seed. They use the same structure and
scene-relative time as layer tracks; values must stay within the property's
range. Object rotation and speed are additive. Root layer transform/opacity
affects the finished viewport, not world-space geometry.

Glass uses physical transmission/IOR and a local procedural environment.
It refracts other 3D objects within its own viewport, not video underneath.
Gas, water and metal are stylized shaders rather than fluid simulation.
There is no recursive ray tracing, external mesh import or project scripting.

## Video composition

Video assets are base64 `data:video/mp4` or `data:video/webm`. Video root layers
use the normal transform, opacity, visibility and shadow fields. Place footage
before graphics for overlays; interleaving with 2D/3D is supported.
Source time is `trim + max(0, sceneTime-start) * playbackRate`. With `loop:true`,
time wraps over the remaining source interval after trim; otherwise it holds
the last frame. Trim must be shorter than source duration or rendering reports
an error. Source audio is not mixed. Raster export and CLI rendering await
source seeking/decoding before capture.
