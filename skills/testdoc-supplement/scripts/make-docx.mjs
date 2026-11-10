#!/usr/bin/env node
// Step 2 — md → docx (batch capable). The md the user confirmed is the single source of truth.
//
//   node make-docx.mjs <a.md> [b.md ...]                       explicit md files
//   node make-docx.mjs --root <dir> --suffix <title suffix> [--tickets A,B]   every <dir>/<any folder>/<T>_<suffix>.md (folder name need not equal T)
//   options: --template <docx|md>   styles/settings/theme source (default: bsd-report docx-structure.md statics)
//            --out-dir <dir>        write docx here instead of next to each md
//            --dry-run              full preflight (parse, images are valid PNGs, no forbidden text) + print the plan, write nothing
//            --out <file.docx>      output path for a single md (default: <md folder>/<title>.docx)
//            --format <f.json>      override labels / font / status color / image width (see FORMAT in lib.mjs)
//            --forbid a,b           fail a ticket whose md body (above the --- notes) contains any of these terms
//            --keep-parts           keep the temp OOXML parts folder
// Never overwrites an existing docx (reported as a failure, exit code 1); a docx is published only after it passes the read-back check. Never touches the md/images.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { FORMAT, setFormat, packDocxPath, docxStructurePath, checkDocx, collectMd, die, esc, forbidHits, parseArgs, parseMd, pngSize, readZip, splitList } from './lib.mjs';

// Font, status color, labels and image width come from FORMAT (defaults = the BSD / 測試文件 layout, see lib.mjs).
const fonts = () => `<w:rFonts w:ascii="${FORMAT.font}" w:eastAsia="${FORMAT.font}" w:hAnsi="${FORMAT.font}"/>`;
const P = {
  title: (t) => `<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:rPr>${fonts()}<w:sz w:val="32"/></w:rPr><w:t>${esc(t)}</w:t></w:r></w:p>`,
  pcr: (t) => `<w:p><w:r><w:rPr><w:b/>${fonts()}<w:sz w:val="22"/></w:rPr><w:t>[${esc(FORMAT.ticketLabel)} : ${esc(t)}]</w:t></w:r></w:p>`,
  item: (n, t) => `<w:p><w:r><w:rPr><w:b/>${fonts()}</w:rPr><w:t>${esc(FORMAT.itemLabel)}${esc(n)}：${esc(t)}</w:t></w:r></w:p>`,
  status: (t) => `<w:p><w:r><w:rPr><w:b/><w:bCs/>${fonts()}<w:color w:val="${FORMAT.statusColor}"/></w:rPr><w:t>${esc(t)}</w:t></w:r></w:p>`,
  text: (t) => `<w:p><w:r><w:rPr>${fonts()}</w:rPr><w:t xml:space="preserve">${esc(t)}</w:t></w:r></w:p>`,
  label: (t) => `<w:p><w:pPr><w:keepNext/></w:pPr><w:r><w:rPr>${fonts()}</w:rPr><w:t>${esc(t)}：</w:t></w:r></w:p>`,
  img: (rId, cx, cy, id, name) => `<w:p><w:r><w:rPr>${fonts()}<w:noProof/></w:rPr><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:effectExtent l="0" t="0" r="0" b="0"/><wp:docPr id="${id}" name="${name}"/><wp:cNvGraphicFramePr/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${id}" name=""/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rId}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`,
};
const IMG_REL = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships/image';

// Paragraph XML + image list for a parsed md. rIdFor(n) decides the relationship id of the n-th image.
export function buildBody(doc, rIdFor) {
  let x = P.title(doc.title) + P.pcr(doc.ticket);
  if (doc.docStatus !== null) x += P.status(doc.docStatus);
  const images = [];
  for (const it of doc.items) {
    x += '<w:p/>' + P.item(it.num, it.title);
    if (it.status !== null) x += P.status(it.status);
    for (const o of it.order) { // text and screenshots exactly in the order written in the md
      if (o.text) { x += P.text(o.text); continue; }
      const s = o.shot;
      const buf = fs.existsSync(s.image) ? fs.readFileSync(s.image) : die(`image not found: ${s.image}`);
      let size;
      try { size = pngSize(buf); } catch (e) { die(`image is not a valid PNG (${e.message}): ${s.image}`); }
      const n = images.length + 1;
      images.push({ n, buf, file: s.image });
      x += P.label(s.label) + P.img(rIdFor(n), FORMAT.imageWidth, Math.round((FORMAT.imageWidth * size.h) / size.w), n, `圖片 ${n}`);
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

// Full preflight on one md (parse, every image exists and is a valid PNG, no forbidden text, no empty item).
// Used by --dry-run, which is therefore also the md review check; it never writes and does not fail because the docx already exists.
export function preflight(mdFile, { forbid } = {}) {
  mdFile = path.resolve(mdFile);
  if (!fs.existsSync(mdFile)) die(`md not found (run step 1 first): ${mdFile}`);
  const doc = parseMd(fs.readFileSync(mdFile, 'utf8'), mdFile);
  const hits = forbidHits(doc, forbid);
  if (hits.length) die(`md body contains forbidden text (${hits.join(', ')}); move it below the "---" notes line: ${mdFile}`);
  for (const it of doc.items) if (!it.order.length) die(`item "${it.title}" has neither text nor image: ${mdFile}`);
  buildBody(doc, (n) => `rId${n}`); // validates every image
  return { mdFile, doc };
}

export function convertOne(mdFile, { template, outDir, output, dryRun, keepParts, forbid }) {
  const { mdFile: md, doc } = preflight(mdFile, { forbid });
  const outFile = output ? path.resolve(output) : path.join(outDir ? path.resolve(outDir) : path.dirname(md), `${doc.title}.docx`);
  const summary = { md, docx: outFile, ticket: doc.ticket, title: doc.title, items: doc.items.length, images: doc.items.reduce((a, i) => a + i.shots.length, 0), statusMode: doc.docStatus === null ? 'per-item' : 'document' };
  if (dryRun) return { ...summary, dryRun: true, outputExists: fs.existsSync(outFile) };
  if (fs.existsSync(outFile)) die(`output exists, refuse to overwrite: ${outFile}`);
  const parts = fs.mkdtempSync(path.join(os.tmpdir(), `testdoc-${doc.ticket}-`));
  try {
    if (template && /\.docx$/i.test(template)) partsFromTemplateDocx(parts, doc, template);
    else partsFromStructureMd(parts, doc, template || docxStructurePath());
    // pack and verify in the temp folder; only a verified docx is published, so a failed check never leaves a file at the final path
    const staged = path.join(parts, '..', path.basename(parts) + '.docx');
    execFileSync(process.execPath, [packDocxPath(), parts, staged], { stdio: ['ignore', 'pipe', 'inherit'] });
    try {
      summary.check = checkDocx(staged);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.copyFileSync(staged, outFile, fs.constants.COPYFILE_EXCL);
    } finally { fs.rmSync(staged, { force: true }); }
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
  let files = [];
  try {
    setFormat(args.format);
    files = collectMd(args);
    if (args.out && files.length !== 1) die('--out names one docx file; give exactly one md');
  } catch (e) { console.error('ERROR:', e.message); process.exit(1); }
  for (const f of files) {
    try {
      const r = convertOne(f, { template: args.template, outDir: args['out-dir'], output: args.out, dryRun: args['dry-run'], keepParts: args['keep-parts'], forbid: splitList(args.forbid) });
      results.push({ ok: true, ...r });
    } catch (e) { failed++; results.push({ ok: false, md: f, error: e.message }); }
  }
  console.log(JSON.stringify(results, null, 2));
  console.error(`${results.length - failed} ok, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
