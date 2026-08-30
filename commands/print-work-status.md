---
description: Print current work status from {MEMORY_VAULT} — grouped by project family and JIRA ticket
---

# /print-work-status

產生「本周工作進度」報告，時間範圍為上周一至今日。

## 用途

快速產生格式化的週報，依業務領域與 JIRA 票號分組，供貼入週報或工作回報使用。

## 業務領域對應

- **CORE** (理賠)：JIRA prefix `BMPCORE-*`
- **PA** (保費)：JIRA prefix `BMPPA-*`
- **POS** (保全)：JIRA prefix `BMPPOS-*`
- **ESP** (外部服務平台)：無固定 JIRA prefix

## 資料來源

- `{MEMORY_VAULT}/journal/log.md`：時間序工作日誌（篩選上周一至今日條目）
- `{MEMORY_VAULT}/projects/{family}/status.md`：專案狀態與 Release 表
- `{MEMORY_VAULT}/projects/{family}/{leaf}.md`：子專案靜態參考（按需）

## 執行步驟

Steps:
1. Read `{MEMORY_VAULT}/memory.md` and identify the current project family from the workspace path.
2. Read `{MEMORY_VAULT}/projects/{family}/{family}.md` and `{MEMORY_VAULT}/projects/{family}/status.md`.
3. Read `{MEMORY_VAULT}/journal/log.md` and filter entries from last Monday to today (inclusive).
4. Read leaf page `{MEMORY_VAULT}/projects/{family}/{leaf}.md` only when a specific leaf project context is needed.
5. Output results using the exact format below. Group by business domain + JIRA ticket. Each item is one short phrase (不超過10字) describing the work, followed by a dash and the status word.
6. Use concise status words only: 已完成、已交付測試、測試中、處理中、待開發、待補測報.
7. Output format (follow exactly):

{業務領域} - {JIRA 票號} 項目
(1) {簡短工作說明} - {狀態}
(2) {簡短工作說明} - {狀態}

{業務領域} - {JIRA 票號} 項目
(1) {簡短工作說明} - {狀態}

Example output:
理賠 - BMPCORE-101 項目
(1) 病例查詢修正 - 已完成

保全 - BMPPOS-23 項目
(1) 系統受理時間 - 已交付測試

保費 - BMPPA-4 項目
(1) 受理人員查詢調整 - 已完成

8. If a JIRA ticket has multiple independent work items, list each as a separate numbered entry.
9. Output in Traditional Chinese.
10. If `{MEMORY_VAULT}` is unavailable, output: ⚠️ 無法存取 {MEMORY_VAULT}，請確認磁碟是否已掛載。
11. If data is insufficient, explicitly state which records or project scopes are missing — do not fabricate progress.
