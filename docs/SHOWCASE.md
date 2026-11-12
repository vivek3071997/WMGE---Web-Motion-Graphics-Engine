# Five original motion stories

Five imagined worlds, each told in **three six-second shots**. The set contains
five separate detailed authoring prompts, five portable editable projects,
15 preview images and five silent films in both MP4 and WebM.

Run `npm start`, then open the [local story theatre](http://127.0.0.1:4173/examples/showcase/).
Choose a story, play from any shot, read its brief or open its editable master.
The theatre can continue through all five stories: **90 seconds total**.
It requires local HTTP serving; the main editor still works directly from disk.

## Stories and separate prompts

| Theme | Original story and three-shot arc | Detailed prompt | Editable master | Finished film |
| --- | --- | --- | --- | --- |
| Technology | **LUMEN / The city wakes.** A sleeping processor assembles, connects sensors into a decision network and launches over an original moving plate. | [Technology](showcase-prompts/technology.md) | [JSON](../examples/showcase/technology.motion.json) | [MP4](../examples/showcase/renders/technology.mp4) / [WebM](../examples/showcase/renders/technology.webm) |
| Scenery | **AER / The valley that remembers.** Dawn reveals a layered valley; a paper bird crosses a misty lake and discovers a floating glass observatory. | [Scenery](showcase-prompts/scenery.md) | [JSON](../examples/showcase/scenery.motion.json) | [MP4](../examples/showcase/renders/scenery.mp4) / [WebM](../examples/showcase/renders/scenery.webm) |
| Food / recipe | **THE LITTLE TABLE / Golden-hour skillet.** Mira brings home a market basket, makes an illustrated tomato-chickpea dish and sets another place for a friend. | [Food](showcase-prompts/food.md) | [JSON](../examples/showcase/food.motion.json) | [MP4](../examples/showcase/renders/food.mp4) / [WebM](../examples/showcase/renders/food.webm) |
| Meeting | **ROOM 04 / One clear decision.** Four invented teammates share perspectives, align question and constraint, then leave with a decision, owner and next step. | [Meeting](showcase-prompts/meeting.md) | [JSON](../examples/showcase/meeting.motion.json) | [MP4](../examples/showcase/renders/meeting.mp4) / [WebM](../examples/showcase/renders/meeting.webm) |
| Social | **THE LONG TABLE / A small kindness travels.** A neighborhood invitation moves between doorways and becomes a shared evening table. | [Social](showcase-prompts/social.md) | [JSON](../examples/showcase/social.motion.json) | [MP4](../examples/showcase/renders/social.mp4) / [WebM](../examples/showcase/renders/social.webm) |

Each prompt includes the premise, art direction, palette, composition, shot-by-shot
timing, choreography, materials, editable requirements, asset references,
acceptance criteria and reproduction command. These are original briefs with
directly authored executable implementations, **not an external AI-model benchmark**.
Read the linked project alongside the brief for exact object positions and tracks.

## Coverage

The five narratives collectively use all **14 layer types**, all **seven
procedural geometries**, and all **five material/effect families**. Coverage is
shared across the set, rather than forcing every feature into every shot.

| Capability | Where to look |
| --- | --- |
| Text, rectangles, circles, groups | All five stories: editorial rails, staged cards, particles and composition |
| Material icon | Technology shot 1: editable `memory` glyph |
| Lucide symbols | All five: processor, reasoning, recipe, team and community symbols |
| Embedded image | Food shot 3: original Forge PNG mark |
| Root connectors and travelling particles | Technology shot 2, meeting shot 2, social shot 2 |
| Custom SVG paths | Technology signal trace; scenery mountains, bird and curved trail |
| Counter and chart | Technology shot 3: illustrative progress, not measured performance |
| Embedded video with motion-graphics overlay | Technology shot 3: original silent synthetic moving plate |
| 3D scenes | Procedural assemblies, observatory, food, abstract teammates and shared table |
| Standalone effect layer | Scenery mist and food steam: fixed-seed gas |
| Box, knot, torus | Technology chip and reflected launch artifact |
| Plane, cylinder, sphere, cone | Scenery lake/observatory; food ingredients and utensils |
| Standard material | Ceramic, produce, architectural pieces, furniture and abstract people |
| Glass transmission/refraction | Technology cover/orbit, observatory dome, meeting table/tile, social lantern |
| Water | Scenery shot 2: animated horizontal lake plane |
| Liquid metal | Technology launch knot and meeting closing ring |
| Gas | Scenery mist and food steam, through the standalone gas effect |
| Lighting, cast shadows, one planar mirror | Multiple 3D hero compositions; technology, scenery and meeting mirror shots |
| Deterministic motion | Layer/object tracks, camera arcs, parallax, path drawing, staged arrivals and final holds |
| Scene styles | Technical product film, illustrated landscape, recipe sequence, spatial facilitation and community story |

The stories use radial and linear backgrounds. For **every** background mode,
all four standalone effect presets and the six original technical templates,
see the complementary [35-scene cookbook](EXAMPLE_COOKBOOK.md).

## Production and reproduction

Editable masters are **1600x900 at 24 fps**. The supplied viewing reels are
**1280x720 at 24 fps**, exactly **432 frames / 18 seconds each**.
MP4 uses H.264, CRF 18 and `medium`; WebM uses VP9, CRF 28.
The WebM viewing copy is transcoded from the high-quality MP4. Render directly
from the project when producing a new delivery master.

From the project directory, with optional tooling already installed:

```powershell
npm run build:showcase
npm run test:showcase
node scripts\render-showcase.cjs
npm start
```

With the server running and the reels built, run `npm run test:showcase:gallery`
in another terminal to check all five video players, shot seeking, links,
automatic continuation, editor loading and mobile layout.

FFmpeg must be installed locally and available on PATH; alternatively pass its
executable as the first argument to the showcase renderer. Existing videos are
never overwritten. The renderer creates the ten videos and a
[decode verification report](../examples/showcase/renders/verification.json).
Renders are local generated deliverables and are ignored by Git; regenerate
them after a fresh clone. Prompt documents, projects, gallery and previews are
retained independently.

To produce an individual 1080p master in a new output location:

```powershell
node scripts\render.cjs --project examples\showcase\scenery.motion.json --scene all --out renders\scenery-1080p.mp4 --format mp4 --width 1920 --height 1080 --fps 24 --crf 18 --preset medium
```

See [export recipes](EXPORT.md) for codec and 4K options. Do not upscale the
720p video when you can rerender the editable source.

## Optional illustration depth (local unDraw files)

Each story in the [showcase manifest](../examples/showcase/manifest.json) has an
`illustrations` plan (37 placements in total, 6–11 per story), and every prompt
ends with an "Illustration depth layer" section that names each file, box,
timing, motion and depth position.
The committed projects, previews and reels contain no unDraw artwork.

When `assets/undraw-local/` contains your own manually downloaded unDraw SVGs
(run `npm run index:illustrations` after adding files), opening
`http://127.0.0.1:4173/?demo=<technology|scenery|food|meeting|social>` imports
the planned files at runtime, recoloured to the story accent and credited. Each
file is imported once per story and rasterised for its largest box at 4K width.

Placement fields:

| Field | Values | Effect |
| --- | --- | --- |
| `layer` | `front` (default), `mid`, `back` | `front` sits above the scene, under the rails; `mid`/`back` use `index` to slot between scene layers (for example between mountain ridges or behind water). `back` is a faded plate. |
| `distant` | `true` | No ground shadow; reads as atmospheric distance. |
| `motion` | `float`, `sway`, `drift`, `none` | Float bobs with a breathing ground shadow; sway rocks ±1.6°; drift pans `drift` px (default 18 front, 36 back, 22 distant). |
| `enter` | `none`, `fade`, `rise`, `slide`, `scale` | Entrance style; otherwise front placements rise and back placements fade. |
| `start`, `end` | seconds | Staggered entrances and timed exits (0.6 s fade-out). |
| `opacity` | 0–1 | Final opacity. |

Missing files are skipped. Add `&illustrations=0` to
the URL to load the original story without them. That folder is ignored by Git;
unDraw's license does not allow redistributing or bundling the artwork.

The editor preview skips a video layer the browser cannot decode and shows a
one-time notice. For example, the VS Code embedded browser cannot play WebM.
Export stays strict, so render in Chrome or Edge or with `scripts/render.cjs`.

## What the effects do, and do not do

- Geometry is composed from procedural primitives, not external meshes.
- Glass uses physical transmission/IOR inside its own 3D viewport; it does not
  refract an arbitrary video layer underneath that viewport.
- Mirror shots use a single reflected-camera pass, not recursive ray tracing.
- Water/metal deformation and seeded gas are stylized deterministic shaders.
  Falling ingredients and seating arrivals are authored tracks, not gravity,
  collision, fluid, aerodynamic or heat-transfer simulations.
- Films are silent. No source-audio mixing or soundtrack is included.
- People, locations, product, metrics and events are fictional. The recipe is
  an illustrative presentation, not a cooking timer or dietary claim.
- All assets are local: original vector compositions, the project's original
  PNG mark, generated abstract footage and licensed bundled icon/3D libraries.
  No personal footage, external font, CDN or model-service call is used.

## Validation

The preview check validates every project and samples all 15 shots at
0, 0.8, 2, 4 and 5.9 seconds: **75 timeline samples**. It checks text bounds,
revisits a timestamp after seeking backwards, and saves three previews per
story. Video validation decodes each MP4 and WebM and requires 432 frames.
These checks do not certify every browser, font or arbitrary project.
