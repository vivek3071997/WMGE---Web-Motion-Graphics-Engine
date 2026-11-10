#!/usr/bin/env node
"use strict";
// Asset manifests resolve paths relative to the manifest file, never a machine-specific project path.
const fs = require("node:fs"),
  path = require("node:path"),
  M = require("../src/engine.js");
const [projectFile, manifestFile, outputFile] = process.argv.slice(2);
if (!outputFile) {
  console.error(
    "Usage: node scripts/embed-assets.cjs project.json assets.json output.motion.json",
  );
  process.exit(2);
}
try {
  const p = JSON.parse(fs.readFileSync(projectFile, "utf8")),
    assets = JSON.parse(fs.readFileSync(manifestFile, "utf8"));
  p.assets ??= {};
  for (const [id, a] of Object.entries(assets)) {
    if (!a || typeof a.path !== "string")
      throw new Error(`Asset ${id} needs a path.`);
    const file = path.resolve(path.dirname(manifestFile), a.path);
    const type = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
    }[path.extname(file).toLowerCase()];
    if (!type)
      throw new Error(
        `${file}: use PNG, JPEG or WebP. Import simple SVG in the editor to rasterise it.`,
      );
    if (fs.statSync(file).size > 10000000)
      throw new Error(`${file}: exceeds 10 MB.`);
    const b = fs.readFileSync(file);
    if (
      (type === "image/png" &&
        b.subarray(0, 8).toString("hex") !== "89504e470d0a1a0a") ||
      (type === "image/jpeg" &&
        b.subarray(0, 3).toString("hex") !== "ffd8ff") ||
      (type === "image/webp" &&
        (b.subarray(0, 4).toString() !== "RIFF" ||
          b.subarray(8, 12).toString() !== "WEBP"))
    )
      throw new Error(`${file}: file signature does not match extension.`);
    p.assets[id] = {
      name: a.name || path.basename(file),
      src: `data:${type};base64,${b.toString("base64")}`,
    };
    for (const k of ["credit", "source"]) if (a[k]) p.assets[id][k] = a[k];
  }
  M.assertValid(p);
  if (fs.existsSync(outputFile))
    throw new Error(
      "Output already exists. Choose a new filename to preserve it.",
    );
  fs.writeFileSync(outputFile, JSON.stringify(p, null, 2) + "\n", {
    flag: "wx",
  });
  console.log(`Saved ${outputFile}. All assets are embedded.`);
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
