#!/usr/bin/env node
// Step 3 (optional) — after the user has accepted a ticket's docx, remove that ticket's md and referenced images.
// Dry-run unless --yes. A ticket is only cleaned when its docx exists next to the md, passes the read-back check and
// carries exactly as many images as the md references. Only the md and the images it references are removed
// (the images folder is removed only if that leaves it empty); anything else is left alone.
//   node clean-md.mjs <a.md> … | --root <dir> --suffix <suffix> [--tickets A,B]   [--yes]
import fs from 'node:fs';
import path from 'node:path';
import { checkDocx, collectMd, dumpDocx, parseArgs, parseMd } from './lib.mjs';

export function cleanOne(mdFile, { yes = false } = {}) {
  const r = { md: mdFile, removed: [], skipped: null };
  try {
    const doc = parseMd(fs.readFileSync(mdFile, 'utf8'), mdFile);
    const docx = path.join(path.dirname(mdFile), `${doc.title}.docx`);
    if (!fs.existsSync(docx)) { r.skipped = `docx not found: ${docx}`; return r; }
    checkDocx(docx);
    const imgs = [...new Set(doc.items.flatMap((i) => i.shots.map((s) => s.image)))];
    const want = doc.items.reduce((n, i) => n + i.shots.length, 0), got = dumpDocx(docx).media.length;
    if (got !== want) { r.skipped = `docx has ${got} images but md references ${want}`; return r; }
    r.docx = docx;
    r.wouldRemove = [mdFile, ...imgs.filter((f) => fs.existsSync(f))];
    if (yes) {
      for (const f of r.wouldRemove) { fs.rmSync(f); r.removed.push(f); }
      for (const d of new Set(imgs.map((f) => path.dirname(f)))) if (fs.existsSync(d) && !fs.readdirSync(d).length) fs.rmdirSync(d);
    }
  } catch (e) { r.skipped = e.message; }
  return r;
}

if (process.argv[1]?.endsWith('clean-md.mjs')) {
  const a = parseArgs(process.argv.slice(2), ['yes']);
  let results;
  try { results = collectMd(a).map((f) => cleanOne(f, { yes: a.yes })); }
  catch (e) { console.error('ERROR:', e.message); process.exit(1); }
  console.log(JSON.stringify(results, null, 2));
  console.error(a.yes ? 'removed' : 'dry-run only (add --yes to delete); skipped: ' + results.filter((r) => r.skipped).length);
  process.exit(results.some((r) => r.skipped) ? 1 : 0);
}
