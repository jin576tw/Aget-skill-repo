# ESP Harness Runs 主清單

> 每次 `start-analysis` 啟動會在此追加一條紀錄。最新在上。
> 完整協議見 [`P:\MEMORY\knowledge\harness-protocol.md`](../../knowledge/harness-protocol.md)。
> 個別 run 的詳細狀態見 `harness/<run_id>/state.json`。

## 紀錄欄位說明

- **run_id**：`YYYYMMDD-HHmm-<feature>`
- **feature**：被分析的功能名稱
- **module**：進入點所屬 Maven 模組
- **mode**：A（逆向）/ B（連動更新）/ C（總覽）
- **started**：啟動時間（ISO-8601）
- **status**：`running` / `done` / `failed` / `partial`
- **docs**：產出文件數 / 預期文件數
- **notes**：備註（待人工項數、失敗 stage 等）

## Runs

| run_id | feature | module | mode | started | status | docs | notes |
|--------|---------|--------|------|---------|--------|------|-------|
| 20260605-1507-verify-reissuebyESP | reissuebyESP | esp-system-ui | verify | 2026-06-05T15:07+08:00 | done | SD-review.md | diff_rate=12.8%；E2E 執行（5 截圖，14 場景全通過）；harness 完整交握 |
| 20260605-1359-verify-reissuebyESP | reissuebyESP | esp-system-ui | verify | 2026-06-05T14:16+08:00 | done | SD-review.md | diff_rate=21%；E2E skipped（無 Playwright）；嚴格 harness 交握 |
| 20260519-1611-reissuebyESP | reissuebyESP | esp-system-ui | A | 2026-05-19T16:11+08:00 | done | 9/9 | 手動 subagent 執行（非 orchestrator）；截圖由使用者手動跑 Playwright |

---

## 7 天保留策略

超過 7 天的 run（依 `started` 欄位判斷）由 `start-analysis` agent 在啟動時自動清理：
1. 保留 `summary.md`（移到 `harness/_archive/<year>/<run_id>-summary.md`）
2. 刪除 `state.json`、`handoff-*.md`、`run-log.md`
3. 從本清單移除該行（保留在 archive 索引）

未自動清理時，使用者可手動執行清理（協議詳見 harness-protocol.md）。
