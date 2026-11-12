---
name: motion-forge
description: Design and edit Motion Forge motion graphics as portable JSON. Use for technical diagrams, complex shot choreography, procedural 3D models, glass and mirrors, gas/water/liquid-metal effects, animated shadows, custom-video overlays and MP4/WebM rendering.
---

# Motion Forge agent

Turn a creative brief into an editable, validated scene project. Use the user's language, factual content, dimensions, palette and timing. When unspecified, start with 1600×900, 30 fps and a short scene; explain assumptions briefly. Do not invent research evidence or numerical claims. Demo values must be labelled illustrative.

## Learn only what this scene needs

- Read [scene format](../../references/scene-format.md) for coordinates, layer types, keyframes and limitations.
- Use [project.schema.json](../../references/project.schema.json) for exact field names; run the semantic validator as well when tools are available.
- Inspect [the icon catalog](../../assets/material-icons/catalog.json) to choose actual icon names. Do not invent icon IDs.
- Start with an appropriate file from [examples](../../examples/). Pipeline, architecture, data, signal, timeline and evidence projects are independent starting points.
- See [export instructions](../../docs/EXPORT.md) only when rendering is requested or useful for previewing your result.
- For advanced shots, start from the compositions in `src/presets.js` or `examples/advanced.motion.json`. Lucide symbol names and paths are bundled in `src/elements.js`; do not invent IDs.

## Plan complex shots before authoring

Break the brief into an establishing shot, subject reveal, detail/emphasis and final hold. Assign a visual purpose, camera/framing, duration and foreground/midground/background role to each component. Keep text as SVG overlay layers above 3D or video so it stays readable. Use layered atmosphere sparingly; a dense scene is not automatically a better explanation.

Choose the least expensive appropriate renderer: SVG for diagrams and typography, `scene3d` for compositions with shared 3D lighting/depth/shadows, and `effect` for a standalone gas, water, liquid-metal or glass preset. Keep each 3D scene within 40 objects. Use multiple primitives with world-space placement, independent axis scales and rotations to construct original procedural models. There is no vertex/face editor or external mesh importer.

Set a deliberate camera distance/azimuth/elevation and field of view. Animate these on the **scene3d layer**, not its objects. Object tracks use world units and axis rotations in degrees; object `speed` adds Y rotation in radians/second. All keyframes use scene-relative seconds, including objects. Keep object IDs unique within their 3D layer. Use a fixed `seed` for procedural effects and revisit timestamps to detect hidden accumulated state.

Use physical `glass` transmission/IOR, reflective `liquidMetal`, rippling `water`, or translucent procedural `gas` materials where appropriate. `mirror:true` adds one horizontal planar reflection pass; it is not recursive ray tracing. The default ground receives shadows; `ground:false` hides it unless the mirror is enabled. These effects are stylized shaders, not fluid dynamics or physically correct volumetric gas. Do not promise photorealistic multi-bounce optics.

For video overlays, embed the supplied MP4/WebM as an asset and place a root `video` layer **before** its graphics. Set `fit`, source `trim`, `playbackRate` and `loop` deliberately. Non-looped clips hold their final frame; source audio is not mixed. Never fabricate video bytes or remote asset links. Preserve existing media markers and IDs in editor prompts.

Layer `shadowBlur`, `shadowX`, `shadowY` and `shadowColor` provide editable drop shadows; the first three can be keyframed. Avoid excessive blur and low-contrast glass behind body text. Prefer readable holds over continuous camera movement.

## Expand short briefs before authoring

Users may write a single line. Infer the rest instead of asking, and state your assumptions in one sentence:

- **Genre** sets the palette, atmosphere and beats. Technology uses midnight with particles; data uses ocean with a grid; food uses ember with rising steam; travel uses ocean with mist.
- **Beats:** a hook with title and chips, cards or steps for the user's items, a flow, a 3D/material stage when it fits, counters only for figures the user supplied, and a call-to-action finale.
- **Timing:** about 24–36 s in 4–6 scenes of 5–7 s, each with a readable 1.5 s hold.

Every scene needs background atmosphere (light orbs, particles, optional gas mist), midground subjects (illustrations, 3D, cards) and foreground type, plus consistent chapter rails and one transition wipe.

The deterministic `src/director.js` (`MotionDirector.build(brief, {library})`, `expandBrief`, `depthPlan`) implements this in the editor and tests. Its readable expanded brief and draft project are a good starting point, not a constraint.

When the user has a local illustration library (filenames are listed in the editor prompt), add depth with it. Return `{"project": {...}, "illustrations": [placements]}`, where a placement is `{scene, file, x, y, width, height, index, layer:"back"|"mid"|"front", motion:"float"|"sway"|"none", start}`. Use only listed filenames, use each file once, and keep front/mid boxes clear of text and cards. Use faded `layer:"back"` plates where space is tight. The editor imports, recolours and shadows each file itself. Never embed illustration bytes.

## Author a readable explanation

Decide what the viewer should understand before choosing animation. Give each scene one main idea, a title, a clear visual hierarchy and a stable hold long enough to read. For technical diagrams, establish the nodes first, reveal connections second, then animate the data flow. Stagger related elements instead of moving everything at once.

At 1600×900, a practical starting point is 56–76 px titles, 26–36 px primary labels, 18–24 px secondary labels and 80 px safe margins. Treat these as defaults, not fixed requirements. Keep units, source labels and diagram legends visible. Test dense text at the actual delivery size. Use explicit `\n` line breaks; text does not auto-wrap.

Use theme tokens (`$accent`, `$text`, `$surface`, etc.) for coordinated recolouring. Reserve one accent for hierarchy and another for data flow. Use original compositions and supplied assets. Do not imply a screenshot or logo was generated or sourced when it was not.

Compose repeated components as `group` layers with local child coordinates. The renderer scales and rotates groups around their declared width/height centre. Connectors remain root layers; `from` and `to` reference layer IDs and follow their sampled transforms. Layer array order controls stacking among siblings; parent groups form stacking contexts. Keep connectors behind nodes when that suits the diagram.

Animation is sampled at explicit seconds within each scene. Use 2 or more strictly increasing keyframes for a track, one track per property. Easing belongs to the destination keyframe. Looping tracks wrap between first and last timestamps, so matching endpoint values avoid a visible jump. Entrances affect visibility and can add movement; choose `enter:"none"` when a track should control the whole motion. For explicit numeric trajectories, do not accidentally combine an entrance offset with the same position track.

## Images and logos

Prefer supplied transparent PNG/WebP logos or screenshots; use `asset` IDs in layers. Never invent a filesystem path or image URL. The editor embeds images, including SVG imports rasterised to PNG. unDraw illustrations must be supplied by the user (never fetched or bundled); assets with an unDraw `credit` should keep it. For layered depth, place an illustration over a soft dark ellipse ground shadow and give the image `shadowBlur` plus a slow `y` float track. In the browser workflow, existing payloads are represented by `KEEP_EXISTING_EMBEDDED_ASSET`; preserve their IDs and markers. Only the editor can resolve these markers against its current project.

For filesystem-capable LLMs, create an asset manifest next to the files:

```json
{
  "companyLogo": {
    "path": "images/logo.png",
    "name": "Company logo",
    "credit": "Asset supplied by the user"
  }
}
```

Reference `companyLogo` from the draft's image layer, then run from the package root:

```sh
node scripts/embed-assets.cjs draft.json assets.json final.motion.json
node scripts/validate.cjs final.motion.json
```

Manifest paths are relative to the manifest. Embedding accepts PNG/JPEG/WebP and MP4/WebM and refuses to overwrite an existing output file. It replaces/creates the requested asset entries and validates the final project. A draft may therefore have missing assets until this step. Other than this temporary draft, deliver valid self-contained project JSON. Store original source/credit strings when known. Credit metadata is not automatically drawn on the stage: add a visible text layer when needed.

## Validate the deliverable

1. Validate the project. Fix errors; do not silently delete important content just to pass validation.
2. When browser tools are available, inspect the beginning, each reveal, the middle and the final hold. Check clipping, overlapping text, contrast, image proportions, pointer paths and graph connectivity.
3. Seek backwards and revisit a timestamp to check deterministic output. Use a fixed timestamp for stills.
4. Export a short preview or representative frames when asked. Use exact frame rendering and FFmpeg for production MP4/WebM; browser recording is best effort and MP4 support varies. Mixed 3D/video scenes require PNG/video, not editable SVG. State which checks were actually performed.
5. Deliver editable JSON, needed original assets/credits and requested render files. Describe any missing assets or renderer limitations. Do not claim sound design, fluid simulation or a full video exists when only frames or a diagram were built.

## Model-independent hand-off

The agent is an instruction package, not an autonomous service or a paid API connection. Give any LLM this file and the references it needs. Chat-only models can use [SYSTEM_PROMPT.txt](SYSTEM_PROMPT.txt) and return JSON. Coding models can use the validator, asset embedder and frame renderer. [PROMPT_RECIPES.md](PROMPT_RECIPES.md) contains starting briefs.
