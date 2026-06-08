---
name: preflight
description: Ambiguous request intake and context routing for any Angular project. TRIGGER when the prompt mentions view/tab/form/field changes without exact file paths, asks to locate candidate spec/component/service/type, or needs extra context before implementation or review. DO NOT TRIGGER when the user already provides an exact file path, symbol, or failing behavior. Works in any project by auto-detecting structure from CLAUDE.md.
---

# Preflight

Works in any Angular project. Auto-detects project structure from `CLAUDE.md`.

Use these supporting docs:

- [workflow.md](workflow.md) — intake workflow, project detection, and output contract

## Purpose

When a request is still expressed as business shorthand or screen-level language, normalize it into an executable local search target before implementation, review, or deeper code analysis.

## Guardrails

- Apply in any workspace; detect project structure before routing.
- If the user already provides an exact file path, symbol, or failing behavior, skip preflight and go directly to local analysis.
- Local project instructions, specs, and source code remain the primary authority.
- `P:\MEMORY` is background context only. If unavailable, do not block work.

## Required Output

Preflight output must include:

- target module or screen
- candidate spec
- candidate files
- candidate service or types
- missing information
- next step recommendation