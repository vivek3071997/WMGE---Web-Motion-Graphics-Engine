# Export and recording

## In the editor

**Project JSON** is the editable master: all scenes and embedded assets, including uploaded video. Keep it with your video project.

**SVG frame** preserves the vector scene content; raster images remain raster. WebGL effects and video layers require a composited PNG/video export. Text may depend on fonts installed on the receiving machine.

**PNG frame** exports the composited scene at the project's dimensions, without selection outlines or safe-area guides.

**Record scene** records the composited canvas in real time. Available formats are detected using `MediaRecorder.isTypeSupported`: WebM and, only when supported by the browser, genuine MP4. An unsupported MP4 is never a renamed WebM. Chrome/Edge are recommended. The recording bitrate is 1–100 Mbps (editor default 24 Mbps), with integer fps 1–60 and dimensions up to 4096 pixels per side. MP4 dimensions must be even.

Keep the tab visible: hiding it cancels recording. Cancelled or failed recordings are discarded, not downloaded as incomplete successes. Frame pacing uses an absolute clock, but browser encoding and frame delivery remain best effort; very slow painting fails explicitly. Use the CLI for deterministic frame sampling. Video codecs do not preserve scene transparency reliably; use an opaque scene background for normal video delivery.

**No audio is exported**, including audio embedded in uploaded video. Add voice-over, music and source-video audio in your video editor.

## Deterministic CLI: frames, MP4 or WebM

Use Node 20 or newer. Install the optional render dependencies once:

```powershell
npm install
npx playwright install chromium
```

Run these examples from the package folder. Paths with spaces must be quoted.

### PNG frames (no FFmpeg required)

```powershell
node scripts\render.cjs --project examples\pipeline.motion.json --scene pipeline --out "C:\Motion exports\pipeline frames" --fps 30 --width 1920 --height 1080
```

Without `--format`, `--out` is a new or empty directory. Existing files are never overwritten, and the renderer never deletes your frame folder. Files are named `frame-000000.png`, `frame-000001.png`, etc. `render-manifest.json` records dimensions, fps, scene boundaries, requested durations and rendered durations.

### MP4 / H.264

Install FFmpeg separately, including the `libx264` encoder, and put `ffmpeg.exe` on PATH or specify `--ffmpeg`:

```powershell
node scripts\render.cjs --project examples\pipeline.motion.json --scene pipeline --format mp4 --out "C:\Motion exports\pipeline.mp4" --fps 30 --width 3840 --height 2160 --crf 18 --preset slow --ffmpeg "C:\Tools\ffmpeg\bin\ffmpeg.exe"
```

MP4 uses `libx264`, `yuv420p` and `+faststart`. Width and height must be even. `--crf` is an integer 0–51 (default 18; lower means higher quality/larger output). Allowed presets: `ultrafast`, `superfast`, `veryfast`, `faster`, `fast`, `medium` (default), `slow`, `slower`, `veryslow`.

### WebM / VP9, whole storyboard

```powershell
node scripts\render.cjs --project examples\systems-in-motion.motion.json --scene all --format webm --out "C:\Motion exports\storyboard.webm" --fps 30 --width 1920 --height 1080 --crf 30
```

WebM uses `libvpx-vp9` with constant-quality encoding. `--crf` is an integer 0–63 (default 30). `--preset` is MP4-only. Both video formats use 4:2:0 color and do not preserve alpha. Use even dimensions for maximum codec/player compatibility.

`--out` must end in the selected container extension and must not already exist. Video export first samples all frames into a private, uniquely named `.motion-render-*` working directory beside the output. FFmpeg is launched directly with argument arrays, without a shell. Only a completed encode is published, using exclusive creation. The exact working directory is removed on success or error; user frame directories are never deleted. No video-side manifest is generated.

### Sampling and browser selection

`--scene all` (also the default) concatenates scenes in project order. A single ID renders only that scene. Each scene gets `ceil(duration × fps)` frames at `0, 1/fps, 2/fps, …`; its endpoint is not an extra frame. Non-frame-aligned durations round up by less than one frame. Async video seeking and compositing are awaited before each screenshot. The output viewport has no editor UI. Sampling is independent of render speed; visual repeatability still depends on the same browser, fonts, media decoders and graphics environment.

Integer fps must be 1–60; each dimension must be 256–4096, including 3840 × 2160 4K. Unspecified fps/dimensions use project values. Unknown/duplicate options and invalid numeric values are errors.

Use a locally installed browser instead of Playwright's downloaded Chromium:

```powershell
$env:BROWSER_PATH = "C:\Program Files\Google\Chrome\Application\chrome.exe"
node scripts\render.cjs --project examples\pipeline.motion.json --out "C:\Motion exports\frames"
```

`--browser "C:\Program Files\Microsoft\Edge\Application\msedge.exe"` overrides `BROWSER_PATH`. Missing FFmpeg produces an actionable error before rendering; a missing encoder or failed encode reports FFmpeg's diagnostics. FFmpeg is not bundled.

## Other encoding workflows

For transparent overlays, render PNG frames with a transparent scene background and encode using an alpha-capable codec supported by your editor, for example:

```powershell
ffmpeg -nostdin -n -framerate 30 -i "C:\Motion exports\overlay frames\frame-%06d.png" -an -c:v prores_ks -profile:v 4 -pix_fmt yuva444p10le "C:\Motion exports\overlay.mov"
```

Match `-framerate` to the frame manifest. `-n` refuses to overwrite an existing output. Check codec support in your video editor.

## Host shoot + graphics workflow

Agree on narration beats first. Author one scene per explanation, with lead-in, reveal and final hold. Export scenes under stable shot IDs. Keep timing, credits and asset rights beside the project. After the voice-over edit, adjust durations/keyframes and render exact frames. Add transitions, music, sound effects and final compositing in the main editor.

The renderer does not time-stretch narration or automatically synchronize speech. A longer `duration` extends the hold; it does not proportionally retime every animation. Changing aspect ratio does not redesign the layout.
