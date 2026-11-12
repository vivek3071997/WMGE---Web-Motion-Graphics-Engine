# THE LITTLE TABLE / Golden-hour skillet

## Copyable creative brief

You are an original motion designer and procedural 3D art director working in
Motion Forge. Create the following fictional short as a complete editable
version-1 project JSON. This is an invented story, not a claim about a real
product, landscape, meal, meeting or social campaign.

**Premise:** Mira returns from an imagined evening market with one small basket and turns it into a warm tomato-chickpea skillet for a friend.

**Delivery:** 1600x900, 24fps, three six-second shots (18 seconds total).
Keep shot order exactly as below. Preserve all embedded media markers and IDs.
Use original vector art, actual bundled symbols and editable procedural objects.
Output complete JSON, never scripts, pseudo-code or imaginary capabilities.
For final video render at 1280x720 or 1920x1080 with the deterministic exporter.

## Art direction

Warm cookbook editorial. Cocoa background, terracotta-red produce, golden oil, pale ceramic, sage herbs. Macro-inspired framing with ample space, tactile shadows and one readable action per recipe card; never render fake food photography.

Palette: {"background":"#201515","surface":"#412a25","accent":"#ffbd72","secondary":"#b9d98a","text":"#fff2df","muted":"#d0b4a0","line":"#6b4636"}.
Use the seven palette tokens, not scattered arbitrary colours. Headlines:
72-82px, bold; hero metric: 120-150px; supporting copy: 24-30px; micro labels:
18-22px. Keep live text within 80px safe margins. Limit body copy to two lines.
Use explicit line breaks. Frame a left narrative column and right hero in the
technical/meeting/recipe scenes; scenery/social may use full-frame composition.
Use contrasting negative space, a consistent top chapter rail and a thin
bottom progress rail. No selection outlines in renders. Do not copy a brand.

## Storyboard, animation and timing

### Shot 1 / food-market / global 0-6s

Introduce the basket ingredients as glossy but illustrated procedural produce. Three staggered recipe cards establish cooked chickpeas, tomatoes, olive oil, garlic, lemon and herbs; state 2 servings without inventing health claims.

Local timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.

### Shot 2 / food-skillet / global 6-12s

A stylized cream bowl/pan assembles from flattened sphere and torus geometry. Tomato/chickpea pieces descend on authored easeOut trajectories; herb shapes settle on top. Warm seeded steam lifts above, without obscuring recipe steps.

Local timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.

### Shot 3 / food-table / global 12-18s

Present the completed dish with a slower overhead camera angle. A restrained warm halo frames the plate. The left column reveals finish instructions: lemon, herbs, share while warm. An original supplied image mark closes the editorial recipe.

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

Food geometry is a deliberately stylized composition of spheres, a torus rim, cone stem and cylinder tool. Ingredient drops are keyframed, not collision simulation. Steam uses the gas shader. Physical lighting and ceramic roughness create depth; no actual heat transfer or cooking simulation is implied.

These are deterministic shader/material treatments, not a gravity/collision
solver, fluid dynamics, real volumetric smoke or recursive ray tracing.
Glass transmission/IOR refracts other objects in its own 3D viewport, not an
arbitrary video layer beneath it. Default geometry sizes are about 1 world unit.
The mirror is a horizontal plane at Y=-1.6; frame subjects above it.
Do not promise audio: the engine does not mix source-video sound.

## Required editable details

- Grouped ingredient and process cards with real Lucide salad/cooking-pot/leaf/flame/timer glyphs.
- Procedural ingredients, shallow bowl, rim, garnish and staged falling motion.
- Gas steam with fixed seed, cast shadows and warm environment reflections.
- Editable recipe typography, halo circle and original supplied PNG seal.

## Assets and references

- Working source: [food.motion.json](../../examples/showcase/food.motion.json).
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

- **food-market** / `undraw_garden-harvest_r6yu.svg` / the harvest behind the basket, ghosted into the warm background. Box x640 y230 880x500; background plate at layer index 0, enters at 0s with a fade; opacity 0.16, no shadow; a slow linear parallax drift of 36px on x across the scene.
- **food-market** / `undraw_food-truck_my6o.svg` / a market stall pulling up with the day's produce. Box x1260 y610 270x160; foreground just beneath the chapter/title rails, enters at 1.8s with a slide; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **food-skillet** / `undraw_plants_md5c.svg` / fresh herbs waiting on the windowsill. Box x545 y610 260x150; foreground just beneath the chapter/title rails, enters at 1.2s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a still ellipse ground shadow (#0000002e); a gentle sway, rotation -1.6° → 1.6° → -1.6° (easeInOut).
- **food-skillet** / `undraw_hot-cocoa_64a7.svg` / the cook leaning in, warmed by the steam. Box x1330 y520 200x250; foreground just beneath the chapter/title rails, enters at 2.2s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **food-table** / `undraw_breakfast-together_vev0.svg` / two friends sharing the finished meal. Box x600 y560 330x210; foreground just beneath the chapter/title rails, enters at 1.4s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **food-table** / `undraw_special-occasion_ffh6.svg` / a dinner under string lights: the table keeps filling. Box x1350 y560 180x210; foreground just beneath the chapter/title rails, enters at 2.4s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).

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
node scripts\validate.cjs examples\showcase\food.motion.json
node scripts\render.cjs --project examples\showcase\food.motion.json --scene all --out renders\food.mp4 --format mp4 --width 1280 --height 720 --fps 24 --crf 18
```

FFmpeg must be installed locally. This file is a detailed human/LLM brief;
the accompanying JSON is a deterministic implementation authored with the
current engine. No external model service was called to generate it.
