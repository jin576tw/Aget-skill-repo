---
description: Save session to memory — update P:\MEMORY journal for the current project
---

Call the @memory agent to update the work journal for this session.

Steps:
1. Read `P:\MEMORY\memory.md` and identify the current project family from the workspace path.
2. Route memory updates using the family-level structure:
   - read `P:\MEMORY\projects/{family}/{family}.md`
   - update `P:\MEMORY\journal\log.md` — add new entries for this session (newest first)
   - update `P:\MEMORY\projects/{family}/status.md` — refresh Current Focus, Next Actions, Blocked
     - **Only write project-specific work** (Jira tickets, features, bugs, release milestones) into this file.
     - Tooling, agent, skill, workflow, or harness items must NOT appear in any project's `status.md`. They belong in `## Agent / Skills / Workflow 優化` in `todo-list.md` only.
   - read `P:\MEMORY\projects/{family}/{leaf}.md` only when a leaf project context is needed
3. Update `P:\MEMORY\journal\todo-list.md` — sync the primary project block for this session:
   - Update each ticket row with the latest status (one concise phrase)
   - Update the Release 進度 table if any release status changed
   - Update the `Last Updated` line at the top with today's date and a brief summary
   - **Boundary rules — do NOT mix sections:**
     - Each project block (POS / Core / PA / ESP / ADP / SDD) contains only that project's Jira tickets and release milestones.
     - Tooling, agent, skill, workflow, or harness items (e.g. `/start-work` changes, new skills, agent routing, shared harness) belong exclusively in `## Agent / Skills / Workflow 優化`. Never add them to a project block.
     - If such an item arises during a project session, append it to the Agent/Skills block only.
4. Distill any reusable knowledge to `P:\MEMORY\knowledge\lessons-learned.md` or `conventions.md` if applicable.
5. Do not use legacy per-project journal files such as `P:\MEMORY\journal\pa-ui.md` or `P:\MEMORY\journal\pos-ui.md`.
6. If workspace instructions still point to legacy `projects/{leaf}/index.md` or `projects/{leaf}/status.md`, update them as part of the same maintenance task.
7. Commit and push all changes to `P:\MEMORY`:
   ```
   cd "P:\MEMORY"
   git add -A -- ':!.obsidian/'
   git commit -m "docs: session update {YYYY-MM-DD} — {一句描述本次主要工作}"
   git push
   ```
   - 排除 `.obsidian/` 目錄（Obsidian UI 狀態，非知識內容）
   - commit message 以 `docs:` 開頭，附上日期與本次 session 核心工作摘要
   - 若 git push 失敗（網路或權限），記錄錯誤訊息並繼續，不阻塞流程
8. Reply with `Memory has updated!` when done.
