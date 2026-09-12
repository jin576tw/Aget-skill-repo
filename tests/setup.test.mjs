import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
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
