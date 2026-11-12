/* Original Motion Forge advanced compositions - MIT. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.MotionPresets = api;
})(globalThis, function () {
  "use strict";
  const names = ["Glass & mirror", "Liquid metal", "Water surface", "Atmospheric gas", "Animated shadows"];
  function scene(name, width = 1600, height = 900) {
    if (!names.includes(name)) throw new Error("Unknown advanced preset.");
    const heading = {
      id: "heading", type: "text", text: name, x: width * 0.06, y: height * 0.06,
      width: width * 0.88, height: height * 0.12, fontSize: Math.round(height * 0.07),
      fill: "$text", enter: "rise", enterDuration: 0.8,
      shadowBlur: 14, shadowY: 6, shadowColor: "#00000080",
    };
    const stage = {
      id: "stage3d", type: "scene3d", name: "Editable 3D stage",
      x: width * 0.05, y: height * 0.15, width: width * 0.9, height: height * 0.8,
      enter: "fade", enterDuration: 0.8, cameraDistance: 6,
      cameraAzimuth: 20, cameraElevation: 18, lightIntensity: 4,
      objects: [],
    };
    if (name === "Glass & mirror") {
      stage.mirror = true;
      stage.objects = [
        { id: "glass", geometry: "knot", material: "glass", color: "$secondary", x: -0.85, scaleX: 0.8, scaleY: 0.8, scaleZ: 0.8, roughness: 0.06, transmission: 0.95, ior: 1.5, speed: 0.3 },
        { id: "metal", geometry: "sphere", material: "liquidMetal", color: "$accent", x: 1.2, y: -0.4, scaleX: 0.65, scaleY: 0.65, scaleZ: 0.65, amplitude: 0.12, speed: 0.5 },
      ];
    } else if (name === "Liquid metal") {
      stage.objects = [{ id: "metal", geometry: "sphere", material: "liquidMetal", color: "$accent", amplitude: 0.25, frequency: 3, speed: 0.6,
        tracks: [{ property: "rotationY", loop: true, keyframes: [{ time: 0, value: 0 }, { time: 8, value: 360, easing: "linear" }] }] }];
    } else if (name === "Water surface") {
      stage.ground = false;
      stage.cameraAzimuth = 0;
      stage.cameraElevation = 40;
      stage.objects = [{ id: "water", geometry: "plane", material: "water", color: "$secondary", scaleX: 2.4, scaleY: 2.4, rotationX: -90, amplitude: 0.2, frequency: 6 }];
    } else if (name === "Atmospheric gas") {
      stage.ground = false;
      stage.cameraAzimuth = 0;
      stage.cameraElevation = 0;
      stage.objects = [{ id: "gas", geometry: "sphere", material: "gas", color: "$secondary", scaleX: 2.4, scaleY: 2, amplitude: 0.3, seed: 42 }];
    } else {
      stage.objects = [{ id: "sculpture", geometry: "torus", material: "standard", color: "$accent", roughness: 0.2, speed: 0.3 }];
      heading.tracks = [
        { property: "shadowX", loop: true, keyframes: [{ time: 0, value: -24 }, { time: 4, value: 24 }, { time: 8, value: -24 }] },
        { property: "shadowBlur", loop: true, keyframes: [{ time: 0, value: 8 }, { time: 4, value: 40 }, { time: 8, value: 8 }] },
      ];
    }
    return {
      id: "advanced", name, duration: 8,
      background: { type: "radial", color: "$background", color2: "$surface" },
      layers: [stage, heading, {
        id: "caption", type: "text",
        text: name === "Glass & mirror" ? "Procedural objects / physical materials / one planar reflection" : "Editable procedural animation / deterministic timeline",
        x: width * 0.06, y: height * 0.9, width: width * 0.88, height: height * 0.06,
        fontSize: Math.round(height * 0.027), fill: "$muted", enter: "fade",
      }],
    };
  }
  return { names, scene };
});
