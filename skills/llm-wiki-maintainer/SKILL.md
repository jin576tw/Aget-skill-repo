---
name: llm-wiki-maintainer
description: 將知識資料夾整理成 LLM Wiki，或維護既有 markdown/Obsidian vault 的 raw sources、wiki、schema、index、log、ingest、query、lint 流程。TRIGGER when 使用者要求整理知識庫、資料夾、筆記、Obsidian vault、work memory、AGENTS.md/CLAUDE.md schema、raw/source catalog、wiki lint，或提到 Karpathy LLM Wiki。
---

# LLM Wiki Maintainer

Use this skill to convert a knowledge folder into a usable LLM-maintained wiki, following the pattern from Karpathy's LLM Wiki gist.

## Core Model

Maintain three layers:

1. **Raw sources** — immutable evidence. Read and add dated copies; do not rewrite existing source files.
2. **Wiki** — LLM-maintained Markdown pages with summaries, entity/topic pages, cross-links, synthesis, current status, and contradictions.
3. **Schema** — `AGENTS.md`, `CLAUDE.md`, `memory.md`, or equivalent instructions that define structure, write rules, and workflows.

Support three operations:

1. **Ingest** — add sources, summarize, integrate into existing wiki pages, update indexes, and append log entries.
2. **Query** — answer from wiki pages first, then raw sources if needed; cite file paths or source IDs.
3. **Lint** — health-check navigation, stale claims, contradictions, missing links, orphan pages, source coverage, and log hygiene.

## When Starting On A Folder

1. Inspect current structure with file listing and key Markdown files.
2. Identify existing equivalents:
   - entry/schema: `AGENTS.md`, `CLAUDE.md`, `memory.md`, `README.md`
   - wiki pages: `knowledge/`, `projects/`, `notes/`, `docs/`
   - raw/source layer: `raw/`, `sources/`, `attachments/`, `assets/`
   - index/log: `index.md`, folder hubs, `journal/log.md`, `log.md`
3. Preserve local conventions when they already work. Add missing layers incrementally.
4. Avoid bulk rewriting content unless the user explicitly asks. Prefer thin schema files and migration notes.

## Recommended Minimal Structure

```text
vault/
  AGENTS.md                  # agent schema and workflow rules
  README.md                  # human overview
  raw/README.md              # immutable source rules
  sources/sources.md         # source catalog
  knowledge/                 # stable distilled knowledge
  projects/ or topics/       # domain-specific hubs and pages
  journal/log.md             # chronological wiki evolution
  maintenance/wiki-lint.md   # health-check checklist
```

If the vault already uses a different hub pattern, keep it and document it in the schema.

## Ingest Workflow

1. Register meaningful durable sources in `sources/sources.md`.
2. Store local copies under `raw/` when links may disappear, change, or need audit.
3. Extract stable facts, uncertainties, contradictions, and cross-page implications.
4. Update existing pages before creating new ones.
5. Create new pages only when the concept will be reused.
6. Update nearest hub/index and append a log entry.
7. Keep sensitive data out of raw, sources, and wiki pages unless explicitly safe and necessary.

## Query Workflow

1. Read schema/entry file first.
2. Read the nearest hub/index to locate relevant pages.
3. Answer from wiki pages when possible.
4. Fall back to raw sources only for verification, missing evidence, or disputed claims.
5. If the answer produces reusable synthesis, ask or infer whether it should be filed back into the wiki.

## Lint Checklist

Check:

- Navigation: every active folder has a hub or clear entry.
- Source coverage: durable claims have source IDs, raw paths, or explicit provenance.
- Staleness: status pages are current; historical items are moved to log/history.
- Contradictions: newer sources supersede old claims or both are documented.
- Link health: important pages have inbound links from hubs.
- Orphans: standalone pages are either linked, archived, or deleted with user approval.
- Log hygiene: ingest/query/lint/session updates are chronological and parseable.
- Schema drift: `AGENTS.md`, `CLAUDE.md`, slash commands, and agents agree on the same workflow.

## Guardrails

- Do not silently delete or overwrite user notes.
- Do not rewrite immutable raw sources; add a new dated copy instead.
- Do not store credentials, tokens, internal IPs, production URLs, personal data, or database connection strings.
- Do not over-index: one useful hub is better than many stale indexes.
- Keep schema files concise. Put detailed domain knowledge in wiki pages, not in `AGENTS.md`.
- When working in git repos, commit and push only according to the user's current instruction.

