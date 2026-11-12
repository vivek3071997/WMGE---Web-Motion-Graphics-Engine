#!/usr/bin/env node
// Copies illustrations you downloaded yourself into a git-ignored local library, then re-indexes it.
// It never downloads anything. Usage:
//   npm run import:illustrations -- [--move] <file-or-folder> [...]
//   npm run import:illustrations -- --move %USERPROFILE%\Downloads\undraw_*.svg
"use strict";
const fs = require("fs");
const path = require("path");
const { LIBRARIES, SAFE_NAME, indexLibrary } = require("./index-local-illustrations.cjs");

const IMAGE = /\.(svg|png|jpe?g|webp)$/i;

function safeName(file) {
  const ext = path.extname(file).toLowerCase(),
    base = path
      .basename(file, path.extname(file))
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w .()-]+/g, "-")
      .replace(/-{2,}/g, "-")
      .replace(/^[-. ]+|[-. ]+$/g, "")
      .slice(0, 120);
  return `${base || "illustration"}${ext === ".jpeg" ? ".jpg" : ext}`;
}

function expand(inputs) {
  const out = [];
  for (const input of inputs) {
    // PowerShell passes wildcards through unexpanded; match them against the folder listing.
    if (/[*?]/.test(path.basename(input))) {
      const dir = path.dirname(input),
        re = new RegExp(
          "^" + path.basename(input).replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".") + "$",
          "i",
        );
      if (fs.existsSync(dir))
        for (const f of fs.readdirSync(dir)) if (re.test(f)) out.push(path.join(dir, f));
      continue;
    }
    if (!fs.existsSync(input)) {
      console.warn(`Not found: ${input}`);
      continue;
    }
    if (fs.statSync(input).isDirectory())
      for (const f of fs.readdirSync(input)) out.push(path.join(input, f));
    else out.push(input);
  }
  return out.filter((f) => IMAGE.test(f) && fs.statSync(f).isFile());
}

function importFiles({ library, inputs, move = false, root = path.join(__dirname, "..", "assets") }) {
  if (!LIBRARIES[library])
    throw new Error(`--library must be one of: ${Object.keys(LIBRARIES).join(", ")}`);
  const dir = path.join(root, LIBRARIES[library]);
  fs.mkdirSync(dir, { recursive: true });
  const result = { copied: 0, duplicates: 0, renamed: 0 };
  for (const src of expand(inputs)) {
    let name = safeName(src);
    if (!SAFE_NAME.test(name)) continue;
    const bytes = fs.readFileSync(src);
    let target = path.join(dir, name);
    if (fs.existsSync(target)) {
      if (Buffer.compare(fs.readFileSync(target), bytes) === 0) {
        result.duplicates++;
        if (move) fs.unlinkSync(src);
        continue;
      }
      const ext = path.extname(name);
      for (let i = 2; fs.existsSync(target); i++) target = path.join(dir, `${path.basename(name, ext)} (${i})${ext}`);
      name = path.basename(target);
    }
    if (name !== path.basename(src)) result.renamed++;
    fs.writeFileSync(target, bytes);
    if (move) fs.unlinkSync(src);
    result.copied++;
  }
  result.indexed = indexLibrary(dir);
  return result;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  let library = "undraw",
    move = false;
  const inputs = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--library") library = args[++i];
    else if (args[i] === "--move") move = true;
    else inputs.push(args[i]);
  }
  if (!inputs.length) {
    console.log(
      "Usage: npm run import:illustrations -- [--library undraw] [--move] <file-or-folder> [...]\n" +
        "Copies images you downloaded yourself into assets/<library>-local (git-ignored). Nothing is downloaded.",
    );
    process.exit(1);
  }
  try {
    const r = importFiles({ library, inputs, move });
    console.log(
      `${library}: ${r.copied} added (${r.renamed} renamed to safe names), ${r.duplicates} identical skipped; ${r.indexed} indexed in assets/${LIBRARIES[library]}.`,
    );
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}

module.exports = { importFiles, safeName };
