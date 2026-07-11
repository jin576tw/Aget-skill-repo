---
name: ticket-workflow
description: Jira 票從接票到交付的完整流程（分支、commit、MR、測報、附件、交QA）。TRIGGER when 使用者說「處理這張票」「開分支」「commit」「建 MR」「解衝突」「交 QA」「上傳附件到 Jira」。DO NOT TRIGGER when 純程式碼分析任務（用 code-analysis 工具鏈）或純規格撰寫。
---

# Ticket Workflow — 接票到交付

> 原則：**link, don't embed**——本 skill 只保存跨專案通用的流程骨架與踩坑；專案特定值（分支名、環境、路徑）以知識庫 vault 為權威來源：`projects/{family}/status.md` 的 Decisions 段與 `knowledge/conventions.md`（vault 位置見全域 CLAUDE.md；Windows 常為 `P:\MEMORY`）。

## 主流程

### 1. 接票

1. `getIssue` 取 summary、description、附件；有截圖必先看（`/jira-get-attachments` skill）
2. bug 類走 `error-first-debug` skill 的強制診斷順序
3. 確認功能入口後才開始動工

### 2. 開分支

1. 先查 vault 該專案的分支規則（來源分支、命名格式）——例：ADP 系為 `git fetch origin && git checkout sit-release && git pull` 後拉出 `{員編}/TGL-{Jira單號}`
2. 不確定來源分支時查 `projects/{family}/status.md` Decisions，不要猜

### 3. 開發與 commit

- Commit 格式與 type 清單見 [git-conventions.md](git-conventions.md)
- 跑過 `mvn test` 的專案若有 formatter plugin 自動改寫格式：**格式化 diff 必須隨下次 commit 一起進**（`[{票號}][chore] apply code formatter`），否則下次測試結果不乾淨

### 4. 驗證

- 依專案測試慣例執行（unit / IT / E2E）；GUI 變更 build-only 不等於驗收，必須觀察執行時行為
- CSS layout 可見變更必跑 E2E（見 `vue-conventions` / `playwright-patterns`）

### 5. 交付

依 [delivery-checklist.md](delivery-checklist.md) 逐項收尾：測報 → MR → Jira 附件/留言 → 交 QA。

## Jira 工具操作

附件下載/上傳、MCP 斷線處理見 [jira-ops.md](jira-ops.md)。

## 衝突與歷程

merge/rebase 衝突解法、`git log -S` 歷程追查見 [git-conventions.md](git-conventions.md)。
