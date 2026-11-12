# AER / The valley that remembers

## Copyable creative brief

You are an original motion designer and procedural 3D art director working in
Motion Forge. Create the following fictional short as a complete editable
version-1 project JSON. This is an invented story, not a claim about a real
product, landscape, meal, meeting or social campaign.

**Premise:** A paper bird follows the first light across a quiet valley and discovers an observatory floating above a luminous lake.

**Delivery:** 1600x900, 24fps, three six-second shots (18 seconds total).
Keep shot order exactly as below. Preserve all embedded media markers and IDs.
Use original vector art, actual bundled symbols and editable procedural objects.
Output complete JSON, never scripts, pseudo-code or imaginary capabilities.
For final video render at 1280x720 or 1920x1080 with the deterministic exporter.

## Art direction

Poetic illustrated travel film. Deep teal atmosphere, warm paper-gold sunrise, mint lake light. Prioritize a layered graphic landscape over photorealism. Keep mountain silhouettes clean; do not put text over busy wave detail.

Palette: {"background":"#081c2c","surface":"#153e50","accent":"#f7c882","secondary":"#6de3cf","text":"#edfbff","muted":"#a7c7c9","line":"#32606c"}.
Use the seven palette tokens, not scattered arbitrary colours. Headlines:
72-82px, bold; hero metric: 120-150px; supporting copy: 24-30px; micro labels:
18-22px. Keep live text within 80px safe margins. Limit body copy to two lines.
Use explicit line breaks. Frame a left narrative column and right hero in the
technical/meeting/recipe scenes; scenery/social may use full-frame composition.
Use contrasting negative space, a consistent top chapter rail and a thin
bottom progress rail. No selection outlines in renders. Do not copy a brand.

## Storyboard, animation and timing

### Shot 1 / scenery-dawn / global 0-6s

Establish three layered mountain silhouettes, a pale sun and distant bird marks. The far ridge shifts 20px while the closer ridge shifts 30px oppositely: depth comes from measured parallax, not a random zoom. The title occupies sky, not the mountains.

Local timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.

### Shot 2 / scenery-crossing / global 6-12s

A warmer sun settles above the lake. A small original paper-bird path travels on a curved route; a fine golden trail writes behind it. Low-opacity seeded gas creates mist while a separate water viewport ripples across the lower composition.

Local timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.

### Shot 3 / scenery-observatory / global 12-18s

The camera reveals a cream circular platform, teal glass dome, gold orbital ring and beacon. Stars drift behind; glass and a horizontal mirror catch light. A left-aligned two-line statement resolves beside the artifact.

Local timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.


## Choreography rules

1. Recompute every frame from absolute scene time. All layer/object keyframes
   are local to the six-second scene, including their first and last holds.
2. Put atmosphere and root connectors behind cards. Cards are parent groups
   with local child positions; 3D/video/effect/line layers stay at root level.
3. Use slow camera arcs (approximately -18 to 24 degrees over 4.5s) and a final hold,
   not a spinning camera competing with typography. Object turns are degrees;
   automatic object Y speed is radians/second.
4. EaseOut for reveals, easeInOut for camera/shape changes, linear for particles
   and progress. Matching loop endpoints prevent a jump; no random per-frame state.
5. Avoid entering the whole scene at once: stage at 0, title at .2, card 1 at .6,
   card 2 at 1.1, card 3 at 1.6. Maintain final visible details through 6s.
6. Layer shadows: use blur 16-32px, offsetY 8-16px and restrained alpha. Keep
   glass behind labels rather than lowering their contrast. 3D cast shadows
   require ground:true; planar mirror is one optional reflected-camera pass.
7. Respect exact schema fields. Use no external URLs, CSS, executable
   expressions, arbitrary mesh imports, sound/music tracks or unimplemented physics.

## Materials, optics and physics-style effects

Lake waves are deterministic vertex deformation on a horizontal water plane. Mist is a low-opacity seeded shader proxy, not volumetric simulation. The observatory uses cylinder/sphere/torus/cone geometry, glass transmission and one mirror pass; the bird follows authored keyframes rather than aerodynamics.

These are deterministic shader/material treatments, not a gravity/collision
solver, fluid dynamics, real volumetric smoke or recursive ray tracing.
Glass transmission/IOR refracts other objects in its own 3D viewport, not an
arbitrary video layer beneath it. Default geometry sizes are about 1 world unit.
The mirror is a horizontal plane at Y=-1.6; frame subjects above it.
Do not promise audio: the engine does not mix source-video sound.

## Required editable details

- Original landscape SVG paths with near/far parallax.
- Circle sun, drifting firefly particles, authored paper-bird path and curved trail.
- Standalone gas atmosphere and shared-scene water material.
- Multi-part procedural observatory, glass dome, camera approach and mirror.

## Assets and references

- Working source: [scenery.motion.json](../../examples/showcase/scenery.motion.json).
- Current format: [scene-format.md](../../references/scene-format.md).
- Exact schema: [project.schema.json](../../references/project.schema.json).
- Agent workflow: [SKILL.md](../../agent/motion-forge/SKILL.md).
- `seal` is the original supplied PNG mark; keep its embedded bytes/marker.
- `city` is an original silent synthetic moving plate, not real location footage.
  Keep its embedded bytes/marker. Use only if this shot calls for video.
- Choose real Material icon IDs or Lucide names from the editor-generated prompt.

## Illustration depth layer (optional, your local unDraw files)

These shots gain a hand-drawn human layer from flat unDraw illustrations that
**you download yourself** from https://undraw.co and place in
`assets/undraw-local/` (git-ignored; never commit, bundle or redistribute them,
and never fetch them automatically). If a file is missing, skip that placement
and keep the rest of the shot unchanged.

For each placement: import the SVG through the editor (Image source → unDraw),
recolour unDraw's `#6C63FF` accent to the palette accent, keep the asset credit
"Illustration from unDraw (https://undraw.co), used under the unDraw License",
and fit it inside the box, bottom-centred, without stretching. Rasterise each
file at 2.4x its largest box so 4K exports stay crisp, and reuse one asset when
a file appears twice.

- **scenery-dawn** / `undraw_wind-turbines_sq2c.svg` / turbines turning on a far ridge, half hidden by the mountains for atmospheric depth. Box x820 y290 230x190; mid-ground at layer index 1, enters at 0.6s with a fade; opacity 0.45, no shadow; a slow linear parallax drift of 22px on x across the scene.
- **scenery-dawn** / `undraw_autumn-walk_x17u.svg` / a walker on the near ridge giving the valley human scale. Box x1150 y440 370x330; foreground just beneath the chapter/title rails, enters at 1s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **scenery-crossing** / `undraw_travel-destination_d2a9.svg` / the far shore: a village and pin across the water. Box x90 y400 360x140; mid-ground at layer index 14, enters at 1.2s with a fade; opacity 0.55, no shadow; a slow linear parallax drift of 22px on x across the scene.
- **scenery-crossing** / `undraw_exploring_d1vd.svg` / an explorer on the far shore where the paper bird lands. Box x1200 y470 330x300; foreground just beneath the chapter/title rails, enters at 2.4s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **scenery-observatory** / `undraw_finding-the-way_qp1z.svg` / a traveller looking up at the floating observatory. Box x540 y470 170x300; foreground just beneath the chapter/title rails, enters at 1.2s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **scenery-observatory** / `undraw_travel-mode_103y.svg` / a newcomer arriving with a suitcase, staying to protect the valley. Box x1350 y520 180x250; foreground just beneath the chapter/title rails, enters at 2.2s with a slide; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).

Depth order, back to front: background illustration plates, atmosphere and 3D,
distant shadowless figures that drift slowly (parallax), cards and diagrams,
foreground illustrations with ground shadows, then the chapter rail, title and
progress bar. Stagger entrances so each shot reads in order: headline, hero,
supporting copy, then the human vignettes. Illustrations never cover headlines,
card copy or the 3D hero. Open `?demo=<story>` with `npm start` to see the
plan applied automatically; add `&illustrations=0` to compare without it.

## Quality and acceptance checks

Validate the complete JSON, then render all shots at 0/.8/2/4/5.9 seconds.
Revisit 4 seconds after seeking backwards; the image must be stable on the same
renderer. Check titles at actual delivery size, ensure cards are not clipped,
objects are not hidden by their own viewport, shadows do not crush detail,
connectors follow the intended nodes and label ordering matches the story.
Keep narrative claims explicitly fictional or illustrative. No unsupported
effect may be silently substituted. Deliver editable JSON plus a silent
MP4/WebM reel, and accurately report the checks actually performed.

## Reproduce the supplied implementation

```powershell
node scripts\validate.cjs examples\showcase\scenery.motion.json
node scripts\render.cjs --project examples\showcase\scenery.motion.json --scene all --out renders\scenery.mp4 --format mp4 --width 1280 --height 720 --fps 24 --crf 18
```

FFmpeg must be installed locally. This file is a detailed human/LLM brief;
the accompanying JSON is a deterministic implementation authored with the
current engine. No external model service was called to generate it.
