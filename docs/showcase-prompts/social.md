# THE LONG TABLE / A small kindness travels

## Copyable creative brief

You are an original motion designer and procedural 3D art director working in
Motion Forge. Create the following fictional short as a complete editable
version-1 project JSON. This is an invented story, not a claim about a real
product, landscape, meal, meeting or social campaign.

**Premise:** A handwritten invitation in an imaginary neighborhood travels from one doorway to the next until strangers build a shared evening table.

**Delivery:** 1600x900, 24fps, three six-second shots (18 seconds total).
Keep shot order exactly as below. Preserve all embedded media markers and IDs.
Use original vector art, actual bundled symbols and editable procedural objects.
Output complete JSON, never scripts, pseudo-code or imaginary capabilities.
For final video render at 1280x720 or 1920x1080 with the deterministic exporter.

## Art direction

Warm community editorial. Forest-green ink, cream paper, honey-gold light and fresh mint. Use human-scale objects, gentle easing and generous breathing room; no fake platform metrics, notification spam or political advocacy.

Palette: {"background":"#0f2022","surface":"#20383a","accent":"#ffe08a","secondary":"#92e6c6","text":"#fff9e9","muted":"#b6ccc2","line":"#42605b"}.
Use the seven palette tokens, not scattered arbitrary colours. Headlines:
72-82px, bold; hero metric: 120-150px; supporting copy: 24-30px; micro labels:
18-22px. Keep live text within 80px safe margins. Limit body copy to two lines.
Use explicit line breaks. Frame a left narrative column and right hero in the
technical/meeting/recipe scenes; scenery/social may use full-frame composition.
Use contrasting negative space, a consistent top chapter rail and a thin
bottom progress rail. No selection outlines in renders. Do not copy a brand.

## Storyboard, animation and timing

### Shot 1 / social-invitation / global 0-6s

Show a warmly lit note floating over a geometric neighborhood silhouette. The paper rotates slowly into place, with a large dark invitation headline. Keep the handwritten-story feeling without requiring external fonts.

Local timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.

### Shot 2 / social-ripple / global 6-12s

The invitation moves into a wide social graph of four contrasting circular nodes. Draw connections in three phases; each node carries a real local symbol for care, conversation, growth or home. Use measured travelling particles and meaningful labels.

Local timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.

### Shot 3 / social-table / global 12-18s

Reveal a stylized shared table and six abstract neighbors arriving at staggered times. A small refractive lantern marks the centre, warm particles suggest evening, and the final line holds: There is room for one more.

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

Paper movement and seating arrivals are authored transforms, not rigid-body simulation. A shared 3D scene supplies physical light, a glass lantern and cast shadows. Connection dots and warm motes are deterministic visual metaphors, not a real social-network simulation.

These are deterministic shader/material treatments, not a gravity/collision
solver, fluid dynamics, real volumetric smoke or recursive ray tracing.
Glass transmission/IOR refracts other objects in its own 3D viewport, not an
arbitrary video layer beneath it. Default geometry sizes are about 1 world unit.
The mirror is a horizontal plane at Y=-1.6; frame subjects above it.
Do not promise audio: the engine does not mix source-video sound.

## Required editable details

- Original vector skyline, rotating invitation card and oversized editable text.
- Circle nodes, Lucide heart-handshake/message-circle/sprout/house glyphs and linked Bezier paths.
- Multi-part 3D table/people/lantern, group cards and warm particle atmosphere.
- Fiction labels and a final hold preserve narrative clarity without fabricated impact claims.

## Assets and references

- Working source: [social.motion.json](../../examples/showcase/social.motion.json).
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

- **social-invitation** / `undraw_message-sent_iyz6.svg` / a paper plane carrying the note across the skyline. Box x1190 y60 200x170; foreground just beneath the chapter/title rails, enters at 2.4s with a slide; soft drop shadow (blur 28, Y 18, #00000040) and a still ellipse ground shadow (#0000002e); a slow linear parallax drift of 60px on x across the scene.
- **social-invitation** / `undraw_walking-the-dog_cjob.svg` / a neighbour passing by just as the note arrives. Box x470 y580 220x190; foreground just beneath the chapter/title rails, enters at 1.6s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **social-invitation** / `undraw_mail-sent_dagx.svg` / the invitation being sent beside the paper note. Box x1320 y500 210x230; foreground just beneath the chapter/title rails, enters at 1.5s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **social-ripple** / `undraw_group-chat_nze2.svg` / neighbours talking as the kindness spreads. Box x1200 y60 250x164; foreground just beneath the chapter/title rails, enters at 1.8s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **social-ripple** / `undraw_love-note_c4fs.svg` / A NOTE: the handwritten card. Box x160 y640 170x135; foreground just beneath the chapter/title rails, enters at 1s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a still ellipse ground shadow (#0000002e); a gentle sway, rotation -1.6° → 1.6° → -1.6° (easeInOut).
- **social-ripple** / `undraw_casual-chat_4byz.svg` / A CONVERSATION: two people on a bench. Box x500 y640 170x135; foreground just beneath the chapter/title rails, enters at 1.6s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a still ellipse ground shadow (#0000002e); a gentle sway, rotation -1.6° → 1.6° → -1.6° (easeInOut).
- **social-ripple** / `undraw_order-delivered_gy61.svg` / A LITTLE HELP: a delivery to a neighbour's door. Box x840 y640 170x135; foreground just beneath the chapter/title rails, enters at 2.2s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a still ellipse ground shadow (#0000002e); a gentle sway, rotation -1.6° → 1.6° → -1.6° (easeInOut).
- **social-ripple** / `undraw_sweet-home_b054.svg` / A PLACE TO MEET: the house with the light on. Box x1180 y640 170x135; foreground just beneath the chapter/title rails, enters at 2.8s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a still ellipse ground shadow (#0000002e); a gentle sway, rotation -1.6° → 1.6° → -1.6° (easeInOut).
- **social-table** / `undraw_together_gsr6.svg` / people gathered at the shared evening table. Box x1250 y60 200x156; foreground just beneath the chapter/title rails, enters at 1.4s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **social-table** / `undraw_dancing_lvv0.svg` / someone dancing as the evening warms up. Box x590 y540 220x230; foreground just beneath the chapter/title rails, enters at 2.4s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a still ellipse ground shadow (#0000002e); a gentle sway, rotation -1.6° → 1.6° → -1.6° (easeInOut).
- **social-table** / `undraw_group-selfie_uih0.svg` / friends taking a group photo at the end of the table. Box x1370 y480 160x290; foreground just beneath the chapter/title rails, enters at 1.8s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).

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
node scripts\validate.cjs examples\showcase\social.motion.json
node scripts\render.cjs --project examples\showcase\social.motion.json --scene all --out renders\social.mp4 --format mp4 --width 1280 --height 720 --fps 24 --crf 18
```

FFmpeg must be installed locally. This file is a detailed human/LLM brief;
the accompanying JSON is a deterministic implementation authored with the
current engine. No external model service was called to generate it.
