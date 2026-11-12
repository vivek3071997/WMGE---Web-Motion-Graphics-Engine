# Third-party notices

## Google Material Icons — Apache License 2.0

The 131 Material icon SVGs in `assets/material-icons/` and the bundled path registry in `src/icons.js` are from Google's official Material Design Icons repository:

- Repository: https://github.com/google/material-design-icons
- Pinned commit: `10ecc14790612ca8fd164e3f4ffe9c16fc50d5b7`
- License: [Apache License 2.0](assets/material-icons/LICENSE)
- Per-file original URLs and SHA-256 hashes: [catalog.json](assets/material-icons/catalog.json)

Original SVG files are retained. `src/icons.js` is a generated representation that removes each outer SVG wrapper and stores the unchanged inner paths under the icon name. Colour is supplied by the renderer. These assets remain under Apache-2.0; they are not relicensed under the engine's MIT license. Google's repository includes the license above; no separate upstream NOTICE was present in the vendored license package.

Official usage guidance: https://developers.google.com/fonts/docs/material_icons

## Three.js 0.160.1 - MIT

`assets/vendor/three.min.js` is the unmodified UMD browser build from npm `three@0.160.1`.
Source: https://github.com/mrdoob/three.js/tree/r160 . The MIT copyright/license
is retained in `assets/vendor/THREE-LICENSE.txt`. This version is pinned to keep
the editor usable directly from `index.html`, with no module server or CDN.

## Lucide 0.468.0 - ISC

The 1,544 SVG element bodies in `src/elements.js` are generated from npm
`lucide-static@0.468.0`. Source: https://github.com/lucide-icons/lucide .
The upstream ISC license and included Feather attribution are retained in
`assets/vendor/LUCIDE-LICENSE.txt`. Only outer SVG wrappers are removed; the
renderer supplies the original 24-unit viewBox and stroke styling.

Run `npm run build:vendor` after `npm ci` to reproduce both bundles from
the exact package versions and integrity records in `package-lock.json`.
No runtime network requests are required.

## Optional development tools

Playwright is an optional development dependency, distributed separately through npm under Apache-2.0: https://github.com/microsoft/playwright . Browser binaries are installed separately and retain their own terms. Neither Playwright packages nor browser binaries are vendored in this source archive. FFmpeg is an optional external encoder and is not bundled.

## unDraw illustrations - not bundled

No unDraw files are included in this repository. The editor's **Image source → unDraw** mode only processes SVGs that the user downloads individually from https://undraw.co. It recolours the `#6C63FF` accent and records the asset credit "Illustration from unDraw (https://undraw.co), used under the unDraw License". Users are responsible for complying with https://undraw.co/license, which prohibits compiling or redistributing the illustrations as packs or inside apps, automated downloading, and AI/ML use. The optional `assets/undraw-local/` folder holds a user's own downloads for local use; it is git-ignored and excluded from FILE_MANIFEST.json. The browser test uses an original synthetic SVG, not unDraw artwork.

## Original assets

`examples/assets/catalog-source.webm` is an original synthetic abstract
animation generated locally by `scripts/build-demo-video.cjs`, included
under MIT for the video-overlay cookbook example. It contains no personal
footage or audio.

The five fictional story briefs, procedural compositions and vector landscapes
in `docs/showcase-prompts/` and `examples/showcase/` are original project
demonstrations under MIT. Their local generated previews/reels reuse only the
original assets above and the licensed bundled libraries/icons; no real people,
personal media, third-party reference footage or external soundtrack is included.

The UI mark, templates and `examples/assets/forge-mark.png` are original illustrative assets included under the project MIT license. Demonstration data is synthetic. Uploaded logos, screenshots and other user assets are not covered by the project's license and must be handled by their owner.

## Implementation references

Canvas recording and its origin-clean requirement: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream

Browser recording API: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API

The documentation links to these sources; their article text is not redistributed.
