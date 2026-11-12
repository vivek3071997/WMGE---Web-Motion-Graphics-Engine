# ARM architecture explainer

An original 90-second, 9-scene technical film about the Arm architecture, built
entirely from WMGE vectors and procedural 3D. It contains no third-party art, so
it can be committed and redistributed with the project.

| File | Purpose |
| --- | --- |
| [arm-architecture.motion.json](../examples/arm-architecture.motion.json) | Editable project (1600×900, 30 fps, 640 layers) |
| [build-arm-architecture.cjs](../scripts/build-arm-architecture.cjs) | Reproducible generator; rebuilds and validates the project |

```powershell
node scripts/build-arm-architecture.cjs
node scripts/validate.cjs examples/arm-architecture.motion.json
node scripts/render.cjs --project examples/arm-architecture.motion.json --out examples/demos/renders/arm-architecture.mp4 --format mp4 --width 1920 --height 1080 --crf 18 --ffmpeg <path-to-ffmpeg>
```

In the studio, open **AI workspace → Import**, or load
`http://127.0.0.1:4173/examples/arm-architecture.motion.json` and call
`MotionForgeApp.setProject(project)`.

## Storyboard

| # | Scene | Length | What animates |
| --- | --- | --- | --- |
| 1 | ARM architecture | 9 s | A 3D chip assembles: a liquid-metal die drops onto the PCB and a glass lid settles, with mirror reflections and an orbiting camera. The title builds with feature chips (RISC, Load / Store, 64-bit AArch64, Energy-efficient) and floating device icons. |
| 2 | Licensing model | 10 s | Arm (ISA + core IP) → Licence (architecture vs core licence) → four device classes: phones, PCs, Neoverse servers, Cortex-R/M cars and IoT. Connectors carry particles. |
| 3 | Load / store | 10 s | A data token runs memory → X1 → ALU → X1 → memory. The `LDR / ADD / STR` code card highlights each line, and the register and memory counters tick from 41 to 42. |
| 4 | Registers | 10 s | A grid of X0–X30 and SP/XZR, colour-coded by AAPCS64 role, plus a 32-bar V0–V31 NEON bank that rises and pulses. Note on SVE/SVE2 128–2048-bit vectors. |
| 5 | Pipeline | 10 s | A five-stage F/D/E/M/W timing diagram for five instructions over cycles C1–C9. A cycle cursor sweeps across and a completed-instruction counter runs. |
| 6 | Memory hierarchy | 10 s | A pyramid: registers, split L1 I/D, L2, shared L3/SLC, DRAM. A miss packet climbs from DRAM; then an L1 hit returns almost immediately. |
| 7 | System on chip | 11 s | A DynamIQ cluster (2 big + 4 LITTLE cores, shared L3/DSU), GPU, NPU, ISP and media engines, a security enclave, the AMBA AXI/CHI interconnect, I/O, and a memory controller linked to DRAM. A task migrates from a LITTLE core to a big core. |
| 8 | Privilege & TrustZone | 11 s | EL0–EL2 in the Normal and Secure worlds, with EL3 spanning both. A request travels SVC → SMC → world switch → S-EL1, with captions for each step. |
| 9 | Summary | 9 s | The finished chip turns among glass and liquid-metal orbs while six checklist points and the closing line appear. |

Every scene shares chapter rails, a progress bar, an accent wipe transition, drifting glow orbs and seeded particles.

## Detailed prompt

Use this with the Motion Forge agent (`agent/motion-forge/SYSTEM_PROMPT.txt`) to author an equivalent film:

```text
Create a 90-second, 9-scene technical explainer titled "ARM Architecture" at 1600×900, 30 fps.
Theme: deep navy background #060f1a, surface #0e1d2c, cyan accent #13c8e6, amber secondary #ffb547,
text #eef6fb, muted #8aa3b8, line #25405a. Every scene: linear navy gradient with a faint 40 px grid,
two slow drifting glow orbs, ~14 seeded floating particles, a chapter label "0N · CHAPTER" top-left,
"0N / 09" top-right, a bottom timeline whose accent bar fills over the scene, and a full-frame accent
wipe on entry (except scene 1). Use no images; only vectors, icons and scene3d.

1 Intro (9 s): right half, scene3d with mirror + ground and the camera orbiting azimuth -32→24: a dark PCB box,
  a liquidMetal cyan die that drops into place, a glass lid that settles after it, and 16 liquid-metal pins.
  Left: "ARM" (124 px, cyan glow) and "Architecture" (84 px), an amber underline that draws in, a subtitle about
  billions of phones, laptops, cars and servers, and pill chips RISC / Load / Store / 64-bit AArch64 /
  Energy-efficient. Add floating cpu, smartphone, laptop, server and car icons, plus a note:
  "Originally Acorn RISC Machine (1985), later Advanced RISC Machines."
2 Licensing (10 s): Arm card (ISA + core IP) → Licence card (architecture licence → own cores; core licence →
  Cortex / Neoverse IP) → four sliding device cards (phones & tablets, laptops & PCs, cloud servers, cars & IoT)
  joined by particle connectors.
3 Load / store (10 s): memory card with addresses 0x1000–0x1020 (0x1010 highlighted holding 41), a register card
  (X0 = 0x1010, X1 counter 41→42), and an amber ALU shape. A glowing token travels LDR → ADD → STR while a mono
  code card highlights each instruction; the memory value becomes 42. Note that A64 instructions are 32 bits.
4 Registers (10 s): a cascading 8×4 grid of X0–X30 + SP/XZR, coloured by role (arguments, temporaries,
  callee-saved, FP/LR), with a legend, and a 32-bar V0–V31 128-bit NEON bank that grows and pulses.
  Note on SVE/SVE2 (128–2048 bits).
5 Pipeline (10 s): a 5-stage F/D/E/M/W timing diagram, 5 instructions × 9 cycles, each cell popping in on its
  cycle, a sweeping cycle cursor, a stage legend and a "completed 0→5 / 5" counter. Note: modern cores are
  superscalar and out-of-order.
6 Memory hierarchy (10 s): a centred pyramid (Registers, L1 I-cache | L1 D-cache, L2, L3/SLC, DRAM) with a
  "Faster · smaller → Larger · slower" axis. An amber miss packet climbs from DRAM, then a cyan L1 hit; the
  captions swap.
7 SoC (11 s): a die outline containing a DynamIQ cluster (2 big + 4 LITTLE cores, shared L3/DSU), GPU, NPU,
  ISP/media and security blocks, an AMBA AXI/CHI interconnect, I/O and a memory controller wired to external
  DRAM with particle links. A task token migrates from a LITTLE core to a big core beside a big.LITTLE
  explanation.
8 Privilege (11 s): Normal world EL0/EL1/EL2 and Secure world S-EL0/S-EL1/S-EL2 (v8.4-A+), with EL3 secure
  monitor spanning both; SVC, HVC and SMC arrows. A white request token goes EL0→EL1→EL3→S-EL1 with three
  timed captions.
9 Summary (9 s): the assembled chip spins among glass and liquid-metal orbs; "Simple instructions. / Efficient
  by design."; six circle-check bullets; closing line "From microcontrollers to supercomputers."
Keep all facts qualitative: do not invent performance numbers or market statistics.
```
