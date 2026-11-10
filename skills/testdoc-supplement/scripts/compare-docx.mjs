#!/usr/bin/env node
// Compare two docx files: paragraph texts (with image markers) and word/media (count, bytes, md5). Exit 1 on any difference.
//   node compare-docx.mjs <expected.docx> <actual.docx> [--parts]   (--parts also compares every part's md5)
import { dumpDocx, md5, parseArgs, readZip, die } from './lib.mjs';

const a = parseArgs(process.argv.slice(2), ['parts']);
if (a._.length !== 2) die('usage: node compare-docx.mjs <expected.docx> <actual.docx> [--parts]');
const [x, y] = a._.map(dumpDocx);
const diffs = [];
if (x.paragraphs.length !== y.paragraphs.length) diffs.push(`paragraph count ${x.paragraphs.length} vs ${y.paragraphs.length}`);
for (let i = 0; i < Math.max(x.paragraphs.length, y.paragraphs.length); i++)
  if (x.paragraphs[i] !== y.paragraphs[i]) diffs.push(`paragraph ${i}: ${JSON.stringify(x.paragraphs[i])} vs ${JSON.stringify(y.paragraphs[i])}`);
if (x.media.length !== y.media.length) diffs.push(`media count ${x.media.length} vs ${y.media.length}`);
for (let i = 0; i < Math.max(x.media.length, y.media.length); i++)
  if (JSON.stringify(x.media[i]) !== JSON.stringify(y.media[i])) diffs.push(`media ${i}: ${JSON.stringify(x.media[i])} vs ${JSON.stringify(y.media[i])}`);
let partsNote = null;
if (a.parts) {
  const [zx, zy] = a._.map(readZip);
  const names = new Set([...zx.keys(), ...zy.keys()]);
  const pd = [...names].filter((n) => !zx.has(n) || !zy.has(n) || md5(zx.get(n)) !== md5(zy.get(n)));
  partsNote = pd.length ? `parts differing: ${pd.join(', ')}` : `all ${names.size} parts byte-identical`;
  if (pd.length) diffs.push(partsNote);
}
console.log(JSON.stringify({ paragraphs: [x.paragraphs.length, y.paragraphs.length], media: [x.media.length, y.media.length], mediaMd5Equal: x.media.map((m) => m.md5).join() === y.media.map((m) => m.md5).join(), parts: partsNote, identical: !diffs.length, diffs }, null, 2));
process.exit(diffs.length ? 1 : 0);
