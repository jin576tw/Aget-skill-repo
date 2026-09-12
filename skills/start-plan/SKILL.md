---
name: start-plan
description: 為跨 session、共享依賴或多項交付建立可接續計畫，或接續已有 plan-board；集中的小任務不需建立。
---

# start-plan

## 完成目標

將需求形成可執行的目標、範圍、依賴與驗收契約，保存目前證據及未完成工作；規劃詳細度以協調需求為準。

## 驗收

每項目標有交付與驗收依據，依賴指向既有任務且無循環。保留已確認約束；Worker、模型、回合及 session 數不作通用必填。跨任務整合證據不能由單項驗收產生時才增加整合目標，不固定 INTEGRATION 角色。

簡單計畫可直接回覆；持久共享 board 使用 [Markdown 範本](references/plan-board-template.md)。現有 board 的 locked contract 與 claim 不可靜默變更；計畫方向已獲授權時不增加例行確認。

## Node 工具

以 JSON stdin 呼叫 `node skills/start-plan/scripts/plan-board.mjs`，可用 action：resolve、hash、validate、status、update。欄位與範例見 [runtime](../../docs/runtime.md)。hash 保留 LF／CRLF 正規化及 trim，相容舊 locked contract；移除自動 commit／push、固定末項 INTEGRATION。更新需最新 expectedHash 與 claim。completed 不可重新開工；blocked claim 仍保留所有權。

一般 handover 不可覆寫 board；全部 board 目標完成後，把完整目標及證據經核對遷入 handover 的完成 checkpoint，再依 finalize 保存知識與 status。board 本身保留為計畫來源，不自動刪除。
