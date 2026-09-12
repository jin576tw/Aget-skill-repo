import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  checkpoint,
  finalize,
  parseCheckpoint,
} from "../scripts/lib/memory.mjs";
import { workspaceInfo, digest, sha, locked } from "../scripts/lib/files.mjs";
import { enableVault } from "../scripts/enable-vault.mjs";
const root = path.resolve(
  import.meta.dirname || path.dirname(new URL(import.meta.url).pathname),
  "..",
);
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aget-memory-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const vault = path.join(dir, "vault"),
    workspace = path.join(dir, "work");
  fs.mkdirSync(workspace);
  fs.mkdirSync(path.join(vault, "handovers"), { recursive: true });
  fs.mkdirSync(path.join(vault, "projects/demo"), { recursive: true });
  fs.mkdirSync(path.join(vault, "knowledge"));
  fs.mkdirSync(path.join(vault, "sources"));
  fs.writeFileSync(path.join(vault, "memory.md"), "# Memory\n");
  fs.writeFileSync(path.join(vault, "handovers/handovers.md"), "# Handover\n");
  enableVault(vault);
  const p = {
    vault,
    workspace,
    task: "feature",
    session: "claude-1",
    status: "active",
    goals: [{ id: "G1", title: "保留完整目標", state: "pending" }],
    inflight: null,
    summary: "決策、變更、下一步：繼續驗證",
    expectedHash: "MISSING",
  };
  return {
    dir,
    p,
    file: path.join(
      vault,
      `handovers/${workspaceInfo(workspace).prefix}--feature.md`,
    ),
  };
}
function done(p) {
  return {
    ...p,
    status: "completed",
    goals: [{ ...p.goals[0], state: "pass", evidence: "node --test: pass" }],
    inflight: [],
  };
}
function finish(p, hash) {
  return {
    ...p,
    expectedHash: hash,
    statusPath: "projects/demo/status.md",
    statusExpectedHash: "MISSING",
    distillation: {
      kind: "none",
      reason: "只調整此任務狀態，沒有可重用的新結論",
    },
  };
}
test("checkpoint dedup, cross-agent continuation and pause retain goals", (t) => {
  const { p, file } = fixture(t);
  const first = checkpoint(p),
    mtime = fs.statSync(file).mtimeMs;
  assert.equal(checkpoint(p).signal, "NO_DIFF");
  assert.equal(fs.statSync(file).mtimeMs, mtime);
  const next = checkpoint({
    ...p,
    session: "codex-2",
    status: "paused",
    expectedHash: first.hash,
  });
  const state = parseCheckpoint(fs.readFileSync(file, "utf8"));
  assert.equal(state.session, "codex-2");
  assert.equal(state.status, "paused");
  assert.equal(state.revision, 2);
  assert.deepEqual(state.goals, p.goals);
  assert.equal(next.hash, digest(file));
});
test("stale checkpoint cannot overwrite, changed goal requires explicit revision", (t) => {
  const { p, file } = fixture(t);
  checkpoint(p);
  assert.throws(() => checkpoint({ ...p, summary: "other" }), /CONCURRENT/);
  assert.throws(
    () =>
      checkpoint({
        ...p,
        expectedHash: digest(file),
        goals: [{ id: "G2", title: "different", state: "pending" }],
      }),
    /GOAL_CHANGE/,
  );
});
test("completed state requires goal evidence and known empty inflight", (t) => {
  const { p } = fixture(t);
  for (const x of [
    { ...p, status: "completed" },
    { ...done(p), inflight: null },
    { ...done(p), inflight: ["job"] },
    { ...done(p), goals: [{ ...done(p).goals[0], evidence: "" }] },
  ])
    assert.throws(() => checkpoint(x));
});
test("finalization none preserves other status and handovers; retry idempotent", (t) => {
  const { p, file } = fixture(t);
  const status = path.join(p.vault, "projects/demo/status.md");
  fs.writeFileSync(status, "# Status\nOther task remains\n");
  const other = path.join(p.vault, "handovers/other.md");
  fs.writeFileSync(other, "unrelated");
  const result = checkpoint(done(p));
  const f = { ...finish(p, result.hash), statusExpectedHash: digest(status) };
  assert.equal(finalize(f).signal, "FINALIZED");
  assert.equal(fs.existsSync(file), false);
  assert.match(fs.readFileSync(status, "utf8"), /Other task remains/);
  assert.match(fs.readFileSync(status, "utf8"), /無新增知識/);
  assert.equal(fs.readFileSync(other, "utf8"), "unrelated");
  assert.equal(finalize(f).signal, "ALREADY_FINALIZED");
});
test("active, paused and unknown tasks cannot finalize", (t) => {
  for (const status of ["active", "paused"]) {
    const { p } = fixture(t);
    const x = checkpoint({ ...p, status });
    assert.throws(() => finalize(finish(p, x.hash)), /GOALS_NOT_COMPLETE/);
  }
});
test("new knowledge and stable source saved before handover removal", (t) => {
  const { p, file } = fixture(t),
    x = checkpoint(done(p));
  const f = {
    ...finish(p, x.hash),
    distillation: {
      kind: "new",
      reason: "可重用方法",
      knowledge: ["knowledge/method.md"],
      sources: ["sources/sources.md"],
    },
    writes: [
      {
        path: "sources/sources.md",
        content: "# Source\nUser decision and test results\n",
        expectedHash: "MISSING",
      },
      {
        path: "knowledge/method.md",
        content:
          "# Method\nEvidence before deletion. [source](../sources/sources.md)\n",
        expectedHash: "MISSING",
      },
    ],
  };
  finalize(f);
  assert.equal(fs.existsSync(file), false);
  assert.match(
    fs.readFileSync(path.join(p.vault, "projects/demo/status.md"), "utf8"),
    /knowledge\/method.md/,
  );
  assert.ok(fs.existsSync(path.join(p.vault, "sources/sources.md")));
});
test("existing knowledge is linked without rewrite", (t) => {
  const { p } = fixture(t);
  const k = path.join(p.vault, "knowledge/method.md");
  fs.writeFileSync(k, "# Method\n[source](../sources/sources.md)");
  fs.writeFileSync(path.join(p.vault, "sources/sources.md"), "source");
  const mtime = fs.statSync(k).mtimeMs;
  const x = checkpoint(done(p));
  finalize({
    ...finish(p, x.hash),
    distillation: {
      kind: "existing",
      reason: "已存在",
      knowledge: ["knowledge/method.md"],
      sources: ["sources/sources.md"],
    },
  });
  assert.equal(fs.statSync(k).mtimeMs, mtime);
});
test("knowledge without stable link cannot delete handover", (t) => {
  const { p, file } = fixture(t),
    x = checkpoint(done(p));
  assert.throws(
    () =>
      finalize({
        ...finish(p, x.hash),
        distillation: {
          kind: "new",
          reason: "new",
          knowledge: ["knowledge/method.md"],
          sources: ["sources/sources.md"],
        },
        writes: [
          {
            path: "sources/sources.md",
            content: "source",
            expectedHash: "MISSING",
          },
          {
            path: "knowledge/method.md",
            content: "plain mention sources.md not a link",
            expectedHash: "MISSING",
          },
        ],
      }),
    /SOURCE_LINK/,
  );
  assert.ok(fs.existsSync(file));
});
test("unsafe paths, symlink knowledge and raw mutations rejected", (t) => {
  const { p, file } = fixture(t),
    x = checkpoint(done(p));
  for (const rel of [
    "../escape.md",
    "raw/source.md",
    "knowledge/../../escape.md",
  ])
    assert.throws(() =>
      finalize({
        ...finish(p, x.hash),
        writes: [{ path: rel, content: "x", expectedHash: "MISSING" }],
      }),
    );
  const outside = path.join(p.workspace, "outside");
  fs.mkdirSync(outside);
  fs.symlinkSync(outside, path.join(p.vault, "knowledge/link"), "dir");
  assert.throws(
    () =>
      finalize({
        ...finish(p, x.hash),
        writes: [
          {
            path: "knowledge/link/test.md",
            content: "x",
            expectedHash: "MISSING",
          },
        ],
      }),
    /SYMLINK/,
  );
  assert.ok(fs.existsSync(file));
});
test("status conflict fails before any knowledge writes", (t) => {
  const { p, file } = fixture(t),
    x = checkpoint(done(p));
  fs.writeFileSync(
    path.join(p.vault, "projects/demo/status.md"),
    "another writer",
  );
  assert.throws(() => finalize(finish(p, x.hash)), /STATUS_CONCURRENT/);
  assert.ok(fs.existsSync(file));
});
test("vault lock prevents competing writers and leaves original untouched", (t) => {
  const { p, file } = fixture(t);
  locked(p.vault, () => assert.throws(() => checkpoint(p), /WRITE_LOCKED/));
  assert.equal(fs.existsSync(file), false);
  checkpoint(p);
});
test("legacy migration explicit and hash-protected; board cannot be overwritten", (t) => {
  const { p, file } = fixture(t);
  fs.writeFileSync(file, "# Legacy\nGoal: preserve\n");
  assert.throws(
    () => checkpoint({ ...p, expectedHash: digest(file) }),
    /UNMANAGED/,
  );
  checkpoint(
    {
      ...p,
      expectedHash: digest(file),
      migrationReason: "核對舊目標、限制及證據均已映射",
    },
    true,
  );
  assert.equal(parseCheckpoint(fs.readFileSync(file, "utf8")).task, p.task);
});
test("Stop idle clear flush same pending revision once, no automatic finalize", (t) => {
  const { p, file } = fixture(t);
  const pending = path.join(p.workspace, ".aget/pending");
  fs.mkdirSync(pending, { recursive: true });
  const request = path.join(pending, sha(p.session) + ".json");
  const payload = JSON.stringify(p);
  fs.writeFileSync(request, payload);
  for (const hook_event_name of ["Stop", "Notification", "SessionEnd"]) {
    const out = spawnSync(
      process.execPath,
      [path.join(root, "hooks/record.mjs")],
      {
        input: JSON.stringify({
          hook_event_name,
          session_id: p.session,
          cwd: p.workspace,
        }),
        encoding: "utf8",
      },
    );
    assert.equal(out.status, 0);
    assert.equal(out.stdout, "");
  }
  assert.ok(fs.existsSync(file));
  assert.equal(parseCheckpoint(fs.readFileSync(file, "utf8")).revision, 1);
  assert.equal(
    fs.existsSync(path.join(p.vault, "projects/demo/status.md")),
    false,
  );
});
test("unsupported event, missing summary and session mismatch never write handover", (t) => {
  const { p, file } = fixture(t);
  const pending = path.join(p.workspace, ".aget/pending");
  fs.mkdirSync(pending, { recursive: true });
  fs.writeFileSync(
    path.join(pending, sha(p.session) + ".json"),
    JSON.stringify({ ...p, summary: "" }),
  );
  for (const event of [
    { hook_event_name: "Other", session_id: p.session },
    { hook_event_name: "Stop", session_id: "other" },
    { hook_event_name: "Stop", session_id: p.session },
  ]) {
    const result = spawnSync(
      process.execPath,
      [path.join(root, "hooks/record.mjs")],
      {
        input: JSON.stringify({ ...event, cwd: p.workspace }),
        encoding: "utf8",
      },
    );
    assert.equal(result.status, 0);
    assert.equal(result.stdout, "");
  }
  assert.equal(fs.existsSync(file), false);
});
for (const stage of ["knowledge", "status", "delete"])
  test(`injected ${stage} failure retains handover and restart retry succeeds`, (t) => {
    const { p, file } = fixture(t),
      x = checkpoint(done(p));
    const f = {
      ...finish(p, x.hash),
      distillation: {
        kind: "new",
        reason: "reusable",
        knowledge: ["knowledge/method.md"],
        sources: ["sources/sources.md"],
      },
      writes: [
        {
          path: "sources/sources.md",
          content: "source",
          expectedHash: "MISSING",
        },
        {
          path: "knowledge/method.md",
          content: "[source](../sources/sources.md)",
          expectedHash: "MISSING",
        },
      ],
    };
    const rename = fs.renameSync,
      unlink = fs.unlinkSync;
    if (stage === "delete")
      fs.unlinkSync = (name, ...args) => {
        if (name === fs.realpathSync(file)) throw Error("INJECTED_DELETE");
        return unlink(name, ...args);
      };
    else
      fs.renameSync = (from, to, ...args) => {
        if (
          to.endsWith(
            stage === "knowledge"
              ? "/knowledge/method.md"
              : "/projects/demo/status.md",
          )
        )
          throw Error("INJECTED_WRITE");
        return rename(from, to, ...args);
      };
    try {
      assert.throws(() => finalize(f), /INJECTED/);
    } finally {
      fs.renameSync = rename;
      fs.unlinkSync = unlink;
    }
    assert.ok(fs.existsSync(file));
    // New process models restart; same write contents are accepted without duplicate insertion.
    const result = spawnSync(
      process.execPath,
      [path.join(root, "scripts/memory.mjs"), "finalize"],
      { input: JSON.stringify(f), encoding: "utf8" },
    );
    assert.equal(result.status, 0, result.stderr);
    assert.equal(fs.existsSync(file), false);
    const status = fs.readFileSync(
      path.join(p.vault, "projects/demo/status.md"),
      "utf8",
    );
    assert.equal((status.match(/## 完成任務/g) || []).length, 1);
  });
test("concurrent handover change during durable write prevents deletion", (t) => {
  const { p, file } = fixture(t),
    x = checkpoint(done(p)),
    rename = fs.renameSync;
  fs.renameSync = (from, to, ...args) => {
    const result = rename(from, to, ...args);
    if (to.endsWith("/status.md")) fs.appendFileSync(file, "\nother writer");
    return result;
  };
  try {
    assert.throws(() => finalize(finish(p, x.hash)), /CONCURRENT/);
  } finally {
    fs.renameSync = rename;
  }
  assert.match(fs.readFileSync(file, "utf8"), /other writer/);
});
test("vault enabling preserves manual contract edits", (t) => {
  const { p } = fixture(t);
  const hub = path.join(p.vault, "handovers/handovers.md");
  fs.writeFileSync(
    hub,
    fs.readFileSync(hub, "utf8").replace("checkpoint", "manual checkpoint"),
  );
  assert.throws(() => enableVault(p.vault), /CONFLICT/);
});
test("staged complete checkpoint is downgraded by deferred event", (t) => {
  const { p, file } = fixture(t);
  const pending = path.join(p.workspace, ".aget/pending");
  fs.mkdirSync(pending, { recursive: true });
  fs.writeFileSync(
    path.join(pending, sha(p.session) + ".json"),
    JSON.stringify(done(p)),
  );
  const out = spawnSync(
    process.execPath,
    [path.join(root, "hooks/record.mjs")],
    {
      input: JSON.stringify({
        hook_event_name: "Stop",
        session_id: p.session,
        cwd: p.workspace,
        background_tasks: ["work"],
      }),
      encoding: "utf8",
    },
  );
  assert.equal(out.status, 0);
  assert.equal(parseCheckpoint(fs.readFileSync(file, "utf8")).status, "active");
  assert.throws(() => finalize(finish(p, digest(file))), /GOALS_NOT_COMPLETE/);
});
