#!/usr/bin/env node
"use strict";
const fs = require("node:fs"),
  path = require("node:path"),
  crypto = require("node:crypto");
const root = path.resolve(__dirname, ".."),
  catalog = JSON.parse(
    fs.readFileSync(
      path.join(root, "assets/material-icons/catalog.json"),
      "utf8",
    ),
  ),
  icons = {};
for (const entry of catalog.icons) {
  const data = fs.readFileSync(
    path.join(root, "assets/material-icons", entry.file),
  );
  if (crypto.createHash("sha256").update(data).digest("hex") !== entry.sha256)
    throw new Error(`Hash mismatch: ${entry.file}`);
  const svg = data.toString();
  if (!svg.startsWith("<svg ") || !svg.trimEnd().endsWith("</svg>"))
    throw new Error(`Unexpected SVG wrapper: ${entry.file}`);
  icons[entry.name] = svg.slice(
    svg.indexOf(">") + 1,
    svg.lastIndexOf("</svg>"),
  );
}
fs.writeFileSync(
  path.join(root, "src/icons.js"),
  "/* Google Material Icons — Apache-2.0. See THIRD_PARTY_NOTICES.md. */\n(function(r){const icons=" +
    JSON.stringify(icons) +
    ';if(typeof module==="object"&&module.exports)module.exports=icons;else r.MotionIcons=icons;})(globalThis);\n',
);
console.log(`Bundled ${Object.keys(icons).length} verified icons.`);
