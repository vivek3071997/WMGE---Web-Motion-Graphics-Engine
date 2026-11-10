# Contributing

The editor is plain HTML, CSS and JavaScript with no runtime package dependencies. Serve the directory with `npm start` or open `index.html`. Run `npm test` for pure-engine and validation tests. For integration tests, install dependencies and a Playwright browser, then run `npm run test:browser`. Test artifacts are ignored under `test-output/`.

Keep rendering a pure function of validated project data and time. New features should preserve local/offline operation and the scene format's explicit limits. Changes to the data contract belong in `src/engine.js`, `scripts/build-schema.cjs`, `references/scene-format.md`, examples and relevant tests together. Run `node scripts/build-schema.cjs` after schema changes.

Add meaningful regression checks for behaviours that could break: grouped transforms, timed interpolation, diagram connectivity, asset decoding, validation and clean exports. UI-only reversible cosmetic changes usually need visual inspection rather than tautological tests.

For new Material icons, download from the official Google repository at a pinned commit, keep the original SVG, record its hash/path in `assets/material-icons/catalog.json`, and regenerate `src/icons.js` with `node scripts/build-icons.cjs`. Keep the Apache license and notices. Other asset libraries need their own provenance and license review before inclusion. Do not silently relicense imported user media.

Before sharing a contribution, remove private projects, screenshots, browser profiles, API keys, generated recordings and local machine paths. No external service is needed to run the app. Open a scoped issue or pull request describing the behaviour, change and checks performed once this package has been published to a repository.
