#!/usr/bin/env node
// Step 2 — md → docx (batch capable). The md the user confirmed is the single source of truth.
//
//   node make-docx.mjs <a.md> [b.md ...]                       explicit md files
//   node make-docx.mjs --root <dir> --suffix <title suffix> [--tickets A,B]   every <dir>/<any folder>/<T>_<suffix>.md (folder name need not equal T)
//   options: --template <docx|md>   styles/settings/theme source (default: bsd-report docx-structure.md statics)
//            --out-dir <dir>        write docx here instead of next to each md
//            --dry-run              parse + validate + print the plan, write nothing
//            --forbid a,b           fail a ticket whose md body (above the --- notes) contains any of these terms
//            --keep-parts           keep the temp OOXML parts folder
// Never overwrites an existing docx (that file is skipped and reported; exit code 1). Never touches the md/images.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { packDocxPath, docxStructurePath, checkDocx, collectMd, die, esc, forbidHits, parseArgs, parseMd, pngSize, readZip, splitList } from './lib.mjs';

const F = '<w:rFonts w:ascii="新細明體" w:eastAsia="新細明體" w:hAnsi="新細明體"/>';
const P = {
  title: (t) => `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr>${F}<w:sz w:val="32"/></w:rPr><w:t>${esc(t)}</w:t></w:r></w:p>`,
  pcr: (t) => `<w:p><w:r><w:rPr><w:b/>${F}<w:sz w:val="22"/></w:rPr><w:t>[PCR單 : ${esc(t)}]</w:t></w:r></w:p>`,
  item: (n, t) => `<w:p><w:r><w:rPr><w:b/>${F}</w:rPr><w:t>項目${esc(n)}：${esc(t)}</w:t></w:r></w:p>`,
  status: (t) => `<w:p><w:r><w:rPr><w:b/><w:bCs/>${F}<w:color w:val="FF0000"/></w:rPr><w:t>${esc(t)}</w:t></w:r></w:p>`,
  text: (t) => `<w:p><w:r><w:rPr>${F}</w:rPr><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`,
  label: (t) => `<w:p><w:pPr><w:keepNext/></w:pPr><w:r><w:rPr>${F}</w:rPr><w:t>${esc(t)}：</w:t></w:r></w:p>`,
  img: (rId, cx, cy, id, name) => `<w:p><w:r><w:rPr>${F}<w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${id}" name="${name}"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name=""/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`,
};
const CX = 5274310; // display width used by the BSD / 測試文件 samples
const IMG_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';

// Paragraph XML + image list for a parsed md. rIdFor(n) decides the relationship id of the n-th image.
export function buildBody(doc, rIdFor) {
  let x = P.title(doc.title) + P.pcr(doc.ticket);
  if (doc.docStatus !== null) x += P.status(doc.docStatus);
  const images = [];
  for (const it of doc.items) {
    x += '<w:p/>' + P.item(it.num, it.title);
    if (it.status !== null) x += P.status(it.status);
    for (const t of it.texts) x += P.text(t);
    for (const s of it.shots) {
      const buf = fs.existsSync(s.image) ? fs.readFileSync(s.image) : die(`image not found: ${s.image}`);
      let size;
      try { size = pngSize(buf); } catch { die(`image is not a PNG: ${s.image}`); }
      const n = images.length + 1;
      images.push({ n, buf, file: s.image });
      x += P.label(s.label) + P.img(rIdFor(n), CX, Math.round((CX * size.h) / size.w), n, `圖片 ${n}`);
    }
  }
  return { xml: x, images };
}

const staticsMd = ['[Content_Types].xml', '_rels/.rels', 'word/styles.xml', 'word/settings.xml', 'word/fontTable.xml',
  'word/webSettings.xml', 'word/numbering.xml', 'word/theme/theme1.xml'];
const write = (root, rel, data) => { const f = path.join(root, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };

function partsFromStructureMd(parts, doc, mdFile) {
  const md = fs.readFileSync(mdFile, 'utf8').replace(/\r\n?/g, '\n'); // repo checkouts may carry CRLF
  const block = (h) => {
    const i = md.indexOf(`### ${h}`);
    if (i < 0) die(`heading not found in ${mdFile}: ${h}`);
    return /```xml\n([\s\S]*?)\n```/.exec(md.slice(i))[1];
  };
  const { xml, images } = buildBody(doc, (n) => `rId${n + 4}`);
  for (const p of staticsMd) write(parts, p, block(p));
  write(parts, 'word/document.xml', block('document.xml 完整骨架').replace('{PARAGRAPHS}', xml));
  const rels = images.map((i) => `<Relationship Id="rId${i.n + 4}" Type="${IMG_REL}" Target="media/image${i.n}.png"/>`).join('');
  write(parts, 'word/_rels/document.xml.rels', block('document.xml.rels').replace('{IMAGE_RELATIONSHIPS}', rels)
    .replace('{FONT_TABLE_RID}', `rId${images.length + 5}`).replace('{THEME_RID}', `rId${images.length + 6}`));
  for (const i of images) write(parts, `word/media/image${i.n}.png`, i.buf);
  return images.length;
}

// Reuse a finished .docx (any finished .docx) as the style/page-setup template:
// every part is copied except the body paragraphs, the document's own image relationships and their media.
function partsFromTemplateDocx(parts, doc, tpl) {
  const z = readZip(tpl);
  const docXml = z.get('word/document.xml')?.toString('utf8') ?? die(`template has no word/document.xml: ${tpl}`);
  const relsXml = z.get('word/_rels/document.xml.rels')?.toString('utf8') ?? die(`template has no document.xml.rels: ${tpl}`);
  for (const ns of ['xmlns:wp=', 'xmlns:r=', 'xmlns:w=']) if (!docXml.includes(ns)) die(`template document.xml lacks ${ns}: ${tpl}`);
  const imgRels = [...relsXml.matchAll(/<Relationship\b[^>]*>/g)].map((m) => m[0]).filter((r) => r.includes(IMG_REL));
  const dropMedia = new Set(imgRels.map((r) => 'word/' + /Target="([^"]+)"/.exec(r)?.[1]));
  const { xml, images } = buildBody(doc, (n) => `rIdTD${n}`);
  for (const [name, buf] of z) {
    if (name === 'word/document.xml' || name === 'word/_rels/document.xml.rels' || dropMedia.has(name)) continue;
    write(parts, name, buf);
  }
  const bodyAt = docXml.indexOf('<w:body>') >= 0 ? docXml.indexOf('<w:body>') + 8 : die('template has no <w:body>');
  const sect = docXml.lastIndexOf('<w:sectPr');
  const tail = sect > bodyAt ? docXml.slice(sect) : docXml.slice(docXml.lastIndexOf('</w:body>'));
  write(parts, 'word/document.xml', docXml.slice(0, bodyAt) + xml + tail);
  const keep = relsXml.replace(/<Relationship\b[^>]*>/g, (r) => (r.includes(IMG_REL) ? '' : r));
  const add = images.map((i) => `<Relationship Id="rIdTD${i.n}" Type="${IMG_REL}" Target="media/image${i.n}.png"/>`).join('');
  write(parts, 'word/_rels/document.xml.rels', keep.replace('</Relationships>', add + '</Relationships>'));
  for (const i of images) write(parts, `word/media/image${i.n}.png`, i.buf);
  const ctPath = path.join(parts, '[Content_Types].xml');
  let ct = fs.readFileSync(ctPath, 'utf8');
  if (!/Extension="png"/i.test(ct)) { ct = ct.replace(/(<Types\b[^>]*>)/, '$1<Default Extension="png" ContentType="image/png"/>'); fs.writeFileSync(ctPath, ct); }
  return images.length;
}

export function convertOne(mdFile, { template, outDir, dryRun, keepParts, forbid }) {
  mdFile = path.resolve(mdFile);
  if (!fs.existsSync(mdFile)) die(`md not found (run step 1 first): ${mdFile}`);
  const doc =parseMd(fs.readFileSync(mdFile, 'utf8'), mdFile);
  const outFile = path.join(outDir ? path.resolve(outDir) : path.dirname(mdFile), `${doc.title}.docx`);
  if (fs.existsSync(outFile)) die(`output exists, refuse to overwrite: ${outFile}`);
  const hits = forbidHits(doc, forbid);
  if (hits.length) die(`md body contains forbidden text (${hits.join(', ')}); move it below the "---" notes line: ${mdFile}`);
  const nShots = doc.items.reduce((a, i) => a + i.shots.length, 0);
  for (const it of doc.items) for (const s of it.shots) if (!fs.existsSync(s.image)) die(`image not found: ${s.image}`);
  const summary = { md: mdFile, docx: outFile, ticket: doc.ticket, title: doc.title, items: doc.items.length, images: nShots, statusMode: doc.docStatus === null ? 'per-item' : 'document' };
  if (dryRun) return { ...summary, dryRun: true };
  const parts = fs.mkdtempSync(path.join(os.tmpdir(), `testdoc-${doc.ticket}-`));
  try {
    if (template && /\.docx$/i.test(template)) partsFromTemplateDocx(parts, doc, template);
    else partsFromStructureMd(parts, doc, template || docxStructurePath());
    fs.mkdirSync(path.dirname(outFile), { recursive: true });
    execFileSync(process.execPath, [packDocxPath(), parts, outFile], { stdio: ['ignore', 'pipe', 'inherit'] });
    summary.check = checkDocx(outFile); // read-back; a failing check leaves the file for inspection and marks the ticket failed
  } finally {
    if (!keepParts) fs.rmSync(parts, { recursive: true, force: true });
    else summary.parts = parts;
  }
  return summary;
}

if (import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`).href || process.argv[1]?.endsWith('make-docx.mjs')) {
  const args = parseArgs(process.argv.slice(2), ['dry-run', 'keep-parts']);
  let failed = 0;
  const results = [];
  for (const f of collectMd(args)) {
    try {
      const r = convertOne(f, { template: args.template, outDir: args['out-dir'], dryRun: args['dry-run'], keepParts: args['keep-parts'], forbid: splitList(args.forbid) });
      results.push({ ok: true, ...r });
    } catch (e) { failed++; results.push({ ok: false, md: f, error: e.message }); }
  }
  console.log(JSON.stringify(results, null, 2));
  console.error(`${results.length - failed} ok, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
