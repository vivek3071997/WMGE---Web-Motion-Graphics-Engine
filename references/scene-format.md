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
| `parentId` | Optional ID of a group in this scene. Max nesting depth 8, no cycles. Connectors cannot have parents. |
| `start`, `end` | Visible interval in scene seconds; default 0 to scene duration |
| `enter` | `none`, `fade`, `rise`, `slide`, `scale`, `draw`; default `fade` |
| `enterDuration` | Entrance duration, default 0.6 seconds |
| `exitDuration` | Fade-out ending at `end`, default 0 |
| `hidden` | Boolean, default false |
| `tracks` | Array of keyframe tracks |

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

Allowed numeric properties: `x`, `y`, `width`, `height`, `rotation`, `scale`, `opacity`, `fontSize`, `strokeWidth`, `radius`, `progress`. Colour properties: `fill`, `stroke` (hex or palette tokens; `none` cannot be interpolated). Colours interpolate RGBA channels, not perceptual colour space.

Use 2–100 keys per track, strictly increasing, within the scene duration. Each property gets one track; maximum 20 tracks per layer. Values before/after the track hold at the first/last key. `loop:true` wraps after the last key over that track's time range. Matching first/last values produce a smooth loop. Supported easings: `linear`, `easeIn`, `easeOut`, `easeInOut` (default), `backOut`, `step`. Easing on a destination key controls the segment leading into it. `backOut` deliberately overshoots; avoid it on properties whose visual range should remain bounded.

Numeric tracks are absolute values, not offsets. Each frame recomputes from project data and timestamp. There is no random seed, accumulated simulation, asynchronous effect, CSS animation or audio clock. This allows repeatable scrubbing and frame export. Different system fonts or browser renderers can still produce different pixels across machines.

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

`...` above is documentation shorthand, not valid image data. The editor and asset embedder create real data URIs. Project assets support PNG/JPEG/WebP only, up to 100 assets, 14 million encoded characters per image and 40 million encoded characters combined. The uploader has a 10 MB input limit, 8192 px per dimension and 32 megapixel decode limit. Imported JSON checks format/size, but an image with corrupt bytes can still fail to decode; preview before delivery. Total JSON import limit is 45 MB.

The SVG uploader is an allowlist for simple vector marks: shapes, paths, groups, gradients and clip paths. It rejects scripts, styles, external references, text, filters, embedded images and unsupported tags/attributes, then rasterises at up to 2048 px. Preserve an original high-resolution raster or vector source separately if needed. Do not include SVG strings directly in a project image asset.

`credit` and `source` are stored as metadata, never fetched or executed. They are not automatically visible; add explicit credit text layers. External image URLs and filesystem paths are not renderable project assets. Use `scripts/embed-assets.cjs` to embed files before distributing a project.

## Engine and browser APIs

```js
const M = require('./src/engine.js'); // CommonJS, no dependencies
M.assertValid(project);
const svg = M.renderSVG(project, 'intro', 2.5);
```

In a browser, the same API is `window.MotionForge`. `validate(project)` returns error strings; `assertValid(project)` throws if invalid. Validate untrusted data before calling `renderSVG`; the low-level renderer assumes a validated project. `sample(layer,time,scene,theme)` and `trackValue(track,time,theme)` expose deterministic interpolation for integrations.

The editor exposes `MotionForgeApp.getProject()`, `setProject(project)` (validates), `renderFrame(sceneId,seconds)`, `select(layerId)`, `getTime()` and `importImage(file)`. `setProject` is an automation API: it does not add an undo snapshot or write autosave. Save/export explicitly after an automated change. `window.ready` indicates startup completion. `?export=1&scene=intro&t=2.5` opens the clean render view; the selected ID must exist in the loaded project. Press Escape to leave clean preview during interactive use.
