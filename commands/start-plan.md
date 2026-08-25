---
description: 將跨 repo 或多 session 工作拆成一份共享 handover task board，為每個 task 選擇 start-work 或 direct 執行路徑
model: opus
---

# /start-plan

使用 `start-plan` skill 執行 `$ARGUMENTS`。

## 指令

- `/start-plan <需求>`：唯讀研究並提出 task board 預覽；使用者確認後才建立共享 handover。
- `/start-plan --status <PLAN-ID>`：讀取共享 handover並顯示任務狀態、claim、依賴與下一個可執行 Task ID。
- `/start-plan --migrate-handovers <PLAN-ID>`：先預覽舊 handover 合併與刪除清單，確認後才遷移。

## 執行契約

1. 完整讀取 `~/.claude/skills/start-plan/SKILL.md` 與其指定的 reference。
2. 規劃階段保持唯讀；只問一個會改變拆分或驗收方式的關鍵問題。
3. Task ID 固定為 `{PLAN-ID}:{TASK}`，例如 `ESP-PM-0001-P01:BACKEND`；每個 task 必須明確標記 `Execution-Workflow`（`governed-start-work` 或 `direct`）。
4. 每個 plan 只使用一份 `Handover-Type: plan-board` 共享 handover；不可建立每 task 一檔。
5. 只有當某項端到端證據無法由任一 task 自身的驗收證據產生時（例如跨 task 共用且變動的契約/介面、跨 repo 行為或錯誤訊息一致性需求、共享 runtime、或其他明確要求的真實環境流程），plan 才建立最後的 `INTEGRATION` checker task；單純「跨 repo」或「跨 task」本身不是理由——常見的拆分結構不等於自動觸發條件。當各 task 對照未變動的契約即可獨立驗證時省略 `INTEGRATION`，但必須在預覽中明確說明哪個契約未變、為何各邊證據互相獨立，不可默默省略。
6. 未收到明確確認時輸出 `WAITING_FOR_PLAN_CONFIRMATION` 並停止寫入。
7. 寫入與狀態更新交由 Honey 的 plan-board mode；不得以一般 handover 全檔覆寫共享 board。`governed-start-work` task 才產生 `/start-work --task`；`direct` task 不進入 start-work 的 Spec/TDD/review/DoD 流程，依 Locked Contract 直接執行，狀態仍以 `scripts/plan-board.ps1` 更新。

## 完成輸出

至少回報：Plan ID、共享 handover 路徑、Task ID 清單、依賴、目前可執行 task，以及下一條可複製指令：

```text
/start-work --task <PLAN-ID:TASK>
```
