---
name: preflight
description: Ambiguous request intake, spec exploration, and knowledge lookup for any Angular project. TRIGGER whenever a prompt is unclear, ambiguous, or lacks sufficient context — including missing file paths, unknown business rules, or undocumented domain knowledge. Works in any project by auto-detecting structure from CLAUDE.md. Explores local specs first; falls back to web search when local knowledge is insufficient.
---

# Preflight

Works in any Angular project. Auto-detects project structure from `CLAUDE.md`.

Use these supporting docs:

- [workflow.md](workflow.md) — intake workflow, project detection, and knowledge lookup strategy

## Purpose

When a request lacks clarity — whether missing file paths, business rule context, or domain knowledge — normalize it into an actionable Plan Input before implementation, review, or deeper code analysis. Combines local spec exploration with web knowledge lookup.

## Guardrails

- Apply in any workspace; detect project structure before routing.
- Local project instructions, specs, and source code are the primary authority.
- Use web search only when local specs are insufficient or silent on a topic.
- `P:\MEMORY` is background context only. If unavailable, do not block work.

## Knowledge Sources (priority order)

1. **Local spec** — `specs/views/`, `specs/feature/`, project CLAUDE.md
2. **P:\MEMORY** — family-level background, conventions, lessons-learned
3. **Web search** — official docs, framework guidelines, domain rules (when 1 & 2 are silent)

## Required Output

Preflight output must include:

- target module or screen
- candidate spec
- candidate files
- candidate service or types
- missing information (and whether resolved via web search)
- next step recommendation