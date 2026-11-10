# Export and recording

## In the editor

**Project JSON** contains all scenes and embedded raster assets. It is the editable master file. Keep it with your video project.

**SVG frame** exports a clean vector frame at the current timestamp. Text remains text and may depend on fonts installed on the receiving machine. Uploaded images are embedded rasters; exporting SVG does not restore rasterised logos to vectors.

**PNG frame** exports a clean raster at the project's width/height. A transparent scene background stays transparent. Selection outlines and safe-area guides are excluded.

**Record scene · WebM** renders and records the current scene in real time, with no audio. Chrome/Edge are the intended browsers. Keep the tab visible; hiding it cancels recording to avoid silently delivering a throttled clip. Encoding is browser-dependent and a busy machine can drop frames. The theme background replaces transparency for video. Stopping/cancelling discards the incomplete recording. A target fps is requested, not guaranteed.

## Exact frames with Node + Playwright

With Node 20 or newer installed, install the optional development tools once:

```sh
npm install
npx playwright install chromium
```

Render one scene:

```sh
node scripts/render.cjs --project examples/pipeline.motion.json --scene pipeline --out renders/pipeline --fps 30 --width 1920 --height 1080
```

Render the whole storyboard in scene order:

```sh
node scripts/render.cjs --project examples/systems-in-motion.motion.json --scene all --out renders/full --fps 30 --width 1920 --height 1080
```

The output directory must be empty. Each file is `frame-000000.png`, `frame-000001.png`, etc. The render manifest records dimensions, fps and frame boundaries. Each scene gets `ceil(duration × fps)` frames sampled at `0, 1/fps, 2/fps, …`; the endpoint itself is not an extra frame. A duration that is not an exact frame multiple rounds up by less than one frame. Frame rendering is deterministic within the same browser/fonts/environment, independent of how quickly the computer renders.

An alternate locally installed browser can be used with `--browser "/absolute/path/to/chrome"`. The supplied browser tests use the environment variable `BROWSER_PATH`. These are optional tools; opening and editing the web app still needs no installation.

## Encode a production clip

Install FFmpeg separately, then run from the package folder:

```sh
ffmpeg -framerate 30 -i renders/pipeline/frame-%06d.png -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart pipeline.mp4
```

Use even width/height for H.264. Match `-framerate` to the render manifest. This command does not overwrite an existing file without FFmpeg's confirmation. It does not add audio.

For a transparent overlay, set the scene background to `transparent`, render PNGs, then use a codec that supports alpha. For example:

```sh
ffmpeg -framerate 30 -i renders/overlay/frame-%06d.png -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le overlay.mov
```

Check codec support in your video editor. H.264 does not preserve alpha. These are encoding recipes, not a bundled FFmpeg distribution.

## Host shoot + graphics workflow

Agree on narration beats first. Author one scene per explanation, with lead-in, reveal and final hold. Export each scene under a stable shot ID. Put timing, source credits and asset rights beside the project. Host filming and voice recording can proceed while a designer or LLM builds the JSON and previews. After the final voice-over edit, adjust scene duration/keyframes and render exact frames. Add transitions, music, sound effects and final compositing in the main video editor.

The renderer does not time-stretch narration or automatically synchronize speech. A longer `duration` extends the hold; it does not proportionally retime every animation. Changing the project aspect ratio does not redesign the layout.
