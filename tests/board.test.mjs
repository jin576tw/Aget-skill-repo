import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { board, contractHash, parseBoard } from "../scripts/lib/board.mjs";
import { digest, workspaceInfo } from "../scripts/lib/files.mjs";
function fixture(t, depends = "A") {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aget-board-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const root = path.join(dir, "handovers");
  fs.mkdirSync(root);
  let text = `# Plan\n- Handover-Type: plan-board\n- Workspace: \`${dir}\`\n- Plan-ID: PLAN-P01\n- Plan-Status: active\n- Plan-Revision: 1\n- Updated: -\n\n| Done | Task | Status | Claim | Revision | Updated |\n|---|---|---|---|---|---|\n| [ ] | A | ready | - | 0 | - |\n| [ ] | B | waiting | - | 0 | - |\n`;
  for (const task of ["A", "B"]) {
    const contract = `- Objective: ${task}\n- Acceptance: verified\n- Priority: P1\n- Depends-On: ${task === "A" ? "NONE" : depends}\n`;
    text += `\n<!-- START-PLAN:TASK:${task}:BEGIN -->\n- Status: ${task === "A" ? "ready" : "waiting"}\n- Claim-ID: -\n- Task-Revision: 0\n- Contract-SHA256: ${contractHash(contract)}\n<!-- START-PLAN:CONTRACT:${task}:BEGIN -->\n${contract}<!-- START-PLAN:CONTRACT:${task}:END -->\n<!-- START-PLAN:PROGRESS:${task}:BEGIN -->\n- Summary: none\n- Evidence: none\n<!-- START-PLAN:PROGRESS:${task}:END -->\n<!-- START-PLAN:TASK:${task}:END -->\n`;
  }
  const file = path.join(root, workspaceInfo(dir).prefix + "--plan-p01.md");
  fs.writeFileSync(file, text);
  return { p: { workspace: dir, root, plan: "PLAN-P01" }, file, text };
}
test("old contract hashing matches normalized CRLF and trim", () => {
  assert.equal(
    contractHash(" \r\n- Objective: 中文\r\n"),
    contractHash("- Objective: 中文"),
  );
});
test("plan without forced INTEGRATION valid; runnable task uses dependencies", (t) => {
  const { p } = fixture(t);
  const x = board(p);
  assert.equal(x.signal, "PLAN_STATUS");
  assert.deepEqual(x.next_tasks, ["PLAN-P01:A"]);
});
test("claim, evidence, complete and immutable contract preserved", (t) => {
  const { p, file, text } = fixture(t);
  const hash = board({ ...p, action: "hash", task: "A" }).computed;
  board({
    ...p,
    action: "update",
    task: "A",
    status: "in_progress",
    claim: "worker",
    expectedHash: digest(file),
  });
  assert.throws(
    () =>
      board({
        ...p,
        action: "update",
        task: "A",
        status: "completed",
        claim: "wrong",
        evidence: "test",
        expectedHash: digest(file),
      }),
    /CLAIMED/,
  );
  assert.throws(
    () =>
      board({
        ...p,
        action: "update",
        task: "A",
        status: "completed",
        claim: "worker",
        expectedHash: digest(file),
      }),
    /EVIDENCE/,
  );
  board({
    ...p,
    action: "update",
    task: "A",
    status: "completed",
    claim: "worker",
    evidence: "tests passed",
    expectedHash: digest(file),
  });
  assert.equal(board({ ...p, action: "hash", task: "A" }).computed, hash);
  assert.deepEqual(board(p).next_tasks, ["PLAN-P01:B"]);
  assert.throws(
    () =>
      board({
        ...p,
        action: "update",
        task: "A",
        status: "ready",
        expectedHash: digest(file),
      }),
    /ALREADY_COMPLETED/,
  );
});
test("stale version, dependency bypass and hash tampering rejected", (t) => {
  const { p, file } = fixture(t);
  assert.throws(
    () =>
      board({
        ...p,
        action: "update",
        task: "A",
        status: "in_progress",
        claim: "x",
        expectedHash: "wrong",
      }),
    /CONCURRENT/,
  );
  assert.throws(
    () =>
      board({
        ...p,
        action: "update",
        task: "B",
        status: "in_progress",
        claim: "x",
        expectedHash: digest(file),
      }),
    /DEPENDENCY/,
  );
  fs.writeFileSync(
    file,
    fs
      .readFileSync(file, "utf8")
      .replace("- Objective: A", "- Objective: changed"),
  );
  assert.throws(() => board(p), /hash/);
});
test("self dependency and row/block mismatch rejected", (t) => {
  const { p } = fixture(t, "B");
  assert.throws(() => board(p), /CYCLE/);
});
test("Windows-normalized legacy prefix resolved without renaming", (t) => {
  const { p, file } = fixture(t);
  const legacy = path.join(
    p.root,
    workspaceInfo(p.workspace, true).prefix + "--plan-p01.md",
  );
  fs.renameSync(file, legacy);
  assert.equal(board(p).path, fs.realpathSync(legacy));
});
