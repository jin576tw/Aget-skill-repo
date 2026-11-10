#!/usr/bin/env node
// Step 1.5 — read-only review aid before converting: parse every md, verify each referenced image exists and is a PNG,
// and (optionally) that none of the --forbid terms appear in the part that reaches the docx. Writes nothing.
//   node check-md.mjs <a.md> [b.md …] | --root <dir> --suffix <suffix> [--tickets A,B]  [--forbid 出處,原測試文件]
import fs from 'node:fs';
import path from 'node:path';
import { collectMd, forbidHits, parseArgs, parseMd, pngSize, splitList } from './lib.mjs';

export function checkMd(mdFile, { forbid = [] } = {}) {
  const r = { md: mdFile, ok: true, problems: [] };
  try {
    const doc = parseMd(fs.readFileSync(mdFile, 'utf8'), mdFile);
    Object.assign(r, { ticket: doc.ticket, items: doc.items.length, images: 0 });
    for (const it of doc.items) for (const s of it.shots) {
      r.images++;
      if (!fs.existsSync(s.image)) { r.problems.push(`missing image: ${s.image}`); continue; }
      try { pngSize(fs.readFileSync(s.image)); } catch { r.problems.push(`not a PNG: ${s.image}`); }
    }
    const hits = forbidHits(doc, forbid);
    if (hits.length) r.problems.push(`forbidden text in docx part: ${hits.join(', ')}`);
    if (!doc.items.every((i) => i.shots.length || i.texts.length)) r.problems.push('an item has neither text nor image');
  } catch (e) { r.problems.push(e.message); }
  r.ok = !r.problems.length;
  return r;
}

if (process.argv[1]?.endsWith('check-md.mjs')) {
  const a = parseArgs(process.argv.slice(2), []);
  let results;
  try { results = collectMd(a).map((f) => checkMd(f, { forbid: splitList(a.forbid) })); }
  catch (e) { console.error('ERROR:', e.message); process.exit(1); }
  console.log(JSON.stringify(results, null, 2));
  const bad = results.filter((r) => !r.ok).length;
  console.error(`${results.length - bad} ok, ${bad} with problems`);
  process.exit(bad ? 1 : 0);
}
