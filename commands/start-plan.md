---
description: 將跨 repo 或多 session 工作拆成一份共享 handover task board，產生可直接交給 /start-work --task 的短 Task ID
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
3. Task ID 固定為 `{PLAN-ID}:{TASK}`，例如 `ESP-PM-0001-P01:BACKEND`。
4. 每個 plan 只使用一份 `Handover-Type: plan-board` 共享 handover；不可建立每 task 一檔。
5. 每個 plan 必須含最後的 `INTEGRATION` checker task。
6. 未收到明確確認時輸出 `WAITING_FOR_PLAN_CONFIRMATION` 並停止寫入。
7. 寫入與狀態更新交由 Honey 的 plan-board mode；不得以一般 handover 全檔覆寫共享 board。

## 完成輸出

至少回報：Plan ID、共享 handover 路徑、Task ID 清單、依賴、目前可執行 task，以及下一條可複製指令：

```text
/start-work --task <PLAN-ID:TASK>
```
