#!/usr/bin/env node
import fs from "node:fs";
import { fileURLToPath } from "node:url";

const model = process.argv[2];
const data = JSON.parse(fs.readFileSync(fileURLToPath(new URL("../rules/model-profiles.json", import.meta.url)), "utf8"));
const profile = data.models.find((entry) => new RegExp(entry.match).test(model || ""));
if (profile) process.stdout.write([data.tiers[profile.tier].directive, ...profile.directives].join(" ") + "\n");
