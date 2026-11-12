#!/usr/bin/env node
// Indexes illustrations the user downloaded themselves into the git-ignored local library folders.
// Usage: npm run index:illustrations
"use strict";
const fs = require("fs");
const path = require("path");

const LIBRARIES = {
  undraw: "undraw-local",
};
const SAFE_NAME = /^[\w .()-]+\.(svg|png|jpe?g|webp)$/i;
const MAX_BYTES = { svg: 2000000, raster: 10000000 };

function indexLibrary(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs
    .readdirSync(dir)
    .filter((f) => {
      if (!SAFE_NAME.test(f)) return false;
      const size = fs.statSync(path.join(dir, f)).size;
      return size <= (/\.svg$/i.test(f) ? MAX_BYTES.svg : MAX_BYTES.raster);
    })
    .sort((a, b) => a.localeCompare(b));
  fs.writeFileSync(path.join(dir, "index.json"), JSON.stringify(files) + "\n");
  return files.length;
}

if (require.main === module) {
  const root = path.join(__dirname, "..", "assets");
  let any = false;
  for (const [name, folder] of Object.entries(LIBRARIES)) {
    const n = indexLibrary(path.join(root, folder));
    if (n === null) continue;
    any = true;
    console.log(`Indexed ${n} ${name} illustrations in assets/${folder}.`);
  }
  if (!any)
    console.log(
      `No local illustration folders found. Create ${Object.values(LIBRARIES)
        .map((f) => `assets/${f}`)
        .join(" or ")} and add files you downloaded yourself.`,
    );
}

module.exports = { LIBRARIES, SAFE_NAME, indexLibrary };
