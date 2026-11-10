# Third-party notices

## Google Material Icons — Apache License 2.0

The 131 Material icon SVGs in `assets/material-icons/` and the bundled path registry in `src/icons.js` are from Google's official Material Design Icons repository:

- Repository: https://github.com/google/material-design-icons
- Pinned commit: `10ecc14790612ca8fd164e3f4ffe9c16fc50d5b7`
- License: [Apache License 2.0](assets/material-icons/LICENSE)
- Per-file original URLs and SHA-256 hashes: [catalog.json](assets/material-icons/catalog.json)

Original SVG files are retained. `src/icons.js` is a generated representation that removes each outer SVG wrapper and stores the unchanged inner paths under the icon name. Colour is supplied by the renderer. These assets remain under Apache-2.0; they are not relicensed under the engine's MIT license. Google's repository includes the license above; no separate upstream NOTICE was present in the vendored license package.

Official usage guidance: https://developers.google.com/fonts/docs/material_icons

## Optional development tools

Playwright is an optional development dependency, distributed separately through npm under Apache-2.0: https://github.com/microsoft/playwright . Browser binaries are installed separately and retain their own terms. Neither Playwright packages nor browser binaries are vendored in this source archive. FFmpeg is an optional external encoder and is not bundled.

## Original assets

The UI mark, templates and `examples/assets/forge-mark.png` are original illustrative assets included under the project MIT license. Demonstration data is synthetic. Uploaded logos, screenshots and other user assets are not covered by the project's license and must be handled by their owner.

## Implementation references

Canvas recording and its origin-clean requirement: https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream

Browser recording API: https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API

The documentation links to these sources; their article text is not redistributed.
