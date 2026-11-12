# Complete example and prompt cookbook

Open [the live catalog](http://127.0.0.1:4173/?demo=catalog) after running
`npm start`, or import [catalog.motion.json](../examples/catalog.motion.json)
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

- All 14 layer types: text, rect, circle, icon, image, line, path, counter, chart, group, symbol, scene3d, effect, video.
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
| Elements | [Text](#demo-01) | `demo-01` |
| Elements | [Rectangle](#demo-02) | `demo-02` |
| Elements | [Circle](#demo-03) | `demo-03` |
| Elements | [Material icon](#demo-04) | `demo-04` |
| Elements | [Lucide symbol](#demo-05) | `demo-05` |
| Elements | [Image](#demo-06) | `demo-06` |
| Elements | [Connector](#demo-07) | `demo-07` |
| Elements | [SVG path](#demo-08) | `demo-08` |
| Elements | [Counter](#demo-09) | `demo-09` |
| Elements | [Chart](#demo-10) | `demo-10` |
| Elements | [Group](#demo-11) | `demo-11` |
| Elements | [Video overlay](#demo-12) | `demo-12` |
| 3D geometry | [3D box](#demo-13) | `demo-13` |
| 3D geometry | [3D sphere](#demo-14) | `demo-14` |
| 3D geometry | [3D torus](#demo-15) | `demo-15` |
| 3D geometry | [3D knot](#demo-16) | `demo-16` |
| 3D geometry | [3D cone](#demo-17) | `demo-17` |
| 3D geometry | [3D cylinder](#demo-18) | `demo-18` |
| 3D geometry | [3D plane](#demo-19) | `demo-19` |
| Materials and physics-style effects | [Glass & mirror](#demo-20) | `demo-20` |
| Materials and physics-style effects | [Liquid metal](#demo-21) | `demo-21` |
| Materials and physics-style effects | [Water surface](#demo-22) | `demo-22` |
| Materials and physics-style effects | [Atmospheric gas](#demo-23) | `demo-23` |
| Materials and physics-style effects | [Animated shadows](#demo-24) | `demo-24` |
| Elements | [Effect layer](#demo-25) | `demo-25` |
| Backgrounds | [solid background](#demo-26) | `demo-26` |
| Backgrounds | [linear background](#demo-27) | `demo-27` |
| Backgrounds | [radial background](#demo-28) | `demo-28` |
| Backgrounds | [transparent background](#demo-29) | `demo-29` |
| Technical scene compositions | [Compute pipeline](#template-pipeline) | `template-pipeline` |
| Technical scene compositions | [Layered architecture](#template-architecture) | `template-architecture` |
| Technical scene compositions | [Data and comparison](#template-data) | `template-data` |
| Technical scene compositions | [Signal processing](#template-signal) | `template-signal` |
| Technical scene compositions | [Technical timeline](#template-timeline) | `template-timeline` |
| Technical scene compositions | [Image and evidence card](#template-evidence) | `template-evidence` |

<a id="demo-01"></a>

## Text

**Category:** Elements. **Scene:** `demo-01`. **Duration:** 8s.

Text uses explicit line breaks; width does not wrap it.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create a two-line headline 'Ideas in motion\nEditable typography' at x250/y300, width1100, fontSize70, lineHeight1.3. Reveal with rise over .8s, keep text editable, hold until 8s. Do not rely on automatic wrapping.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-01",
  "name": "Text",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "x": 250,
      "y": 300,
      "width": 1100,
      "height": 280,
      "fill": "$text",
      "enter": "rise",
      "id": "subject",
      "type": "text",
      "text": "Ideas in motion\nEditable typography",
      "fontSize": 70,
      "lineHeight": 1.3,
      "enterDuration": 0.8
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Text",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Text uses explicit line breaks; width does not wrap it.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-02"></a>

## Rectangle

**Category:** Elements. **Scene:** `demo-02`. **Duration:** 8s.

Width keyframes + rounded corners + drop shadow.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Build a rounded accent card at x500/y300, height280, radius40. Animate width200 to600 from0 to3s, then hold. Add shadowBlur32/shadowY18 and a .6s scale entrance. Preserve editable shape geometry.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-02",
  "name": "Rectangle",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "x": 500,
      "y": 300,
      "width": 600,
      "height": 280,
      "fill": "$accent",
      "enter": "scale",
      "id": "subject",
      "type": "rect",
      "radius": 40,
      "shadowBlur": 32,
      "shadowY": 18,
      "tracks": [
        {
          "property": "width",
          "keyframes": [
            {
              "time": 0,
              "value": 200
            },
            {
              "time": 3,
              "value": 600,
              "easing": "easeInOut"
            },
            {
              "time": 8,
              "value": 600
            }
          ]
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Rectangle",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Width keyframes + rounded corners + drop shadow.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-03"></a>

## Circle

**Category:** Elements. **Scene:** `demo-03`. **Duration:** 8s.

Equal width and height creates a circle; colours interpolate.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Place an editable 320x320 circle at640/300. Animate fill from $accent at0s to $secondary at3s and hold. Use equal width/height; add a scale entrance, not a rasterized image.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-03",
  "name": "Circle",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "x": 640,
      "y": 300,
      "width": 320,
      "height": 320,
      "fill": "$accent",
      "enter": "scale",
      "id": "subject",
      "type": "circle",
      "tracks": [
        {
          "property": "fill",
          "keyframes": [
            {
              "time": 0,
              "value": "$accent"
            },
            {
              "time": 3,
              "value": "$secondary",
              "easing": "easeInOut"
            },
            {
              "time": 8,
              "value": "$secondary"
            }
          ]
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Circle",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Equal width and height creates a circle; colours interpolate.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-04"></a>

## Material icon

**Category:** Elements. **Scene:** `demo-04`. **Duration:** 8s.

131 Material icons / Apache-2.0.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use the bundled Material memory icon at650/300,300x300, accent fill. Rotate -20 to20 degrees over3s; hold. Choose an actual catalog ID, never a remote image.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-04",
  "name": "Material icon",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "x": 650,
      "y": 300,
      "width": 300,
      "height": 300,
      "fill": "$accent",
      "enter": "scale",
      "id": "subject",
      "type": "icon",
      "icon": "memory",
      "tracks": [
        {
          "property": "rotation",
          "keyframes": [
            {
              "time": 0,
              "value": -20
            },
            {
              "time": 3,
              "value": 20,
              "easing": "easeInOut"
            },
            {
              "time": 8,
              "value": 20
            }
          ]
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Material icon",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "131 Material icons / Apache-2.0.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-05"></a>

## Lucide symbol

**Category:** Elements. **Scene:** `demo-05`. **Duration:** 8s.

1,544 Lucide elements / ISC / editable stroke glyphs.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Add Lucide symbol rocket at650/430,300x300. Move y430 to250 over3s with easeOut. Use $secondary as stroke colour through fill; keep vector output.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-05",
  "name": "Lucide symbol",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "x": 650,
      "y": 300,
      "width": 300,
      "height": 300,
      "fill": "$secondary",
      "enter": "scale",
      "id": "subject",
      "type": "symbol",
      "symbol": "rocket",
      "tracks": [
        {
          "property": "y",
          "keyframes": [
            {
              "time": 0,
              "value": 430
            },
            {
              "time": 3,
              "value": 250,
              "easing": "easeOut"
            },
            {
              "time": 8,
              "value": 250
            }
          ]
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Lucide symbol",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "1,544 Lucide elements / ISC / editable stroke glyphs.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-06"></a>

## Image

**Category:** Elements. **Scene:** `demo-06`. **Duration:** 8s.

Supplied original logo embedded as PNG; contain preserves aspect.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use existing logo asset ID logo in an image layer at500/300,600x280, fit contain,radius0. Reveal via scale without stretching or replacing the logo. Preserve its media marker.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-06",
  "name": "Image",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "x": 500,
      "y": 300,
      "width": 600,
      "height": 280,
      "fill": "$accent",
      "enter": "scale",
      "id": "subject",
      "type": "image",
      "asset": "logo",
      "fit": "contain",
      "radius": 0
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Image",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Supplied original logo embedded as PNG; contain preserves aspect.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-07"></a>

## Connector

**Category:** Elements. **Scene:** `demo-07`. **Duration:** 8s.

Root connectors follow animated node anchors.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create two rounded nodes: left250/350/260x180, right1090/350/260x180. Put a root Bezier connector behind them using from:left,to:right, right/left anchors, arrow:true, four travelling particles, strokeWidth6. Draw it over2s while left y moves350 to280 over3s. Verify the endpoints follow nodes.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-07",
  "name": "Connector",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "wire",
      "type": "line",
      "from": "left",
      "to": "right",
      "curve": "bezier",
      "fromAnchor": "right",
      "toAnchor": "left",
      "arrow": true,
      "particles": 4,
      "stroke": "$secondary",
      "fill": "$text",
      "strokeWidth": 6,
      "enter": "draw",
      "enterDuration": 2
    },
    {
      "id": "left",
      "type": "rect",
      "x": 250,
      "y": 350,
      "width": 260,
      "height": 180,
      "radius": 25,
      "fill": "$accent",
      "tracks": [
        {
          "property": "y",
          "keyframes": [
            {
              "time": 0,
              "value": 350
            },
            {
              "time": 3,
              "value": 280,
              "easing": "easeInOut"
            },
            {
              "time": 8,
              "value": 280
            }
          ]
        }
      ]
    },
    {
      "id": "right",
      "type": "rect",
      "x": 1090,
      "y": 350,
      "width": 260,
      "height": 180,
      "radius": 25,
      "fill": "$secondary"
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Connector",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Root connectors follow animated node anchors.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-08"></a>

## SVG path

**Category:** Elements. **Scene:** `demo-08`. **Duration:** 8s.

Path drawing reveals stroke; declared box does not rewrite path.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Draw an original wave path M0 120 C160 -100 320 340 500 120 S820 -100 1000 120 at300/360. Set fill none,secondary stroke,width10,enter draw,duration3s. Use SVG commands only, no markup or scripts.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-08",
  "name": "SVG path",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "subject",
      "type": "path",
      "x": 300,
      "y": 360,
      "width": 1000,
      "height": 260,
      "d": "M 0 120 C 160 -100 320 340 500 120 S 820 -100 1000 120",
      "fill": "none",
      "stroke": "$secondary",
      "strokeWidth": 10,
      "enter": "draw",
      "enterDuration": 3
    },
    {
      "id": "heading",
      "type": "text",
      "text": "SVG path",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Path drawing reveals stroke; declared box does not rewrite path.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-09"></a>

## Counter

**Category:** Elements. **Scene:** `demo-09`. **Duration:** 8s.

Illustrative values only / progress drives the number.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create an illustrative counter from0 to100 with suffix %,fontSize150, at500/300. Drive its progress over3s then hold. Label the values illustrative; do not imply a measured metric.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-09",
  "name": "Counter",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "x": 500,
      "y": 300,
      "width": 600,
      "height": 280,
      "fill": "$accent",
      "enter": "scale",
      "id": "subject",
      "type": "counter",
      "valueFrom": 0,
      "valueTo": 100,
      "suffix": "%",
      "decimals": 0,
      "fontSize": 150,
      "enterDuration": 3
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Counter",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Illustrative values only / progress drives the number.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-10"></a>

## Chart

**Category:** Elements. **Scene:** `demo-10`. **Duration:** 8s.

Synthetic values / fixed 0-100 maximum.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Build an illustrative bar chart at350/240,900x450,values25/45/70/90,labelsA/B/C/D,maxValue100. Alternate accent/secondary. Grow bars over3s and hold; label synthetic data explicitly. Keep scale honest and fixed.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-10",
  "name": "Chart",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "x": 350,
      "y": 240,
      "width": 900,
      "height": 450,
      "fill": "$accent",
      "enter": "scale",
      "id": "subject",
      "type": "chart",
      "values": [
        25,
        45,
        70,
        90
      ],
      "labels": [
        "A",
        "B",
        "C",
        "D"
      ],
      "colors": [
        "$accent",
        "$secondary"
      ],
      "maxValue": 100,
      "fontSize": 28,
      "enterDuration": 3
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Chart",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Synthetic values / fixed 0-100 maximum.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-11"></a>

## Group

**Category:** Elements. **Scene:** `demo-11`. **Duration:** 8s.

Children share the parent transform and stacking context.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Compose a500x300 group at550/280 with a rounded surface card and Lucide layers symbol at local175/70. Rotate the parent -12 to12 degrees over3s. Children use local coordinates. Do not parent connectors/video/effect/scene3d.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-11",
  "name": "Group",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "assembly",
      "type": "group",
      "x": 550,
      "y": 280,
      "width": 500,
      "height": 300,
      "enter": "none",
      "tracks": [
        {
          "property": "rotation",
          "keyframes": [
            {
              "time": 0,
              "value": -12
            },
            {
              "time": 3,
              "value": 12,
              "easing": "easeInOut"
            },
            {
              "time": 8,
              "value": 12
            }
          ]
        }
      ]
    },
    {
      "id": "card",
      "type": "rect",
      "parentId": "assembly",
      "x": 0,
      "y": 0,
      "width": 500,
      "height": 300,
      "radius": 28,
      "fill": "$surface",
      "stroke": "$accent",
      "strokeWidth": 4
    },
    {
      "id": "glyph",
      "type": "symbol",
      "symbol": "layers",
      "parentId": "assembly",
      "x": 175,
      "y": 70,
      "width": 150,
      "height": 150,
      "fill": "$secondary"
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Group",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Children share the parent transform and stacking context.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-12"></a>

## Video overlay

**Category:** Elements. **Scene:** `demo-12`. **Duration:** 8s.

Original synthetic footage / muted / video behind editable graphics.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use existing footage video asset as a full1600x900 cover layer, loop:true,trim0,rate1,enter none. Overlay a translucent dark panel80/280/900x260 and editable two-line title120/320/820x180,font64. Keep video first in layer order and title above. Preserve marker; do not invent video bytes. Audio is not mixed.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-12",
  "name": "Video overlay",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "footage",
      "type": "video",
      "asset": "footage",
      "x": 0,
      "y": 0,
      "width": 1600,
      "height": 900,
      "fit": "cover",
      "trim": 0,
      "loop": true,
      "playbackRate": 1,
      "enter": "none"
    },
    {
      "id": "panel",
      "type": "rect",
      "x": 80,
      "y": 280,
      "width": 900,
      "height": 260,
      "radius": 24,
      "fill": "#101828dd",
      "shadowBlur": 24
    },
    {
      "id": "copy",
      "type": "text",
      "text": "Your footage.\nYour motion graphics.",
      "x": 120,
      "y": 320,
      "width": 820,
      "height": 180,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Video overlay",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Original synthetic footage / muted / video behind editable graphics.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-13"></a>

## 3D box

**Category:** 3D geometry. **Scene:** `demo-13`. **Duration:** 8s.

World-space model / physical light / object motion.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create a scene3d viewport250/160/1100x600 with one box object at world origin,standard material,$accent,roughness.25. Set cameraDistance4.5,azimuth20,elevation20. Use object speed.35 radians/sec around Y. Keep labels as separate SVG overlays. Render PNG/video, not SVG.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-13",
  "name": "3D box",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "subject",
      "type": "scene3d",
      "x": 250,
      "y": 160,
      "width": 1100,
      "height": 600,
      "cameraDistance": 4.5,
      "cameraAzimuth": 20,
      "cameraElevation": 20,
      "objects": [
        {
          "id": "model",
          "geometry": "box",
          "material": "standard",
          "color": "$accent",
          "roughness": 0.25,
          "speed": 0.35,
          "tracks": []
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "3D box",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "World-space model / physical light / object motion.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-14"></a>

## 3D sphere

**Category:** 3D geometry. **Scene:** `demo-14`. **Duration:** 8s.

World-space model / physical light / object motion.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create a scene3d viewport250/160/1100x600 with one sphere object at world origin,standard material,$accent,roughness.25. Set cameraDistance4.5,azimuth20,elevation20. Use object speed.35 radians/sec around Y. Keep labels as separate SVG overlays. Render PNG/video, not SVG.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-14",
  "name": "3D sphere",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "subject",
      "type": "scene3d",
      "x": 250,
      "y": 160,
      "width": 1100,
      "height": 600,
      "cameraDistance": 4.5,
      "cameraAzimuth": 20,
      "cameraElevation": 20,
      "objects": [
        {
          "id": "model",
          "geometry": "sphere",
          "material": "standard",
          "color": "$accent",
          "roughness": 0.25,
          "speed": 0.35,
          "tracks": []
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "3D sphere",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "World-space model / physical light / object motion.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-15"></a>

## 3D torus

**Category:** 3D geometry. **Scene:** `demo-15`. **Duration:** 8s.

World-space model / physical light / object motion.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create a scene3d viewport250/160/1100x600 with one torus object at world origin,standard material,$accent,roughness.25. Set cameraDistance4.5,azimuth20,elevation20. Use object speed.35 radians/sec around Y. Keep labels as separate SVG overlays. Render PNG/video, not SVG.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-15",
  "name": "3D torus",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "subject",
      "type": "scene3d",
      "x": 250,
      "y": 160,
      "width": 1100,
      "height": 600,
      "cameraDistance": 4.5,
      "cameraAzimuth": 20,
      "cameraElevation": 20,
      "objects": [
        {
          "id": "model",
          "geometry": "torus",
          "material": "standard",
          "color": "$accent",
          "roughness": 0.25,
          "speed": 0.35,
          "tracks": []
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "3D torus",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "World-space model / physical light / object motion.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-16"></a>

## 3D knot

**Category:** 3D geometry. **Scene:** `demo-16`. **Duration:** 8s.

World-space model / physical light / object motion.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create a scene3d viewport250/160/1100x600 with one knot object at world origin,standard material,$accent,roughness.25. Set cameraDistance4.5,azimuth20,elevation20. Use object speed.35 radians/sec around Y. Keep labels as separate SVG overlays. Render PNG/video, not SVG.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-16",
  "name": "3D knot",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "subject",
      "type": "scene3d",
      "x": 250,
      "y": 160,
      "width": 1100,
      "height": 600,
      "cameraDistance": 4.5,
      "cameraAzimuth": 20,
      "cameraElevation": 20,
      "objects": [
        {
          "id": "model",
          "geometry": "knot",
          "material": "standard",
          "color": "$accent",
          "roughness": 0.25,
          "speed": 0.35,
          "tracks": []
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "3D knot",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "World-space model / physical light / object motion.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-17"></a>

## 3D cone

**Category:** 3D geometry. **Scene:** `demo-17`. **Duration:** 8s.

World-space model / physical light / object motion.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create a scene3d viewport250/160/1100x600 with one cone object at world origin,standard material,$accent,roughness.25. Set cameraDistance4.5,azimuth20,elevation20. Use object speed.35 radians/sec around Y. Keep labels as separate SVG overlays. Render PNG/video, not SVG.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-17",
  "name": "3D cone",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "subject",
      "type": "scene3d",
      "x": 250,
      "y": 160,
      "width": 1100,
      "height": 600,
      "cameraDistance": 4.5,
      "cameraAzimuth": 20,
      "cameraElevation": 20,
      "objects": [
        {
          "id": "model",
          "geometry": "cone",
          "material": "standard",
          "color": "$accent",
          "roughness": 0.25,
          "speed": 0.35,
          "tracks": []
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "3D cone",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "World-space model / physical light / object motion.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-18"></a>

## 3D cylinder

**Category:** 3D geometry. **Scene:** `demo-18`. **Duration:** 8s.

World-space model / physical light / object motion.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create a scene3d viewport250/160/1100x600 with one cylinder object at world origin,standard material,$accent,roughness.25. Set cameraDistance4.5,azimuth20,elevation20. Use object speed.35 radians/sec around Y. Keep labels as separate SVG overlays. Render PNG/video, not SVG.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-18",
  "name": "3D cylinder",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "subject",
      "type": "scene3d",
      "x": 250,
      "y": 160,
      "width": 1100,
      "height": 600,
      "cameraDistance": 4.5,
      "cameraAzimuth": 20,
      "cameraElevation": 20,
      "objects": [
        {
          "id": "model",
          "geometry": "cylinder",
          "material": "standard",
          "color": "$accent",
          "roughness": 0.25,
          "speed": 0.35,
          "tracks": []
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "3D cylinder",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "World-space model / physical light / object motion.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-19"></a>

## 3D plane

**Category:** 3D geometry. **Scene:** `demo-19`. **Duration:** 8s.

World-space model / physical light / object motion.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create a scene3d viewport250/160/1100x600 with one plane object at world origin,standard material,$accent,roughness.25. Set cameraDistance4.5,azimuth20,elevation20. Animate object rotationY -30 to30 degrees over3s. Keep labels as separate SVG overlays. Render PNG/video, not SVG.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-19",
  "name": "3D plane",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "subject",
      "type": "scene3d",
      "x": 250,
      "y": 160,
      "width": 1100,
      "height": 600,
      "cameraDistance": 4.5,
      "cameraAzimuth": 20,
      "cameraElevation": 20,
      "objects": [
        {
          "id": "model",
          "geometry": "plane",
          "material": "standard",
          "color": "$accent",
          "roughness": 0.25,
          "speed": 0,
          "tracks": [
            {
              "property": "rotationY",
              "keyframes": [
                {
                  "time": 0,
                  "value": -30
                },
                {
                  "time": 3,
                  "value": 30,
                  "easing": "easeInOut"
                },
                {
                  "time": 8,
                  "value": 30
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "3D plane",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "World-space model / physical light / object motion.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-20"></a>

## Glass & mirror

**Category:** Materials and physics-style effects. **Scene:** `demo-20`. **Duration:** 8s.

One planar reflection / physical transmission / no recursive ray tracing.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Compose a glass knot at world x-.85 and liquidMetal sphere at1.2/-.4. Use glass transmission.95,IOR1.5,roughness.06. Enable mirror:true for one planar reflection. Set cameraDistance6,azimuth20,elevation18,lightIntensity4. Rotate objects slowly and keep readable SVG labels above. Glass refracts other 3D objects, not background video.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-20",
  "name": "Glass & mirror",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "stage3d",
      "type": "scene3d",
      "name": "Editable 3D stage",
      "x": 80,
      "y": 135,
      "width": 1440,
      "height": 720,
      "enter": "fade",
      "enterDuration": 0.8,
      "cameraDistance": 6,
      "cameraAzimuth": 20,
      "cameraElevation": 18,
      "lightIntensity": 4,
      "objects": [
        {
          "id": "glass",
          "geometry": "knot",
          "material": "glass",
          "color": "$secondary",
          "x": -0.85,
          "scaleX": 0.8,
          "scaleY": 0.8,
          "scaleZ": 0.8,
          "roughness": 0.06,
          "transmission": 0.95,
          "ior": 1.5,
          "speed": 0.3
        },
        {
          "id": "metal",
          "geometry": "sphere",
          "material": "liquidMetal",
          "color": "$accent",
          "x": 1.2,
          "y": -0.4,
          "scaleX": 0.65,
          "scaleY": 0.65,
          "scaleZ": 0.65,
          "amplitude": 0.12,
          "speed": 0.5
        }
      ],
      "mirror": true
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Glass & mirror",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "One planar reflection / physical transmission / no recursive ray tracing.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-21"></a>

## Liquid metal

**Category:** Materials and physics-style effects. **Scene:** `demo-21`. **Duration:** 8s.

Stylized deterministic visual effect, not a physics simulation.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Animate a sphere with liquidMetal material,$accent,amplitude.25,frequency3,speed.6. Add rotationY keys0deg at0s and360deg at8s,linear,loop:true. Use cameraDistance6. Verify deterministic deformation on backward seeking. This is a stylized shader, not fluid dynamics.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-21",
  "name": "Liquid metal",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "stage3d",
      "type": "scene3d",
      "name": "Editable 3D stage",
      "x": 80,
      "y": 135,
      "width": 1440,
      "height": 720,
      "enter": "fade",
      "enterDuration": 0.8,
      "cameraDistance": 6,
      "cameraAzimuth": 20,
      "cameraElevation": 18,
      "lightIntensity": 4,
      "objects": [
        {
          "id": "metal",
          "geometry": "sphere",
          "material": "liquidMetal",
          "color": "$accent",
          "amplitude": 0.25,
          "frequency": 3,
          "speed": 0.6,
          "tracks": [
            {
              "property": "rotationY",
              "loop": true,
              "keyframes": [
                {
                  "time": 0,
                  "value": 0
                },
                {
                  "time": 8,
                  "value": 360,
                  "easing": "linear"
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Liquid metal",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Stylized deterministic visual effect, not a physics simulation.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-22"></a>

## Water surface

**Category:** Materials and physics-style effects. **Scene:** `demo-22`. **Duration:** 8s.

Stylized deterministic visual effect, not a physics simulation.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Build a plane with water material,$secondary,scaleX/Y2.4,rotationX-90,amplitude.2,frequency6. Hide ground. Use cameraDistance6,azimuth0,elevation40. Show absolute-time wave deformation and reflected environment highlights. This is a stylized surface, not a fluid simulation.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-22",
  "name": "Water surface",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "stage3d",
      "type": "scene3d",
      "name": "Editable 3D stage",
      "x": 80,
      "y": 135,
      "width": 1440,
      "height": 720,
      "enter": "fade",
      "enterDuration": 0.8,
      "cameraDistance": 6,
      "cameraAzimuth": 0,
      "cameraElevation": 40,
      "lightIntensity": 4,
      "objects": [
        {
          "id": "water",
          "geometry": "plane",
          "material": "water",
          "color": "$secondary",
          "scaleX": 2.4,
          "scaleY": 2.4,
          "rotationX": -90,
          "amplitude": 0.2,
          "frequency": 6
        }
      ],
      "ground": false
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Water surface",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Stylized deterministic visual effect, not a physics simulation.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-23"></a>

## Atmospheric gas

**Category:** Materials and physics-style effects. **Scene:** `demo-23`. **Duration:** 8s.

Stylized deterministic visual effect, not a physics simulation.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use a sphere volume proxy with gas material,$secondary,scaleX2.4,scaleY2,amplitude.3,seed42. Hide ground and use cameraDistance6,azimuth0,elevation0. Show translucent deterministic noise; keep the silhouette soft and typography readable. Do not claim volumetric fluid simulation.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-23",
  "name": "Atmospheric gas",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "stage3d",
      "type": "scene3d",
      "name": "Editable 3D stage",
      "x": 80,
      "y": 135,
      "width": 1440,
      "height": 720,
      "enter": "fade",
      "enterDuration": 0.8,
      "cameraDistance": 6,
      "cameraAzimuth": 0,
      "cameraElevation": 0,
      "lightIntensity": 4,
      "objects": [
        {
          "id": "gas",
          "geometry": "sphere",
          "material": "gas",
          "color": "$secondary",
          "scaleX": 2.4,
          "scaleY": 2,
          "amplitude": 0.3,
          "seed": 42
        }
      ],
      "ground": false
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Atmospheric gas",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Stylized deterministic visual effect, not a physics simulation.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-24"></a>

## Animated shadows

**Category:** Materials and physics-style effects. **Scene:** `demo-24`. **Duration:** 8s.

Stylized deterministic visual effect, not a physics simulation.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Combine a standard torus with editable SVG title. Animate title shadowX -24 at0s to24 at4s back to-24 at8s and shadowBlur8 to40 to8,loop:true. Use shadowY6,colour#00000080. Keep the 3D ground visible to demonstrate cast/received shadows too.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-24",
  "name": "Animated shadows",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "stage3d",
      "type": "scene3d",
      "name": "Editable 3D stage",
      "x": 80,
      "y": 135,
      "width": 1440,
      "height": 720,
      "enter": "fade",
      "enterDuration": 0.8,
      "cameraDistance": 6,
      "cameraAzimuth": 20,
      "cameraElevation": 18,
      "lightIntensity": 4,
      "objects": [
        {
          "id": "sculpture",
          "geometry": "torus",
          "material": "standard",
          "color": "$accent",
          "roughness": 0.2,
          "speed": 0.3
        }
      ]
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Animated shadows",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Stylized deterministic visual effect, not a physics simulation.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-25"></a>

## Effect layer

**Category:** Elements. **Scene:** `demo-25`. **Duration:** 8s.

Standalone presets: gas / water / liquidMetal / glass.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create four root effect layers across the canvas: gas,water,liquidMetal,glass. Give each a350x400 viewport at x80/450/820/1190,y260. Set intensity.3,speed.6,seed42,alternate palette colours. These are isolated effect viewports; use scene3d instead when objects need shared lighting/depth/refraction.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-25",
  "name": "Effect layer",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface"
  },
  "layers": [
    {
      "id": "effect-0",
      "type": "effect",
      "effect": "gas",
      "x": 80,
      "y": 260,
      "width": 350,
      "height": 400,
      "fill": "$accent",
      "intensity": 0.3,
      "speed": 0.6,
      "seed": 42
    },
    {
      "id": "effect-1",
      "type": "effect",
      "effect": "water",
      "x": 450,
      "y": 260,
      "width": 350,
      "height": 400,
      "fill": "$secondary",
      "intensity": 0.3,
      "speed": 0.6,
      "seed": 42
    },
    {
      "id": "effect-2",
      "type": "effect",
      "effect": "liquidMetal",
      "x": 820,
      "y": 260,
      "width": 350,
      "height": 400,
      "fill": "$accent",
      "intensity": 0.3,
      "speed": 0.6,
      "seed": 42
    },
    {
      "id": "effect-3",
      "type": "effect",
      "effect": "glass",
      "x": 1190,
      "y": 260,
      "width": 350,
      "height": 400,
      "fill": "$secondary",
      "intensity": 0.3,
      "speed": 0.6,
      "seed": 42
    },
    {
      "id": "heading",
      "type": "text",
      "text": "Effect layer",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Standalone presets: gas / water / liquidMetal / glass.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-26"></a>

## solid background

**Category:** Backgrounds. **Scene:** `demo-26`. **Duration:** 8s.

Editable scene background and independent grid.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create an8s scene with background type solid,color $background,color2 $surface,angle35. Add a centered editable Lucide palette symbol. Add a subtle grid,size80,opacity.08; preserve readable text contrast.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-26",
  "name": "solid background",
  "duration": 8,
  "background": {
    "type": "solid",
    "color": "$background",
    "color2": "$surface",
    "angle": 35,
    "grid": true,
    "gridSize": 80,
    "gridOpacity": 0.08
  },
  "layers": [
    {
      "x": 650,
      "y": 300,
      "width": 300,
      "height": 300,
      "fill": "$text",
      "enter": "scale",
      "id": "subject",
      "type": "symbol",
      "symbol": "palette"
    },
    {
      "id": "heading",
      "type": "text",
      "text": "solid background",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Editable scene background and independent grid.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-27"></a>

## linear background

**Category:** Backgrounds. **Scene:** `demo-27`. **Duration:** 8s.

Editable scene background and independent grid.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create an8s scene with background type linear,color $background,color2 $surface,angle35. Add a centered editable Lucide palette symbol. Add a subtle grid,size80,opacity.08; preserve readable text contrast.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-27",
  "name": "linear background",
  "duration": 8,
  "background": {
    "type": "linear",
    "color": "$background",
    "color2": "$surface",
    "angle": 35,
    "grid": true,
    "gridSize": 80,
    "gridOpacity": 0.08
  },
  "layers": [
    {
      "x": 650,
      "y": 300,
      "width": 300,
      "height": 300,
      "fill": "$text",
      "enter": "scale",
      "id": "subject",
      "type": "symbol",
      "symbol": "palette"
    },
    {
      "id": "heading",
      "type": "text",
      "text": "linear background",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Editable scene background and independent grid.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-28"></a>

## radial background

**Category:** Backgrounds. **Scene:** `demo-28`. **Duration:** 8s.

Editable scene background and independent grid.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create an8s scene with background type radial,color $background,color2 $surface,angle35. Add a centered editable Lucide palette symbol. Add a subtle grid,size80,opacity.08; preserve readable text contrast.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-28",
  "name": "radial background",
  "duration": 8,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface",
    "angle": 35,
    "grid": true,
    "gridSize": 80,
    "gridOpacity": 0.08
  },
  "layers": [
    {
      "x": 650,
      "y": 300,
      "width": 300,
      "height": 300,
      "fill": "$text",
      "enter": "scale",
      "id": "subject",
      "type": "symbol",
      "symbol": "palette"
    },
    {
      "id": "heading",
      "type": "text",
      "text": "radial background",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "Editable scene background and independent grid.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="demo-29"></a>

## transparent background

**Category:** Backgrounds. **Scene:** `demo-29`. **Duration:** 8s.

PNG preserves alpha; normal MP4/WebM does not.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Create an8s scene with background type transparent,no opaque background fill. Add a centered editable Lucide palette symbol. Export PNG and verify corner alpha0; video does not retain alpha.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "demo-29",
  "name": "transparent background",
  "duration": 8,
  "background": {
    "type": "transparent",
    "color": "$background",
    "color2": "$surface",
    "angle": 35,
    "grid": false,
    "gridSize": 80,
    "gridOpacity": 0.08
  },
  "layers": [
    {
      "x": 650,
      "y": 300,
      "width": 300,
      "height": 300,
      "fill": "$text",
      "enter": "scale",
      "id": "subject",
      "type": "symbol",
      "symbol": "palette"
    },
    {
      "id": "heading",
      "type": "text",
      "text": "transparent background",
      "x": 80,
      "y": 55,
      "width": 1440,
      "height": 90,
      "fontSize": 64,
      "fill": "$text",
      "enter": "rise"
    },
    {
      "id": "subtitle",
      "type": "text",
      "text": "PNG preserves alpha; normal MP4/WebM does not.",
      "x": 80,
      "y": 790,
      "width": 1440,
      "height": 55,
      "fontSize": 25,
      "fill": "$muted",
      "enter": "fade"
    }
  ]
}
```

<a id="template-pipeline"></a>

## Compute pipeline

**Category:** Technical scene compositions. **Scene:** `template-pipeline`. **Duration:** 10s.

Original editable technical template; inspect its layer structure and timing.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use the Compute pipeline scene in examples/catalog.motion.json as structural reference. Preserve its factual subject and label demonstration values illustrative. Rebuild the grouped cards, editable typography, actual bundled icons, root connectors/charts and staggered reveals. Establish the main subjects first, connections/data second, then hold the completed explanation for at least2s. Keep source labels visible; do not invent claims. Match the reference scene duration rather than forcing8s. Return a complete self-contained project.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "template-pipeline",
  "name": "Compute pipeline",
  "duration": 10,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface",
    "grid": true,
    "gridSize": 60,
    "gridOpacity": 0.07
  },
  "layers": [
    {
      "id": "eyebrow",
      "type": "text",
      "name": "eyebrow",
      "x": 100,
      "y": 65,
      "width": 1300,
      "height": 23.400000000000002,
      "enter": "fade",
      "enterDuration": 0.75,
      "text": "01 / SYSTEMS EXPLAINED",
      "fontSize": 18,
      "fill": "$accent",
      "fontFamily": "mono"
    },
    {
      "id": "title",
      "type": "text",
      "name": "title",
      "x": 96,
      "y": 112,
      "width": 1300,
      "height": 88.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "From input to intelligence.",
      "fontSize": 68,
      "fill": "$text",
      "fontWeight": 700,
      "start": 0.1
    },
    {
      "id": "subtitle",
      "type": "text",
      "name": "subtitle",
      "x": 100,
      "y": 207,
      "width": 1300,
      "height": 32.5,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "A reusable architecture scene. Every node, colour and connection is editable.",
      "fontSize": 25,
      "fill": "$muted",
      "start": 0.2
    },
    {
      "id": "edge-input",
      "type": "line",
      "name": "edge input",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "enter": "draw",
      "enterDuration": 1,
      "from": "input",
      "to": "compute",
      "fill": "$secondary",
      "stroke": "$line",
      "strokeWidth": 3,
      "arrow": true,
      "particles": 2,
      "curve": "bezier",
      "start": 1.3
    },
    {
      "id": "edge-compute",
      "type": "line",
      "name": "edge compute",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "enter": "draw",
      "enterDuration": 1,
      "from": "compute",
      "to": "output",
      "fill": "$secondary",
      "stroke": "$line",
      "strokeWidth": 3,
      "arrow": true,
      "particles": 2,
      "curve": "bezier",
      "start": 1.9
    },
    {
      "id": "input",
      "type": "group",
      "name": "input",
      "x": 100,
      "y": 345,
      "width": 360,
      "height": 240,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "none",
      "start": 0.4
    },
    {
      "id": "input-panel",
      "type": "rect",
      "name": "input panel",
      "x": 0,
      "y": 0,
      "width": 360,
      "height": 240,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "input",
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24
    },
    {
      "id": "input-icon",
      "type": "icon",
      "name": "input icon",
      "x": 28,
      "y": 28,
      "width": 48,
      "height": 48,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "input",
      "icon": "input",
      "fill": "$accent"
    },
    {
      "id": "input-title",
      "type": "text",
      "name": "input title",
      "x": 28,
      "y": 100,
      "width": 310,
      "height": 37.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "01  Collect",
      "fontSize": 29,
      "fill": "$text",
      "parentId": "input",
      "fontWeight": 700
    },
    {
      "id": "input-label",
      "type": "text",
      "name": "input label",
      "x": 28,
      "y": 155,
      "width": 310,
      "height": 24.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "Events · signals · files",
      "fontSize": 19,
      "fill": "$muted",
      "parentId": "input"
    },
    {
      "id": "compute",
      "type": "group",
      "name": "compute",
      "x": 620,
      "y": 345,
      "width": 360,
      "height": 240,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "none",
      "start": 0.7
    },
    {
      "id": "compute-panel",
      "type": "rect",
      "name": "compute panel",
      "x": 0,
      "y": 0,
      "width": 360,
      "height": 240,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "compute",
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24
    },
    {
      "id": "compute-icon",
      "type": "icon",
      "name": "compute icon",
      "x": 28,
      "y": 28,
      "width": 48,
      "height": 48,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "compute",
      "icon": "memory",
      "fill": "$accent"
    },
    {
      "id": "compute-title",
      "type": "text",
      "name": "compute title",
      "x": 28,
      "y": 100,
      "width": 310,
      "height": 37.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "02  Compute",
      "fontSize": 29,
      "fill": "$text",
      "parentId": "compute",
      "fontWeight": 700
    },
    {
      "id": "compute-label",
      "type": "text",
      "name": "compute label",
      "x": 28,
      "y": 155,
      "width": 310,
      "height": 24.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "Transform · evaluate · route",
      "fontSize": 19,
      "fill": "$muted",
      "parentId": "compute"
    },
    {
      "id": "output",
      "type": "group",
      "name": "output",
      "x": 1140,
      "y": 345,
      "width": 360,
      "height": 240,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "none",
      "start": 1
    },
    {
      "id": "output-panel",
      "type": "rect",
      "name": "output panel",
      "x": 0,
      "y": 0,
      "width": 360,
      "height": 240,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "output",
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24
    },
    {
      "id": "output-icon",
      "type": "icon",
      "name": "output icon",
      "x": 28,
      "y": 28,
      "width": 48,
      "height": 48,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "output",
      "icon": "device_hub",
      "fill": "$accent"
    },
    {
      "id": "output-title",
      "type": "text",
      "name": "output title",
      "x": 28,
      "y": 100,
      "width": 310,
      "height": 37.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "03  Deliver",
      "fontSize": 29,
      "fill": "$text",
      "parentId": "output",
      "fontWeight": 700
    },
    {
      "id": "output-label",
      "type": "text",
      "name": "output label",
      "x": 28,
      "y": 155,
      "width": 310,
      "height": 24.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "Models · applications · people",
      "fontSize": 19,
      "fill": "$muted",
      "parentId": "output"
    },
    {
      "id": "tag-bg",
      "type": "rect",
      "name": "tag bg",
      "x": 100,
      "y": 666,
      "width": 245,
      "height": 42,
      "enter": "rise",
      "enterDuration": 0.75,
      "fill": "$accent",
      "radius": 21,
      "start": 2.2
    },
    {
      "id": "tag",
      "type": "text",
      "name": "tag",
      "x": 122,
      "y": 675,
      "width": 220,
      "height": 22.1,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "LIVE DATA FLOW",
      "fontSize": 17,
      "fill": "$background",
      "fontWeight": 700,
      "start": 2.2
    },
    {
      "id": "footnote",
      "type": "text",
      "name": "footnote",
      "x": 100,
      "y": 795,
      "width": 1300,
      "height": 22.1,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "ILLUSTRATIVE SYSTEM  /  REPLACE WITH YOUR OWN FACTS",
      "fontSize": 17,
      "fill": "$muted",
      "fontFamily": "mono",
      "start": 0.3
    },
    {
      "id": "pulse",
      "type": "circle",
      "name": "pulse",
      "x": 1450,
      "y": 685,
      "width": 18,
      "height": 18,
      "enter": "rise",
      "enterDuration": 0.75,
      "fill": "$secondary",
      "start": 2.2,
      "tracks": [
        {
          "property": "opacity",
          "loop": true,
          "keyframes": [
            {
              "time": 2.2,
              "value": 0.35
            },
            {
              "time": 3,
              "value": 1
            },
            {
              "time": 3.8,
              "value": 0.35
            }
          ]
        }
      ]
    }
  ]
}
```

<a id="template-architecture"></a>

## Layered architecture

**Category:** Technical scene compositions. **Scene:** `template-architecture`. **Duration:** 10s.

Original editable technical template; inspect its layer structure and timing.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use the Layered architecture scene in examples/catalog.motion.json as structural reference. Preserve its factual subject and label demonstration values illustrative. Rebuild the grouped cards, editable typography, actual bundled icons, root connectors/charts and staggered reveals. Establish the main subjects first, connections/data second, then hold the completed explanation for at least2s. Keep source labels visible; do not invent claims. Match the reference scene duration rather than forcing8s. Return a complete self-contained project.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "template-architecture",
  "name": "Layered architecture",
  "duration": 10,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface",
    "grid": true,
    "gridSize": 60,
    "gridOpacity": 0.07
  },
  "layers": [
    {
      "id": "eyebrow",
      "type": "text",
      "name": "eyebrow",
      "x": 100,
      "y": 65,
      "width": 1300,
      "height": 23.400000000000002,
      "enter": "fade",
      "enterDuration": 0.75,
      "text": "02 / ARCHITECTURE",
      "fontSize": 18,
      "fill": "$accent",
      "fontFamily": "mono"
    },
    {
      "id": "title",
      "type": "text",
      "name": "title",
      "x": 96,
      "y": 112,
      "width": 1300,
      "height": 88.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "One system. Many layers.",
      "fontSize": 68,
      "fill": "$text",
      "fontWeight": 700,
      "start": 0.1
    },
    {
      "id": "subtitle",
      "type": "text",
      "name": "subtitle",
      "x": 100,
      "y": 207,
      "width": 1300,
      "height": 32.5,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Group related elements, connect modules, then choreograph the explanation.",
      "fontSize": 25,
      "fill": "$muted",
      "start": 0.2
    },
    {
      "id": "application",
      "type": "group",
      "name": "application",
      "x": 100,
      "y": 330,
      "width": 620,
      "height": 160,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "none",
      "start": 0.3
    },
    {
      "id": "application-panel",
      "type": "rect",
      "name": "application panel",
      "x": 0,
      "y": 0,
      "width": 620,
      "height": 160,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "application",
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24
    },
    {
      "id": "application-icon",
      "type": "icon",
      "name": "application icon",
      "x": 28,
      "y": 40,
      "width": 48,
      "height": 48,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "application",
      "icon": "devices",
      "fill": "$accent"
    },
    {
      "id": "application-title",
      "type": "text",
      "name": "application title",
      "x": 104,
      "y": 25,
      "width": 490,
      "height": 37.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "APPLICATION",
      "fontSize": 29,
      "fill": "$text",
      "parentId": "application",
      "fontWeight": 700
    },
    {
      "id": "application-label",
      "type": "text",
      "name": "application label",
      "x": 104,
      "y": 76,
      "width": 490,
      "height": 24.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "The user-facing experience",
      "fontSize": 19,
      "fill": "$muted",
      "parentId": "application"
    },
    {
      "id": "runtime",
      "type": "group",
      "name": "runtime",
      "x": 100,
      "y": 530,
      "width": 620,
      "height": 160,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "none",
      "start": 0.8
    },
    {
      "id": "runtime-panel",
      "type": "rect",
      "name": "runtime panel",
      "x": 0,
      "y": 0,
      "width": 620,
      "height": 160,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "runtime",
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24
    },
    {
      "id": "runtime-icon",
      "type": "icon",
      "name": "runtime icon",
      "x": 28,
      "y": 40,
      "width": 48,
      "height": 48,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "runtime",
      "icon": "settings",
      "fill": "$accent"
    },
    {
      "id": "runtime-title",
      "type": "text",
      "name": "runtime title",
      "x": 104,
      "y": 25,
      "width": 490,
      "height": 37.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "RUNTIME",
      "fontSize": 29,
      "fill": "$text",
      "parentId": "runtime",
      "fontWeight": 700
    },
    {
      "id": "runtime-label",
      "type": "text",
      "name": "runtime label",
      "x": 104,
      "y": 76,
      "width": 490,
      "height": 24.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "Scheduling · memory · state",
      "fontSize": 19,
      "fill": "$muted",
      "parentId": "runtime"
    },
    {
      "id": "hardware",
      "type": "group",
      "name": "hardware",
      "x": 100,
      "y": 730,
      "width": 620,
      "height": 130,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "none",
      "start": 1.3
    },
    {
      "id": "hardware-panel",
      "type": "rect",
      "name": "hardware panel",
      "x": 0,
      "y": 0,
      "width": 620,
      "height": 130,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "hardware",
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24
    },
    {
      "id": "hardware-icon",
      "type": "icon",
      "name": "hardware icon",
      "x": 28,
      "y": 40,
      "width": 48,
      "height": 48,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "hardware",
      "icon": "developer_board",
      "fill": "$accent"
    },
    {
      "id": "hardware-title",
      "type": "text",
      "name": "hardware title",
      "x": 104,
      "y": 25,
      "width": 490,
      "height": 37.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "HARDWARE",
      "fontSize": 29,
      "fill": "$text",
      "parentId": "hardware",
      "fontWeight": 700
    },
    {
      "id": "hardware-label",
      "type": "text",
      "name": "hardware label",
      "x": 104,
      "y": 76,
      "width": 490,
      "height": 24.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "Compute · network · storage",
      "fontSize": 19,
      "fill": "$muted",
      "parentId": "hardware"
    },
    {
      "id": "observability",
      "type": "group",
      "name": "observability",
      "x": 1050,
      "y": 390,
      "width": 430,
      "height": 340,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "none",
      "start": 1.8
    },
    {
      "id": "observability-panel",
      "type": "rect",
      "name": "observability panel",
      "x": 0,
      "y": 0,
      "width": 430,
      "height": 340,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "observability",
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24
    },
    {
      "id": "observability-icon",
      "type": "icon",
      "name": "observability icon",
      "x": 28,
      "y": 28,
      "width": 48,
      "height": 48,
      "enter": "none",
      "enterDuration": 0.75,
      "parentId": "observability",
      "icon": "analytics",
      "fill": "$accent"
    },
    {
      "id": "observability-title",
      "type": "text",
      "name": "observability title",
      "x": 28,
      "y": 100,
      "width": 380,
      "height": 37.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "OBSERVABILITY",
      "fontSize": 29,
      "fill": "$text",
      "parentId": "observability",
      "fontWeight": 700
    },
    {
      "id": "observability-label",
      "type": "text",
      "name": "observability label",
      "x": 28,
      "y": 155,
      "width": 380,
      "height": 24.7,
      "enter": "none",
      "enterDuration": 0.75,
      "text": "Metrics\nTraces\nLogs",
      "fontSize": 19,
      "fill": "$muted",
      "parentId": "observability"
    },
    {
      "id": "a-o",
      "type": "line",
      "name": "a o",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "enter": "draw",
      "enterDuration": 1,
      "from": "application",
      "to": "observability",
      "fill": "$secondary",
      "stroke": "$line",
      "strokeWidth": 3,
      "arrow": true,
      "particles": 2,
      "curve": "bezier",
      "start": 2
    },
    {
      "id": "r-o",
      "type": "line",
      "name": "r o",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "enter": "draw",
      "enterDuration": 1,
      "from": "runtime",
      "to": "observability",
      "fill": "$secondary",
      "stroke": "$line",
      "strokeWidth": 3,
      "arrow": true,
      "particles": 2,
      "curve": "bezier",
      "start": 2.3
    },
    {
      "id": "h-o",
      "type": "line",
      "name": "h o",
      "x": 0,
      "y": 0,
      "width": 0,
      "height": 0,
      "enter": "draw",
      "enterDuration": 1,
      "from": "hardware",
      "to": "observability",
      "fill": "$secondary",
      "stroke": "$line",
      "strokeWidth": 3,
      "arrow": true,
      "particles": 2,
      "curve": "bezier",
      "start": 2.6
    }
  ]
}
```

<a id="template-data"></a>

## Data and comparison

**Category:** Technical scene compositions. **Scene:** `template-data`. **Duration:** 10s.

Original editable technical template; inspect its layer structure and timing.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use the Data and comparison scene in examples/catalog.motion.json as structural reference. Preserve its factual subject and label demonstration values illustrative. Rebuild the grouped cards, editable typography, actual bundled icons, root connectors/charts and staggered reveals. Establish the main subjects first, connections/data second, then hold the completed explanation for at least2s. Keep source labels visible; do not invent claims. Match the reference scene duration rather than forcing8s. Return a complete self-contained project.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "template-data",
  "name": "Data and comparison",
  "duration": 10,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface",
    "grid": true,
    "gridSize": 60,
    "gridOpacity": 0.07
  },
  "layers": [
    {
      "id": "eyebrow",
      "type": "text",
      "name": "eyebrow",
      "x": 100,
      "y": 65,
      "width": 1300,
      "height": 23.400000000000002,
      "enter": "fade",
      "enterDuration": 0.75,
      "text": "03 / DATA STORY",
      "fontSize": 18,
      "fill": "$accent",
      "fontFamily": "mono"
    },
    {
      "id": "title",
      "type": "text",
      "name": "title",
      "x": 96,
      "y": 112,
      "width": 1300,
      "height": 88.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Make the difference visible.",
      "fontSize": 68,
      "fill": "$text",
      "fontWeight": 700,
      "start": 0.1
    },
    {
      "id": "subtitle",
      "type": "text",
      "name": "subtitle",
      "x": 100,
      "y": 207,
      "width": 1300,
      "height": 32.5,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Illustrative values only. Label your sources before publishing.",
      "fontSize": 25,
      "fill": "$muted",
      "start": 0.2
    },
    {
      "id": "chart-card",
      "type": "rect",
      "name": "chart card",
      "x": 100,
      "y": 315,
      "width": 900,
      "height": 450,
      "enter": "rise",
      "enterDuration": 0.75,
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24,
      "start": 0.2
    },
    {
      "id": "bar-chart",
      "type": "chart",
      "name": "bar chart",
      "x": 140,
      "y": 365,
      "width": 820,
      "height": 350,
      "enter": "scale",
      "enterDuration": 2,
      "values": [
        32,
        48,
        67,
        86
      ],
      "labels": [
        "BASELINE",
        "PASS 01",
        "PASS 02",
        "PASS 03"
      ],
      "colors": [
        "$line",
        "$accent",
        "$accent",
        "$secondary"
      ],
      "maxValue": 100,
      "fill": "$accent",
      "fontSize": 21,
      "start": 0.8
    },
    {
      "id": "metric-label",
      "type": "text",
      "name": "metric label",
      "x": 1080,
      "y": 345,
      "width": 420,
      "height": 26,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "EXAMPLE IMPROVEMENT",
      "fontSize": 20,
      "fill": "$muted",
      "start": 1
    },
    {
      "id": "metric",
      "type": "counter",
      "name": "metric",
      "x": 1070,
      "y": 400,
      "width": 420,
      "height": 160,
      "enter": "rise",
      "enterDuration": 2.3,
      "valueFrom": 0,
      "valueTo": 2.7,
      "decimals": 1,
      "suffix": "×",
      "fontSize": 144,
      "fontWeight": 700,
      "fill": "$secondary",
      "start": 1
    },
    {
      "id": "metric-caption",
      "type": "text",
      "name": "metric caption",
      "x": 1080,
      "y": 605,
      "width": 420,
      "height": 32.5,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Replace these values\nwith measured results.",
      "fontSize": 25,
      "fill": "$muted",
      "start": 1.5
    },
    {
      "id": "source",
      "type": "text",
      "name": "source",
      "x": 100,
      "y": 805,
      "width": 1300,
      "height": 22.1,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "SOURCE: DEMONSTRATION DATA — NOT A PERFORMANCE CLAIM",
      "fontSize": 17,
      "fill": "$muted",
      "fontFamily": "mono"
    }
  ]
}
```

<a id="template-signal"></a>

## Signal processing

**Category:** Technical scene compositions. **Scene:** `template-signal`. **Duration:** 10s.

Original editable technical template; inspect its layer structure and timing.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use the Signal processing scene in examples/catalog.motion.json as structural reference. Preserve its factual subject and label demonstration values illustrative. Rebuild the grouped cards, editable typography, actual bundled icons, root connectors/charts and staggered reveals. Establish the main subjects first, connections/data second, then hold the completed explanation for at least2s. Keep source labels visible; do not invent claims. Match the reference scene duration rather than forcing8s. Return a complete self-contained project.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "template-signal",
  "name": "Signal processing",
  "duration": 10,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface",
    "grid": true,
    "gridSize": 60,
    "gridOpacity": 0.07
  },
  "layers": [
    {
      "id": "eyebrow",
      "type": "text",
      "name": "eyebrow",
      "x": 100,
      "y": 65,
      "width": 1300,
      "height": 23.400000000000002,
      "enter": "fade",
      "enterDuration": 0.75,
      "text": "04 / SIGNALS",
      "fontSize": 18,
      "fill": "$accent",
      "fontFamily": "mono"
    },
    {
      "id": "title",
      "type": "text",
      "name": "title",
      "x": 96,
      "y": 112,
      "width": 1300,
      "height": 88.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "A signal becomes a story.",
      "fontSize": 68,
      "fill": "$text",
      "fontWeight": 700,
      "start": 0.1
    },
    {
      "id": "subtitle",
      "type": "text",
      "name": "subtitle",
      "x": 100,
      "y": 207,
      "width": 1300,
      "height": 32.5,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Path drawing, looping keyframes and travelling particles — driven by time.",
      "fontSize": 25,
      "fill": "$muted",
      "start": 0.2
    },
    {
      "id": "signal-panel",
      "type": "rect",
      "name": "signal panel",
      "x": 100,
      "y": 320,
      "width": 1400,
      "height": 370,
      "enter": "rise",
      "enterDuration": 0.75,
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24,
      "start": 0.2
    },
    {
      "id": "wave",
      "type": "path",
      "name": "wave",
      "x": 130,
      "y": 360,
      "width": 1330,
      "height": 260,
      "enter": "draw",
      "enterDuration": 3,
      "d": "M 0 130 C 55 130 55 25 110 25 S 165 235 220 235 S 275 25 330 25 S 385 235 440 235 S 495 25 550 25 S 605 235 660 235 S 715 25 770 25 S 825 235 880 235 S 935 25 990 25 S 1045 235 1100 235 S 1155 25 1210 25 S 1265 130 1320 130",
      "fill": "none",
      "stroke": "$secondary",
      "strokeWidth": 5,
      "start": 0.7
    },
    {
      "id": "scan",
      "type": "rect",
      "name": "scan",
      "x": 130,
      "y": 345,
      "width": 4,
      "height": 310,
      "enter": "rise",
      "enterDuration": 0.75,
      "fill": "$accent",
      "radius": 0,
      "start": 0.7,
      "tracks": [
        {
          "property": "x",
          "loop": true,
          "keyframes": [
            {
              "time": 0.7,
              "value": 130
            },
            {
              "time": 6.7,
              "value": 1460,
              "easing": "linear"
            }
          ]
        }
      ]
    },
    {
      "id": "signal-caption",
      "type": "text",
      "name": "signal caption",
      "x": 100,
      "y": 735,
      "width": 1300,
      "height": 28.6,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "RAW INPUT",
      "fontSize": 22,
      "fill": "$secondary",
      "fontFamily": "mono"
    },
    {
      "id": "time-caption",
      "type": "text",
      "name": "time caption",
      "x": 1360,
      "y": 735,
      "width": 140,
      "height": 28.6,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "TIME →",
      "fontSize": 22,
      "fill": "$muted",
      "fontFamily": "mono"
    }
  ]
}
```

<a id="template-timeline"></a>

## Technical timeline

**Category:** Technical scene compositions. **Scene:** `template-timeline`. **Duration:** 10s.

Original editable technical template; inspect its layer structure and timing.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use the Technical timeline scene in examples/catalog.motion.json as structural reference. Preserve its factual subject and label demonstration values illustrative. Rebuild the grouped cards, editable typography, actual bundled icons, root connectors/charts and staggered reveals. Establish the main subjects first, connections/data second, then hold the completed explanation for at least2s. Keep source labels visible; do not invent claims. Match the reference scene duration rather than forcing8s. Return a complete self-contained project.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "template-timeline",
  "name": "Technical timeline",
  "duration": 10,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface",
    "grid": true,
    "gridSize": 60,
    "gridOpacity": 0.07
  },
  "layers": [
    {
      "id": "eyebrow",
      "type": "text",
      "name": "eyebrow",
      "x": 100,
      "y": 65,
      "width": 1300,
      "height": 23.400000000000002,
      "enter": "fade",
      "enterDuration": 0.75,
      "text": "05 / CHRONOLOGY",
      "fontSize": 18,
      "fill": "$accent",
      "fontFamily": "mono"
    },
    {
      "id": "title",
      "type": "text",
      "name": "title",
      "x": 96,
      "y": 112,
      "width": 1300,
      "height": 88.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Build the story in stages.",
      "fontSize": 68,
      "fill": "$text",
      "fontWeight": 700,
      "start": 0.1
    },
    {
      "id": "subtitle",
      "type": "text",
      "name": "subtitle",
      "x": 100,
      "y": 207,
      "width": 1300,
      "height": 32.5,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "A timeline for product histories, scientific discoveries or release milestones.",
      "fontSize": 25,
      "fill": "$muted",
      "start": 0.2
    },
    {
      "id": "timeline-line",
      "type": "line",
      "name": "timeline line",
      "x": 180,
      "y": 510,
      "width": 1240,
      "height": 0,
      "enter": "draw",
      "enterDuration": 2,
      "x2": 1420,
      "y2": 510,
      "stroke": "$line",
      "fill": "$accent",
      "strokeWidth": 4,
      "start": 0.5
    },
    {
      "id": "point-0",
      "type": "circle",
      "name": "point 0",
      "x": 160,
      "y": 490,
      "width": 40,
      "height": 40,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "$accent",
      "start": 0.5
    },
    {
      "id": "icon-0",
      "type": "icon",
      "name": "icon 0",
      "x": 160,
      "y": 365,
      "width": 42,
      "height": 42,
      "enter": "rise",
      "enterDuration": 0.75,
      "icon": "science",
      "start": 0.5
    },
    {
      "id": "year-0",
      "type": "text",
      "name": "year 0",
      "x": 112,
      "y": 575,
      "width": 200,
      "height": 22.1,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "PHASE 01",
      "fontSize": 17,
      "fill": "$secondary",
      "fontFamily": "mono",
      "start": 0.7
    },
    {
      "id": "label-0",
      "type": "text",
      "name": "label 0",
      "x": 112,
      "y": 620,
      "width": 260,
      "height": 36.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Research",
      "fontSize": 28,
      "fill": "$text",
      "fontWeight": 700,
      "start": 0.8
    },
    {
      "id": "point-1",
      "type": "circle",
      "name": "point 1",
      "x": 560,
      "y": 490,
      "width": 40,
      "height": 40,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "$accent",
      "start": 1.15
    },
    {
      "id": "icon-1",
      "type": "icon",
      "name": "icon 1",
      "x": 560,
      "y": 365,
      "width": 42,
      "height": 42,
      "enter": "rise",
      "enterDuration": 0.75,
      "icon": "build",
      "start": 1.15
    },
    {
      "id": "year-1",
      "type": "text",
      "name": "year 1",
      "x": 512,
      "y": 575,
      "width": 200,
      "height": 22.1,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "PHASE 02",
      "fontSize": 17,
      "fill": "$secondary",
      "fontFamily": "mono",
      "start": 1.35
    },
    {
      "id": "label-1",
      "type": "text",
      "name": "label 1",
      "x": 512,
      "y": 620,
      "width": 260,
      "height": 36.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Prototype",
      "fontSize": 28,
      "fill": "$text",
      "fontWeight": 700,
      "start": 1.4500000000000002
    },
    {
      "id": "point-2",
      "type": "circle",
      "name": "point 2",
      "x": 960,
      "y": 490,
      "width": 40,
      "height": 40,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "$accent",
      "start": 1.8
    },
    {
      "id": "icon-2",
      "type": "icon",
      "name": "icon 2",
      "x": 960,
      "y": 365,
      "width": 42,
      "height": 42,
      "enter": "rise",
      "enterDuration": 0.75,
      "icon": "rocket_launch",
      "start": 1.8
    },
    {
      "id": "year-2",
      "type": "text",
      "name": "year 2",
      "x": 912,
      "y": 575,
      "width": 200,
      "height": 22.1,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "PHASE 03",
      "fontSize": 17,
      "fill": "$secondary",
      "fontFamily": "mono",
      "start": 2
    },
    {
      "id": "label-2",
      "type": "text",
      "name": "label 2",
      "x": 912,
      "y": 620,
      "width": 260,
      "height": 36.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Production",
      "fontSize": 28,
      "fill": "$text",
      "fontWeight": 700,
      "start": 2.1
    },
    {
      "id": "point-3",
      "type": "circle",
      "name": "point 3",
      "x": 1360,
      "y": 490,
      "width": 40,
      "height": 40,
      "enter": "scale",
      "enterDuration": 0.75,
      "fill": "$accent",
      "start": 2.45
    },
    {
      "id": "icon-3",
      "type": "icon",
      "name": "icon 3",
      "x": 1360,
      "y": 365,
      "width": 42,
      "height": 42,
      "enter": "rise",
      "enterDuration": 0.75,
      "icon": "analytics",
      "start": 2.45
    },
    {
      "id": "year-3",
      "type": "text",
      "name": "year 3",
      "x": 1312,
      "y": 575,
      "width": 200,
      "height": 22.1,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "PHASE 04",
      "fontSize": 17,
      "fill": "$secondary",
      "fontFamily": "mono",
      "start": 2.6500000000000004
    },
    {
      "id": "label-3",
      "type": "text",
      "name": "label 3",
      "x": 1312,
      "y": 620,
      "width": 260,
      "height": 36.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Evolution",
      "fontSize": 28,
      "fill": "$text",
      "fontWeight": 700,
      "start": 2.75
    },
    {
      "id": "timeline-note",
      "type": "text",
      "name": "timeline note",
      "x": 100,
      "y": 800,
      "width": 1300,
      "height": 29.900000000000002,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Replace phase labels with verified dates and add an evidence card.",
      "fontSize": 23,
      "fill": "$muted"
    }
  ]
}
```

<a id="template-evidence"></a>

## Image and evidence card

**Category:** Technical scene compositions. **Scene:** `template-evidence`. **Duration:** 10s.

Original editable technical template; inspect its layer structure and timing.

### Detailed prompt

```text
Use Motion Forge's current scene-format reference and schema. Return a complete editable version-1 project JSON, not code or Markdown. Use a 1600x900 canvas at 30 fps, midnight palette, 8-second scene, 80px safe margins, unique IDs and strictly increasing scene-relative keyframes. Preserve existing embedded-media IDs and KEEP_EXISTING_EMBEDDED_ASSET markers. Do not invent bytes, facts, icon IDs or unsupported fields. Validate with node scripts/validate.cjs, preview 0/2/4/7.9 seconds, and revisit 4 seconds to check deterministic seeking.

Use the Image and evidence card scene in examples/catalog.motion.json as structural reference. Preserve its factual subject and label demonstration values illustrative. Rebuild the grouped cards, editable typography, actual bundled icons, root connectors/charts and staggered reveals. Establish the main subjects first, connections/data second, then hold the completed explanation for at least2s. Keep source labels visible; do not invent claims. Match the reference scene duration rather than forcing8s. Return a complete self-contained project.
```

### Working scene JSON

Copy this scene into a version-1 project with the catalog theme/assets, or use
the complete [catalog project](../examples/catalog.motion.json). This scene
fragment is not a standalone project.

```json
{
  "id": "template-evidence",
  "name": "Image and evidence card",
  "duration": 10,
  "background": {
    "type": "radial",
    "color": "$background",
    "color2": "$surface",
    "grid": true,
    "gridSize": 60,
    "gridOpacity": 0.07
  },
  "layers": [
    {
      "id": "eyebrow",
      "type": "text",
      "name": "eyebrow",
      "x": 100,
      "y": 65,
      "width": 1300,
      "height": 23.400000000000002,
      "enter": "fade",
      "enterDuration": 0.75,
      "text": "06 / VISUAL EVIDENCE",
      "fontSize": 18,
      "fill": "$accent",
      "fontFamily": "mono"
    },
    {
      "id": "title",
      "type": "text",
      "name": "title",
      "x": 96,
      "y": 112,
      "width": 1300,
      "height": 88.4,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Give your sources a stage.",
      "fontSize": 68,
      "fill": "$text",
      "fontWeight": 700,
      "start": 0.1
    },
    {
      "id": "subtitle",
      "type": "text",
      "name": "subtitle",
      "x": 100,
      "y": 207,
      "width": 1300,
      "height": 32.5,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Add a screenshot, a custom illustration or your logo from the Assets panel.",
      "fontSize": 25,
      "fill": "$muted",
      "start": 0.2
    },
    {
      "id": "evidence-card",
      "type": "rect",
      "name": "evidence card",
      "x": 100,
      "y": 315,
      "width": 920,
      "height": 450,
      "enter": "rise",
      "enterDuration": 0.75,
      "fill": "$surface",
      "stroke": "$line",
      "radius": 24,
      "start": 0.3
    },
    {
      "id": "evidence-symbol",
      "type": "icon",
      "name": "evidence symbol",
      "x": 430,
      "y": 390,
      "width": 220,
      "height": 220,
      "enter": "scale",
      "enterDuration": 0.75,
      "icon": "image",
      "fill": "$muted",
      "start": 0.7
    },
    {
      "id": "image-note",
      "type": "text",
      "name": "image note",
      "x": 195,
      "y": 690,
      "width": 800,
      "height": 23.400000000000002,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "UPLOAD IMAGE → SELECT LAYER → REPLACE ASSET",
      "fontSize": 18,
      "fill": "$muted",
      "fontFamily": "mono",
      "start": 1
    },
    {
      "id": "evidence-label",
      "type": "text",
      "name": "evidence label",
      "x": 1090,
      "y": 360,
      "width": 400,
      "height": 26,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "SOURCE / DATE",
      "fontSize": 20,
      "fill": "$secondary",
      "start": 0.6
    },
    {
      "id": "evidence-title",
      "type": "text",
      "name": "evidence title",
      "x": 1090,
      "y": 415,
      "width": 410,
      "height": 55.9,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Explain the\nimportant detail.",
      "fontSize": 43,
      "fill": "$text",
      "fontWeight": 700,
      "start": 0.9
    },
    {
      "id": "evidence-caption",
      "type": "text",
      "name": "evidence caption",
      "x": 1090,
      "y": 585,
      "width": 420,
      "height": 31.200000000000003,
      "enter": "rise",
      "enterDuration": 0.75,
      "text": "Keep captions short.\nCredit the original creator.\nSeparate evidence from inference.",
      "fontSize": 24,
      "fill": "$muted",
      "start": 1.2
    }
  ]
}
```

## Animation recipes shared by all examples

- **Entrance:** `none` for explicitly keyed motion; `fade`, `rise`,
  `slide`, `scale` for reveals; `draw` for path/connector strokes.
- **Easing:** `linear` for steady travel; `easeIn` for acceleration;
  `easeOut` for settling; `easeInOut` for camera moves; `backOut` for
  restrained overshoot; `step` for discrete states. Avoid overshoot on bounded
  properties such as opacity, IOR and camera distance.
- **Loop:** at least two strictly increasing keys, one track/property.
  Match endpoints for continuous position/colour loops; a360-degree rotation
  can intentionally wrap to0. Layer/object times are scene-relative.
- **Opacity/colour:** animate `opacity`0..1 and `fill`/`stroke` using
  hex or palette tokens. Object colour is static, not an object-track property.
- **Camera/light:** on the scene3d layer animate cameraDistance,
  cameraAzimuth, cameraElevation, fov or lightIntensity. Objects separately
  animate position, rotation, scale and numeric material properties.

Detailed combined prompt:

```text
Create an8s scene3d study with a standard box and glass sphere. Orbit cameraAzimuth
from-20deg at0s to30deg at5s using easeInOut, hold through8s. Move the box x-1 to1
over3s using easeOut. Animate the glass sphere ior1.2 to1.5 over4s without
overshoot. Add an SVG title with rise entrance. Keep labels fixed and readable.
Use one track/property with strictly increasing scene-relative keys. Render at
0/2/4/7.9s and compare4s before/after backward seeking. Return complete validated
Motion Forge version-1 JSON, preserving existing asset markers.
```

## Export the catalog

```powershell
npm start
node scripts\validate.cjs examples\catalog.motion.json
node scripts\render.cjs --project examples\catalog.motion.json --scene demo-20 --out renders\glass-frames --fps 30 --width 1920 --height 1080
node scripts\render.cjs --project examples\catalog.motion.json --scene demo-20 --out renders\glass.mp4 --format mp4 --width 3840 --height 2160 --fps 30 --crf 18
```

Install local FFmpeg for direct MP4/WebM encoding. Pick scene IDs from the
index rather than assuming a template name is its ID. Rebuild this cookbook
and portable catalog with `node scripts/build-catalog.cjs`; generate the
original synthetic source first with `node scripts/build-demo-video.cjs`.
