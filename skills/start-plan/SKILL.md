---
name: start-plan
description: 為跨 session、共享依賴或多項交付建立可接續計畫，或接續已有 plan-board；集中的小任務不需建立。
---

# start-plan

## 完成目標

將需求形成可執行的目標、範圍、依賴與驗收契約，保存目前證據及未完成工作；規劃詳細度以協調需求為準。

## 驗收

每項目標有交付與驗收依據；交給執行者時按 [Execution Brief](../start-work/references/execution-brief.md) 提供範圍、不可改行為、Context、AC、驗證與 Done，可引用既有 spec。依賴指向既有任務且無循環。保留已確認約束；Worker、模型、回合及 session 數不作通用必填。跨任務整合證據不能由單項驗收產生時才增加整合目標，不固定 INTEGRATION 角色。

每項任務有穩定 task-id，每次認領有唯一 claim-id；session 顯示名稱只是可變標籤，不是身分主鍵，不能單獨用來判定 owner、claim 或「這是不是同一個 session」——顯示名稱可能在執行中被環境重新產生，這不代表任務被重新認領或出現新 session。認領前先讀最新 board 確認該 task-id 沒有其他 active claim；若本次起手指令與另一個 active session 相同，暫停共享 artifact 寫入，交由協調者（COORD／控場者）去重，不要因顯示名稱不同就推定是不同執行者，也不要自行判定並繼續動手。多 session 共用同一 board 時，協調者的完整操作程序（重複認領偵測、身分重新核對、依賴/資源互斥、獨立證據驗證）見專案若有提供的 COORD 類 skill；本檔只定義任務與計畫本身的結構。

簡單計畫可直接回覆；持久共享 board 使用 [Markdown 範本](references/plan-board-template.md)。現有 board 的 locked contract 與 claim 不可靜默變更；計畫方向已獲授權時不增加例行確認。

## Node 工具

以 JSON stdin 呼叫 `node skills/start-plan/scripts/plan-board.mjs`，可用 action：resolve、hash、validate、status、update。欄位與範例見 [runtime](../../docs/runtime.md)。hash 保留 LF／CRLF 正規化及 trim，相容舊 locked contract；移除自動 commit／push、固定末項 INTEGRATION。更新需最新 expectedHash 與 claim。completed 不可重新開工；blocked claim 仍保留所有權。

一般 handover 不可覆寫 board；全部 board 目標完成後，把完整目標及證據經核對遷入 handover 的完成 checkpoint，再依 finalize 保存知識與 status。board 本身保留為計畫來源，不自動刪除。
