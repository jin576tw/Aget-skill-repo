---
name: start-plan
description: 為跨 session、共享依賴或多項交付建立可接續計畫，或接續已有 plan-board；集中的小任務不需建立。
---

# start-plan

## 完成目標

將需求形成可執行的目標、範圍、依賴與驗收契約，保存目前證據及未完成工作；規劃詳細度以協調需求為準。

## 驗收

每項目標有交付與驗收依據；交給執行者時按 [Execution Brief](../start-work/references/execution-brief.md) 提供範圍、不可改行為、Context、AC、驗證與 Done，可引用既有 spec。依賴指向既有任務且無循環。保留已確認約束。持久共享 board 的每個任務都要在 contract 填 `Model`（模型或 tier 加一句理由）與 `Effort`（建議值），讓使用者和執行者在派工前就看得到配置；選法依 plan-coord「派工配置」與 `rules/model-profiles.json`。簡單計畫、Worker、回合及 session 數不作通用必填。跨任務整合證據不能由單項驗收產生時才增加整合目標，不固定 INTEGRATION 角色。

每項任務有穩定 task-id，每次認領有唯一 claim-id；session 顯示名稱只是可變標籤，不是身分主鍵，不能單獨用來判定 owner、claim 或「這是不是同一個 session」——顯示名稱可能在執行中被環境重新產生，這不代表任務被重新認領或出現新 session。認領前先讀最新 board 確認該 task-id 沒有其他 active claim；若本次起手指令與另一個 active session 相同，暫停共享 artifact 寫入，交由協調者（COORD／控場者）去重，不要因顯示名稱不同就推定是不同執行者，也不要自行判定並繼續動手。多 session 共用同一 board 時，協調者的完整操作程序（重複認領偵測、身分重新核對、依賴/資源互斥、獨立證據驗證）見專案若有提供的 COORD 類 skill；本檔只定義任務與計畫本身的結構。

簡單計畫可直接回覆；持久共享 board 使用 [Markdown 範本](references/plan-board-template.md)。現有 board 的 locked contract 與 claim 不可靜默變更；計畫方向已獲授權時不增加例行確認。

## Node 工具

以 JSON stdin 呼叫 `node skills/start-plan/scripts/plan-board.mjs`，可用 action：resolve、hash、validate、status、update；status 同時列出可平行分波的機械候選（`wave_candidates`）與排除原因。欄位與範例見 [runtime](../../docs/runtime.md)。hash 保留 LF／CRLF 正規化及 trim，相容舊 locked contract；移除自動 commit／push、固定末項 INTEGRATION。更新需最新 expectedHash 與 claim。completed 不可重新開工；blocked claim 仍保留所有權。

一般 handover 不可覆寫 board；全部 board 目標完成後，把完整目標及證據經核對遷入 handover 的完成 checkpoint，再依 finalize 保存知識與 status。board 本身保留為計畫來源，不自動刪除。

## 任務 session 先啟動：待命登記

寫入權限：COORD 專屬寫入範圍為任務狀態、claim、progress、派工與驗收；每個任務 session 明確獲准在 COORD 尚未啟動時新增或更新 Session Registry 中自己的登記列。此登記不需 COORD 預先核准，不受「COORD 唯一 board writer／執行者不寫 board」的概括文字阻擋；不得藉此修改其他列或任務契約。既有 board 若仍使用概括文字，先依使用者已授權的登記流程將協調規則同步為上述範圍；若 locked contract 明文禁止登記則回報具體衝突。

支援先啟動任務 session、準備完成並待命，再啟動 COORD。任務 session 讀完指定任務契約後，立即在 board 的 `Session Registry` 區登記 Plan-ID、Task-ID、宿主、可供宿主定位的 session id／record-id、目前模型、`standby` 與更新時間；顯示名稱僅供輔助。session id 是工具路由識別，不可填登入 session、cookie 或 token。只能使用宿主實際提供的 id，不可猜測；取不到時填 `unavailable` 並向使用者回報定位缺口。

登記是協調 metadata，不是 claim：保留任務 ready、原 Claim-ID、依賴及 contract hash，不取得資源、不開始實作。依賴未完成仍可登記待命。回報「Task-ID／session id／已登記待命，等待 COORD 放行」。同 task 可保留多個候選 session，不能覆蓋他人紀錄。

登記區放在所有 TASK／CONTRACT／PROGRESS markers 外。這是執行者不得寫 board 的狹義例外：僅可更新自己的登記列。寫入使用當前 board 共用鎖（使用當前 `scripts/lib/files.mjs` 的 `locked(root, fn)`，勿另建不同鎖協定）、最新整檔 hash 比對與同目錄 temp＋rename；衝突時重讀合併，不盲寫。不能安全取得鎖或無寫入權限時，只回報登記內容供 COORD 補登，不宣稱已登記。現有 `update` 不提供 registry 欄位，不能假冒 `in_progress` 寫入登記，也不能用任務 summary 取代登記區。COORD 上線後由其維護登記狀態與核對時間；任務狀態／claim／progress 仍一律走 start-plan update。

COORD 啟動先讀 registry，按 session id 使用宿主可用工具定位，再核對目前 Plan-ID、Task-ID、context、模型及是否仍待命；不得要求使用者為了啟動順序重開 session。舊 id 不可直接視為存活或持有 claim，尤其 `/clear` 可重用 record-id。確認依賴與資源後才認領、派工並將登記標為 dispatched；失聯標 unavailable，重複候選先去重，不能同時放行。沒有 session 聯絡工具時，提供含 session id 的可轉貼派工訊息，不能宣稱已通知。

登記格式：

| Plan-ID | Task-ID | Host | Session-ID | Model | State | Updated |
|---|---|---|---|---|---|---|
| <plan> | <task> | <host> | <actual-id-or-unavailable> | <model-or-unknown> | standby | <timestamp> |
### Claude Code／Codex session id 取得方式

- Claude Code：本機 skill 載入時的目前 session id 為 `${CLAUDE_SESSION_ID}`。使用 Claude 已展開的實際值；若仍是原樣 placeholder（例如直接 Read SKILL.md 或不支援替換的宿主），不可登記該字串。改取目前 SessionStart hook JSON 的 `session_id`（宿主已提供時），或請使用者以 `/status` 確認目前 session id。不要假設 shell 存在同名環境變數。
- Codex：在目前頂層任務的 shell 讀取 `CODEX_THREAD_ID`；PowerShell：`[Environment]::GetEnvironmentVariable('CODEX_THREAD_ID')`，POSIX shell：`printenv CODEX_THREAD_ID`。登記 Host=codex、Session-ID=該 thread id。Codex 不執行 Claude 的 placeholder 替換，不可用上列 Claude 字串。
- Codex 的 COORD 可用可用的 `list_threads`／`read_thread(threadId)` 核對，再以 `send_message_to_thread(threadId)` 派工。無環境值時可從宿主明確提供的目前 thread id 取得；不能只憑標題或最新時間猜中清單中的一筆。巢狀 CLI／子程序的繼承環境可能指向父任務，須以其啟動結果的 thread id 為準。
- Claude 與 Codex 的 id 分屬不同宿主，配對鍵為 Host＋Session-ID；跨宿主沒有可用聯絡工具時提供轉貼訊息，不把 Claude id 傳入 Codex thread 工具。取得失敗仍依 unavailable 流程處理。

來源：Claude skills https://code.claude.com/docs/en/skills#available-string-substitutions ；Codex thread https://learn.chatgpt.com/docs/app-server 。CODEX_THREAD_ID 已在本機 Codex shell 實測取得非空值；Claude placeholder 依官方規格，尚未在獨立 Claude session 實測。