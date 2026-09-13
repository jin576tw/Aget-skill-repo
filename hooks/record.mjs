#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  sha,
  read,
  safe,
  workspaceInfo,
  locked,
  atomic,
  digest,
} from "../scripts/lib/files.mjs";
import { checkpoint } from "../scripts/lib/memory.mjs";
// Host signals never authorize finalization. Only flush a model-authored pending checkpoint.
let event = {};
try {
  event = JSON.parse(fs.readFileSync(0, "utf8"));
  const allowed = [
    "Stop",
    "Notification",
    "PreCompact",
    "SessionEnd",
    "TaskCompleted",
    "SubagentStop",
    "Interrupt",
    "PermissionRequest",
  ];
  if (
    allowed.includes(event.hook_event_name) &&
    typeof event.session_id === "string" &&
    typeof event.cwd === "string"
  ) {
    const cwd = workspaceInfo(event.cwd).resolved;
    const pending = safe(cwd, `.aget/pending/${sha(event.session_id)}.json`);
    const raw = read(pending);
    if (raw !== null) {
      const request = JSON.parse(raw);
      if (
        request.session !== event.session_id ||
        workspaceInfo(request.workspace).resolved !== cwd
      )
        throw Error("EVENT_IDENTITY_MISMATCH");
      // Even if model marked complete, a hook only checkpoints. Finalization is explicit.
      // A deferred request cannot certify that work stayed complete while waiting.
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
  process.stderr.write(
    "aget: checkpoint not flushed; inspect pending request and retry during normal work\n",
  );
}
// The nearest hooks-enabled installation above cwd owns the journal, so user and project hooks never both write.
function journalOwner(cwd) {
  let dir = typeof cwd === "string" ? path.resolve(cwd) : null;
  while (dir) {
    try {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(dir, ".aget/installation.json"), "utf8"),
      );
      if (manifest.hooks) return fs.realpathSync(dir);
    } catch {}
    const parent = path.dirname(dir);
    dir = parent === dir ? null : parent;
  }
  return null;
}
const owner = journalOwner(event.cwd);
let installRoot = path.resolve(fileURLToPath(import.meta.url), "../../../..");
try {
  installRoot = fs.realpathSync(installRoot);
} catch {}
const i = process.argv.indexOf("--vault");
const vault = i > 0 ? process.argv[i + 1] : process.env.MEMORY_VAULT;
// A native plugin has no opt-in flag, so its journal stays silent until MEMORY_VAULT is configured.
// It also yields to a user-scope setup install, whose hooks run for every cwd, not only those under home.
const plugin = process.argv.includes("--plugin");
const optedOut =
  plugin && (!vault || (!owner && journalOwner(os.homedir()) !== null));
// Each main-turn Stop appends one mechanical journal line; handover and finalize stay model-driven.
if (
  event.hook_event_name === "Stop" &&
  !optedOut &&
  (!owner || owner === installRoot)
) {
  let message = "Memory has updated!";
  try {
    if (!vault) throw Error("VAULT_NOT_CONFIGURED");
    const mark = "<!-- aget-hook -->";
    const now = new Date();
    const offset = -now.getTimezoneOffset();
    const pad = (n) => String(Math.abs(n)).padStart(2, "0");
    const time =
      new Date(now.getTime() + offset * 60000).toISOString().slice(0, -1) +
      (offset < 0 ? "-" : "+") +
      pad(Math.trunc(offset / 60)) +
      ":" +
      pad(offset % 60);
    const topic =
      typeof event.cwd === "string" ? path.basename(event.cwd) : "unknown";
    const said =
      String(event.last_assistant_message ?? "")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200) || "（無回覆內容）";
    const entry = `[${time}][${topic}] ${said} ${mark}`;
    const expired = now.getTime() - 90 * 86400000;
    const log = safe(vault, "journal/log.md");
    locked(vault, () => {
      const old = read(log) ?? "# Log\n";
      // Keep every retained line byte-for-byte, including manual spacing and CRLF.
      const kept = (old.match(/[^\n]*\n|[^\n]+$/g) ?? [])
        .filter((line) => {
          const content = line.replace(/\r?\n$/, "");
          const stamp = content.match(/^\[([^\]]+)\]/);
          return !content.endsWith(mark) || !stamp ||
            !(Date.parse(stamp[1]) < expired);
        })
        .join("");
      const eol = old.includes("\r\n") ? "\r\n" : "\n";
      const header = kept.match(/^# [^\r\n]*(?:\r?\n|$)/)?.[0] ?? "";
      const body = kept.slice(header.length);
      const prefix = header && !header.endsWith("\n") ? header + eol : header;
      const text = prefix + (header ? eol : "") + entry + eol + body;
      atomic(log, text, digest(log));
    });
  } catch (e) {
    message = "Memory 未更新：" + (e.code || e.message);
  }
  process.stdout.write(JSON.stringify({ systemMessage: message }) + "\n");
}
