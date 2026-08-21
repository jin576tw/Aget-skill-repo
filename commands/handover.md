---
description: Save resumable workspace state through @honey without updating durable Memory
---

Call the @honey agent in **handover mode** for the current workspace.

This is not `/save`. Follow `P:\MEMORY\handovers\handovers.md`: compute the current workspace prefix, enumerate and read both the legacy `{workspace-prefix}.md` file and every `{workspace-prefix}--*.md` task handover, then deliberately select the task-slug. Reuse a task-slug only when its recorded goal matches the current task; otherwise choose an unused descriptive task-slug. If more than one handover may match, stop with `HANDOVER_NEEDS_TASK_SLUG` and ask the user before writing.

Pass @honey the selected task-slug and the target file's preflight SHA-256 (`MISSING` when absent). Immediately before writing, @honey must confirm the target hash is unchanged; if not, return `HANDOVER_CONCURRENT_UPDATE` without overwriting or merging. It may overwrite, commit, and push only the selected per-task handover file. It must not update journal, project status, todo, sources, raw files, or durable knowledge.

Before delegating, run `node C:\Users\003689\.agents\skills\save\session-metrics.cjs all` and capture this session's own tokens/cost/duration as a lightweight, single-session snapshot per `P:\MEMORY\handovers\handovers.md`'s "Session Metrics 段落規則" — record honestly (including `fallback`/workspace-mismatch/known-zero-duration cases as "not usable, reason X"), never fabricate or aggregate across sessions, and never let this substitute for `/save`'s durable metrics.

Pass @honey a concise factual summary of the current goal, completed work, current state, session-only decisions and constraints, changed files, verification, this session's metrics snapshot, next steps, and blockers. Do not pass or persist the transcript, full source code, credentials, personal data, production details, or reusable knowledge distillation.

Return the workspace prefix, task-slug, full workspace key, handover path, conflict-check result, validation result, commit hash, and push result. If the handover content is unchanged, return `NO_DIFF` and do not create an empty commit.
