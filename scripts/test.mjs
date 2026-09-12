#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {sourceRoot} from './lib/setup.mjs';
const files=fs.readdirSync(path.join(sourceRoot,'tests')).filter(n=>n.endsWith('.test.mjs')).sort().map(n=>path.join(sourceRoot,'tests',n));
const result=spawnSync(process.execPath,['--test',...files],{cwd:sourceRoot,stdio:'inherit'});
process.exitCode=result.status??1;
