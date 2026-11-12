# Verification record

## Five-story narrative showcase

The [showcase](SHOWCASE.md) contains five original fictional projects, 15 shots,
five separate detailed prompts and 90 seconds of animation in total.

- `npm run build:showcase` validated every master and asserted coverage of
  all 14 layer types, seven geometries and five material/effect families.
- `npm run test:showcase` rendered 75 timeline samples, checked text bounds,
  compared 15 deterministic timestamp revisits and saved 15 previews.
  No browser/renderer errors occurred.
- The production renderer generated five H.264 MP4 and five VP9 WebM reels.
  FFmpeg decoded every file completely: **432 frames each**.
- `npm run test:showcase:gallery` checked actual browser metadata for all ten
  videos: **1280x720, 24-fps delivery, 18 seconds** (WebM duration tolerance
  0.01 seconds). It checked all five selectors, prompt/project/editor/download
  links, third-shot seeking, advancing playback, automatic continuation,
  all five editable demo routes and mobile overflow. No browser exceptions
  or console errors occurred on the completed run. An initial run timed out
  waiting for editor readiness; the diagnostic rerun passed all five routes.
- The local server now supports byte ranges and HEAD: an actual browser seek
  reached the requested timestamp instead of resetting to zero. A focused
  test checks exact prefix/open-ended/suffix bytes, invalid ranges, HEAD,
  video MIME and missing files.
- The final `npm test` run passed **34** unit/contract/software-WebGL/server
  checks; the original **13** browser checks also passed.
- All five encoded films were opened and representative frames visually
  inspected in the local theatre. The server remains local-only.

Generated videos and their decode report are local ignored deliverables.
Regenerate them with the commands in the showcase guide after cloning.
These are silent, stylized authored demonstrations, not a claim of fluid
simulation, photorealism or external AI-model performance.

## 1.1 hybrid-engine upgrade checks

The complete example cookbook additionally covers 35 editable scenes.
`npm run test:catalog` rendered every scene at its beginning, middle and
end, then revisited the middle and saved screenshots. All scene IDs had
matching cookbook sections; no browser exceptions or renderer errors occurred.
All 14 element types, seven geometries, five material models, four effect
presets, four backgrounds and six technical templates are represented.

Checked on Windows with Node 24.17.0, Playwright 1.62.1 and Chromium 151:

- 33 unit/contract checks passed, including software-WebGL geometry/material
  coverage, mirror differences and deterministic revisiting of timestamps.
- The original 13 browser checks passed unchanged.
- 14 advanced browser checks passed: offline Lucide search/add, five animated
  material starters, object editing/keyframes/duration repair, source-video
  decoding/seeking/trim/loop/final-frame hold, 2D/3D/video stacking, mixed PNG
  export, explicit SVG rejection, real browser MP4 and native 3840x2160 WebGL
  compositing and slow-render playback progress. No external requests or browser exceptions were observed.
- Actual FFmpeg exports decoded as H.264 MP4 and VP9 WebM: 640x360, 10 frames,
  2.00 seconds each. A separate 3840x2160 H.264 MP4 encoded/decoded correctly
  with one composited 4K frame (0.20 seconds). This is not a long-duration
  4K performance or quality benchmark.
- Existing example projects and the five new advanced compositions validated.
- Stage screenshots for glass/mirror, gas, water and video overlays were
  inspected. Fluid effects remain stylized, not physical simulation.
- Recorder output is decoded before download. Some headless/software graphics
  configurations advertise codecs but produce no valid frames; these now fail
  explicitly instead of downloading a corrupt, success-shaped result.

To reproduce the additional checks: `npm test`, `npm run test:advanced`.
Set `BROWSER_PATH` for the optional software-WebGL unit test; downloaded
Playwright Chromium is the reference for the full recording integration.
The portable agent prompt/JSON workflow was tested, not an external LLM's
ability to generate advanced scenes. No model-service benchmark is claimed.

## Original 1.0 verification

Checked on 10 November 2026 with Node 22.14.0, Playwright 1.62.1 and desktop Chrome 157.0.8103.39 on macOS. This is a record of checks performed, not a claim of exhaustive browser or visual coverage.

## Passed

- **12 engine tests**: example validity, deterministic seeking, interpolation/looping, RGBA colour tracks, transformed-node connections, escaped text, invalid references/cycles/duplicate IDs, unsafe image sources, unsafe paths/colours, connector constraints, visibility/exit fading and pinned icon hashes.
- **13 browser checks**: offline startup, colour controls and undo/redo, icons and keyframes, PNG/SVG upload, rejection of executable/external SVG content, image-preserving LLM import, group deletion, shortened scene timing, JSON/SVG/PNG export, WebM recording, repeatable scene screenshots, responsive width and absence of browser exceptions/network requests.
- PNG export: 400×300, transparent corner alpha 0, opaque logo centre alpha 255.
- WebM export: decoded successfully as VP9, 400×300, 7 frames for the short 0.6-second recording fixture. Real-time capture is not an exact frame-count guarantee.
- Standalone renderer: a three-frame alpha sequence and a two-scene six-frame sequence. Verified order/boundaries in the manifest, and transparent output pixels.
- Asset embedder: created and validated a portable project from a relative-path manifest and original logo file.
- Agent package: required skill frontmatter and references checked; the browser prompt/JSON image-preservation workflow tested. No external LLM service was called or benchmarked.
- Visual inspection: desktop editor, six scene templates, mobile stage and library. Template text remained within stage bounds at the tested final holds.
- Distribution scan: no personal filesystem paths or user research/media included.

## Practical limits

Full Safari/Firefox parity, long-duration recording stability, 4K performance under heavy scenes and every user-supplied SVG variant were not tested. Browser recording can drop frames under load. System fonts and rendering implementations can differ between machines. Use the exact-frame renderer on the final production machine and review the resulting clip before publication.

The project schema is generated from the maintained schema builder. The built-in semantic validator was used for distributed projects; no claim of an independent third-party JSON Schema conformance audit is made.

## Reproduce

```sh
npm ci
npx playwright install chromium
npm test
npm run test:browser
```

`test-output/` is generated and ignored. `BROWSER_PATH` can select an installed Chrome. See `docs/EXPORT.md` for the standalone render commands.
