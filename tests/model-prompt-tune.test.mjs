import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const profiles = JSON.parse(fs.readFileSync(path.join(root, "rules/model-profiles.json"), "utf8"));
const expected = new Map([
  ["claude-opus-4-8", "frontier"], ["claude-sonnet-5", "balanced"],
  ["claude-opus-5", "frontier"], ["claude-opus-5-5", "frontier"],
  ["claude-fable-5-1", "frontier"], ["claude-sonnet-5-5", "balanced"],
  ["gpt-6.1-sol", "balanced"], ["claude-haiku-4-5", "efficient"],
  ["claude-haiku-4-5-20251001", "efficient"],
  ["gpt-6-astra", "frontier"], ["gpt-6-sol", "balanced"],
  ["gpt-6-luna", "efficient"], ["gpt-5.6-sol", "frontier"],
  ["gpt-5.6-terra", "balanced"], ["gpt-5.6-luna", "efficient"],
]);

test("profiles have anchored unique matches, sources and known tiers", () => {
  assert.equal(profiles.version, 1);
  for (const tier of ["frontier", "balanced", "efficient"])
    assert.ok(profiles.tiers[tier].directive);
  assert.equal(profiles.models.length, expected.size - 1);
  for (const profile of profiles.models) {
    assert.match(profile.match, /^\^.*\$$/);
    assert.ok(["claude", "gpt"].includes(profile.family));
    assert.ok(profiles.tiers[profile.tier]);
    assert.ok(profile.directives.length && profile.directives.every((x) => typeof x === "string"));
    assert.ok(profile.source && profile.reviewed);
    new RegExp(profile.match);
  }
  for (const [id, tier] of expected) {
    const matches = profiles.models.filter((p) => new RegExp(p.match).test(id));
    assert.equal(matches.length, 1, id);
    assert.equal(matches[0].tier, tier);
  }
  assert.equal(profiles.models.some((p) => new RegExp(p.match).test("gpt-7-unknown")), false);
});

test("hook injects Claude family once and Codex only on first model or change", (t) => {
  const state = fs.mkdtempSync(path.join(os.tmpdir(), "aget-model-tune-"));
  t.after(() => fs.rmSync(state, { recursive: true, force: true }));
  const run = (input) => spawnSync(process.execPath, [path.join(root, "hooks/model-prompt-tune.mjs")], {
    input: typeof input === "string" ? input : JSON.stringify(input),
    encoding: "utf8", env: { ...process.env, AGET_MODEL_TUNE_STATE_DIR: state },
  });
  const claude = run({ hook_event_name: "SessionStart", session_id: "session123" });
  assert.equal(claude.status, 0);
  const family = JSON.parse(claude.stdout).hookSpecificOutput;
  assert.equal(family.hookEventName, "SessionStart");
  assert.match(family.additionalContext, /claude-opus-5-5/);
  assert.match(family.additionalContext, /claude-fable-5-1/);
  assert.match(family.additionalContext, /claude-sonnet-5-5/);
  assert.doesNotMatch(family.additionalContext, /gpt-/);
  const base = { hook_event_name: "UserPromptSubmit", session_id: "session123", model: "gpt-5.6-luna", prompt: "SECRET_PROMPT" };
  const first = run(base);
  assert.equal(first.status, 0);
  assert.match(JSON.parse(first.stdout).hookSpecificOutput.additionalContext, /任務目標/);
  assert.doesNotMatch(first.stdout, /SECRET_PROMPT/);
  assert.equal(run(base).stdout, "");
  const changed = run({ ...base, model: "gpt-5.6-terra" });
  assert.match(changed.stdout, /gpt-5\.6-terra/);
  assert.equal(run({ ...base, model: "gpt-7-unknown" }).stdout, "");
  assert.match(run({ ...base, model: "gpt-5.6-terra" }).stdout, /gpt-5\.6-terra/);
  assert.equal(run("invalid json").status, 0);
  assert.equal(run("invalid json").stdout, "");
  assert.equal(run({ hook_event_name: "UserPromptSubmit" }).stdout, "");
});

test("target-model prompt renderer uses the same profiles", () => {
  const run = (id) => spawnSync(process.execPath, [path.join(root, "scripts/model-prompt.mjs"), id], { encoding: "utf8" });
  assert.match(run("gpt-5.6-luna").stdout, /任務目標/);
  assert.equal(run("gpt-7-unknown").stdout, "");
});
