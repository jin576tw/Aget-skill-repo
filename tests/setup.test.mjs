import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { setup } from "../scripts/lib/setup.mjs";
function target(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "aget-setup-"));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}
test("setup preserves user rules, installs tools, repeat check current", (t) => {
  const dir = target(t);
  fs.writeFileSync(path.join(dir, "AGENTS.md"), "# User rules\n");
  const x = setup({ target: dir });
  assert.equal(x.signal, "SETUP_COMPLETE");
  assert.equal(setup({ target: dir, check: true }).signal, "SETUP_CURRENT");
  setup({ target: dir });
  const text = fs.readFileSync(path.join(dir, "AGENTS.md"), "utf8");
  assert.match(text, /# User rules/);
  assert.equal((text.match(/aget:work:begin/g) || []).length, 1);
  assert.ok(
    fs.existsSync(path.join(dir, ".agents/skills/aget-handover/SKILL.md")),
  );
  assert.ok(fs.existsSync(path.join(dir, ".aget/plugin/scripts/memory.mjs")));
});
test("manual managed file or rule edits conflict and remain untouched", (t) => {
  const dir = target(t);
  setup({ target: dir });
  const file = path.join(dir, ".aget/plugin/scripts/memory.mjs");
  fs.appendFileSync(file, "\n// user edit");
  assert.throws(() => setup({ target: dir }), /CONFLICT/);
  assert.match(fs.readFileSync(file, "utf8"), /user edit/);
});
test("hooks are host-specific, repeated setup preserves unrelated hooks", (t) => {
  const dir = target(t);
  fs.mkdirSync(path.join(dir, ".claude"));
  fs.writeFileSync(
    path.join(dir, ".claude/settings.json"),
    JSON.stringify({
      custom: "keep",
      hooks: { Stop: [{ hooks: [{ type: "command", command: "echo user" }] }] },
    }),
  );
  setup({ target: dir, hooks: true });
  setup({ target: dir });
  const claude = JSON.parse(
      fs.readFileSync(path.join(dir, ".claude/settings.json")),
    ),
    codex = JSON.parse(fs.readFileSync(path.join(dir, ".codex/hooks.json")));
  assert.equal(claude.custom, "keep");
  assert.equal(claude.hooks.Stop.length, 2);
  assert.ok(claude.hooks.Notification);
  assert.equal(codex.hooks.Notification, undefined);
  assert.ok(codex.hooks.Interrupt);
  assert.equal(codex.hooks.SessionEnd[0].hooks[0].timeout, 3);
});
test("hook vault argument is added once and kept on later setup", (t) => {
  const dir = target(t);
  setup({ target: dir, hooks: true, vault: "/v a'ult" });
  setup({ target: dir });
  const codex = JSON.parse(fs.readFileSync(path.join(dir, ".codex/hooks.json")));
  assert.equal(codex.hooks.Stop.length, 1);
  assert.match(codex.hooks.Stop[0].hooks[0].command, / '--vault' '\/v a'"'"'ult'$/);
});
test("both installed host commands write Stop journals and ignore SubagentStop", (t) => {
  const dir = target(t);
  const vault = path.join(dir, "vault 空間");
  fs.mkdirSync(path.join(vault, "journal"), { recursive: true });
  setup({ target: dir, platform: "both", hooks: true, vault });
  const log = path.join(vault, "journal/log.md");
  for (const config of [".claude/settings.json", ".codex/hooks.json"]) {
    const { hooks } = JSON.parse(fs.readFileSync(path.join(dir, config)));
    const run = (event) => spawnSync(hooks[event][0].hooks[0].command, {
      shell: true,
      cwd: dir,
      input: JSON.stringify({
        hook_event_name: event, session_id: "host-test", cwd: dir,
        stop_hook_active: false, last_assistant_message: "相容測試 OK",
      }),
      encoding: "utf8",
      env: { ...process.env, MEMORY_VAULT: path.join(dir, "wrong-vault") },
    });
    fs.writeFileSync(log, "", { flag: "a" });
    const before = fs.readFileSync(log, "utf8");
    const sub = run("SubagentStop");
    assert.equal(sub.status, 0, sub.stderr);
    assert.equal(fs.readFileSync(log, "utf8"), before);
    const stop = run("Stop");
    assert.equal(stop.status, 0, stop.stderr);
    assert.equal(JSON.parse(stop.stdout).systemMessage, "Memory has updated!");
    assert.match(fs.readFileSync(log, "utf8"), /相容測試 OK <!-- aget-hook -->/);
    fs.renameSync(vault, vault + "-saved");
    const missing = run("Stop");
    assert.equal(missing.status, 0, missing.stderr);
    assert.match(JSON.parse(missing.stdout).systemMessage, /^Memory 未更新：/);
    assert.equal(fs.existsSync(vault), false);
    fs.renameSync(vault + "-saved", vault);
  }
});
test("nearest hooks installation above cwd owns the Stop journal", (t) => {
  const home = target(t);
  const project = path.join(home, "work", "proj");
  const other = path.join(home, "elsewhere");
  const personal = path.join(home, "personal");
  const work = path.join(home, "work-vault");
  for (const dir of [project, other, personal + "/journal", work + "/journal"])
    fs.mkdirSync(dir, { recursive: true });
  setup({ target: home, scope: "user", platform: "both", hooks: true, vault: personal });
  setup({ target: project, platform: "both", hooks: true, vault: work });
  const commands = (root) =>
    [".claude/settings.json", ".codex/hooks.json"].map(
      (rel) => JSON.parse(fs.readFileSync(path.join(root, rel))).hooks.Stop.at(-1).hooks[0].command,
    );
  const lines = (vault) => {
    const log = path.join(vault, "journal/log.md");
    return fs.existsSync(log) ? (fs.readFileSync(log, "utf8").match(/aget-hook/g) || []).length : 0;
  };
  const runAll = (cwd) => {
    for (const cmd of [...commands(home), ...commands(project)]) {
      const r = spawnSync(cmd, {
        shell: true, cwd, encoding: "utf8",
        input: JSON.stringify({ hook_event_name: "Stop", session_id: "owner", cwd, last_assistant_message: "owner" }),
      });
      assert.equal(r.status, 0, r.stderr);
    }
  };
  runAll(project);
  assert.deepEqual([lines(personal), lines(work)], [0, 2]);
  runAll(other);
  assert.deepEqual([lines(personal), lines(work)], [2, 2]);
});
test("shadowed instructions and preexisting skill directory are not overwritten", (t) => {
  const dir = target(t);
  fs.writeFileSync(path.join(dir, "AGENTS.override.md"), "override");
  assert.throws(() => setup({ target: dir }), /SHADOWS/);
  fs.unlinkSync(path.join(dir, "AGENTS.override.md"));
  fs.mkdirSync(path.join(dir, ".agents/skills/aget-handover"), {
    recursive: true,
  });
  assert.throws(() => setup({ target: dir }), /CONFLICT/);
  assert.equal(fs.existsSync(path.join(dir, ".aget/installation.json")), false);
});
test("installation failure rolls back written files", (t) => {
  const dir = target(t),
    rename = fs.renameSync;
  fs.writeFileSync(path.join(dir, "AGENTS.md"), "original");
  fs.renameSync = (from, to, ...args) => {
    if (to.endsWith("/AGENTS.md")) throw Error("INJECTED");
    return rename(from, to, ...args);
  };
  try {
    assert.throws(() => setup({ target: dir }), /INJECTED/);
  } finally {
    fs.renameSync = rename;
  }
  assert.equal(
    fs.readFileSync(path.join(dir, "AGENTS.md"), "utf8"),
    "original",
  );
  assert.equal(fs.existsSync(path.join(dir, ".aget/installation.json")), false);
});
test("missing installed file repaired and edited managed rules rejected", (t) => {
  const dir = target(t);
  setup({ target: dir });
  const script = path.join(dir, ".aget/plugin/scripts/memory.mjs");
  fs.unlinkSync(script);
  assert.equal(setup({ target: dir, check: true }).signal, "SETUP_REQUIRED");
  setup({ target: dir });
  assert.ok(fs.existsSync(script));
  const rules = path.join(dir, "AGENTS.md");
  fs.writeFileSync(
    rules,
    fs.readFileSync(rules, "utf8").replace("Aget 開發契約", "Aget User Change"),
  );
  assert.throws(() => setup({ target: dir }), /RULE_BLOCK_CONFLICT/);
});
test("user scope writes native instruction locations instead of home root", (t) => {
  const dir = target(t);
  setup({ target: dir, scope: "user" });
  assert.ok(fs.existsSync(path.join(dir, ".claude/CLAUDE.md")));
  assert.ok(fs.existsSync(path.join(dir, ".codex/AGENTS.md")));
  assert.equal(fs.existsSync(path.join(dir, "AGENTS.md")), false);
  assert.equal(
    setup({ target: dir, scope: "user", check: true }).signal,
    "SETUP_CURRENT",
  );
});
test("update removes only unchanged previously managed files and links", (t) => {
  const dir = target(t),
    source = target(t);
  for (const name of [
    "skills",
    "agents",
    "scripts",
    "rules",
    "docs",
    ".claude-plugin",
    ".codex-plugin",
    "hooks",
  ])
    fs.cpSync(path.resolve(name), path.join(source, name), { recursive: true });
  setup({ target: dir, source });
  fs.writeFileSync(path.join(dir, "user-file"), "keep");
  fs.rmSync(path.join(source, "skills/java-explain"), { recursive: true });
  setup({ target: dir, source });
  assert.equal(
    fs.existsSync(path.join(dir, ".agents/skills/aget-java-explain")),
    false,
  );
  assert.equal(
    fs.existsSync(path.join(dir, ".aget/plugin/skills/java-explain/SKILL.md")),
    false,
  );
  assert.equal(fs.readFileSync(path.join(dir, "user-file"), "utf8"), "keep");
});
test("update prunes directories emptied by removed files but keeps stray files", (t) => {
  const dir = target(t);
  const source = target(t);
  for (const d of ["skills", "agents", "rules"])
    fs.cpSync(path.join(path.dirname(new URL(import.meta.url).pathname), "..", d), path.join(source, d), { recursive: true });
  fs.mkdirSync(path.join(source, "skills/old-a/refs"), { recursive: true });
  fs.mkdirSync(path.join(source, "skills/old-b"), { recursive: true });
  for (const f of ["old-a/SKILL.md", "old-a/refs/x.md", "old-b/SKILL.md"])
    fs.writeFileSync(path.join(source, "skills", f), "---\nname: x\ndescription: x\n---\n");
  setup({ target: dir, source, platform: "codex" });
  const plugin = path.join(dir, ".aget/plugin/skills");
  fs.writeFileSync(path.join(plugin, "old-b/.DS_Store"), "");
  fs.rmSync(path.join(source, "skills/old-a"), { recursive: true });
  fs.rmSync(path.join(source, "skills/old-b"), { recursive: true });
  assert.equal(setup({ target: dir, source, platform: "codex" }).signal, "SETUP_COMPLETE");
  assert.equal(fs.existsSync(path.join(plugin, "old-a")), false);
  assert.ok(fs.existsSync(path.join(plugin, "old-b/.DS_Store")));
  assert.equal(fs.existsSync(path.join(plugin, "old-b/SKILL.md")), false);
  assert.ok(fs.existsSync(path.join(plugin, "handover/SKILL.md")));
  assert.equal(setup({ target: dir, source, platform: "codex", check: true }).signal, "SETUP_CURRENT");
});
