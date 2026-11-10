---
name: plan-coord
description: 使用者指派多 session plan board 的 COORD／場控時，協調任務認領、依賴與共用資源，以一任務一 session 或宿主支援的平行執行者分波派工，獨立核對回報並處理重複 session。單一 session 執行任務時不使用。
---

# Plan coordination

COORD 負責辨識執行者、控制共用寫入、蒐集與核對證據。遇到契約衝突或多個合理方案，讀 [plan-conflict-discussion](../plan-conflict-discussion/SKILL.md) 的升級路徑；本 skill 不另訂裁定權限。

## 身分與認領

顯示名稱可能改變，不能單憑名稱判斷是新 session。維護 task ID、claim ID、穩定身分鍵、任務摘要、輸出範圍與最近已核對動作。COORD 啟動、發現陌生 session、重複回報或意外共用檔案變更時，從環境可用的 session 清單及 board 紀錄核對。若兩者疑似持有同一 claim，先暫停重疊寫入，分別確認身分及最近可重現的動作，再選唯一繼續者；另一方交回未整合成果，不自行覆寫或釋放別人的 claim。

同一 record-id 可能在使用者 `/clear` 後承接新任務：先向該 session 或使用者確認目前 task 與 context，若沒有實際 claim 或資源衝突就視為合法認領，不要求釋放或重開。

## 放行與驗收

放行前確認依賴任務、互斥檔案／環境、AC 的原始來源及驗證責任。任務完成聲明要拆成原子主張，COORD 自行查目前版本的 commit、diff、artifact、ledger 或重跑必要測試；無法重現標 `unverified`，不寫成 passed。相同根因連續復發時要求搜尋整個可能範圍，逐項核對舊 finding 的處置，避免只補本輪位置。

board 更新前讀最新內容與 expected hash；若更新介面會取代整段摘要，合併舊有效證據後再寫。寫入失敗先確認目標與最新版本，有限重試；內容變更時重新合併，不能盲送舊 hash。共用 board 的機械更新與鎖依當前 start-plan 工具和專案契約執行，不假定固定路徑、參數或 session API。board 的狀態、claim 與 progress 變更一律走 start-plan 的 `update`（認領＝`in_progress`＋claim，完成＝`completed`＋evidence），不用文字編輯直接改；寫入後以 `validate` 讀回。`Claim-ID` 只放 claim 本身，session、attempt、模型等附註寫在 progress。

## 分波派工

宿主能在一次呼叫內啟動多個獨立執行者（例如 subagent 或 workflow）時，COORD 可以分波派工，代替逐一開關 session；不支援或不確定時維持一任務一 session。

- **入波條件**：任務為 ready、依賴均 completed、執行中不需使用者裁定、互斥資源未被其他進行中任務占用。寫入同一 working tree 的任務分在不同波，除非各自隔離。需中途裁定、預期跨多次 checkpoint 或無法單次完成的任務維持獨立 session。
- **派工**：COORD 先在 board 記 claim 與本次 attempt 識別，再交給執行者該任務契約、必要 context 與回報格式；執行期間不改該任務契約。派工內容固定寫明資源所有權：執行者只能停止自己這次 attempt 啟動且能證明的程序與服務，不確定歸屬時回報 COORD，不批次終止。
- **執行者邊界**：執行者只可寫自己的 Session Registry 登記列，不寫任務狀態／claim／progress、不釋放 claim、不自行標記完成；回傳證據包，含 task／claim／attempt ID、基準版本、改動範圍、逐條 AC 結果與證據位置、未執行的驗證、風險及需升級事項。
- **收波**：COORD 依「放行與驗收」逐項重現，並由 COORD 依序寫入 board；全波處理完才派下一波。失敗或 `unverified` 的任務退回 ready 或升級，不整波重跑。
- **停止條件**：同一次派工內修補與審查最多兩輪；同根因再現或需要裁定時停止，交回 COORD 走升級路徑。
- **模型與顧問**：依風險、耦合與不確定性選擇模型或唯讀第二意見，不寫成固定規則；實際選擇、理由與 COORD 採納結果記在該任務 progress。

## 派工配置：模型與 effort

COORD 依模型指引實際指派模型：每個任務先選定一組「模型＋建議 effort＋理由」，確認有相符模型的 session 後才記 claim 並派工（effort 不列為派工前提）；沒有相符 session 時，該任務列為待開 session 或待切換模型，告訴使用者需要什麼。選擇寫進派工內容與該任務 progress，不寫進 `Claim-ID`。

- **來源**：派工前以 UTF-8 讀 Aget 的 `rules/model-profiles.json`（可用 `node scripts/model-prompt.mjs <model-id>` 取該模型的精簡指令；PowerShell 5.1 讀檔要加 `-Encoding UTF8`），取目標模型的 tier 與 directives；不要從記憶推定，也不要複製成固定路由表。檔案找不到或沒有該模型時，說明缺口並用 tier 描述配置。
- **寫入 board**：建立 board 時，每個任務的 contract 都要填 `Model`（模型 id 或 tier 加一句理由）與 `Effort`（建議值）；status／validate 會回傳這兩個值，回報使用者時一併列出。
- **契約優先**：任務契約的 `Model`／`Effort` 欄是預設；COORD 依風險調整時，在 progress 記理由。
- **選 tier**：
  - efficient（如 Haiku）：步驟、輸入與完成標準都明確，以執行指令、蒐集輸出、整理資訊為主。
  - balanced（如 Sonnet）：範圍明確的實作、撰寫或執行測試、需要多步驗證；不需架構或安全判斷。
  - frontier（如 Opus）：安全／架構判斷、多檔因果分析、高不確定性，或最終裁定與報告。
- **選 effort（僅建議）**：effort 是給使用者的建議值，不強制、不阻擋派工；實際以使用者在執行 session 的設定為準，board progress 標註「建議 X，依使用者設定執行」。建議值照 board 任務的 effort 欄位或該任務契約；沒寫時依難度給 low／medium／high／xhigh，並遵守該模型的 directives（例如某些模型不支援 effort，就改以提示控制深度；只有 Opus 系列才考慮 xhigh 起步）。只有使用者或專案契約明確要求時才用 max。
- **派工訊息**：依目標模型的格式寫。efficient tier 用「任務目標／輸入與範圍／明確規則／步驟／完成標準／不做的事」；其他 tier 給完整目標、完成標準與限制即可。附上該模型的 directives 精簡句。
- **既有 session**：要沿用某個 session 時，先確認它目前用的模型；不相符時請使用者用 `/model` 切換或開新 session，不要假設已切換。effort 由使用者在該 session 設定，COORD 只提供建議值，不要求切換或確認，執行者以目前設定直接開工。宿主能直接啟動執行者（subagent、workflow）時，COORD 以選定模型啟動，effort 用使用者指定值，未指定才用建議值。
- **調整**：執行者因能力不足失敗、或同根因再現時，升一級 tier 重派，並把原因記在 progress。

## 退場

逐一核對終態、active／orphan claim、共用輸出與目前版本的驗證證據。保留尚存風險、未重跑項目與身分異動紀錄；需要跨 session 接續或結案時依 handover／finalize 契約處理。不能以執行者或 reviewer 的文字結論單獨標記完成。

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