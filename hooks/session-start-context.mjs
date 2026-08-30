#!/usr/bin/env node
// session-start-context.mjs — Claude Code SessionStart hook
// Node port of session-start-context.ps1.
//
// Detects the project stack from package.json / pom.xml in the launch directory
// and emits it as { systemMessage } so the agent knows the tech stack up front.
// Errors are swallowed (PowerShell $ErrorActionPreference = 'SilentlyContinue').

import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Swallow EPIPE if the hook consumer closes the pipe early — stay fail-silent.
process.stdout.on('error', () => process.exit(0));

try {
  // Drain stdin (hook input); content is unused.
  try {
    readFileSync(0, 'utf8');
  } catch {
    /* no stdin */
  }

  const cwd = process.cwd();
  const info = [];

  // package.json — frontend / Node frameworks
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8'));
    const deps = pkg.dependencies ?? {};

    if (deps['@angular/core']) info.push(`Angular ${deps['@angular/core']}`);
    if (deps['react']) info.push(`React ${deps['react']}`);
    if (deps['vue']) info.push(`Vue ${deps['vue']}`);
    if (deps['next']) info.push(`Next.js ${deps['next']}`);
    if (deps['@nestjs/core']) info.push(`NestJS ${deps['@nestjs/core']}`);

    if (pkg.engines && pkg.engines.node) info.push(`Node ${pkg.engines.node}`);
  } catch {
    /* no package.json */
  }

  // pom.xml — Java / Spring
  try {
    const pom = readFileSync(join(cwd, 'pom.xml'), 'utf8');
    // PowerShell -match is case-insensitive; keep that semantics.
    if (/spring-boot/i.test(pom)) info.push('Spring Boot');
    else if (/<groupId>/i.test(pom)) info.push('Java/Maven');
  } catch {
    /* no pom.xml */
  }

  if (info.length > 0) {
    const msg = `Detected project stack: ${info.join(', ')}`;
    process.stdout.write(JSON.stringify({ systemMessage: msg }) + '\n');
  }
} catch {
  /* fail silent */
}
