#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {
  cli,
  jsonInput,
  safe,
  workspaceInfo,
  sha,
  atomic,
  digest,
  locked,
  read,
  fail,
} from "./lib/files.mjs";
import { validateCheckpoint } from "./lib/memory.mjs";
import { pathToFileURL } from "node:url";
export function stageCheckpoint(p) {
  validateCheckpoint(p);
  const root = workspaceInfo(p.workspace).resolved;
  const dir = safe(root, ".aget/pending");
  fs.mkdirSync(dir, { recursive: true });
  const file = safe(root, `.aget/pending/${sha(p.session)}.json`);
  return locked(dir, () => {
    const old = read(file);
    if (old !== null) {
      const prior = JSON.parse(old);
      if (prior.task !== p.task || prior.vault !== p.vault)
        fail("PENDING_TASK_CONFLICT");
      if (old !== JSON.stringify(p) && digest(file) !== p.pendingExpectedHash)
        fail("PENDING_CONCURRENT_UPDATE");
    }
    atomic(file, JSON.stringify(p), digest(file));
    return { signal: "CHECKPOINT_PENDING", path: file, hash: digest(file) };
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  cli(() => stageCheckpoint(jsonInput()));
