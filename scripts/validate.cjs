#!/usr/bin/env node
"use strict";
const fs = require("node:fs"),
  M = require("../src/engine.js");
const path = process.argv[2];
if (!path) {
  console.error("Usage: node scripts/validate.cjs project.motion.json");
  process.exit(2);
}
try {
  if (fs.statSync(path).size > 45000000)
    throw new Error("Project exceeds 45 MB.");
  const p = JSON.parse(fs.readFileSync(path, "utf8")),
    errors = M.validate(p);
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      `Valid: ${p.name} — ${p.scenes.length} scene(s), ${p.width}×${p.height}, ${p.fps} fps.`,
    );
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
}
