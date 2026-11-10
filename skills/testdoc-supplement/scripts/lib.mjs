// testdoc-supplement shared helpers: md render/parse, minimal zip reader, docx paragraph dump, PNG size.
// Pure Node (no dependencies). Packing is delegated to the Aget plugin's pack-docx.mjs (not re-implemented here).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

// Paths resolve relative to this file (plugin layout: <root>/skills/testdoc-supplement/scripts, <root>/scripts/pack-docx.mjs,
// <root>/skills/bsd-report/docx-structure.md); env vars override for any other layout.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const firstExisting = (list, what) => list.find((p) => fs.existsSync(p)) ?? die(`${what} not found (set the env var to override); looked in: ${list.join(' | ')}`);
export const packDocxPath = () => process.env.PACK_DOCX || firstExisting([path.resolve(HERE, '../../../scripts/pack-docx.mjs')], 'pack-docx.mjs (PACK_DOCX)');
export const docxStructurePath = () => process.env.DOCX_STRUCTURE || firstExisting([path.resolve(HERE, '../../bsd-report/docx-structure.md')], 'bsd-report/docx-structure.md (DOCX_STRUCTURE)');
export const NOTES_HEAD = '以下為確認用備註，**不輸出到 docx**。';

export const die = (msg) => { throw new Error(msg); };
export const md5 = (buf) => crypto.createHash('md5').update(buf).digest('hex');

// ---- CLI args: positional[] + --key value + --flag
export function parseArgs(argv, flags = []) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      if (flags.includes(k)) out[k] = true;
      else { out[k] = argv[++i]; if (out[k] === undefined) die(`missing value for --${k}`); }
    } else out._.push(a);
  }
  return out;
}

// ---- presentation defaults (the BSD / 測試文件 layout). Override per run with --format <file.json> (any subset of these keys).
export const FORMAT = { ticketLabel: 'PCR單', itemLabel: '項目', itemNumbering: 'cn', font: '新細明體', statusColor: 'FF0000', imageWidth: 5274310 };
export function setFormat(file) {
  if (!file) return FORMAT;
  const o = JSON.parse(fs.readFileSync(path.resolve(file), 'utf8'));
  for (const k of Object.keys(o)) if (!(k in FORMAT)) die(`--format: unknown key "${k}" (allowed: ${Object.keys(FORMAT).join(', ')})`);
  Object.assign(FORMAT, o);
  if (!['cn', 'arabic'].includes(FORMAT.itemNumbering)) die('--format: itemNumbering must be "cn" or "arabic"');
  return FORMAT;
}
const reEsc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, (c) => '\\' + c);
export const itemNo = (n) => (FORMAT.itemNumbering === 'arabic' ? String(n) : numToCn(n));

// ---- 項目編號 (一、二…十、十一…)
const D = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
export function numToCn(n) {
  if (n < 1 || n > 99) die('item number out of range: ' + n);
  if (n < 10) return D[n];
  const t = Math.floor(n / 10), o = n % 10;
  return (t === 1 ? '' : D[t]) + '十' + D[o];
}

export const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export const unesc = (s) => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');

export function pngSize(buf) {
  if (buf.length < 24 || buf.readUInt32BE(0) !== 0x89504e47) die('not a PNG file');
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  if (!w || !h) die('PNG has zero width or height');
  return { w, h };
}

// ---- minimal ZIP reader (store + deflate), enough for OOXML packages
export function readZip(file) {
  const buf = fs.readFileSync(file);
  let e = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { e = i; break; }
  if (e < 0) die('not a zip file: ' + file);
  const count = buf.readUInt16LE(e + 10);
  let p = buf.readUInt32LE(e + 16);
  const files = new Map();
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) die('bad central directory: ' + file);
    const method = buf.readUInt16LE(p + 10), csize = buf.readUInt32LE(p + 20);
    const nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32);
    const lho = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nlen);
    const ds = lho + 30 + buf.readUInt16LE(lho + 26) + buf.readUInt16LE(lho + 28);
    const raw = buf.subarray(ds, ds + csize);
    if (!name.endsWith('/')) files.set(name, method === 0 ? Buffer.from(raw) : method === 8 ? zlib.inflateRawSync(raw) : die('unsupported zip method ' + method));
    p += 46 + nlen + xlen + clen;
  }
  return files;
}

// ---- docx dump: one entry per <w:p>, text + image count; media list with md5
export function dumpDocx(file) {
  const z = readZip(file);
  const xml = z.get('word/document.xml')?.toString('utf8') ?? die('no word/document.xml: ' + file);
  const paragraphs = [];
  for (const m of xml.matchAll(/<w:p(?:\s[^>]*)?\/>|<w:p(?:\s[^>]*)?>[\s\S]*?<\/w:p>/g)) {
    const x = m[0];
    const text = [...x.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map((t) => unesc(t[1])).join('');
    const images = (x.match(/<a:blip\b/g) || []).length;
    paragraphs.push(images ? `${text}[IMG×${images}]` : text);
  }
  const media = [...z.keys()].filter((n) => n.startsWith('word/media/')).sort()
    .map((n) => ({ name: n, bytes: z.get(n).length, md5: md5(z.get(n)) }));
  return { paragraphs, media };
}

// ---- structural read-back check (no Word available): tag balance (not a full XML validation), r:embed ids resolve, targets exist, png content type
function tagBalance(xml, name) {
  const stack = [];
  for (const m of xml.matchAll(/<(\/?)([A-Za-z_][\w:.-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g)) {
    if (m[4]) continue;
    if (!m[1]) stack.push(m[2]);
    else if (stack.pop() !== m[2]) die(`${name}: mismatched </${m[2]}>`);
  }
  if (stack.length) die(`${name}: unclosed <${stack.pop()}>`);
}
export function checkDocx(file) {
  const z = readZip(file);
  const get = (n) => z.get(n)?.toString('utf8') ?? die(`${file}: missing part ${n}`);
  for (const [n, b] of z) if (/\.(xml|rels)$/.test(n)) tagBalance(b.toString('utf8'), n);
  const doc = get('word/document.xml'), rels = get('word/_rels/document.xml.rels');
  const relIds = new Map([...rels.matchAll(/<Relationship\b[^>]*>/g)].map((m) => [/Id="([^"]+)"/.exec(m[0])[1], /Target="([^"]+)"/.exec(m[0])[1]]));
  const embeds = [...doc.matchAll(/r:embed="([^"]+)"/g)].map((m) => m[1]);
  for (const id of embeds) if (!relIds.has(id)) die(`document.xml references missing relationship ${id}`);
  for (const [id, t] of relIds) if (!/^https?:/.test(t) && !z.has('word/' + t)) die(`relationship ${id} targets missing part word/${t}`);
  const docPr = [...doc.matchAll(/<wp:docPr id="(\d+)"/g)].map((m) => m[1]);
  if (new Set(docPr).size !== docPr.length) die('duplicate wp:docPr ids');
  if (embeds.length && !/Extension="png"/i.test(get('[Content_Types].xml'))) die('[Content_Types].xml lacks png default');
  return { parts: z.size, images: embeds.length };
}

// ---- md render (from spec) / parse (to doc model)
export function titleOf(spec) { return spec.titleSuffix ? `${spec.ticket}_${spec.titleSuffix}` : spec.ticket; }
export const imagesDirName = (spec) => `${titleOf(spec)}_images`;

export function renderMd(spec) {
  const mode = spec.statusMode || 'per-item';
  const L = [`# ${titleOf(spec)}`, '', `**[${FORMAT.ticketLabel} : ${spec.ticket}]**`, ''];
  if (mode === 'document') L.push(spec.statusText, '');
  spec.items.forEach((it, i) => {
    L.push(`## ${FORMAT.itemLabel}${itemNo(i + 1)}：${it.title}`, '');
    if (mode === 'per-item') L.push(it.status || spec.statusText, '');
    for (const t of [].concat(it.text ?? [])) L.push(t, '');
    for (const s of it.shots ?? []) {
      const alt = s.label.includes(' — ') ? s.label.split(' — ').pop() : s.label;
      L.push(`${s.label}：`, '', `![${alt}](${imagesDirName(spec)}/${s.image})`, '');
    }
  });
  if (spec.notes?.length) L.push('---', '', `> ${NOTES_HEAD}`, '>', ...spec.notes.map((n) => `> - ${n}`));
  return L.join('\n').replace(/\n+$/, '') + '\n';
}

// The notes block starts at the first "---" line whose next non-empty line starts with ">" (or that ends the file).
// Any other "---" in the body is outside the md dialect: reject it instead of silently cutting the document.
function bodyLines(text, mdPath) {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() !== '---') continue;
    const next = lines.slice(i + 1).find((l) => l.trim() !== '');
    if (next === undefined || next.startsWith('>')) return lines.slice(0, i);
    die(`${mdPath}:${i + 1}: unsupported "---" in the body (the notes block is "---" followed by a ">" line)`);
  }
  return lines;
}

export function parseMd(text, mdPath) {
  const body = bodyLines(text, mdPath).join('\n');
  const tk = reEsc(FORMAT.ticketLabel), il = reEsc(FORMAT.itemLabel);
  const t = /^# (.+)$/m.exec(body)?.[1]?.trim() ?? die(`${mdPath}: missing "# title" line`);
  const ticket = new RegExp(`\\*\\*\\[${tk} : (.+?)\\]\\*\\*`).exec(body)?.[1]?.trim() ?? die(`${mdPath}: missing **[${FORMAT.ticketLabel} : …]** line`);
  const parts = body.split(/^## /m);
  const pre = parts[0].split(/\n\s*\n/).map((b) => b.trim()).filter((b) => b && !b.startsWith('# ') && !b.startsWith(`**[${FORMAT.ticketLabel}`));
  if (pre.length > 1) die(`${mdPath}: more than one block between the ticket line and the first item (a document-level status must be a single line)`);
  const docStatus = pre[0] ?? null;
  const items = parts.slice(1).map((sec) => {
    const [head, ...rest] = sec.split('\n');
    const h = new RegExp(`^${il}(.+?)：(.*)$`).exec(head.trim()) ?? die(`${mdPath}: bad item heading: "${head}"`);
    const blocks = rest.join('\n').split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
    const status = docStatus === null ? blocks.shift() ?? die(`${mdPath}: item ${h[1]} has no status line`) : null;
    const order = []; // text paragraphs and screenshots in the order written in the md
    for (let i = 0; i < blocks.length; i++) {
      const b = blocks[i];
      if (/^!\[(.*?)\]\((.+)\)$/.test(b)) die(`${mdPath}: image without preceding caption line in item ${h[1]}: ${b}`);
      const nx = /^!\[(.*?)\]\((.+)\)$/.exec(blocks[i + 1] ?? '');
      if (nx) {
        if (!b.endsWith('：')) die(`${mdPath}: caption line must end with "：" in item ${h[1]}: "${b}"`);
        order.push({ shot: { label: b.slice(0, -1), image: path.resolve(path.dirname(mdPath), nx[2]) } });
        i++;
      } else order.push({ text: b });
    }
    return { num: h[1], title: h[2], status, order, texts: order.filter((o) => o.text).map((o) => o.text), shots: order.filter((o) => o.shot).map((o) => o.shot) };
  });
  if (!items.length) die(`${mdPath}: no item sections found`);
  return { title: t, ticket, docStatus, items };
}

// ---- find the md files for a batch: explicit paths, and/or every <root>/<folder>/<ticket>_<suffix>.md.
// The folder name does NOT have to equal the ticket (e.g. folder "BMP_POS_3" holding "BMPPOS-3_<suffix>.md"); --tickets only filters.
export function collectMd(args) {
  const list = args._.map((p) => path.resolve(p));
  if (args.root) {
    const root = path.resolve(args.root);
    const suffix = args.suffix || die('--root needs --suffix (the title suffix, e.g. "測試文件(補)")');
    const tail = `_${suffix}.md`;
    const found = new Map(); // ticket -> md path; the same ticket in two folders is ambiguous → error, never silently picked
    const scan = (dir) => { for (const e of fs.readdirSync(dir, { withFileTypes: true })) if (e.isFile() && e.name.endsWith(tail)) {
      const t = e.name.slice(0, -tail.length), f = path.join(dir, e.name);
      if (found.has(t)) die(`ticket ${t} is ambiguous: ${found.get(t)} and ${f} (pass the md path explicitly)`);
      found.set(t, f);
    } };
    scan(root);
    for (const d of fs.readdirSync(root, { withFileTypes: true })) if (d.isDirectory()) scan(path.join(root, d.name));
    const wanted = args.tickets ? args.tickets.split(',').map((x) => x.trim()).filter(Boolean) : [...found.keys()].sort();
    for (const t of wanted) list.push(found.get(t) ?? path.join(root, t, `${t}${tail}`)); // missing explicit ticket → reported as a failure by the caller
  }
  if (!list.length) die('no md files given (pass paths, or --root <dir> --suffix <suffix>)');
  return [...new Set(list)];
}

// ---- text that must not reach the docx (e.g. provenance notes); terms come from --forbid a,b
export function forbidHits(doc, terms) {
  if (!terms?.length) return [];
  const texts = [doc.title, doc.ticket, doc.docStatus, ...doc.items.flatMap((i) => [i.num, i.title, i.status, ...i.texts, ...i.shots.map((s) => s.label)])].filter(Boolean);
  return terms.filter((t) => texts.some((x) => x.includes(t)));
}
export const splitList = (v) => (v ? v.split(',').map((x) => x.trim()).filter(Boolean) : []);
