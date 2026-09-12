#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  sha,
  read,
  safe,
  workspaceInfo,
  locked,
} from "../scripts/lib/files.mjs";
import { checkpoint } from "../scripts/lib/memory.mjs";
// Host signals never authorize finalization. Only flush a model-authored pending checkpoint.
try {
  const event = JSON.parse(fs.readFileSync(0, "utf8"));
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
