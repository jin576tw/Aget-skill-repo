#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { sourceRoot } from "./lib/setup.mjs";
import {
  safe,
  read,
  sha,
  digest,
  atomic,
  locked,
  cli,
  fail,
} from "./lib/files.mjs";
import { pathToFileURL } from "node:url";
export function enableVault(root) {
  root = fs.realpathSync(root);
  const contract = read(path.join(sourceRoot, "rules/memory-contract.md"));
  return locked(root, () => {
    const hub = safe(root, "handovers/handovers.md"),
      agents = safe(root, "AGENTS.md"),
      memory = safe(root, "memory.md");
    if (read(hub) === null || read(memory) === null)
      fail("VAULT_SCHEMA_REQUIRED");
    const content = {};
    for (const file of [hub, agents, memory]) {
      const old = read(file) || "";
      const begin = "<!-- aget-vault:begin -->",
        end = "<!-- aget-vault:end -->";
      const a = old.indexOf(begin),
        b = old.indexOf(end);
      if (a < 0 !== b < 0 || b < a) fail("INVALID_VAULT_MARKERS");
      const body =
        file === hub
          ? contract
          : "Aget checkpoint 為單檔 handover；finalize 是另立的正常工作模式，允許蒸餾、來源及 project status 更新後刪除該任務交接。Aget 格式、保留與 Git 邊界以 handovers/handovers.md 的 Aget 接續與結案契約為準，取代與其衝突的舊規則；其他任務與 vault 邊界保留。";
      const block = begin + "\n" + body + "\n" + end;
      if (
        a >= 0 &&
        (old.slice(a, b + end.length) !== block ||
          old.indexOf(begin, a + 1) >= 0 ||
          old.indexOf(end, b + 1) >= 0)
      )
        fail("VAULT_CONTRACT_CONFLICT");
      content[file] = {
        old: read(file),
        hash: digest(file),
        next:
          a < 0
            ? old + "\n\n" + block + "\n"
            : old.slice(0, a) + block + old.slice(b + end.length),
      };
    }
    const written = [];
    try {
      for (const [file, x] of Object.entries(content)) {
        if (x.old === x.next) continue;
        atomic(file, x.next, x.hash);
        written.push(file);
      }
    } catch (e) {
      for (const file of written.reverse()) {
        const x = content[file];
        if (digest(file) === sha(x.next)) {
          if (x.old === null) fs.unlinkSync(file);
          else atomic(file, x.old, sha(x.next));
        }
      }
      throw e;
    }
    return { signal: "VAULT_ENABLED" };
  });
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  cli(() => enableVault(process.argv[2]));
