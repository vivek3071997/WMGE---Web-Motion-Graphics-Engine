# Verification record

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
