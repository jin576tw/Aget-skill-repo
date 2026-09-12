#!/usr/bin/env node
// Store-only ZIP, sufficient for OOXML packages; no platform zip command required.
import fs from "node:fs";
import path from "node:path";
import { cli, fail } from "./lib/files.mjs";
import { pathToFileURL } from "node:url";
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) {
    c ^= b;
    for (let i = 0; i < 8; i++) c = (c >>> 1) ^ (c & 1 ? 0xedb88320 : 0);
  }
  return (c ^ 0xffffffff) >>> 0;
}
export function packDocx(root, output) {
  root = fs.realpathSync(root);
  output = path.resolve(output);
  let ancestor = path.dirname(output),
    suffix = [path.basename(output)];
  while (!fs.existsSync(ancestor)) {
    suffix.unshift(path.basename(ancestor));
    ancestor = path.dirname(ancestor);
  }
  output = path.join(fs.realpathSync(ancestor), ...suffix);
  if (output === root || output.startsWith(root + path.sep))
    fail("OUTPUT_INSIDE_SOURCE");
  const list = [];
  function scan(dir, rel = "") {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const n = rel ? rel + "/" + ent.name : ent.name;
      if (ent.isSymbolicLink()) fail("SYMLINK_REJECTED");
      if (ent.isDirectory()) scan(path.join(dir, ent.name), n);
      else list.push(n);
    }
  }
  scan(root);
  for (const required of [
    "[Content_Types].xml",
    "_rels/.rels",
    "word/document.xml",
  ])
    if (!list.includes(required)) fail("OOXML_PART_MISSING");
  if (list.length > 65535) fail("ZIP64_REQUIRED");
  const locals = [],
    central = [];
  let offset = 0;
  for (const name of list.sort()) {
    const data = fs.readFileSync(path.join(root, name)),
      n = Buffer.from(name);
    if (data.length > 0xffffffff || n.length > 65535) fail("ZIP64_REQUIRED");
    const crc = crc32(data),
      h = Buffer.alloc(30);
    h.writeUInt32LE(0x04034b50);
    h.writeUInt16LE(20, 4);
    h.writeUInt16LE(0x800, 6);
    h.writeUInt32LE(crc, 14);
    h.writeUInt32LE(data.length, 18);
    h.writeUInt32LE(data.length, 22);
    h.writeUInt16LE(n.length, 26);
    locals.push(h, n, data);
    const c = Buffer.alloc(46);
    c.writeUInt32LE(0x02014b50);
    c.writeUInt16LE(20, 4);
    c.writeUInt16LE(20, 6);
    c.writeUInt16LE(0x800, 8);
    c.writeUInt32LE(crc, 16);
    c.writeUInt32LE(data.length, 20);
    c.writeUInt32LE(data.length, 24);
    c.writeUInt16LE(n.length, 28);
    c.writeUInt32LE(offset, 42);
    central.push(c, n);
    offset += h.length + n.length + data.length;
  }
  const cd = Buffer.concat(central);
  if (offset + cd.length > 0xffffffff) fail("ZIP64_REQUIRED");
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50);
  end.writeUInt16LE(list.length, 8);
  end.writeUInt16LE(list.length, 10);
  end.writeUInt32LE(cd.length, 12);
  end.writeUInt32LE(offset, 16);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, Buffer.concat([...locals, cd, end]), { flag: "wx" });
  return { signal: "DOCX_PACKED", output, parts: list.length };
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  cli(() => packDocx(process.argv[2], process.argv[3]));
