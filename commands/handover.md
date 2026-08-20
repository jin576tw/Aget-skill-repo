---
description: Save resumable workspace state through @honey without updating durable Memory
---

Call the @honey agent in **handover mode** for the current workspace.

This is not `/save`. The agent must follow `P:\MEMORY\handovers\handovers.md`, overwrite only the deterministic handover file for the resolved current workspace, and commit/push only that file. It must not update journal, project status, todo, sources, raw files, durable knowledge, or session metrics.

Pass @honey a concise factual summary of the current goal, completed work, current state, session-only decisions and constraints, changed files, verification, next steps, and blockers. Do not pass or persist the transcript, full source code, credentials, tokens, personal data, production details, or reusable knowledge distillation.

Return the workspace key, handover path, validation result, commit hash, and push result. If the handover content is unchanged, return `NO_DIFF` and do not create an empty commit.
