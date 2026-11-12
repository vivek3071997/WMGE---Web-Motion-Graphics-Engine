# Editor guide

## Demos

Click **▶ Demos** in the top bar to browse the ready-made demos. **Watch** plays a demo from 0:00, using its MP4 if one has been rendered and the live engine otherwise. **Open in studio** loads it for editing. Loading a project or selecting a scene always resets the playhead to 0:00.

## Backgrounds and colour

Open **Scene & theme**. Select a solid colour, a two-colour linear/radial gradient or transparency. The grid is independent of background style. The five palette buttons replace all seven project theme colours. Each colour can be edited separately.

Select an element and edit Fill or Stroke. A value such as `$accent` stays linked to the project palette. A hex colour such as `#ffb26b` is a local override. The seven swatches assign theme tokens to a layer's fill. Picking a custom colour replaces its token with a hex value.

## Complex diagrams

Add a group, then assign related layers to it using **Parent group**. Their x/y values become local positions. Give the group an appropriate width and height before rotating/scaling it. Alt-drag a child to move the immediate group. The layer list marks children with an indent; it is a flat list, so use clear names for deeply nested structures.

Connectors can link any non-connector layer through JSON; the inspector offers root nodes as a convenient starting point. Pick endpoint sides and straight, Bézier or step routing. A connector follows animated target transforms. Place it behind cards using the layer-order arrows. For custom routing, use a path layer and SVG path data.

The editor offers a lightweight layer/timeline workflow; it does not yet provide multi-selection, snap alignment, a Bézier handle editor, drag-to-reorder layers, freeform vector drawing or arbitrary shape masks. Use JSON or extend the engine for those needs.

## Images and icons

Open **Assets** and upload files. Add creates a new image layer; Replace changes the currently selected image layer. Choose contain, cover or stretch in the inspector. Transparent logos work best as PNG/WebP with Corner radius set to zero. Remove unused assets using ×; assets still referenced by a scene cannot be removed accidentally.

SVG imports are rasterised at 2048 px and keep transparency. For unDraw illustrations, download the SVGs you want from undraw.co, set **Image source** to **unDraw**, keep **Recolour unDraw accent** ticked to match your theme, upload, then click **Depth** on the asset card for a layered, floating placement. Motion Forge never downloads or bundles unDraw files. **Local illustrations:** put SVGs you downloaded yourself in `assets/undraw-local/` (git-ignored, never committed or redistributed), run `npm run index:illustrations`, then open the app with `npm start`; the Assets panel lists them with search and adds one with recolour, credit and depth in a click. The folder is not available from `file://`. `npm run import:illustrations -- [--move] <files or folder>` copies your own downloads into that folder with safe file names, skips identical files and re-indexes. The folder also accepts PNG, JPEG and WebP files. SVGs that use simple `.class { fill: … }` style blocks are supported; other CSS is rejected. If a detailed SVG is rejected, export it as a transparent PNG from your design tool. The engine does not download external images or logos. Images sent to a remote LLM are your choice; the built-in prompt omits their binary payloads and sends only names/IDs/metadata when you manually copy it.

Search Material icons by names such as `memory`, `cloud`, `settings`, `code`, `storage`, `public`, `science`, `analytics`, `layers` or `rocket launch`. Click to add. Icons stay vector and inherit the layer fill.

## 3D, materials and advanced starters

Choose **Advanced starter** in Layers for Glass & mirror, Liquid metal, Water
surface, Atmospheric gas or Animated shadows. **3D scene** adds a procedural
composition; Gas/Water/Metal/Glass buttons add standalone effect layers.

In the 3D layer inspector, set camera distance, azimuth, elevation, field of
view, light intensity/colour, shadow-receiving ground and the single planar
mirror. Expand an object to edit geometry, material, colour, world-space
position, independent axis scales and rotations. **Add 3D object** constructs
multi-part models. Object speed adds Y rotation in radians/second. No arbitrary
mesh editing or external-model import is included.

Object keyframe controls add a value at the current playhead. Seek first,
then select a property/value and add/update its key. Key times use scene
seconds. Edit/remove individual keys through AI workspace JSON; **Clear object
keyframes** clears all tracks for that object. The regular layer keyframe
controls also animate the 3D camera and light intensity.

Materials use a local procedural environment for reflective highlights. Glass
transmits/refracts other objects in its 3D scene, not video underneath the
viewport. Water, gas and metal are stylized procedural animations, not fluid
simulations. A mirror performs one planar reflection pass. Large 3D scenes
require suitable WebGL hardware; failures appear explicitly on the stage.

Every ordinary layer has a **Shadow** section. Set blur greater than zero,
offsets and colour; blur and offsets can also be keyframed. Lucide symbols
are available via **Assets -> Library -> Lucide**, alongside Material Icons.

## Custom video and high-quality export

Use **Assets -> Add custom video** for MP4/WebM up to 100 MB. The editor places
it behind the current graphics. Select it to adjust source trim, playback
rate, contain/cover/stretch and source looping. Reorder it like any layer.
Non-looped clips hold the last frame. Footage is muted; original audio is
not mixed into exports.

Video bytes are embedded in JSON. Large projects may exceed browser autosave
capacity: download **Project JSON** as a durable backup. Keep original media
separately. Browser format controls show only containers actually supported
by the installed browser, never a renamed WebM masquerading as MP4. Choose
the recording bitrate up to 100 Mbps. Heavy scenes should use deterministic
FFmpeg export instead of real-time capture; see [EXPORT.md](EXPORT.md).

Mixed 3D/video scenes export to PNG or video. SVG export is available only
for wholly 2D scenes so it cannot silently discard composited content.

## Motion and timing

Use Start/End for visibility, Entrance for a reveal and Exit fade for ending a shot. In Keyframes, choose the property, target time and value. **Add / update** replaces a key at that time or creates one. The first track creates a second baseline key so it can interpolate. Use the ↻ button on a track to toggle looping, or × to remove it. For deletion of individual keys, use the validated JSON editor.

Space toggles playback. The timeline slider seeks. A line indicates the current timestamp in each row; diamonds show key times. The current scene loops when Loop is selected. The storyboard exporter can combine all scenes; interactive playback stays on the selected scene.

## Shortcuts and recovery

| Action | Shortcut |
| --- | --- |
| Play / pause | Space, outside inputs |
| Undo / redo | Ctrl/Cmd Z / Ctrl/Cmd Shift Z |
| Nudge selected layer | Arrow keys; Shift for 10 px |
| Delete selected layer | Delete / Backspace, outside inputs |
| Move immediate group from child | Alt-drag |
| Leave clean preview | Escape |

Undo history is bounded to 30 edits and approximately 32 MB of JSON snapshots, retaining at least the latest edit. Very large images reduce available history. Download project JSON for durable backups. Browser autosave is local to the browser and page origin; changing folders or browsers can make previous autosave unavailable. Loading a new project through the editor is undoable. There is no server backup, shared editing or cloud sync.

## AI changes

**Smart director.** A one-line brief is enough. The readout under the brief shows what the director understood: genre, title, length and scenes, theme and colours, beats, items, figures and the illustrations it will use. Click a quick-start chip to see examples.

- To steer the result, add any of these to the brief: a quoted title (`"Pancake Sunday"`), a length (`30 seconds`, `5 scenes`), colours (`in teal and gold`), a mood (`light theme`, `warm`, `calm`, `neon`, `premium`), materials (`glass`, `liquid metal`, `water`, `gas`, `mirror`, `3D`, or `no 3D`), a list after a colon (`: flour, eggs, milk`) and real figures (`42% growth`, `$3.5m revenue`). Figures are never invented.
- **✦ Build it for me** replaces the project with the director's build, then places illustrations. Each is a separate undo step.
- **Add illustration depth** (or **✦ Auto-add illustration depth** in Assets) leaves your layers untouched. It adds one matched illustration to every scene that has no credited illustration yet.
- **Copy smart prompt** sends an LLM the expanded production brief, the illustration plan and the director's draft. Untick **Include director draft** to send the current project instead. An LLM may return `{"project": {...}, "illustrations": [{"scene", "file", "x", "y", "width", "height", "index", "layer", "motion", "start"}]}`. The editor applies the project, then imports each named local file once with recolour, shadow and float.

The generated prompt describes supported fields and includes the current project with image-preservation markers. Paste the full returned JSON, then Validate. Error messages identify the field to fix. Apply replaces the project with an undo snapshot. Prompts and imported scene files are data for this app; the app does not evaluate model-generated code.

When using a separate coding assistant, give it the repository agent instructions and validate its saved project before import. Do not substitute a Markdown explanation for complete JSON, omit image assets or invent unsupported properties such as arbitrary CSS animations.
