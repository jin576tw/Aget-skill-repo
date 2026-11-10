import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import zlib from "node:zlib";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const S = (name) => path.join(root, "skills/testdoc-supplement/scripts", name);
const run = (script, args) => {
  const r = spawnSync(process.execPath, [S(script), ...args], { encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr };
};
const json = (r) => JSON.parse(r.out);

function crc32(buf) {
  let c, crc = ~0;
  for (const b of buf) {
    c = (crc ^ b) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return ~crc >>> 0;
}
function png(w, h, shade) {
  const chunk = (type, data) => {
    const t = Buffer.concat([Buffer.from(type), data]);
    const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(t));
    return Buffer.concat([len, t, crc]);
  };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(w * 3, shade)]);
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk("IHDR", ihdr),
    chunk("IDAT", zlib.deflateSync(Buffer.concat(Array(h).fill(row)))), chunk("IEND", Buffer.alloc(0))]);
}

// Workspace: <ws>/<folder>/ with a spec whose folder name differs from the ticket, notes carrying a provenance remark.
function workspace(t, { folder = "folder-a", ticket = "ABC-1" } = {}) {
  const ws = fs.mkdtempSync(path.join(os.tmpdir(), "aget-testdoc-"));
  t.after(() => fs.rmSync(ws, { recursive: true, force: true }));
  const dir = path.join(ws, folder);
  const src = path.join(ws, "src"); fs.mkdirSync(src);
  fs.writeFileSync(path.join(src, "one.png"), png(40, 20, 200));
  fs.writeFileSync(path.join(src, "two.png"), png(40, 30, 100));
  const spec = {
    ticket, sourceDir: dir, titleSuffix: "Verified", statusText: "Tested in env", statusMode: "per-item",
    items: [
      { title: "Fields & <labels>", text: ["Text with & and <angle>."], shots: [{ label: "Screen — A", image: "item1.png", source: "src/one.png" }] },
      { title: "Second", status: "Tested in env, note", text: "Plain.", shots: [{ label: "Screen — B", image: "item2.png", source: "src/two.png" }] },
    ],
    notes: ["provenance: copied from an old report"],
  };
  fs.mkdirSync(dir);
  const specFile = path.join(ws, `${ticket}.json`);
  fs.writeFileSync(specFile, JSON.stringify(spec));
  return { ws, dir, specFile, ticket };
}
const docxName = (ticket) => `${ticket}_Verified.docx`;

test("md step then docx step: folder name differs from ticket, per-item status, notes stay out of docx", (t) => {
  const { ws, dir, specFile, ticket } = workspace(t);
  const dry = run("make-md.mjs", [specFile, "--dry-run"]);
  assert.equal(dry.code, 0, dry.err);
  assert.equal(fs.existsSync(path.join(dir, `${ticket}_Verified.md`)), false);
  assert.equal(run("make-md.mjs", [specFile]).code, 0);
  const md = fs.readFileSync(path.join(dir, `${ticket}_Verified.md`), "utf8");
  assert.match(md, /Tested in env, note/);
  assert.match(md, /provenance/);
  assert.equal(run("make-md.mjs", [specFile]).code, 1, "second md run must refuse to overwrite");

  const chk = run("make-docx.mjs", ["--root", ws, "--suffix", "Verified", "--forbid", "provenance", "--dry-run"]);
  assert.equal(chk.code, 0, chk.out + chk.err);
  assert.equal(json(chk)[0].images, 2);
  assert.equal(fs.existsSync(path.join(dir, docxName(ticket))), false, "dry-run writes nothing");

  const bad = run("make-docx.mjs", ["--root", ws, "--suffix", "Verified", "--forbid", "Plain"]);
  assert.equal(bad.code, 1);
  assert.match(bad.out, /forbidden text/);
  assert.equal(fs.existsSync(path.join(dir, docxName(ticket))), false, "forbid failure must not write a docx");

  const ok = run("make-docx.mjs", ["--root", ws, "--suffix", "Verified", "--tickets", ticket, "--forbid", "provenance"]);
  assert.equal(ok.code, 0, ok.out + ok.err);
  const docx = path.join(dir, docxName(ticket));
  assert.ok(fs.existsSync(docx));
  const again = run("make-docx.mjs", ["--root", ws, "--suffix", "Verified"]);
  assert.equal(again.code, 1);
  assert.match(again.out, /refuse to overwrite/);

  // the same md converted again elsewhere gives the same file bytes (regression anchor for output stability)
  const other = path.join(ws, "other");
  assert.equal(run("make-docx.mjs", [path.join(dir, `${ticket}_Verified.md`), "--out-dir", other]).code, 0);
  assert.ok(fs.readFileSync(docx).equals(fs.readFileSync(path.join(other, docxName(ticket)))));
  assert.equal(run("compare-docx.mjs", [docx, path.join(other, docxName(ticket)), "--parts"]).code, 0);
});

test("md keeps text and screenshots in the written order; an unsupported --- in the body is rejected", async (t) => {
  const { dir, specFile, ticket } = workspace(t);
  run("make-md.mjs", [specFile]);
  const mdFile = path.join(dir, `${ticket}_Verified.md`);
  const md = fs.readFileSync(mdFile, "utf8");
  fs.writeFileSync(mdFile, md.replace("---\n", "A paragraph written after the screenshot.\n\n---\n"));
  assert.equal(run("make-docx.mjs", [mdFile]).code, 0);
  const { dumpDocx } = await import(pathToUrl(S("lib.mjs")));
  const p = dumpDocx(path.join(dir, docxName(ticket))).paragraphs;
  assert.ok(p.indexOf("A paragraph written after the screenshot.") > p.findIndex((x) => x.includes("[IMG")), "text after the last screenshot stays after it");

  fs.writeFileSync(mdFile, md.replace("## 項目二", "---\n\nstray rule\n\n## 項目二"));
  const bad = run("make-docx.mjs", [mdFile, "--out-dir", path.join(dir, "o2")]);
  assert.equal(bad.code, 1);
  assert.match(bad.out, /unsupported .*---/);
});

test("the same ticket in two folders is ambiguous, never silently picked", (t) => {
  const a = workspace(t, { folder: "one", ticket: "DUP-1" });
  run("make-md.mjs", [a.specFile]);
  fs.cpSync(a.dir, path.join(a.ws, "two"), { recursive: true });
  const r = run("make-docx.mjs", ["--root", a.ws, "--suffix", "Verified", "--dry-run"]);
  assert.equal(r.code, 1);
  assert.match(r.err, /ambiguous/);
});

test("make-md refuses two different images for one file name, and a spec without sourceDir needs --out-dir", (t) => {
  const { ws, specFile } = workspace(t);
  const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  spec.items[1].shots[0].image = "item1.png"; // item1.png already planned from one.png
  fs.writeFileSync(specFile, JSON.stringify(spec));
  const r = run("make-md.mjs", [specFile, "--dry-run"]);
  assert.equal(r.code, 1);
  assert.match(r.err, /same file name/);
  const spec2 = JSON.parse(fs.readFileSync(specFile, "utf8"));
  spec2.items[1].shots[0].image = "item2.png";
  delete spec2.sourceDir;
  fs.writeFileSync(specFile, JSON.stringify(spec2));
  assert.equal(run("make-md.mjs", [specFile, "--dry-run"]).code, 1);
  assert.equal(run("make-md.mjs", [specFile, "--out-dir", path.join(ws, "elsewhere")]).code, 0);
});

test("--format changes labels, numbering and style; an empty suffix gives a title that is just the ticket", async (t) => {
  const { ws, dir, specFile } = workspace(t, { ticket: "FMT-1" });
  const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  spec.titleSuffix = "";
  fs.writeFileSync(specFile, JSON.stringify(spec));
  const fmt = path.join(ws, "format.json");
  fs.writeFileSync(fmt, JSON.stringify({ ticketLabel: "Ticket", itemLabel: "Item ", itemNumbering: "arabic", font: "Arial", statusColor: "00AA00", imageWidth: 3000000 }));
  assert.equal(run("make-md.mjs", [specFile, "--format", fmt]).code, 0);
  const mdFile = path.join(dir, "FMT-1.md");
  assert.match(fs.readFileSync(mdFile, "utf8"), /\*\*\[Ticket : FMT-1\]\*\*[\s\S]*## Item 1：/);
  assert.equal(run("make-docx.mjs", [mdFile]).code, 1, "default labels cannot read an md written with other labels");
  assert.equal(run("make-docx.mjs", [mdFile, "--format", fmt]).code, 0);
  const { dumpDocx, readZip } = await import(pathToUrl(S("lib.mjs")));
  const docx = path.join(dir, "FMT-1.docx");
  const p = dumpDocx(docx).paragraphs;
  assert.equal(p[0], "FMT-1");
  assert.equal(p[1], "[Ticket : FMT-1]");
  assert.ok(p.includes("Item 1：Fields & <labels>"));
  const xml = readZip(docx).get("word/document.xml").toString("utf8");
  assert.match(xml, /w:ascii="Arial"/);
  assert.match(xml, /w:color w:val="00AA00"/);
  assert.match(xml, /cx="3000000"/);
  assert.equal(run("make-docx.mjs", [mdFile, "--format", path.join(ws, "nope.json")]).code, 1);
  fs.writeFileSync(fmt, JSON.stringify({ colour: "x" }));
  assert.equal(run("make-docx.mjs", [mdFile, "--format", fmt, "--out", path.join(ws, "x.docx")]).code, 1, "unknown format key is an error");
});

test("a failed preflight or read-back leaves nothing at the output path; --out names a single docx", (t) => {
  const { ws, dir, specFile, ticket } = workspace(t);
  run("make-md.mjs", [specFile]);
  const mdFile = path.join(dir, `${ticket}_Verified.md`);
  fs.writeFileSync(path.join(dir, `${ticket}_Verified_images`, "item1.png"), Buffer.from("not a png at all, just text bytes here"));
  const out = path.join(ws, "custom", "result.docx");
  const bad = run("make-docx.mjs", [mdFile, "--out", out]);
  assert.equal(bad.code, 1);
  assert.match(bad.out, /not a valid PNG|not a PNG/);
  assert.equal(fs.existsSync(out), false);
  fs.writeFileSync(path.join(dir, `${ticket}_Verified_images`, "item1.png"), png(40, 20, 200));
  assert.equal(run("make-docx.mjs", [mdFile, "--out", out]).code, 0);
  assert.ok(fs.existsSync(out));
});

test("docx paragraphs carry titles, escaped text, per-item status and image count; notes are absent", async (t) => {
  const { ws, dir, specFile, ticket } = workspace(t);
  run("make-md.mjs", [specFile]);
  assert.equal(run("make-docx.mjs", ["--root", ws, "--suffix", "Verified"]).code, 0);
  const { dumpDocx } = await import(pathToUrl(S("lib.mjs")));
  const d = dumpDocx(path.join(dir, docxName(ticket)));
  const text = d.paragraphs.join("\n");
  assert.match(text, /^ABC-1_Verified/m);
  assert.match(text, /\[PCR單 : ABC-1\]/);
  assert.match(text, /項目一：Fields & <labels>/);
  assert.match(text, /^Tested in env, note$/m);
  assert.match(text, /Text with & and <angle>\./);
  assert.equal(d.media.length, 2);
  assert.doesNotMatch(text, /provenance/);
});

test("document status mode puts one status line under the PCR line", async (t) => {
  const { ws, dir, specFile, ticket } = workspace(t, { folder: "x", ticket: "DOC-9" });
  const spec = JSON.parse(fs.readFileSync(specFile, "utf8"));
  spec.statusMode = "document";
  fs.writeFileSync(specFile, JSON.stringify(spec));
  run("make-md.mjs", [specFile]);
  assert.equal(run("make-docx.mjs", [path.join(dir, `${ticket}_Verified.md`)]).code, 0);
  const { dumpDocx } = await import(pathToUrl(S("lib.mjs")));
  const p = dumpDocx(path.join(dir, docxName(ticket))).paragraphs;
  assert.equal(p[1], "[PCR單 : DOC-9]");
  assert.equal(p[2], "Tested in env");
  assert.equal(p.filter((x) => x === "Tested in env").length, 1);
});

test("a finished docx works as the style template and the result passes the read-back check", (t) => {
  const a = workspace(t, { folder: "a", ticket: "T-1" });
  run("make-md.mjs", [a.specFile]);
  run("make-docx.mjs", ["--root", a.ws, "--suffix", "Verified"]);
  const tpl = path.join(a.dir, docxName("T-1"));
  const b = workspace(t, { folder: "b", ticket: "T-2" });
  run("make-md.mjs", [b.specFile]);
  const r = run("make-docx.mjs", [path.join(b.dir, "T-2_Verified.md"), "--template", tpl]);
  assert.equal(r.code, 0, r.out + r.err);
  assert.ok(fs.existsSync(path.join(b.dir, docxName("T-2"))));
});

test("clean-md is a dry run by default and only cleans tickets whose docx verifies", (t) => {
  const { ws, dir, specFile, ticket } = workspace(t);
  run("make-md.mjs", [specFile]);
  const md = path.join(dir, `${ticket}_Verified.md`);
  const early = run("clean-md.mjs", [md, "--yes"]);
  assert.equal(early.code, 1, "no docx yet → skipped, nothing deleted");
  assert.ok(fs.existsSync(md));
  run("make-docx.mjs", [md]);
  const dry = run("clean-md.mjs", [md]);
  assert.equal(dry.code, 0, dry.out + dry.err);
  assert.ok(fs.existsSync(md));
  fs.writeFileSync(path.join(dir, `${ticket}_Verified_images`, "keep.txt"), "x");
  const real = run("clean-md.mjs", [md, "--yes"]);
  assert.equal(real.code, 0, real.out + real.err);
  assert.equal(fs.existsSync(md), false);
  assert.ok(fs.existsSync(path.join(dir, docxName(ticket))));
  assert.ok(fs.existsSync(path.join(dir, `${ticket}_Verified_images`, "keep.txt")), "unrelated files are kept");
  assert.equal(fs.existsSync(path.join(dir, `${ticket}_Verified_images`, "item1.png")), false);
});

test("clean-md refuses a stale docx and never deletes images that live outside the ticket's own images folder", (t) => {
  const { ws, dir, specFile, ticket } = workspace(t);
  run("make-md.mjs", [specFile]);
  const md = path.join(dir, `${ticket}_Verified.md`);
  run("make-docx.mjs", [md]);

  // the md changes after the docx was made (text edit) → docx is stale → nothing is deleted
  const original = fs.readFileSync(md, "utf8");
  fs.writeFileSync(md, original.replace("Plain.", "Plain, edited after the docx."));
  const stale = run("clean-md.mjs", [md, "--yes"]);
  assert.equal(stale.code, 1);
  assert.match(stale.out, /does not match the current md/);
  assert.ok(fs.existsSync(md) && fs.existsSync(path.join(dir, `${ticket}_Verified_images`, "item1.png")));

  // an image replaced with the same size class but different bytes is stale too
  fs.writeFileSync(md, original);
  fs.writeFileSync(path.join(dir, `${ticket}_Verified_images`, "item1.png"), png(40, 20, 50));
  assert.equal(run("clean-md.mjs", [md, "--yes"]).code, 1);
  fs.writeFileSync(path.join(dir, `${ticket}_Verified_images`, "item1.png"), png(40, 20, 200));

  // an md that points at a shared image outside its own folder: that image stays
  const shared = path.join(ws, "shared"); fs.mkdirSync(shared);
  fs.writeFileSync(path.join(shared, "common.png"), png(40, 20, 7));
  fs.rmSync(path.join(dir, docxName(ticket)));
  fs.writeFileSync(md, original.replace(`${ticket}_Verified_images/item2.png`, "../shared/common.png"));
  assert.equal(run("make-docx.mjs", [md]).code, 0);
  const real = run("clean-md.mjs", [md, "--yes"]);
  assert.equal(real.code, 0, real.out + real.err);
  assert.ok(fs.existsSync(path.join(shared, "common.png")), "shared image is kept");
  assert.equal(fs.existsSync(md), false);
  assert.ok(json(real)[0].kept.some((f) => f.endsWith("common.png")));

  // docx kept in another folder: --out-dir tells clean-md where it is
  const w2 = workspace(t, { folder: "z", ticket: "OUT-1" });
  run("make-md.mjs", [w2.specFile]);
  const md2 = path.join(w2.dir, "OUT-1_Verified.md");
  const outDir = path.join(w2.ws, "docs");
  run("make-docx.mjs", [md2, "--out-dir", outDir]);
  assert.equal(run("clean-md.mjs", [md2, "--yes"]).code, 1, "docx is not beside the md");
  assert.equal(run("clean-md.mjs", [md2, "--yes", "--out-dir", outDir]).code, 0);
  assert.equal(fs.existsSync(md2), false);
});

test("bsd-to-spec reads a docx made by this tool back into a skeleton and refuses to overwrite", (t) => {
  const { ws, dir, specFile, ticket } = workspace(t);
  run("make-md.mjs", [specFile]);
  run("make-docx.mjs", [path.join(dir, `${ticket}_Verified.md`)]);
  const out = path.join(ws, "skeleton.json");
  const r = run("bsd-to-spec.mjs", [path.join(dir, docxName(ticket)), "--out", out, "--title-suffix", "Verified"]);
  assert.equal(r.code, 0, r.err);
  const spec = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.equal(spec.ticket, "ABC-1");
  assert.equal(spec.items.length, 2);
  assert.equal(run("bsd-to-spec.mjs", [path.join(dir, docxName(ticket)), "--out", out]).code, 1);
});

function pathToUrl(p) {
  return new URL("file:///" + p.replace(/\\/g, "/")).href;
}
