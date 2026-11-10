# Editor guide

## Backgrounds and colour

Open **Scene & theme**. Select a solid colour, a two-colour linear/radial gradient or transparency. The grid is independent of background style. The five palette buttons replace all seven project theme colours. Each colour can be edited separately.

Select an element and edit Fill or Stroke. A value such as `$accent` stays linked to the project palette. A hex colour such as `#ffb26b` is a local override. The seven swatches assign theme tokens to a layer's fill. Picking a custom colour replaces its token with a hex value.

## Complex diagrams

Add a group, then assign related layers to it using **Parent group**. Their x/y values become local positions. Give the group an appropriate width and height before rotating/scaling it. Alt-drag a child to move the immediate group. The layer list marks children with an indent; it is a flat list, so use clear names for deeply nested structures.

Connectors can link any non-connector layer through JSON; the inspector offers root nodes as a convenient starting point. Pick endpoint sides and straight, Bézier or step routing. A connector follows animated target transforms. Place it behind cards using the layer-order arrows. For custom routing, use a path layer and SVG path data.

The editor offers a lightweight layer/timeline workflow; it does not yet provide multi-selection, snap alignment, a Bézier handle editor, drag-to-reorder layers, freeform vector drawing or arbitrary shape masks. Use JSON or extend the engine for those needs.

## Images and icons

Open **Assets** and upload files. Add creates a new image layer; Replace changes the currently selected image layer. Choose contain, cover or stretch in the inspector. Transparent logos work best as PNG/WebP with Corner radius set to zero. Remove unused assets using ×; assets still referenced by a scene cannot be removed accidentally.

Simple SVG imports are rasterised and keep transparency. If a detailed SVG is rejected, export it as a transparent PNG from your design tool. The engine does not download external images or logos. Images sent to a remote LLM are your choice; the built-in prompt omits their binary payloads and sends only names/IDs/metadata when you manually copy it.

Search Material icons by names such as `memory`, `cloud`, `settings`, `code`, `storage`, `public`, `science`, `analytics`, `layers` or `rocket launch`. Click to add. Icons stay vector and inherit the layer fill.

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

The generated prompt describes supported fields and includes the current project with image-preservation markers. Paste the full returned JSON, then Validate. Error messages identify the field to fix. Apply replaces the project with an undo snapshot. Prompts and imported scene files are data for this app; the app does not evaluate model-generated code.

When using a separate coding assistant, give it the repository agent instructions and validate its saved project before import. Do not substitute a Markdown explanation for complete JSON, omit image assets or invent unsupported properties such as arbitrary CSS animations.
