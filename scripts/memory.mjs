#!/usr/bin/env node
import { checkpoint, finalize } from "./lib/memory.mjs";
import { cli, jsonInput, fail } from "./lib/files.mjs";
cli(() => {
  const fn = { checkpoint, finalize }[process.argv[2]];
  if (!fn) fail("USAGE: memory.mjs checkpoint|finalize < request.json");
  return fn(jsonInput());
});
