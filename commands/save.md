---
description: Save session to memory — update P:\MEMORY journal for the current project
---

Call the @honey agent to update the work journal for this session.

Steps:
1. Read the current vault rules before writing:
   - `P:\MEMORY\memory.md` — canonical entry and session protocol
   - `P:\MEMORY\AGENTS.md` — agent-facing schema and layer rules, if present
   - `P:\MEMORY\knowledge\conventions.md` — Session 結束協議
   - `P:\MEMORY\maintenance\wiki-lint.md` — only when structure, index, hub, cross-page rules, or many pages changed
2. Identify the current project family from the workspace path. Supported families include Core / PA / POS / ESP / ADP / SDD.
3. Route memory updates using the family-level structure:
   - read `P:\MEMORY\projects/{family}/{family}.md`
   - update `P:\MEMORY\journal\log.md` — add new entries for this session (newest first)
   - update `P:\MEMORY\projects/{family}/status.md` — refresh Current Focus, Next Actions, Blocked
     - **Only write project-specific work** (Jira tickets, features, bugs, release milestones) into this file.
     - Tooling, agent, skill, workflow, or harness items must NOT appear in any project's `status.md`. They belong in `## Agent / Skills / Workflow 優化` in `todo-list.md` only.
   - read `P:\MEMORY\projects/{family}/{leaf}.md` only when a leaf project context is needed
4. Update `P:\MEMORY\journal\todo-list.md` — sync the primary project block for this session:
   - Update each ticket row with the latest status (one concise phrase)
   - Update the Release 進度 table if any release status changed
   - Update the `Last Updated` line at the top with today's date and a brief summary
   - **Boundary rules — do NOT mix sections:**
     - Each project block (POS / Core / PA / ESP / ADP / SDD) contains only that project's Jira tickets and release milestones.
     - Tooling, agent, skill, workflow, or harness items (e.g. `/start-work` changes, new skills, agent routing, shared harness) belong exclusively in `## Agent / Skills / Workflow 優化`. Never add them to a project block.
     - If such an item arises during a project session, append it to the Agent/Skills block only.
5. Distill reusable knowledge when applicable:
   - 情境教訓、踩坑 → `P:\MEMORY\knowledge\lessons-learned.md`
   - 跨專案慣例 → `P:\MEMORY\knowledge\conventions.md`
   - 跨 session 會重複使用的背景、流程、查找入口 → `domain-map.md` / `workflow-map.md` / `lookup-map.md`
   - If durable knowledge came from Jira, screenshots, official docs, external articles, raw files, or other preserved evidence, update `P:\MEMORY\sources\sources.md` and cite the source in the new/updated knowledge page.
   - **pitfalls.json 蒸餾判斷**：若本次教訓屬於**機械可判定類型**（指令參數錯誤、檔案格式限制、工具呼叫方式等），判斷是否能以 `{id, pattern, scope, message, severity}` 格式表達，若能則同步新增至 `P:\MEMORY\knowledge\pitfalls.json`；首批以機械確定性高的教訓為優先，避免規則過多造成提示疲勞。
6. If this session changed vault structure, indexes, hubs, cross-page rules, or added many pages, run the checklist in `P:\MEMORY\maintenance\wiki-lint.md` and record meaningful findings in `journal/log.md`.
7. Do not use legacy per-project journal files such as `P:\MEMORY\journal\pa-ui.md` or `P:\MEMORY\journal\pos-ui.md`.
8. If workspace instructions still point to legacy `projects/{leaf}/index.md` or `projects/{leaf}/status.md`, update them as part of the same maintenance task.
8a. **工具庫同步檢查**：若本 session 中 `~/.claude/skills/`、`agents/`、`hooks/`、`commands/` 下有任何新增、修改、刪除，必須同步更新 `P:\MEMORY\knowledge\ai-tooling.md` 對應條目（新增條目 / 更新來源路徑 / 標記失效），並更新「全量驗證歷史」表格的最後驗證日期。
9. Commit changes to `P:\MEMORY`; push only when the user has not asked to avoid pushing:
   ```
   cd "P:\MEMORY"
   git add -A -- ':!.obsidian/'
   git commit -m "docs: session update {YYYY-MM-DD} — {一句描述本次主要工作}"
   # run only if user did not say "不要 push" / "no push"
   git push
   ```
   - 排除 `.obsidian/` 目錄（Obsidian UI 狀態，非知識內容）
   - commit message 以 `docs:` 開頭，附上日期與本次 session 核心工作摘要
   - 若使用者要求不要 push，只建立本地 commit 並回報目前 branch ahead 狀態
   - 若 git push 失敗（網路或權限），記錄錯誤訊息並繼續，不阻塞流程
10. Reply with `Memory has updated!` when done.
