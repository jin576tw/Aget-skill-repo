import fs from "node:fs";
import path from "node:path";
import { safe, read, sha, digest, atomic, locked, fail } from "./files.mjs";
import { fileURLToPath } from "node:url";
export const sourceRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
function files(root, rel = "") {
  return fs
    .readdirSync(path.join(root, rel), { withFileTypes: true })
    .flatMap((d) => {
      const p = rel ? rel + "/" + d.name : d.name;
      if (d.isSymbolicLink()) fail("SOURCE_SYMLINK");
      return d.isDirectory() ? files(root, p) : [p];
    });
}
function segment(text, label) {
  const a = `<!-- aget:${label}:begin -->`,
    b = `<!-- aget:${label}:end -->`;
  const start = text.indexOf(a),
    end = text.indexOf(b);
  if (start < 0 && end < 0) return null;
  if (
    start < 0 ||
    end < start ||
    text.indexOf(a, start + 1) >= 0 ||
    text.indexOf(b, end + 1) >= 0
  )
    fail("INVALID_MANAGED_MARKERS");
  return text.slice(start, end + b.length);
}
function replace(text, label, value) {
  const old = segment(text, label);
  return old
    ? text.replace(old, value)
    : text + (text.endsWith("\n") ? "" : "\n") + "\n" + value + "\n";
}
const wrap = (label, body) =>
  `<!-- aget:${label}:begin -->\n${body.trim()}\n<!-- aget:${label}:end -->`;
const normalizeNewlines = (text) => text.replace(/\r\n?/g, "\n");
const textFile = (rel) => /\.(?:json|md|mjs|ps1)$/i.test(rel);
function hashFile(file) {
  try {
    return sha(fs.readFileSync(file));
  } catch (e) {
    if (e.code === "ENOENT") return "MISSING";
    throw e;
  }
}
export function hookCommand(
  node,
  script,
  windows = process.platform === "win32",
  args = [],
) {
  const parts = [node, script, ...args];
  if (windows) {
    if (/[\r\n%!"`$]/.test(parts.join(""))) fail("HOOK_PATH_UNSUPPORTED");
    return parts.map((s) => '"' + s + '"').join(" ");
  }
  const quote = (s) => "'" + s.replaceAll("'", "'\"'\"'") + "'";
  return parts.map(quote).join(" ");
}
export function setup(p) {
  if (Number(process.versions.node.split(".")[0]) < 18)
    fail("NODE_18_REQUIRED");
  const root = fs.realpathSync(p.target || process.cwd());
  const source = fs.realpathSync(p.source || sourceRoot);
  const scope = p.scope || "project";
  if (!["project", "user"].includes(scope)) fail("INVALID_SCOPE");
  const platform = p.platform || "both";
  if (!["both", "claude", "codex"].includes(platform)) fail("INVALID_PLATFORM");
  const manifestFile = safe(root, ".aget/installation.json");
  return locked(root, () => {
    const previous = JSON.parse(
      read(manifestFile) || '{"files":{},"blocks":{},"links":{}}',
    );
    if (previous.scope && previous.scope !== scope)
      fail("SCOPE_CHANGE_REQUIRES_SEPARATE_TARGET");
    if (previous.platform && previous.platform !== platform)
      fail("PLATFORM_CHANGE_REQUIRES_UNINSTALL");
    const planned = [],
      links = {},
      blocks = {},
      owned = {};
    const add = (rel, data) => {
      const file = safe(root, rel);
      const current = hashFile(file);
      if (
        current !== "MISSING" &&
        current !== previous.files?.[rel] &&
        current !== sha(data) &&
        !(
          textFile(rel) &&
          normalizeNewlines(read(file)) ===
            normalizeNewlines(Buffer.from(data).toString("utf8"))
        )
      )
        fail("INSTALL_CONFLICT: " + rel);
      planned.push({ rel, file, data, expected: current });
      owned[rel] = sha(data);
    };
    for (const dir of [
      "skills",
      "agents",
      "scripts",
      "rules",
      "docs",
      ".claude-plugin",
      ".codex-plugin",
      "hooks",
    ])
      if (fs.existsSync(path.join(source, dir)))
        for (const rel of files(path.join(source, dir))) {
          const sourceRel = dir + "/" + rel;
          add(
            ".aget/plugin/" + sourceRel,
            fs.readFileSync(path.join(source, sourceRel)),
          );
        }
    // Rules are small owned blocks, never replace the user's whole file.
    const ruleBody =
      fs.readFileSync(path.join(source, "rules/development.md"), "utf8") +
      "\n\nAget 工具位置：`" +
      path.join(root, ".aget/plugin") +
      "`。\n";
    const claudeRules = scope === "user" ? ".claude/CLAUDE.md" : "CLAUDE.md",
      codexRules = scope === "user" ? ".codex/AGENTS.md" : "AGENTS.md";
    const names =
      platform === "both"
        ? [claudeRules, codexRules]
        : platform === "codex"
          ? [codexRules]
          : [claudeRules];
    if (
      names.includes(codexRules) &&
      fs.existsSync(
        safe(
          root,
          scope === "user" ? ".codex/AGENTS.override.md" : "AGENTS.override.md",
        ),
      )
    )
      fail("AGENTS_OVERRIDE_SHADOWS_TARGET");
    for (const rel of names) {
      const file = safe(root, rel),
        text = read(file) || "",
        old = segment(text, "work"),
        value = wrap("work", ruleBody);
      if (
        old &&
        sha(old) !== previous.blocks?.[rel] &&
        normalizeNewlines(old) !== normalizeNewlines(value)
      )
        fail("RULE_BLOCK_CONFLICT");
      blocks[rel] = sha(value);
      const data = Buffer.from(replace(text, "work", value));
      planned.push({ rel, file, data, expected: hashFile(file) });
    }
    const skillDirs = fs
      .readdirSync(path.join(source, "skills"))
      .filter((n) => fs.existsSync(path.join(source, "skills", n, "SKILL.md")));
    const discovery =
      platform === "both"
        ? [".agents/skills", ".claude/skills"]
        : platform === "codex"
          ? [".agents/skills"]
          : [".claude/skills"];
    for (const base of discovery)
      for (const name of skillDirs) {
        const rel = base + "/aget-" + name,
          target = path.join(root, ".aget/plugin/skills", name);
        safe(root, base);
        const file = path.join(root, rel);
        let old;
        try {
          old = fs.lstatSync(file);
        } catch (e) {
          if (e.code !== "ENOENT") throw e;
        }
        if (
          old &&
          (!old.isSymbolicLink() ||
            fs.readlinkSync(file) !== previous.links?.[rel] ||
            fs.readlinkSync(file) !== target)
        )
          fail("SKILL_INSTALL_CONFLICT: " + rel);
        links[rel] = target;
      }
    if (platform !== "codex")
      for (const name of fs.readdirSync(path.join(source, "agents")))
        if (name.endsWith(".md"))
          add(
            ".claude/agents/aget-" + name,
            fs.readFileSync(path.join(source, "agents", name)),
          );
    // Opt-in hooks are merged independently for each host, preserving unrelated handlers.
    const hooksEnabled = p.hooks ?? previous.hooks ?? false;
    // Hosts without MEMORY_VAULT (Codex) need the vault passed to the per-turn journal hook.
    const vault = p.vault ?? previous.vault ?? null;
    const hookArgs = vault ? ["--vault", vault] : [];
    if (hooksEnabled) {
      for (const host of platform === "both"
        ? ["claude", "codex"]
        : [platform]) {
        const rel =
          host === "claude" ? ".claude/settings.json" : ".codex/hooks.json";
        const file = safe(root, rel);
        const text = read(file) || "{}",
          config = JSON.parse(text);
        const cmd = hookCommand(
          process.execPath,
          path.join(root, ".aget/plugin/hooks/record.mjs"),
          undefined,
          hookArgs,
        );
        config.hooks ??= {};
        const events =
          host === "claude"
            ? [
                "Stop",
                "Notification",
                "PreCompact",
                "SessionEnd",
                "TaskCompleted",
                "SubagentStop",
              ]
            : [
                "Stop",
                "PermissionRequest",
                "PreCompact",
                "SessionEnd",
                "Interrupt",
                "SubagentStop",
              ];
        for (const event of events) {
          const entries = config.hooks[event] ?? [];
          if (!Array.isArray(entries)) fail("INVALID_HOOK_CONFIG");
          const previousCommand = previous.hookCommand;
          config.hooks[event] = entries
            .map((entry) => ({
              ...entry,
              hooks: entry.hooks?.filter(
                (h) => !previousCommand || h.command !== previousCommand,
              ),
            }))
            .filter((entry) => entry.hooks?.length);
          config.hooks[event].push({
            hooks: [
              {
                type: "command",
                command: cmd,
                timeout: host === "codex" ? 3 : 15,
              },
            ],
          });
        }
        planned.push({
          rel,
          file,
          data: Buffer.from(JSON.stringify(config, null, 2) + "\n"),
          expected: hashFile(file),
        });
      }
    }
    const removed = [];
    for (const [rel, hash] of Object.entries(previous.files || {}))
      if (!owned[rel]) {
        const file = safe(root, rel);
        if (hashFile(file) === "MISSING") continue;
        if (hashFile(file) !== hash) fail("REMOVED_FILE_CONFLICT");
        removed.push({ file, rel, hash });
      }
    for (const [rel, target] of Object.entries(previous.links || {}))
      if (!links[rel]) {
        safe(root, path.dirname(rel));
        const file = path.join(root, rel);
        if (!fs.existsSync(file)) {
          try {
            fs.lstatSync(file);
          } catch (e) {
            if (e.code === "ENOENT") continue;
            throw e;
          }
        }
        if (
          !fs.lstatSync(file).isSymbolicLink() ||
          fs.readlinkSync(file) !== target
        )
          fail("REMOVED_LINK_CONFLICT");
        removed.push({ file, rel, link: true, target });
      }
    const manifest = {
      version: 1,
      scope,
      platform,
      hooks: hooksEnabled,
      vault,
      hookCommand: hooksEnabled
        ? hookCommand(
            process.execPath,
            path.join(root, ".aget/plugin/hooks/record.mjs"),
            undefined,
            hookArgs,
          )
        : null,
      files: owned,
      blocks,
      links,
    };
    if (p.check) {
      const changes = planned
        .filter((x) => hashFile(x.file) !== sha(x.data))
        .map((x) => x.rel);
      for (const rel of Object.keys(links))
        if (!fs.existsSync(path.join(root, rel))) changes.push(rel);
      return {
        signal:
          changes.length || removed.length ? "SETUP_REQUIRED" : "SETUP_CURRENT",
        changes,
        removed: removed.map((x) => x.rel),
        node: process.version,
      };
    }
    const undo = [];
    try {
      for (const x of planned) {
        if (hashFile(x.file) === sha(x.data)) continue;
        if (hashFile(x.file) !== x.expected) fail("INSTALL_CONCURRENT_UPDATE");
        const old = x.expected === "MISSING" ? null : fs.readFileSync(x.file);
        fs.mkdirSync(path.dirname(x.file), { recursive: true });
        const tmp = x.file + ".aget-tmp";
        fs.writeFileSync(tmp, x.data, { flag: "wx" });
        try {
          fs.renameSync(tmp, x.file);
        } finally {
          fs.rmSync(tmp, { force: true });
        }
        undo.push(() =>
          old === null
            ? fs.rmSync(x.file, { force: true })
            : fs.writeFileSync(x.file, old),
        );
        if (hashFile(x.file) !== sha(x.data)) fail("INSTALL_READBACK_FAILED");
      }
      for (const [rel, target] of Object.entries(links)) {
        const file = path.join(root, rel);
        if (fs.existsSync(file)) continue;
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.symlinkSync(
          target,
          file,
          process.platform === "win32" ? "junction" : "dir",
        );
        undo.push(() => fs.unlinkSync(file));
      }
      for (const x of removed) {
        if (!x.link && hashFile(x.file) !== x.hash)
          fail("REMOVED_FILE_CONFLICT");
        const old = x.link ? null : fs.readFileSync(x.file);
        fs.unlinkSync(x.file);
        undo.push(() => {
          if (x.link) return fs.symlinkSync(x.target, x.file, "dir");
          fs.mkdirSync(path.dirname(x.file), { recursive: true });
          fs.writeFileSync(x.file, old);
        });
        // Git and unlink leave emptied directories behind; prune them up to the plugin root.
        if (!x.link && x.rel.startsWith(".aget/plugin/")) {
          const stop = path.join(root, ".aget/plugin");
          for (
            let d = path.dirname(x.file);
            d.startsWith(stop + path.sep) && fs.readdirSync(d).length === 0;
            d = path.dirname(d)
          )
            fs.rmdirSync(d);
        }
      }
      atomic(
        manifestFile,
        JSON.stringify(manifest, null, 2) + "\n",
        digest(manifestFile),
      );
    } catch (e) {
      for (const restore of undo.reverse()) restore();
      throw e;
    }
    return {
      signal: "SETUP_COMPLETE",
      target: root,
      skills: skillDirs.length,
      platform,
      hooks: hooksEnabled,
    };
  });
}
