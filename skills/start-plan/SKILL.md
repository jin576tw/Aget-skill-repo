---
name: start-plan
description: 為跨 session、共享依賴或多項交付建立可接續計畫，或接續已有 plan-board；集中的小任務不需建立。
---

# start-plan

## 完成目標

將需求形成可執行的目標、範圍、依賴與驗收契約，保存目前證據及未完成工作；規劃詳細度以協調需求為準。

主會話建立 plan-board 或接手整張 board 時，預設依 [plan-coord](../plan-coord/SKILL.md) 擔任 COORD。建立時先確認目標、交付與驗收條件；接手時先讀最新 board，核對已確認的目標、任務狀態、現有 claim 與依賴。明確只交付 `PLAN-ID:TASK` 時，依執行者契約先讀該任務與認領／放行紀錄。

## 驗收

每項目標有交付與驗收依據；交給執行者時按 [Execution Brief](../start-work/references/execution-brief.md) 提供範圍、不可改行為、Context、AC、驗證與 Done，可引用既有 spec。依賴指向既有任務且無循環。保留已確認約束。持久共享 board 的每個任務都要在 contract 填 `Model`（模型或 tier 加一句理由）與 `Effort`（建議值），讓使用者和執行者在派工前就看得到配置；選法依 plan-coord「派工配置」與 `rules/model-profiles.json`。簡單計畫、Worker、回合及 session 數不作通用必填。跨任務整合證據不能由單項驗收產生時才增加整合目標，不固定 INTEGRATION 角色。

每項任務有穩定 task-id，每次認領有唯一 claim-id；session 顯示名稱只是可變標籤，不是身分主鍵，不能單獨用來判定 owner、claim 或「這是不是同一個 session」——顯示名稱可能在執行中被環境重新產生，這不代表任務被重新認領或出現新 session。認領前先讀最新 board 確認該 task-id 沒有其他 active claim；若本次起手指令與另一個 active session 相同，暫停共享 artifact 寫入，交由協調者（COORD／控場者）去重，不要因顯示名稱不同就推定是不同執行者，也不要自行判定並繼續動手。多 session 共用同一 board 時，協調者的完整操作程序（重複認領偵測、身分重新核對、依賴/資源互斥、獨立證據驗證）見專案若有提供的 COORD 類 skill；本檔只定義任務與計畫本身的結構。

簡單計畫可直接回覆；持久共享 board 使用 [Markdown 範本](references/plan-board-template.md)。現有 board 的 locked contract 與 claim 不可靜默變更；計畫方向已獲授權時不增加例行確認。

跨任務契約、共用資源或多方案判斷出現實質衝突時，依 [plan-conflict-discussion](../plan-conflict-discussion/SKILL.md) 蒐證與裁定。派工模型及 effort 採用 [模型派工指引](../start-work/references/model-dispatch.md)。

## Node 工具

以 JSON stdin 呼叫 `node skills/start-plan/scripts/plan-board.mjs`，可用 action：resolve、hash、validate、status、update、complete、register-session；status 同時列出可平行分波的機械候選（`wave_candidates`）與排除原因。欄位與範例見 [runtime](../../docs/runtime.md)。hash 保留 LF／CRLF 正規化及 trim，相容舊 locked contract；移除自動 commit／push、固定末項 INTEGRATION。更新需最新 expectedHash 與 claim。completed 不可重新開工；blocked claim 仍保留所有權。

Board 存於知識庫 `plan-boards/`（呼叫時 `root` 傳 `<vault>/plan-boards`，`file` 須為完整路徑）；一般 handover 不可覆寫 board；全部 board 目標完成後，把完整目標及證據經核對遷入 handover 的完成 checkpoint，再依 finalize 保存知識與 status。board 本身保留為計畫來源。每三個月與 log 一起檢視，整板完成滿 90 天才可列入蒸餾及封存候選；有在途依賴或無法核對完成日期時繼續保留。永久刪除另行確認。

## 任務 session 先啟動：待命登記

COORD 維護任務狀態、claim、progress、派工與驗收。COORD 啟動前，任務 Session 讀完契約可透過 `register-session` 自登或更新自己的 `standby` 列。即使依賴尚未完成，也可以登記待命；登記不取得 claim。COORD 核對 Plan-ID、Task-ID、context、依賴與資源後放行，將登記改為 `dispatched`。直接派出的子代理取得宿主回傳後也要登記。失聯標 `unavailable`，缺少聯絡工具時提供可轉貼的派工訊息。

合併表以 TASK 列顯示名稱與建議配置，Session 列顯示名稱、宿主、Session ID、model、effort、來源、狀態、登記 ID 與時間。Session ID 使用宿主提供的路由識別；待命時取不到填 `unavailable` 並告知使用者。歷史缺證填 `unknown`。配置來源用 `host-report`、`launch-args`、`dispatch-history` 或 `unknown`，保留宿主原始 effort，確認不支援才填 `n/a`。

兩宿主共用 [JSON 登記介面](../../docs/runtime.md)。更新前取 `status` 的 hash，衝突時重讀。執行者只可操作自己的列，COORD 可設定 TASK 顯示名稱及補登歷史。核對 `/clear` 重用後將舊列標 `released`，再建新列。任務狀態、進度及 claim 仍走 `update`。

### Claude Code／Codex session id 取得方式

- Claude Code：本機 skill 載入時的目前 session id 為 `${CLAUDE_SESSION_ID}`。使用 Claude 已展開的實際值；若仍是原樣 placeholder（例如直接 Read SKILL.md 或不支援替換的宿主），不可登記該字串。改取目前 SessionStart hook JSON 的 `session_id`（宿主已提供時），或請使用者以 `/status` 確認目前 session id。不要假設 shell 存在同名環境變數。
- Codex：在目前頂層任務的 shell 讀取 `CODEX_THREAD_ID`；PowerShell：`[Environment]::GetEnvironmentVariable('CODEX_THREAD_ID')`，POSIX shell：`printenv CODEX_THREAD_ID`。登記 Host=codex、Session-ID=該 thread id。Codex 不執行 Claude 的 placeholder 替換，不可用上列 Claude 字串。
- Codex 的 COORD 可用可用的 `list_threads`／`read_thread(threadId)` 核對，再以 `send_message_to_thread(threadId)` 派工。無環境值時可從宿主明確提供的目前 thread id 取得；不能只憑標題或最新時間猜中清單中的一筆。巢狀 CLI／子程序的繼承環境可能指向父任務，須以其啟動結果的 thread id 為準。
- Claude 與 Codex 的 id 分屬不同宿主，配對鍵為 Host＋Session-ID；跨宿主沒有可用聯絡工具時提供轉貼訊息，不把 Claude id 傳入 Codex thread 工具。取得失敗仍依 unavailable 流程處理。

來源：Claude skills https://code.claude.com/docs/en/skills#available-string-substitutions ；Codex thread https://learn.chatgpt.com/docs/app-server 。CODEX_THREAD_ID 已在本機 Codex shell 實測取得非空值；Claude placeholder 依官方規格，尚未在獨立 Claude session 實測。
## 一致驗收與計畫完成

所有 Task 放行與驗收均依 [測試預算與驗收](../verify/references/test-budget.md)，不因執行形式改變。

全部 Task completed 後計畫仍為 active；驗收者依 [runtime 的 Plan acceptance](../../docs/runtime.md#plan-acceptance) 明確完成。superseded 不視為已驗收完成，不藉終態略過未交付目標；需要替換任務時先依確認流程調整計畫契約。

## 派工預算

新派工依 [plan-coord](../plan-coord/SKILL.md#派工前預算與現場確認) 先確認目標與驗收，再按執行步驟估列預算。使用現有 update 在 mutable progress 保存 Budget 及計畫摘要或引用。欄位及恢復規則見 [Dispatch budget](../../docs/runtime.md#dispatch-budget)。COORD 核對 validate 的結構結果、tasks 的 dispatch.budget_ready、計畫與授權、依賴及資源後放行。舊 active 任務可回報與完成，從 ready／waiting／blocked 進入 in_progress 則需要有效預算。
