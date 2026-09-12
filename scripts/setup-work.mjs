#!/usr/bin/env node
import { setup } from "./lib/setup.mjs";
import { cli, fail } from "./lib/files.mjs";
cli(() => {
  const p = {};
  const args = process.argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (flag === "--check") p.check = true;
    else if (flag === "--hooks") p.hooks = true;
    else if (["--target", "--platform", "--scope"].includes(flag)) {
      if (!args[i + 1]) fail("VALUE_REQUIRED");
      p[flag.slice(2)] = args[++i];
    } else
      fail(
        "USAGE: setup-work.mjs [--target project] [--platform both|claude|codex] [--scope project|user] [--hooks] [--check]",
      );
  }
  return setup(p);
});
