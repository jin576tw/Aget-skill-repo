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
function waveFixture(t, tasks) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aget-wave-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const root = path.join(dir, "handovers");
  fs.mkdirSync(root);
  let text = `# Plan\n- Handover-Type: plan-board\n- Workspace: \`${dir}\`\n- Plan-ID: WAVE-P01\n- Plan-Status: active\n- Plan-Revision: 1\n- Updated: -\n\n| Done | Task | Status | Claim | Revision | Updated |\n|---|---|---|---|---|---|\n`;
  for (const x of tasks)
    text += `| [ ] | ${x.id} | ${x.status || "ready"} | ${x.claim || "-"} | 0 | - |\n`;
  for (const x of tasks) {
    const contract = `- Objective: ${x.id}\n- Acceptance: verified\n- Priority: P1\n- Depends-On: NONE\n${x.extra || ""}`;
    text += `\n<!-- START-PLAN:TASK:${x.id}:BEGIN -->\n- Status: ${x.status || "ready"}\n- Claim-ID: ${x.claim || "-"}\n- Task-Revision: 0\n- Contract-SHA256: ${contractHash(contract)}\n<!-- START-PLAN:CONTRACT:${x.id}:BEGIN -->\n${contract}<!-- START-PLAN:CONTRACT:${x.id}:END -->\n<!-- START-PLAN:PROGRESS:${x.id}:BEGIN -->\n${x.progress || "- Summary: none\n- Evidence: none\n"}<!-- START-PLAN:PROGRESS:${x.id}:END -->\n<!-- START-PLAN:TASK:${x.id}:END -->\n`;
  }
  const file = path.join(root, workspaceInfo(dir).prefix + "--wave-p01.md");
  fs.writeFileSync(file, text);
  return { p: { workspace: dir, root, plan: "WAVE-P01" }, file };
}
const free = (res) => `- Resources: ${res}\n- Sign-off: none\n`;
test("wave candidates include ready tasks with sign-off none and disjoint resources", (t) => {
  const { p } = waveFixture(t, [
    { id: "A", extra: free("docs/a.md") },
    { id: "B", extra: free("NONE") },
  ]);
  const x = board(p);
  assert.deepEqual(x.wave_candidates, ["WAVE-P01:A", "WAVE-P01:B"]);
  assert.deepEqual(x.wave_excluded, []);
});
test("wave excludes sign-off, unknown resources and legacy boards without new fields", (t) => {
  const { p } = waveFixture(t, [
    { id: "A", extra: "- Resources: NONE\n- Sign-off: user\n" },
    { id: "B", extra: "- Sign-off: none\n" },
    { id: "C" },
  ]);
  const x = board(p);
  assert.deepEqual(x.wave_candidates, []);
  assert.deepEqual(
    x.wave_excluded.map((e) => e.reason),
    ["sign_off:user", "resources_unknown", "sign_off:unknown"],
  );
  assert.deepEqual(x.next_tasks, ["WAVE-P01:A", "WAVE-P01:B", "WAVE-P01:C"]);
  const legacy = fixture(t);
  assert.deepEqual(board(legacy.p).wave_candidates, []);
});
test("wave separates shared resources and respects in-progress holders", (t) => {
  const shared = waveFixture(t, [
    { id: "A", extra: free("worktree:main") },
    { id: "B", extra: free("`worktree:main`, docs/b.md") },
    { id: "C", status: "in_progress", claim: "c1", extra: free("docs/c.md") },
    { id: "D", extra: free("docs/c.md") },
  ]);
  const x = board(shared.p);
  assert.deepEqual(x.wave_candidates, ["WAVE-P01:A"]);
  assert.deepEqual(x.wave_excluded, [
    { task: "WAVE-P01:B", reason: "resource_conflict:worktree:main@A" },
    { task: "WAVE-P01:D", reason: "resource_conflict:docs/c.md@C" },
  ]);
  const unknown = waveFixture(t, [
    { id: "A", extra: free("docs/a.md") },
    { id: "C", status: "in_progress", claim: "c1" },
  ]);
  const y = board(unknown.p);
  assert.deepEqual(y.wave_candidates, []);
  assert.deepEqual(y.wave_excluded, [
    { task: "WAVE-P01:A", reason: "in_progress_resources_unknown:C" },
  ]);
});
test("update keeps earlier progress as history without changing the contract", (t) => {
  const { p, file } = waveFixture(t, [
    {
      id: "A",
      extra: free("docs/a.md"),
      progress:
        "- Summary: manual note\n- Evidence: log.txt\n- Risk: flaky env\n",
    },
  ]);
  const hash = board({ ...p, action: "hash", task: "A" }).computed;
  const step = (status, summary, evidence) =>
    board({
      ...p,
      action: "update",
      task: "A",
      status,
      claim: "w1",
      summary,
      evidence,
      expectedHash: digest(file),
    });
  step("in_progress", "started", "none");
  step("blocked", "waiting on env", "ci#1 red");
  step("in_progress", "resumed", "ci#2 green");
  const text = fs.readFileSync(file, "utf8");
  const history = text
    .split("- History:\n")[1]
    .split("<!--")[0]
    .trimEnd()
    .split("\n");
  assert.equal(history.length, 3);
  assert.match(
    history[0],
    /^ {2}- r2 blocked: .*waiting on env; Evidence: ci#1 red$/,
  );
  assert.match(history[1], /^ {2}- r1 in_progress: .*started/);
  assert.match(
    history[2],
    /^ {2}- r0 ready: Summary: manual note; Evidence: log.txt; Risk: flaky env$/,
  );
  assert.match(text, /- Summary: resumed\n- Evidence: ci#2 green\n- History:/);
  assert.equal(board({ ...p, action: "hash", task: "A" }).computed, hash);
  assert.equal(board({ ...p, action: "validate" }).signal, "PLAN_BOARD_VALID");
});
