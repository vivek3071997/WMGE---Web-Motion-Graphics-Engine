# Motion Forge authoring and maintenance

For a request to make a motion graphic, read `agent/motion-forge/SKILL.md`, then the relevant parts of `references/scene-format.md`. Produce editable project JSON plus rendered previews when your environment supports rendering. Chat-only models should produce complete JSON that the user can validate and import.

For engine development, keep `src/engine.js` deterministic and independent of the browser DOM. Scene files are data; never execute JavaScript, HTML, remote fetches or arbitrary expressions from a project. Extend validation, JSON Schema, documentation and meaningful tests together when changing the scene format. Maintain version-1 compatibility or introduce an explicit migration.

The editor must remain usable offline by opening `index.html`. Do not introduce CDN fonts, trackers, API keys, model-service dependencies or a required bundler. Preserve Material icon licensing and provenance. Keep user projects, research, personal media, exported renders and machine-specific paths out of distributable source.

Useful checks: `npm test`, `npm run test:browser`, `node scripts/validate.cjs project.json`. Browser testing needs Playwright; `BROWSER_PATH` may point to a locally installed Chrome. Test output belongs in the ignored `test-output/` directory. Publication to a repository or a hosted service requires an explicit request; creating local files is sufficient for authoring tasks.
