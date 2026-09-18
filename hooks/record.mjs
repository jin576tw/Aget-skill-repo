#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sha, read, safe, workspaceInfo, locked, append } from "../scripts/lib/files.mjs";
import { checkpoint } from "../scripts/lib/memory.mjs";

const INPUT_TIMEOUT_MS = 1500;
const MAX_INPUT_BYTES = 1024 * 1024;

function hookEvent() {
  return new Promise((resolve) => {
    const chunks = [];
    let size = 0;
    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      process.stdin.destroy();
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), INPUT_TIMEOUT_MS);
    timer.unref();
    process.stdin.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_INPUT_BYTES) return finish(null);
      chunks.push(chunk);
    });
    process.stdin.once("end", () => {
      try { finish(JSON.parse(Buffer.concat(chunks).toString("utf8"))); }
      catch { finish(null); }
    });
    process.stdin.once("error", () => finish(null));
    process.stdin.resume();
  });
}

function journalOwner(cwd) {
  let dir = typeof cwd === "string" ? path.resolve(cwd) : null;
  while (dir) {
    try {
      const manifest = JSON.parse(fs.readFileSync(path.join(dir, ".aget/installation.json"), "utf8"));
      if (manifest.hooks) return fs.realpathSync(dir);
    } catch {}
    const parent = path.dirname(dir);
    dir = parent === dir ? null : parent;
  }
  return null;
}

function journalPrefix(log) {
  try {
    const fd = fs.openSync(log, "r");
    try {
      const size = fs.fstatSync(fd).size;
      if (!size) return "";
      const last = Buffer.alloc(1);
      fs.readSync(fd, last, 0, 1, size - 1);
      return last[0] === 10 ? "" : "\n";
    } finally { fs.closeSync(fd); }
  } catch (e) {
    if (e.code === "ENOENT") return "# Log\n\n";
    throw e;
  }
}

async function main() {
  // A host can cancel a hook without closing stdin. Bound this read so the
  // process cannot remain alive after the host timeout.
  const event = await hookEvent();
  if (!event) return;

  // Host signals never authorize finalization. Only flush a model-authored
  // pending checkpoint.
  try {
    const allowed = ["Stop", "Notification", "PreCompact", "SessionEnd", "TaskCompleted", "SubagentStop", "Interrupt", "PermissionRequest"];
    if (allowed.includes(event.hook_event_name) && typeof event.session_id === "string" && typeof event.cwd === "string") {
      const cwd = workspaceInfo(event.cwd).resolved;
      const pending = safe(cwd, `.aget/pending/${sha(event.session_id)}.json`);
      const raw = read(pending);
      if (raw !== null) {
        const request = JSON.parse(raw);
        if (request.session !== event.session_id || workspaceInfo(request.workspace).resolved !== cwd)
          throw Error("EVENT_IDENTITY_MISMATCH");
        if (request.status === "completed") {
          request.status = "active";
          request.inflight = null;
        }
        const result = locked(path.dirname(pending), () => {
          const result = checkpoint(request);
          if (read(pending) === raw) fs.unlinkSync(pending);
          return result;
        });
        process.stderr.write("aget: " + result.signal + "\n");
      }
    }
  } catch {
    process.stderr.write("aget: checkpoint not flushed; inspect pending request and retry during normal work\n");
  }

  const owner = journalOwner(event.cwd);
  let installRoot = path.resolve(fileURLToPath(import.meta.url), "../../../..");
  try { installRoot = fs.realpathSync(installRoot); } catch {}
  const i = process.argv.indexOf("--vault");
  const vault = i > 0 ? process.argv[i + 1] : process.env.MEMORY_VAULT;
  const plugin = process.argv.includes("--plugin");
  const optedOut = plugin && (!vault || (!owner && journalOwner(os.homedir()) !== null));

  // Only main-turn Stop records a journal line. Append-only writes avoid
  // reading, hashing, and replacing the full remote journal from a hook.
  if (event.hook_event_name === "Stop" && !optedOut && (!owner || owner === installRoot)) {
    let message = "Memory has updated!";
    try {
      if (!vault) throw Error("VAULT_NOT_CONFIGURED");
      const mark = "<!-- aget-hook -->";
      const now = new Date();
      const offset = -now.getTimezoneOffset();
      const pad = (n) => String(Math.abs(n)).padStart(2, "0");
      const time = new Date(now.getTime() + offset * 60000).toISOString().slice(0, -1) +
        (offset < 0 ? "-" : "+") + pad(Math.trunc(offset / 60)) + ":" + pad(offset % 60);
      const topic = typeof event.cwd === "string" ? path.basename(event.cwd) : "unknown";
      const said = String(event.last_assistant_message ?? "").replace(/\s+/g, " ").trim().slice(0, 200) || "（無回覆內容）";
      const entry = `[${time}][${topic}] ${said} ${mark}`;
      const log = safe(vault, "journal/log.md");
      locked(vault, () => append(log, journalPrefix(log) + entry + "\n"));
    } catch (e) {
      message = "Memory 未更新：" + (e.code || e.message);
    }
    process.stdout.write(JSON.stringify({ systemMessage: message }) + "\n");
  }
}

await main();
