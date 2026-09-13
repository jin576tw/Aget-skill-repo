import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { packDocx } from "../scripts/pack-docx.mjs";
import { stageCheckpoint } from "../scripts/stage-checkpoint.mjs";
import { hookCommand } from "../scripts/lib/setup.mjs";
function temp(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "aget-tools-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  return root;
}
test("DOCX ZIP stores required OOXML and Unicode parts without changing source", (t) => {
  const root = temp(t),
    parts = path.join(root, "parts");
  fs.mkdirSync(path.join(parts, "word"), { recursive: true });
  fs.mkdirSync(path.join(parts, "_rels"));
  const expected = {
    "[Content_Types].xml": "<Types/>",
    "_rels/.rels": "<Relationships/>",
    "word/document.xml": "<document>中文</document>",
    "word/圖片.txt": "123456789",
  };
  for (const [n, v] of Object.entries(expected))
    fs.writeFileSync(path.join(parts, n), v);
  const output = path.join(root, "test.docx");
  packDocx(parts, output);
  const bytes = fs.readFileSync(output);
  let pos = 0,
    seen = 0;
  while (bytes.readUInt32LE(pos) === 0x04034b50) {
    assert.equal(bytes.readUInt16LE(pos + 8), 0);
    const size = bytes.readUInt32LE(pos + 18),
      length = bytes.readUInt16LE(pos + 26),
      name = bytes.subarray(pos + 30, pos + 30 + length).toString(),
      value = bytes
        .subarray(pos + 30 + length, pos + 30 + length + size)
        .toString();
    assert.equal(value, expected[name]);
    if (name.endsWith(".txt"))
      assert.equal(bytes.readUInt32LE(pos + 14), 0xcbf43926);
    pos += 30 + length + size;
    seen++;
  }
  assert.equal(seen, 4);
  assert.equal(bytes.readUInt32LE(pos), 0x02014b50);
  assert.equal(bytes.readUInt32LE(bytes.length - 22), 0x06054b50);
  assert.throws(() => packDocx(parts, output), /EEXIST/);
  assert.equal(
    fs.readFileSync(path.join(parts, "word/document.xml"), "utf8"),
    expected["word/document.xml"],
  );
});
test("DOCX missing parts and output within source are rejected", (t) => {
  const dir = temp(t);
  assert.throws(
    () => packDocx(dir, path.join(dir, "out.docx")),
    /OUTPUT_INSIDE/,
  );
  assert.throws(() => packDocx(dir, dir + ".docx"), /PART_MISSING/);
});
test("pending different task or stale update rejected without losing first request", (t) => {
  const dir = temp(t);
  const p = {
    workspace: dir,
    vault: dir,
    task: "one",
    session: "s",
    status: "active",
    goals: [{ id: "g", title: "goal", state: "pending" }],
    inflight: null,
    summary: "resume",
    expectedHash: "MISSING",
  };
  const first = stageCheckpoint(p);
  assert.throws(() => stageCheckpoint({ ...p, task: "two" }), /TASK_CONFLICT/);
  assert.throws(
    () => stageCheckpoint({ ...p, summary: "changed" }),
    /CONCURRENT/,
  );
  stageCheckpoint({
    ...p,
    summary: "changed",
    pendingExpectedHash: first.hash,
  });
  assert.equal(JSON.parse(fs.readFileSync(first.path)).summary, "changed");
});
test("hook commands preserve POSIX shell characters and Windows backslashes", () => {
  const cmd = hookCommand("/a/node", "/some/$value/it's script.mjs", false);
  assert.match(cmd, /\$value/);
  assert.equal(
    hookCommand("C:\\node\\node.exe", "C:\\工作 空間\\record.mjs", true),
    '"C:\\node\\node.exe" "C:\\工作 空間\\record.mjs"',
  );
  assert.equal(
    hookCommand("/a/node", "/r.mjs", false, ["--vault", "/v"]),
    "'/a/node' '/r.mjs' '--vault' '/v'",
  );
  assert.throws(
    () => hookCommand("node", "C:\\%TEMP%\\script", true),
    /UNSUPPORTED/,
  );
});
test("existing hooks fail open, match case and detect stack", (t) => {
  const dir = temp(t),
    hooks = path.resolve("hooks");
  fs.mkdirSync(path.join(dir, "knowledge"));
  fs.writeFileSync(
    path.join(dir, "knowledge/pitfalls.json"),
    JSON.stringify([
      { id: "fixture", scope: "bash", pattern: "danger", message: "fixture" },
    ]),
  );
  function run(file, input) {
    const x = spawnSync(process.execPath, [path.join(hooks, file)], {
      cwd: dir,
      input,
      encoding: "utf8",
      env: { ...process.env, MEMORY_VAULT: dir },
    });
    assert.equal(x.status, 0);
    return x.stdout;
  }
  assert.match(
    run(
      "pitfall-guard.mjs",
      JSON.stringify({ tool_name: "Bash", tool_input: { command: "DANGER" } }),
    ),
    /fixture/,
  );
  assert.equal(run("pitfall-guard.mjs", "invalid"), "");
  assert.equal(run("session-start-context.mjs", "{}"), "");
  fs.writeFileSync(
    path.join(dir, "package.json"),
    JSON.stringify({ dependencies: { vue: "3" }, engines: { node: ">=18" } }),
  );
  assert.match(run("session-start-context.mjs", "{}"), /Vue 3, Node >=18/);
});
