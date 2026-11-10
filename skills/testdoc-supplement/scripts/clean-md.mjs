#!/usr/bin/env node
// Step 3 (optional) — after the user has accepted a ticket's docx, remove that ticket's md and its own images.
// Dry-run unless --yes. A ticket is cleaned only when its docx (next to the md, or in --out-dir) passes the read-back check
// AND matches what the md produces today (same paragraphs, same images in the same order); a stale docx never authorizes deletion.
// Only files inside <md folder>/<title>_images are removed (images referenced from elsewhere are reported as "kept");
// the md is removed last, and the images folder only if it ends up empty.
//   node clean-md.mjs <a.md> … | --root <dir> --suffix <suffix> [--tickets A,B]   [--out-dir D] [--format f.json] [--yes]
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { checkDocx, collectMd, dumpDocx, parseArgs, parseMd, setFormat } from './lib.mjs';
import { convertOne } from './make-docx.mjs';

const same = (a, b) => JSON.stringify([a.paragraphs, a.media.map((m) => m.md5)]) === JSON.stringify([b.paragraphs, b.media.map((m) => m.md5)]);

export function cleanOne(mdFile, { yes = false, outDir } = {}) {
  mdFile = path.resolve(mdFile);
  const r = { md: mdFile, removed: [], kept: [], skipped: null };
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'testdoc-clean-'));
  try {
    const doc = parseMd(fs.readFileSync(mdFile, 'utf8'), mdFile);
    const docx = path.join(outDir ? path.resolve(outDir) : path.dirname(mdFile), `${doc.title}.docx`);
    if (!fs.existsSync(docx)) { r.skipped = `docx not found: ${docx}`; return r; }
    checkDocx(docx);
    const fresh = convertOne(mdFile, { outDir: tmp }); // what the md produces now
    if (!same(dumpDocx(docx), dumpDocx(fresh.docx))) { r.skipped = `docx does not match the current md (text or images differ): ${docx}`; return r; }
    r.docx = docx;
    const own = path.join(path.dirname(mdFile), `${doc.title}_images`);
    const imgs = [...new Set(doc.items.flatMap((i) => i.shots.map((s) => s.image)))].filter((f) => fs.existsSync(f));
    const inOwn = (f) => { const rel = path.relative(own, f); return rel && !rel.startsWith('..') && !path.isAbsolute(rel); };
    r.kept = imgs.filter((f) => !inOwn(f));
    r.wouldRemove = [...imgs.filter(inOwn), mdFile];
    if (yes) {
      for (const f of r.wouldRemove) { fs.rmSync(f); r.removed.push(f); } // md is last in the list
      if (fs.existsSync(own) && !fs.readdirSync(own).length) fs.rmdirSync(own);
    }
  } catch (e) { r.skipped = e.message; } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  return r;
}

if (process.argv[1]?.endsWith('clean-md.mjs')) {
  const a = parseArgs(process.argv.slice(2), ['yes']);
  let results;
  try { setFormat(a.format); results = collectMd(a).map((f) => cleanOne(f, { yes: a.yes, outDir: a['out-dir'] })); }
  catch (e) { console.error('ERROR:', e.message); process.exit(1); }
  console.log(JSON.stringify(results, null, 2));
  console.error((a.yes ? 'removed' : 'dry-run only (add --yes to delete)') + `; skipped: ${results.filter((r) => r.skipped).length}`);
  process.exit(results.some((r) => r.skipped) ? 1 : 0);
}
