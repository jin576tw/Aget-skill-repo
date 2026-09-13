#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { sourceRoot } from "./lib/setup.mjs";
const errors = [];
let count = 0;
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)],
    );
}
for (const file of walk(sourceRoot).filter(
  (p) =>
    !p.includes(path.sep + ".git" + path.sep) &&
    !p.includes(path.sep + "node_modules" + path.sep),
)) {
  if (file.endsWith(".ps1")) errors.push("Obsolete PowerShell: " + file);
  if (file.endsWith(".mjs")) {
    const r = spawnSync(process.execPath, ["--check", file], {
      encoding: "utf8",
    });
    if (r.status !== 0) errors.push(r.stderr);
  }
  if (!file.endsWith(".md")) continue;
  const text = fs.readFileSync(file, "utf8");
  if (path.basename(file) === "SKILL.md") {
    count++;
    const head = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1];
    if (!head || !/^name: .+/m.test(head) || !/^description: .+/m.test(head))
      errors.push("Invalid skill metadata: " + file);
  }
  const prose = text.replace(/^```[^\n]*\n[\s\S]*?^```/gm, "");
  for (const match of prose.matchAll(/\]\(([^)]+)\)/g)) {
    let link = match[1].replace(/^<|>$/g, "").split("#")[0];
    if (!link || /^[a-z]+:/i.test(link) || link.startsWith("/")) continue;
    if (!fs.existsSync(path.resolve(path.dirname(file), link)))
      errors.push(
        "Missing link: " + path.relative(sourceRoot, file) + " -> " + link,
      );
  }
}
for (const host of [".claude-plugin", ".codex-plugin"]) {
  const m = JSON.parse(
    fs.readFileSync(path.join(sourceRoot, host, "plugin.json")),
  );
  if (!m.name || !m.version) errors.push("Invalid manifest: " + host);
}
const market = JSON.parse(
  fs.readFileSync(path.join(sourceRoot, ".claude-plugin/marketplace.json")),
);
if (!market.name || !market.owner?.name || !Array.isArray(market.plugins))
  errors.push("Invalid marketplace manifest");
for (const entry of market.plugins ?? [])
  if (
    typeof entry.source !== "string" ||
    !fs.existsSync(
      path.join(sourceRoot, entry.source, ".claude-plugin/plugin.json"),
    )
  )
    errors.push("Marketplace plugin source missing: " + entry.name);
const pluginHooks = JSON.parse(
  fs.readFileSync(path.join(sourceRoot, "hooks/hooks.json")),
);
for (const entries of Object.values(pluginHooks.hooks))
  for (const { hooks } of entries)
    for (const { command } of hooks)
      for (const [, rel] of command.matchAll(/\$\{CLAUDE_PLUGIN_ROOT\}\/([^"\s]+)/g))
        if (!fs.existsSync(path.join(sourceRoot, rel)))
          errors.push("Plugin hook script missing: " + rel);
// The README tool tables are the user-facing index, so every shipped skill and agent must appear there.
const readme = fs.readFileSync(path.join(sourceRoot, "README.md"), "utf8");
for (const name of fs.readdirSync(path.join(sourceRoot, "skills")))
  if (
    fs.existsSync(path.join(sourceRoot, "skills", name, "SKILL.md")) &&
    !readme.includes(`(skills/${name}/SKILL.md)`)
  )
    errors.push("README missing skill: " + name);
for (const name of fs.readdirSync(path.join(sourceRoot, "agents")))
  if (name.endsWith(".md") && !readme.includes(`(agents/${name})`))
    errors.push("README missing agent: " + name);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else
  console.log(
    `${count} skills; Node syntax, manifests, Markdown links and PowerShell removal verified.`,
  );
