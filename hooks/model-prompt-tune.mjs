#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const profilesFile = fileURLToPath(new URL("../rules/model-profiles.json", import.meta.url));

function emit(event, additionalContext) {
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: { hookEventName: event, additionalContext },
  }));
}

function label(model) {
  return model.match.slice(1, -1).replace(/\([^)]*\)\?/g, "").replace(/\\\./g, ".");
}

function directive(profile, tiers) {
  return [tiers[profile.tier].directive, ...profile.directives].join(" ");
}

async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const { tiers, models } = JSON.parse(fs.readFileSync(profilesFile, "utf8"));
  if (input.hook_event_name === "SessionStart") {
    const lines = models.filter((model) => model.family === "claude")
      .map((model) => `${label(model)}: ${directive(model, tiers)}`);
    if (lines.length) emit("SessionStart", `Claude 模型精簡指引；只套用目前模型對應的一行：\n${lines.join("\n")}`);
    return;
  }
  if (input.hook_event_name !== "UserPromptSubmit" ||
      typeof input.model !== "string" ||
      typeof input.session_id !== "string" ||
      !/^[a-zA-Z0-9_-]{8,128}$/.test(input.session_id)) return;
  const stateDir = process.env.AGET_MODEL_TUNE_STATE_DIR ||
    path.join(os.homedir(), ".aget", "state", "model-prompt-tune");
  const stateFile = path.join(stateDir, input.session_id);
  const profile = models.find((entry) => entry.family === "gpt" && new RegExp(entry.match).test(input.model));
  if (!profile) {
    fs.rmSync(stateFile, { force: true });
    return;
  }
  try {
    if (fs.readFileSync(stateFile, "utf8") === input.model) return;
  } catch (error) {
    if (error.code !== "ENOENT") return;
  }
  fs.mkdirSync(stateDir, { recursive: true });
  const tempFile = `${stateFile}.${process.pid}.tmp`;
  fs.writeFileSync(tempFile, input.model, { mode: 0o600 });
  fs.renameSync(tempFile, stateFile);
  emit("UserPromptSubmit", `目前模型 ${input.model}：${directive(profile, tiers)}`);
}

main().catch(() => { /* Hooks must never interrupt the user prompt. */ });
