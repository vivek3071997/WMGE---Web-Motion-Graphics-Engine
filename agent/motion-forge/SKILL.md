---
name: motion-forge
description: Design and edit Motion Forge 2D motion graphics as portable scene JSON, including technical diagrams, charts, timelines, image cards and reusable animations. Use for Motion Forge scene authoring or rendering; this does not provide 3D simulation or video editing.
---

# Motion Forge agent

Turn a creative brief into an editable, validated scene project. Use the user's language, factual content, dimensions, palette and timing. When unspecified, start with 1600×900, 30 fps and a short scene; explain assumptions briefly. Do not invent research evidence or numerical claims. Demo values must be labelled illustrative.

## Learn only what this scene needs

- Read [scene format](../../references/scene-format.md) for coordinates, layer types, keyframes and limitations.
- Use [project.schema.json](../../references/project.schema.json) for exact field names; run the semantic validator as well when tools are available.
- Inspect [the icon catalog](../../assets/material-icons/catalog.json) to choose actual icon names. Do not invent icon IDs.
- Start with an appropriate file from [examples](../../examples/). Pipeline, architecture, data, signal, timeline and evidence projects are independent starting points.
- See [export instructions](../../docs/EXPORT.md) only when rendering is requested or useful for previewing your result.

## Author a readable explanation

Decide what the viewer should understand before choosing animation. Give each scene one main idea, a title, a clear visual hierarchy and a stable hold long enough to read. For technical diagrams, establish the nodes first, reveal connections second, then animate the data flow. Stagger related elements instead of moving everything at once.

At 1600×900, a practical starting point is 56–76 px titles, 26–36 px primary labels, 18–24 px secondary labels and 80 px safe margins. Treat these as defaults, not fixed requirements. Keep units, source labels and diagram legends visible. Test dense text at the actual delivery size. Use explicit `\n` line breaks; text does not auto-wrap.

Use theme tokens (`$accent`, `$text`, `$surface`, etc.) for coordinated recolouring. Reserve one accent for hierarchy and another for data flow. Use original compositions and supplied assets. Do not imply a screenshot or logo was generated or sourced when it was not.

Compose repeated components as `group` layers with local child coordinates. The renderer scales and rotates groups around their declared width/height centre. Connectors remain root layers; `from` and `to` reference layer IDs and follow their sampled transforms. Layer array order controls stacking among siblings; parent groups form stacking contexts. Keep connectors behind nodes when that suits the diagram.

Animation is sampled at explicit seconds within each scene. Use 2 or more strictly increasing keyframes for a track, one track per property. Easing belongs to the destination keyframe. Looping tracks wrap between first and last timestamps, so matching endpoint values avoid a visible jump. Entrances affect visibility and can add movement; choose `enter:"none"` when a track should control the whole motion. For explicit numeric trajectories, do not accidentally combine an entrance offset with the same position track.

## Images and logos

Prefer supplied transparent PNG/WebP logos or screenshots; use `asset` IDs in layers. Never invent a filesystem path or image URL. The editor embeds images, including simple SVG imports rasterised to PNG. In the browser workflow, existing payloads are represented by `KEEP_EXISTING_EMBEDDED_ASSET`; preserve their IDs and markers. Only the editor can resolve these markers against its current project.

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

Manifest paths are relative to the manifest. Embedding accepts PNG/JPEG/WebP and refuses to overwrite an existing output file. It replaces/creates the requested asset entries and validates the final project. A draft may therefore have missing assets until this step. Other than this temporary draft, deliver valid self-contained project JSON. Store original source/credit strings when known. Credit metadata is not automatically drawn on the stage: add a visible text layer when needed.

## Validate the deliverable

1. Validate the project. Fix errors; do not silently delete important content just to pass validation.
2. When browser tools are available, inspect the beginning, each reveal, the middle and the final hold. Check clipping, overlapping text, contrast, image proportions, pointer paths and graph connectivity.
3. Seek backwards and revisit a timestamp to check deterministic output. Use a fixed timestamp for stills.
4. Export a short preview or representative frames when asked. Use exact frame rendering for production; real-time WebM can drop frames. State which checks were actually performed.
5. Deliver editable JSON, needed original assets/credits and requested render files. Describe any missing assets or renderer limitations. Do not claim a full video, sound design or 3D effect exists when only a diagram has been built.

## Model-independent hand-off

The agent is an instruction package, not an autonomous service or a paid API connection. Give any LLM this file and the references it needs. Chat-only models can use [SYSTEM_PROMPT.txt](SYSTEM_PROMPT.txt) and return JSON. Coding models can use the validator, asset embedder and frame renderer. [PROMPT_RECIPES.md](PROMPT_RECIPES.md) contains starting briefs.
