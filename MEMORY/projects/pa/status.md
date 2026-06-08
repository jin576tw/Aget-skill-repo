# PA 工作狀態

## Related Lessons

> PA family 目前以共用規則為主；完整列表見 [lessons-learned.md](../../knowledge/lessons-learned.md)。

- **正體中文用字**：「自訂」非「自定」。

---

## Current Focus

- **跨專案 md 工作流工具骨架已建立**（2026-06-08）：user-level `.claude` 已新增 `gate-keeper` / `angular-testing` skills、`unit-test-writer` / `implementer` agents、輕量 `/start-work` command；`/plan` 改為先問答確認後再執行。另已建立共享 Playwright harness：`C:\Users\003689\Desktop\playwright-harness`。
- **Preflight skill 接線完成**（2026-06-05）：PA-UI 已改成「skill 優先、`.github/instructions/preflight.instructions.md` 保底」模式。CLAUDE.md + copilot-instructions.md + fornt-end / checkbox-select-all / pdf-worker / roc-date 四份 instructions 均已更新。不依賴 user-local 路徑。
- **BMPPA-4**（受理人員查詢調整）：✅ 已部署正式環境（2026-06-01 確認完成）。
- PA-UI Vault 連結完成；下一步依實際任務補充索引。

## Entry Points

**工作區路徑**（相對於工作區根目錄）
- PA API: `pa/pa-api`
- PA UI: `pa/pa-ui`

**Vault 路徑**（相對於 `P:\MEMORY`）
- Context: [projects/pa/pa.md](pa.md), [projects/pa/about.md](about.md), [projects/pa/lookup.md](lookup.md), [projects/pa/history.md](history.md), [projects/pa/pa-ui.md](pa-ui.md), [knowledge/conventions.md](../../knowledge/conventions.md)

## Next Actions

- [ ] 用一個真實需求 dry run `/start-work` → spec → `/plan` 確認 → 單一 AC 流程，驗證問答 checkpoint 是否順暢
- [x] 確認 BMPPA-4 正式環境部署結果（✅ 2026-06-01 確認完成）
- [ ] 為 `pa-api` 補 about / lookup / status 細節
- [ ] 依實際任務補充 PA-UI components / services / types 索引
- [ ] 確認 PA-UI 的 specs/views 與實際頁面是否同步

## Blocked

- 無

## Decisions / Constraints

- `/start-work` 應維持單一輕量入口；是否繼續、是否建立共享 harness、是否進入 DoD 收尾，皆以流程問答確認，不新增額外 command 心智負擔。
- `projects/pa/` 是 PA 的唯一活文件入口；UI 靜態參考由 `projects/pa/pa-ui.md` 承接。
- 調整 Vault 結構或路徑後，需同步更新 `pa-ui/CLAUDE.md` 與 `.github/copilot-instructions.md` 的 memory 入口、status 路徑與 `/save` 觸發詞。
- `journal.md` 只作入口，`journal/log.md` 是唯一活日誌；`journal/todo-list.md` 作為跨專案待辦總覽，不得再新增月誌或 template 型 journal 活文件。
- 待實際碰到 PA API 任務後，再補 API 層常用查找規則。
- `P:\MEMORY` is optional personal context; if unavailable, rely on project specs, instructions, and source code.
- The journal should optimize for session handoff, not replace issues, specs, or commit history.
- 既有工作歷程保留在 `projects/pa/history.md` 與 `journal/log.md`，不刪除既有 session 歷史。