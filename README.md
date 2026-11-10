# WMGE — Web Motion Graphics Engine

Motion Forge is the local editor included in WMGE.

**A local web studio for editable, technical motion graphics — built for people and AI agents.**

![Motion Forge editor](docs/studio-preview.png)

Open **`index.html`** in a current Chrome or Edge browser. No installation, account, API key, CDN, build step or server is required for the editor. Everything runs locally. A local server is also available with `npm start` (Node 20+); open the address it prints.

## What you can build

- Technical diagrams, animated pipelines, product explanations, data comparisons, timelines, titles and evidence cards.
- 10 layer types: text, rectangles, ellipses, Material icons, custom images, connectors, SVG paths, counters, charts and nested groups.
- Solid, linear, radial or transparent backgrounds; 5 editable palettes; per-element colours; palette tokens that stay linked across scenes.
- **131 locally bundled Google Material Icons** with search, editable colour and vector export.
- PNG, JPEG and WebP images; simple SVG logos are checked and converted to PNG on import. Images remain embedded in exported projects.
- Timed entrances, exit fades, numeric and colour keyframes, 6 easing modes, looping tracks, moving data particles and connectors that follow animated nodes.
- A storyboard, layer inspector, drag positioning, keyboard nudging, undo/redo, timeline seeking and safe-area overlay.
- Portable JSON, vector SVG frames, PNG frames, browser WebM capture and deterministic PNG sequences for production encoding.
- A model-independent authoring agent: guidelines, schema, examples, prompts, asset embedding and validation tools. Use your preferred LLM; no model service is included or contacted.

## Five-minute start

1. Open `index.html`. Six original technical templates are already loaded.
2. Select a scene. Open **Scene & theme** to try palettes and backgrounds.
3. Click a layer, or pick it in the layer list. Edit its text, position, colour and motion. Drag on the stage; hold **Alt** while dragging a child to move its immediate group.
4. Open **Assets**. Search an icon, or upload an image and click **Add**. **Replace** swaps the selected image layer's asset.
5. Seek to a time, choose an animated property and value, then add a keyframe. The first new track gets a second baseline key automatically. For precise multi-key edits use **AI workspace → Load current JSON**.
6. **Export → Project JSON** saves a reusable project. SVG/PNG export the current frame. WebM records the current scene in real time.

Local autosave is a convenience, not a backup. Large embedded images may exceed browser storage; the header will say **Download JSON to save**. Save a JSON file before clearing browser data, moving the app or closing a large unsaved project. Imported projects can be undone.

## Work with any LLM

In the editor, open **AI workspace**, describe your scene, then **Copy prompt + current project**. Paste it into your model. Paste the returned complete JSON back into the editor, validate and apply. Large image payloads are replaced by markers in the prompt; the editor restores them by existing asset ID. Keep the same project open while doing this. These markers are an editor import convenience; saved project files always contain real embedded images.

For a coding agent, give it [AGENTS.md](AGENTS.md) and [the Motion Forge agent](agent/motion-forge/SKILL.md). For chat-only LLMs, use [the portable system prompt](agent/motion-forge/SYSTEM_PROMPT.txt) with the [scene reference](references/scene-format.md), icon catalog and one example. No particular vendor or tool protocol is required.

An LLM can also embed local assets with:

```sh
node scripts/embed-assets.cjs draft.json assets.json final.motion.json
node scripts/validate.cjs final.motion.json
```

The asset manifest format and full workflow are in [the agent guide](agent/motion-forge/SKILL.md).

## Production rendering

The editor works without dependencies. The optional test/render tooling uses Playwright and requires Node 20 or newer:

```sh
npm install
npx playwright install chromium
npm test
npm run test:browser
node scripts/render.cjs --project examples/pipeline.motion.json --scene pipeline --out renders/pipeline --fps 30 --width 1920 --height 1080
```

Rendering advances to exact frame timestamps. It does not depend on playback speed. See [export recipes](docs/EXPORT.md) for FFmpeg, alpha export, all-scene renders, custom Chrome paths and limitations. WebM recording is a convenient real-time preview; busy machines can drop frames. Use PNG sequences for final production.

## Project structure

| Folder / file | Purpose |
| --- | --- |
| `index.html`, `src/` | Standalone editor, SVG engine, example scene builders, bundled icon registry |
| `assets/material-icons/` | Original SVGs, pinned upstream provenance and Apache license |
| `agent/motion-forge/` | Portable agent skill, system prompt and reusable creative briefs |
| `references/` | Scene format and machine-readable JSON Schema |
| `examples/` | Complete, editable project files; original demonstration image |
| `scripts/` | Local server, validation, image embedding, schema generation and frame export |
| `tests/` | Renderer, validation, browser interaction, image and export checks |
| `docs/` | User guide, export instructions and verified capability notes |

## Scope and limits

This is a **2D SVG motion graphics engine**. It does not simulate 3D scenes, render photorealistic game footage, edit audio, import After Effects projects, or automatically reproduce every effect in a reference video. Compose its exported clips in your video editor. Advanced shapes can be SVG paths; new layer types can be implemented in the open renderer.

Text uses system fonts and explicit line breaks. `width` is a layout/selection box, not an automatic text-wrap rule. Check exported frames on the machine used for final rendering. SVG imports intentionally exclude text, scripts, filters, styles and external references; convert a complex logo to PNG first. Only local raster data is used in project image layers, avoiding network dependencies and canvas cross-origin failures.

Target: desktop Chrome/Edge. Responsive layout works on smaller screens, but dense diagrams are easier on desktop. Safari/Firefox may vary in video codec availability, SVG image decoding and local-file clipboard behaviour. No claim of full cross-browser parity is made.

## Publishing / contributing

This directory is the complete distributable source package. Publish it as its own repository or serve it on any static host. No original research, private footage, account paths or API credentials are included. `package.json` is marked private to avoid accidental npm publication; this does not prevent publishing the repository or website. Source repository: [WMGE — Web Motion Graphics Engine](https://github.com/vivek3071997/WMGE---Web-Motion-Graphics-Engine).

See [CONTRIBUTING.md](CONTRIBUTING.md), [LICENSE](LICENSE) and [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). Original engine, UI, agent text and templates: **MIT**. Google Material Icons: **Apache-2.0**. Your imported assets keep their own rights and licenses.
