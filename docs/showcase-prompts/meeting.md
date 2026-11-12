# ROOM 04 / One clear decision

## Copyable creative brief

You are an original motion designer and procedural 3D art director working in
Motion Forge. Create the following fictional short as a complete editable
version-1 project JSON. This is an invented story, not a claim about a real
product, landscape, meal, meeting or social campaign.

**Premise:** Four fictional teammates enter a meeting with separate ideas and leave with one visible decision, an owner and a next step.

**Delivery:** 1600x900, 24fps, three six-second shots (18 seconds total).
Keep shot order exactly as below. Preserve all embedded media markers and IDs.
Use original vector art, actual bundled symbols and editable procedural objects.
Output complete JSON, never scripts, pseudo-code or imaginary capabilities.
For final video render at 1280x720 or 1920x1080 with the deterministic exporter.

## Art direction

Refined strategy presentation, not a busy SaaS dashboard. Ink-violet space, lavender emphasis, mint completion. Use consistent card sizes, large readable editorial titles and a thin shared progress rail.

Palette: {"background":"#111326","surface":"#222741","accent":"#b6a2ff","secondary":"#77e3d8","text":"#f7f4ff","muted":"#acb4d2","line":"#45496b"}.
Use the seven palette tokens, not scattered arbitrary colours. Headlines:
72-82px, bold; hero metric: 120-150px; supporting copy: 24-30px; micro labels:
18-22px. Keep live text within 80px safe margins. Limit body copy to two lines.
Use explicit line breaks. Frame a left narrative column and right hero in the
technical/meeting/recipe scenes; scenery/social may use full-frame composition.
Use contrasting negative space, a consistent top chapter rail and a thin
bottom progress rail. No selection outlines in renders. Do not copy a brand.

## Storyboard, animation and timing

### Shot 1 / meeting-arrival / global 0-6s

Reveal four abstract head-and-body figures around a transparent table. Differently coloured teammates share a camera frame, not separate fake video-call feeds. Left cards give each discipline a concrete question.

Local timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.

### Shot 2 / meeting-decision / global 6-12s

Replace the meeting room with a three-part decision map: question, constraint, decision. Step connectors draw first, cards appear in order and travelling dots imply thought moving toward action. Preserve legible long-form labels in 80px-safe framing.

Local timing: 0-.8s establish atmosphere and settle the subject; .5-1.6s introduce the title; 1.2-3.8s reveal supporting details in staggered groups; 3.8-4.8s complete the camera/material/metric change; 4.8-6s hold the final readable composition. Every animation resets at the next scene. Use a motivated storyboard cut between shots, not an unsupported cross-scene transition.

### Shot 3 / meeting-action / global 12-18s

A glass decision tile and a reflective ring become a quiet emblem of alignment. Three final cards state the decision, owner and learning goal. Stop the camera at 4.5s and hold the final hand-off through 6s.

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

Abstract people use sphere/cylinder primitives. The table and final decision tile use transmission glass; the closing ring uses restrained liquidMetal reflection and a single mirror. All spatial motion is keyframed. No emotion recognition, real attendee analysis or real meeting recording is implied.

These are deterministic shader/material treatments, not a gravity/collision
solver, fluid dynamics, real volumetric smoke or recursive ray tracing.
Glass transmission/IOR refracts other objects in its own 3D viewport, not an
arbitrary video layer beneath it. Default geometry sizes are about 1 world unit.
The mirror is a horizontal plane at Y=-1.6; frame subjects above it.
Do not promise audio: the engine does not mix source-video sound.

## Required editable details

- Eight-part procedural team plus glass table with shared 3D lighting.
- Groups, text and rectangular decision cards; root step connectors and travelling particles.
- Real Lucide team/question/controls/check/owner/target symbols.
- Glass tile, reflective ring, camera orbit, cast shadows and mirror.

## Assets and references

- Working source: [meeting.motion.json](../../examples/showcase/meeting.motion.json).
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

- **meeting-arrival** / `undraw_meet-the-team_fau8.svg` / the team portrait that introduces the four voices. Box x1120 y60 330x157; foreground just beneath the chapter/title rails, enters at 0.8s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **meeting-arrival** / `undraw_sharing-ideas_toje.svg` / someone pinning the first idea to the wall. Box x540 y540 270x230; foreground just beneath the chapter/title rails, enters at 1.9s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **meeting-decision** / `undraw_decision-point_yhu3.svg` / a person choosing a path above the decision map. Box x1200 y70 250x240; foreground just beneath the chapter/title rails, enters at 1.6s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **meeting-decision** / `undraw_sorting-thoughts_b0kt.svg` / a facilitator sorting notes beneath the constraint. Box x600 y625 400x150; foreground just beneath the chapter/title rails, enters at 2.4s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **meeting-action** / `undraw_handshake-deal_nwk6.svg` / the hand-off sealed: a handshake above the plan. Box x1250 y60 200x148; foreground just beneath the chapter/title rails, enters at 1s with a scale; soft drop shadow (blur 28, Y 18, #00000040) and a still ellipse ground shadow (#0000002e); no idle motion.
- **meeting-action** / `undraw_next-task_jtbr.svg` / the owner reaching for the next task. Box x540 y560 300x210; foreground just beneath the chapter/title rails, enters at 2s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).
- **meeting-action** / `undraw_shared-goals_ijlg.svg` / the team leaving with a shared goal. Box x1150 y560 380x210; foreground just beneath the chapter/title rails, enters at 1.2s with a rise; soft drop shadow (blur 28, Y 18, #00000040) and a breathing ellipse ground shadow (#0000002e, scale 1 → .86 → 1); a 3.5% height float on y (0 → mid-scene → 6s, easeInOut).

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
node scripts\validate.cjs examples\showcase\meeting.motion.json
node scripts\render.cjs --project examples\showcase\meeting.motion.json --scene all --out renders\meeting.mp4 --format mp4 --width 1280 --height 720 --fps 24 --crf 18
```

FFmpeg must be installed locally. This file is a detailed human/LLM brief;
the accompanying JSON is a deterministic implementation authored with the
current engine. No external model service was called to generate it.
