#!/usr/bin/env node
// pitfall-guard.mjs — PreToolUse warn-only hook (ADR-003 Phase 2)
// Node port of pitfall-guard.ps1. No external deps, fail-open: always exits 0.
//
// Reads the PreToolUse hook payload from stdin, matches the Bash command against
// {MEMORY_VAULT}/knowledge/pitfalls.json, and emits { additionalContext } when a
// pitfall pattern fires. Any error is swallowed so a broken hook never blocks a tool.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

// If the hook consumer closes the pipe early, swallow the EPIPE rather than
// crashing with a stderr dump — this hook must stay fail-open and quiet.
process.stdout.on('error', () => process.exit(0));

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function pitfallsPath() {
  const vault = process.env.MEMORY_VAULT && process.env.MEMORY_VAULT.trim()
    ? process.env.MEMORY_VAULT.trim()
    : join(homedir(), 'personal-memory');
  return join(vault, 'knowledge', 'pitfalls.json');
}

try {
  const json = readStdin();
  if (!json || !json.trim()) process.exit(0);

  const data = JSON.parse(json);
  const toolName = data.tool_name ?? '';
  const command =
    data.tool_input && typeof data.tool_input.command === 'string'
      ? data.tool_input.command
      : '';

  if (!command.trim()) process.exit(0);

  let raw;
  try {
    raw = readFileSync(pitfallsPath(), 'utf8');
  } catch {
    process.exit(0); // no pitfalls file → nothing to guard against
  }

  const pitfalls = JSON.parse(raw);
  if (!Array.isArray(pitfalls)) process.exit(0);

  for (const p of pitfalls) {
    if (!p || !p.pattern) continue;
    // PowerShell -match / -notmatch are case-insensitive regex.
    if (p.scope && !new RegExp(p.scope, 'i').test(toolName)) continue;
    if (new RegExp(p.pattern, 'i').test(command)) {
      const out = {
        additionalContext: `⚠️ 踩雷防護 [${p.id ?? ''}] ${p.message ?? ''}`,
      };
      // Let Node drain stdout on natural exit — process.exit() can truncate a
      // pending pipe write, which would silently drop the only output we emit.
      process.stdout.write(JSON.stringify(out) + '\n');
      break;
    }
  }
} catch {
  // fail-open: never block a tool because the guard itself broke
}
