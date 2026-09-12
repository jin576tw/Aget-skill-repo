import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
export const sha = (value) => createHash("sha256").update(value).digest("hex");
export const fail = (code) => {
  throw new Error(code);
};
export function read(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (e) {
    if (e.code === "ENOENT") return null;
    throw e;
  }
}
export const digest = (file) => {
  const text = read(file);
  return text === null ? "MISSING" : sha(text);
};
export function safe(root, relative) {
  root = fs.realpathSync(root);
  if (
    typeof relative !== "string" ||
    path.isAbsolute(relative) ||
    relative.includes("\\") ||
    relative.split("/").some((x) => x === ".." || x === "" || x === ".")
  )
    fail("UNSAFE_PATH");
  let current = root;
  for (const part of relative.split("/")) {
    current = path.join(current, part);
    try {
      const s = fs.lstatSync(current);
      if (s.isSymbolicLink()) fail("SYMLINK_REJECTED");
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
    }
  }
  return current;
}
export function atomic(file, text, expected) {
  if (digest(file) !== expected) fail("CONCURRENT_UPDATE");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temp = file + "." + randomUUID() + ".tmp";
  try {
    fs.writeFileSync(temp, text, { encoding: "utf8", flag: "wx", mode: 0o600 });
    if (digest(file) !== expected) fail("CONCURRENT_UPDATE");
    fs.renameSync(temp, file);
    if (read(file) !== text) fail("READBACK_FAILED");
  } finally {
    fs.rmSync(temp, { force: true });
  }
}
export function locked(root, fn) {
  const lock = safe(root, ".aget-write.lock");
  let fd;
  try {
    fd = fs.openSync(lock, "wx", 0o600);
  } catch (e) {
    if (e.code === "EEXIST") fail("WRITE_LOCKED");
    throw e;
  }
  try {
    return fn();
  } finally {
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}
export function workspaceInfo(value, legacy = false) {
  const resolved = fs.realpathSync(value);
  const windows = process.platform === "win32";
  const normalized = (
    windows || legacy ? resolved.replaceAll("/", "\\") : resolved
  ).toLowerCase();
  const slug =
    path
      .basename(resolved)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "workspace";
  return {
    resolved,
    normalized,
    prefix: slug + "--" + sha(normalized).slice(0, 8),
  };
}
export function slug(s) {
  if (typeof s !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s))
    fail("INVALID_TASK_SLUG");
  return s;
}
export function jsonInput() {
  return JSON.parse(fs.readFileSync(0, "utf8"));
}
export function cli(fn) {
  try {
    process.stdout.write(JSON.stringify(fn()) + "\n");
  } catch (e) {
    process.stderr.write(e.message + "\n");
    process.exitCode = 1;
  }
}
