/* Original Motion Forge demonstration scenes — MIT. Values are illustrative. */
(function (root) {
  const M =
    typeof module === "object" && module.exports
      ? require("./engine.js")
      : root.MotionForge;
  const layer = (id, type, x, y, width, height, extra = {}) => ({
    id,
    type,
    name: id.replaceAll("-", " "),
    x,
    y,
    width,
    height,
    enter: "rise",
    enterDuration: 0.75,
    ...extra,
  });
  const text = (id, txt, x, y, size = 32, extra = {}) =>
    layer(id, "text", x, y, 1300, size * 1.3, {
      text: txt,
      fontSize: size,
      fill: "$text",
      ...extra,
    });
  function header(k, title, subtitle) {
    return [
      text("eyebrow", k, 100, 65, 18, {
        fill: "$accent",
        fontFamily: "mono",
        enter: "fade",
      }),
      text("title", title, 96, 112, 68, { fontWeight: 700, start: 0.1 }),
      text("subtitle", subtitle, 100, 207, 25, { fill: "$muted", start: 0.2 }),
    ];
  }
  function node(id, title, label, icon, x, y, start = 0, w = 290, h = 230) {
    const compact = h < 200;
    return [
      layer(id, "group", x, y, w, h, { fill: "none", start, enter: "scale" }),
      layer(id + "-panel", "rect", 0, 0, w, h, {
        parentId: id,
        fill: "$surface",
        stroke: "$line",
        radius: 24,
        enter: "none",
      }),
      layer(id + "-icon", "icon", 28, compact ? 40 : 28, 48, 48, {
        parentId: id,
        icon,
        fill: "$accent",
        enter: "none",
      }),
      text(id + "-title", title, compact ? 104 : 28, compact ? 25 : 100, 29, {
        parentId: id,
        width: w - (compact ? 130 : 50),
        fontWeight: 700,
        enter: "none",
      }),
      text(id + "-label", label, compact ? 104 : 28, compact ? 76 : 155, 19, {
        parentId: id,
        width: w - (compact ? 130 : 50),
        fill: "$muted",
        enter: "none",
      }),
    ];
  }
  const connector = (id, from, to, start = 1, extra = {}) =>
    layer(id, "line", 0, 0, 0, 0, {
      from,
      to,
      fill: "$secondary",
      stroke: "$line",
      strokeWidth: 3,
      arrow: true,
      particles: 2,
      curve: "bezier",
      enter: "draw",
      enterDuration: 1,
      start,
      ...extra,
    });
  const scene = (id, name, layers, duration = 10) => ({
    id,
    name,
    duration,
    background: {
      type: "radial",
      color: "$background",
      color2: "$surface",
      grid: true,
      gridSize: 60,
      gridOpacity: 0.07,
    },
    layers,
  });
  function templates() {
    return [
      scene("pipeline", "Compute pipeline", [
        ...header(
          "01 / SYSTEMS EXPLAINED",
          "From input to intelligence.",
          "A reusable architecture scene. Every node, colour and connection is editable.",
        ),
        connector("edge-input", "input", "compute", 1.3),
        connector("edge-compute", "compute", "output", 1.9),
        ...node(
          "input",
          "01  Collect",
          "Events · signals · files",
          "input",
          100,
          345,
          0.4,
          360,
          240,
        ),
        ...node(
          "compute",
          "02  Compute",
          "Transform · evaluate · route",
          "memory",
          620,
          345,
          0.7,
          360,
          240,
        ),
        ...node(
          "output",
          "03  Deliver",
          "Models · applications · people",
          "device_hub",
          1140,
          345,
          1,
          360,
          240,
        ),
        layer("tag-bg", "rect", 100, 666, 245, 42, {
          fill: "$accent",
          radius: 21,
          start: 2.2,
        }),
        text("tag", "LIVE DATA FLOW", 122, 675, 17, {
          fill: "$background",
          fontWeight: 700,
          width: 220,
          start: 2.2,
        }),
        text(
          "footnote",
          "ILLUSTRATIVE SYSTEM  /  REPLACE WITH YOUR OWN FACTS",
          100,
          795,
          17,
          { fontFamily: "mono", fill: "$muted", start: 0.3 },
        ),
        layer("pulse", "circle", 1450, 685, 18, 18, {
          fill: "$secondary",
          start: 2.2,
          tracks: [
            {
              property: "opacity",
              loop: true,
              keyframes: [
                { time: 2.2, value: 0.35 },
                { time: 3, value: 1 },
                { time: 3.8, value: 0.35 },
              ],
            },
          ],
        }),
      ]),
      scene("architecture", "Layered architecture", [
        ...header(
          "02 / ARCHITECTURE",
          "One system. Many layers.",
          "Group related elements, connect modules, then choreograph the explanation.",
        ),
        ...node(
          "application",
          "APPLICATION",
          "The user-facing experience",
          "devices",
          100,
          330,
          0.3,
          620,
          160,
        ),
        ...node(
          "runtime",
          "RUNTIME",
          "Scheduling · memory · state",
          "settings",
          100,
          530,
          0.8,
          620,
          160,
        ),
        ...node(
          "hardware",
          "HARDWARE",
          "Compute · network · storage",
          "developer_board",
          100,
          730,
          1.3,
          620,
          130,
        ),
        ...node(
          "observability",
          "OBSERVABILITY",
          "Metrics\nTraces\nLogs",
          "analytics",
          1050,
          390,
          1.8,
          430,
          340,
        ),
        connector("a-o", "application", "observability", 2),
        connector("r-o", "runtime", "observability", 2.3),
        connector("h-o", "hardware", "observability", 2.6),
      ]),
      scene("data", "Data and comparison", [
        ...header(
          "03 / DATA STORY",
          "Make the difference visible.",
          "Illustrative values only. Label your sources before publishing.",
        ),
        layer("chart-card", "rect", 100, 315, 900, 450, {
          fill: "$surface",
          stroke: "$line",
          radius: 24,
          start: 0.2,
        }),
        layer("bar-chart", "chart", 140, 365, 820, 350, {
          values: [32, 48, 67, 86],
          labels: ["BASELINE", "PASS 01", "PASS 02", "PASS 03"],
          colors: ["$line", "$accent", "$accent", "$secondary"],
          maxValue: 100,
          fill: "$accent",
          fontSize: 21,
          start: 0.8,
          enterDuration: 2,
          enter: "scale",
        }),
        text("metric-label", "EXAMPLE IMPROVEMENT", 1080, 345, 20, {
          fill: "$muted",
          width: 420,
          start: 1,
        }),
        layer("metric", "counter", 1070, 400, 420, 160, {
          valueFrom: 0,
          valueTo: 2.7,
          decimals: 1,
          suffix: "×",
          fontSize: 144,
          fontWeight: 700,
          fill: "$secondary",
          start: 1,
          enterDuration: 2.3,
        }),
        text(
          "metric-caption",
          "Replace these values\nwith measured results.",
          1080,
          605,
          25,
          { width: 420, fill: "$muted", start: 1.5 },
        ),
        text(
          "source",
          "SOURCE: DEMONSTRATION DATA — NOT A PERFORMANCE CLAIM",
          100,
          805,
          17,
          { fill: "$muted", fontFamily: "mono" },
        ),
      ]),
      scene("signal", "Signal processing", [
        ...header(
          "04 / SIGNALS",
          "A signal becomes a story.",
          "Path drawing, looping keyframes and travelling particles — driven by time.",
        ),
        layer("signal-panel", "rect", 100, 320, 1400, 370, {
          fill: "$surface",
          stroke: "$line",
          radius: 24,
          start: 0.2,
        }),
        layer("wave", "path", 130, 360, 1330, 260, {
          d: "M 0 130 C 55 130 55 25 110 25 S 165 235 220 235 S 275 25 330 25 S 385 235 440 235 S 495 25 550 25 S 605 235 660 235 S 715 25 770 25 S 825 235 880 235 S 935 25 990 25 S 1045 235 1100 235 S 1155 25 1210 25 S 1265 130 1320 130",
          fill: "none",
          stroke: "$secondary",
          strokeWidth: 5,
          enter: "draw",
          enterDuration: 3,
          start: 0.7,
        }),
        layer("scan", "rect", 130, 345, 4, 310, {
          fill: "$accent",
          radius: 0,
          start: 0.7,
          tracks: [
            {
              property: "x",
              loop: true,
              keyframes: [
                { time: 0.7, value: 130 },
                { time: 6.7, value: 1460, easing: "linear" },
              ],
            },
          ],
        }),
        text("signal-caption", "RAW INPUT", 100, 735, 22, {
          fill: "$secondary",
          fontFamily: "mono",
        }),
        text("time-caption", "TIME →", 1360, 735, 22, {
          fill: "$muted",
          width: 140,
          fontFamily: "mono",
        }),
      ]),
      scene("timeline", "Technical timeline", [
        ...header(
          "05 / CHRONOLOGY",
          "Build the story in stages.",
          "A timeline for product histories, scientific discoveries or release milestones.",
        ),
        layer("timeline-line", "line", 180, 510, 1240, 0, {
          x2: 1420,
          y2: 510,
          stroke: "$line",
          fill: "$accent",
          strokeWidth: 4,
          enter: "draw",
          enterDuration: 2,
          start: 0.5,
        }),
        ...["Research", "Prototype", "Production", "Evolution"].flatMap(
          (label, i) => [
            layer("point-" + i, "circle", 160 + i * 400, 490, 40, 40, {
              fill: "$accent",
              start: 0.5 + i * 0.65,
              enter: "scale",
            }),
            layer("icon-" + i, "icon", 160 + i * 400, 365, 42, 42, {
              icon: ["science", "build", "rocket_launch", "analytics"][i],
              start: 0.5 + i * 0.65,
            }),
            text(
              "year-" + i,
              ["PHASE 01", "PHASE 02", "PHASE 03", "PHASE 04"][i],
              112 + i * 400,
              575,
              17,
              {
                fill: "$secondary",
                fontFamily: "mono",
                width: 200,
                start: 0.7 + i * 0.65,
              },
            ),
            text("label-" + i, label, 112 + i * 400, 620, 28, {
              width: 260,
              fontWeight: 700,
              start: 0.8 + i * 0.65,
            }),
          ],
        ),
        text(
          "timeline-note",
          "Replace phase labels with verified dates and add an evidence card.",
          100,
          800,
          23,
          { fill: "$muted" },
        ),
      ]),
      scene("evidence", "Image and evidence card", [
        ...header(
          "06 / VISUAL EVIDENCE",
          "Give your sources a stage.",
          "Add a screenshot, a custom illustration or your logo from the Assets panel.",
        ),
        layer("evidence-card", "rect", 100, 315, 920, 450, {
          fill: "$surface",
          stroke: "$line",
          radius: 24,
          start: 0.3,
        }),
        layer("evidence-symbol", "icon", 430, 390, 220, 220, {
          icon: "image",
          fill: "$muted",
          start: 0.7,
          enter: "scale",
        }),
        text(
          "image-note",
          "UPLOAD IMAGE → SELECT LAYER → REPLACE ASSET",
          195,
          690,
          18,
          { fill: "$muted", fontFamily: "mono", width: 800, start: 1 },
        ),
        text("evidence-label", "SOURCE / DATE", 1090, 360, 20, {
          fill: "$secondary",
          width: 400,
          start: 0.6,
        }),
        text(
          "evidence-title",
          "Explain the\nimportant detail.",
          1090,
          415,
          43,
          { width: 410, fontWeight: 700, start: 0.9 },
        ),
        text(
          "evidence-caption",
          "Keep captions short.\nCredit the original creator.\nSeparate evidence from inference.",
          1090,
          585,
          24,
          { width: 420, fill: "$muted", start: 1.2 },
        ),
      ]),
    ];
  }
  function project() {
    return {
      version: 1,
      name: "Systems in motion",
      width: 1600,
      height: 900,
      fps: 30,
      theme: M.clone(M.THEMES.midnight),
      assets: {},
      scenes: templates(),
    };
  }
  const api = { templates, project, layer };
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MotionExamples = api;
})(globalThis);
