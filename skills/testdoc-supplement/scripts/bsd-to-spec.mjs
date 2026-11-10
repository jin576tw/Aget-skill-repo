#!/usr/bin/env node
// Step 0 — read an existing BSD / 測試文件 .docx and write a spec.json skeleton (item titles, BSD text, caption list).
//   node bsd-to-spec.mjs <BSD.docx> --out <spec.json> [--ticket T] [--source-dir D] [--title-suffix 測試文件(補)]
//                        [--status-text 已在環境測試完成] [--status-mode per-item|document]
// Image file names are placeholders item<N>[-<k>].png; take the screenshots to those names, then run make-md.mjs.
// Refuses to overwrite --out. The skeleton keeps the BSD wording verbatim; edit it before running make-md.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { die, parseArgs, readZip, unesc } from './lib.mjs';

export function readBsd(docx) {
  const xml = readZip(docx).get('word/document.xml')?.toString('utf8') ?? die('no word/document.xml: ' + docx);
  const paras = [...xml.matchAll(/<w:p(?:\s[^>]*)?\/>|<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)].map((m) => ({
    text: [...m[0].matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((t) => unesc(t[1])).join('').trim(),
    img: /<a:blip\b/.test(m[0]),
  }));
  const ticket = paras.map((p) => /^\[PCR單\s*:\s*(.+?)\]$/.exec(p.text)?.[1]).find(Boolean) ?? null;
  const items = [];
  let cur = null, pendingLabel = null;
  for (const p of paras) {
    const h = /^項目(.+?)：(.*)$/.exec(p.text);
    if (h) { cur = { title: h[2].trim(), text: [], shots: [] }; items.push(cur); pendingLabel = null; continue; }
    if (!cur) continue;
    if (p.img) { cur.shots.push({ label: (p.text.endsWith('：') ? p.text.slice(0, -1) : pendingLabel ?? '畫面截圖'), image: '' }); pendingLabel = null; continue; }
    if (!p.text) continue;
    if (p.text.endsWith('：') && /截圖|畫面|查詢|顯示/.test(p.text) && p.text.length < 60) pendingLabel = p.text.slice(0, -1);
    else cur.text.push(p.text);
  }
  items.forEach((it, i) => it.shots.forEach((s, k) => { s.image = `item${i + 1}${it.shots.length > 1 ? '-' + (k + 1) : ''}.png`; }));
  return { ticket, items };
}

if (process.argv[1]?.endsWith('bsd-to-spec.mjs')) {
  try {
    const a = parseArgs(process.argv.slice(2));
    if (!a._[0] || !a.out) die('usage: node bsd-to-spec.mjs <BSD.docx> --out <spec.json> [--ticket T] [--source-dir D]');
    const bsd = readBsd(path.resolve(a._[0]));
    const ticket = a.ticket || bsd.ticket || die('ticket not found in docx; pass --ticket');
    const spec = {
      ticket,
      sourceDir: a['source-dir'] || path.dirname(path.resolve(a._[0])),
      titleSuffix: a['title-suffix'] || '測試文件(補)',
      statusText: a['status-text'] || '已在環境測試完成',
      statusMode: a['status-mode'] || 'per-item',
      items: bsd.items,
      notes: [],
    };
    const out = path.resolve(a.out);
    if (fs.existsSync(out)) die(`output exists, refuse to overwrite: ${out}`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(spec, null, 2) + '\n', { encoding: 'utf8', flag: 'wx' });
    console.log(JSON.stringify({ spec: out, ticket, items: spec.items.length, shots: spec.items.reduce((n, i) => n + i.shots.length, 0) }, null, 2));
  } catch (e) { console.error('ERROR:', e.message); process.exit(1); }
}
