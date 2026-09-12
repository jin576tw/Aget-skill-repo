#!/usr/bin/env node
import { board } from "../../../scripts/lib/board.mjs";
import { cli, jsonInput } from "../../../scripts/lib/files.mjs";
cli(() => board(jsonInput()));
