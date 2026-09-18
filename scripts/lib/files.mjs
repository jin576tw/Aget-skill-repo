import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
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
// Stop hooks append one mechanical journal line. Replacing the whole journal
// here would make a harmless hook depend on remote-file read/hash/write time.
export function append(file, text) {
  if (typeof text !== "string" || !text.length) fail("EMPTY_APPEND");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const bytes = Buffer.from(text, "utf8");
  const fd = fs.openSync(file, "a+", 0o600);
  try {
    const start = fs.fstatSync(fd).size;
    let offset = 0;
    while (offset < bytes.length)
      offset += fs.writeSync(fd, bytes, offset, bytes.length - offset);
    fs.fsyncSync(fd);
    const actual = Buffer.alloc(bytes.length);
    let readBytes = 0;
    while (readBytes < actual.length) {
      const count = fs.readSync(fd, actual, readBytes, actual.length - readBytes, start + readBytes);
      if (!count) fail("READBACK_FAILED");
      readBytes += count;
    }
    if (!actual.equals(bytes)) fail("READBACK_FAILED");
  } finally {
    fs.closeSync(fd);
  }
}

const lockName = ".aget-write.lock";
const lockPrefix = lockName + "-";
const lockPattern = /^\.aget-write\.lock-([0-9a-z]+)-(\d+)-[0-9a-f-]+$/;
function legacyLock(root) {
  const file = safe(root, lockName);
  try { fs.lstatSync(file); return file; } catch (e) { if (e.code === "ENOENT") return null; throw e; }
}
function pidIsAlive(pid) {
  try { process.kill(pid, 0); return true; } catch (e) { return e.code !== "ESRCH"; }
}
function processStartedBefore(pid, acquiredAt) {
  if (process.platform !== "win32") return true;
  const command = "(Get-Process -Id " + pid + " -ErrorAction SilentlyContinue).StartTime.ToUniversalTime().ToString('o')";
  const result = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", command], { encoding: "utf8", timeout: 2000, windowsHide: true });
  if (result.error || result.status !== 0) return true;
  const started = Date.parse(result.stdout.trim());
  return Number.isNaN(started) || started <= acquiredAt;
}
function lockCandidates(root) {
  return fs.readdirSync(root).filter((name) => name.startsWith(lockPrefix)).sort().map((name) => {
    const match = name.match(lockPattern);
    if (!match) fail("WRITE_LOCKED");
    const file = safe(root, name);
    const stat = fs.lstatSync(file);
    if (!stat.isDirectory()) fail("WRITE_LOCKED");
    return { name, file, pid: Number(match[2]), acquiredAt: Number.parseInt(match[1], 36) };
  });
}
function recoverDeadLocks(root) {
  for (const candidate of lockCandidates(root)) {
    if (!Number.isSafeInteger(candidate.pid) || !Number.isSafeInteger(candidate.acquiredAt) || (pidIsAlive(candidate.pid) && processStartedBefore(candidate.pid, candidate.acquiredAt))) continue;
    // Recovery requires a dead/reused owner PID. This is not a time lease.
    fs.rmSync(candidate.file, { recursive: true, force: false });
  }
}
export function locked(root, fn) {
  root = fs.realpathSync(root);
  // Preserve an existing legacy lock exactly as-is; it has no owner identity.
  if (legacyLock(root)) fail("WRITE_LOCKED");
  recoverDeadLocks(root);
  const stamp = Date.now().toString(36).padStart(10, "0");
  const name = lockPrefix + stamp + "-" + process.pid + "-" + randomUUID();
  const lock = safe(root, name);
  try { fs.mkdirSync(lock, { mode: 0o700 }); } catch (e) { if (e.code === "EEXIST") fail("WRITE_LOCKED"); throw e; }
  try {
    // Directory names sort by acquisition order, so exactly one contender wins.
    if (legacyLock(root) || lockCandidates(root)[0]?.name !== name) fail("WRITE_LOCKED");
    return fn();
  } finally {
    fs.rmSync(lock, { recursive: true, force: true });
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
