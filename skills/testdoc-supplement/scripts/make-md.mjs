#!/usr/bin/env node
// Step 1 (md half) — spec.json (+ screenshots) → <sourceDir>/<ticket>_<suffix>.md for the user to review.
//   node make-md.mjs <spec.json> [--out-dir <dir>] [--dry-run]
// Output dir defaults to spec.sourceDir. Images live in <outDir>/<ticket>_<suffix>_images/ (a shot may carry
// "source": "<path>" to be copied there). Never overwrites an existing md or a different existing image.
// Does not take screenshots (see shot-helpers.mjs) and never builds a docx (see make-docx.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { die, md5, parseArgs, parseMd, pngSize, renderMd, setFormat, titleOf, imagesDirName } from './lib.mjs';

export function validateSpec(spec, where = 'spec', { needSourceDir = true } = {}) {
  for (const k of ['ticket', 'statusText', ...(needSourceDir ? ['sourceDir'] : [])]) if (!spec[k] || typeof spec[k] !== 'string') die(`${where}: "${k}" is required (string)`);
  if (spec.titleSuffix !== undefined && typeof spec.titleSuffix !== 'string') die(`${where}: "titleSuffix" must be a string (omit or "" for a title that is just the ticket)`);
  if (!['per-item', 'document', undefined].includes(spec.statusMode)) die(`${where}: statusMode must be "per-item" or "document"`);
  if (!Array.isArray(spec.items) || !spec.items.length) die(`${where}: "items" must be a non-empty array`);
  spec.items.forEach((it, i) => {
    if (!it.title) die(`${where}: items[${i}].title is required`);
    for (const s of it.shots ?? []) if (!s.label || !s.image) die(`${where}: items[${i}].shots[] needs label and image`);
  });
  for (const t of [spec.ticket, spec.titleSuffix, spec.statusText]) if (/[\r\n]/.test(t)) die(`${where}: no line breaks in ticket/titleSuffix/statusText`);
}

export function makeMd(specFile, { outDir, dryRun } = {}) {
  specFile = path.resolve(specFile);
  const spec = JSON.parse(fs.readFileSync(specFile, 'utf8'));
  validateSpec(spec, specFile, { needSourceDir: !outDir });
  const dir = path.resolve(outDir || path.resolve(path.dirname(specFile), spec.sourceDir)); // a relative sourceDir is relative to the spec file, like shot sources
  const mdFile = path.join(dir, `${titleOf(spec)}.md`);
  const imgDir = path.join(dir, imagesDirName(spec));
  if (fs.existsSync(mdFile)) die(`output exists, refuse to overwrite: ${mdFile}`);
  const plan = [];
  for (const it of spec.items) for (const s of it.shots ?? []) {
    const target = path.join(imgDir, s.image);
    const src = s.source ? path.resolve(path.dirname(specFile), s.source) : null;
    if (src && !fs.existsSync(src)) die(`shot source not found: ${src}`);
    if (!src && !fs.existsSync(target)) die(`image not found (give "source" or put it there first): ${target}`);
    const buf = fs.readFileSync(src || target);
    pngSize(buf); // throws if not PNG
    if (src && fs.existsSync(target) && md5(fs.readFileSync(target)) !== md5(buf)) die(`different image already exists, refuse to overwrite: ${target}`);
    const same = plan.find((p) => p.target === target);
    if (same && md5(fs.readFileSync(same.src || same.target)) !== md5(buf)) die(`two different images are planned for the same file name "${s.image}" (give each shot its own image name)`);
    plan.push({ target, src, copy: !!src && !fs.existsSync(target) && !same });
  }
  const text = renderMd(spec);
  parseMd(text, mdFile); // the md we write must be parseable by step 2
  if (!dryRun) {
    fs.mkdirSync(imgDir, { recursive: true });
    for (const p of plan) if (p.copy) fs.copyFileSync(p.src, p.target, fs.constants.COPYFILE_EXCL);
    fs.writeFileSync(mdFile, text, { encoding: 'utf8', flag: 'wx' });
  }
  return { dryRun: !!dryRun, md: mdFile, imagesDir: imgDir, items: spec.items.length, images: plan.length, copied: plan.filter((p) => p.copy).length };
}

if (process.argv[1]?.endsWith('make-md.mjs')) {
  try {
    const a = parseArgs(process.argv.slice(2), ['dry-run']);
    if (!a._[0]) die('usage: node make-md.mjs <spec.json> [--out-dir <dir>] [--format <format.json>] [--dry-run]');
    setFormat(a.format);
    console.log(JSON.stringify(makeMd(a._[0], { outDir: a['out-dir'], dryRun: a['dry-run'] }), null, 2));
  } catch (e) { console.error('ERROR:', e.message); process.exit(1); }
}
