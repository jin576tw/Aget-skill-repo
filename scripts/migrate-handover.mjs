#!/usr/bin/env node
import { checkpoint } from "./lib/memory.mjs";
import { cli, jsonInput } from "./lib/files.mjs";
cli(() => checkpoint(jsonInput(), true));
