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
- **停止條件**：同一次派工內修補與審查不超過 Budget 的 maxRepairRounds（未另訂時建議兩輪）；同根因再現或需要裁定時停止，交回 COORD 走升級路徑。
- **模型與顧問**：依風險、耦合與不確定性選擇模型或唯讀第二意見，不寫成固定規則；實際選擇、理由與 COORD 採納結果記在該任務 progress。

## 派工配置：模型與 effort

COORD 依模型指引實際指派模型：每個任務先選定一組「模型＋建議 effort＋理由」，確認有相符模型的 session 後才記 claim 並派工（effort 不列為派工前提）；沒有相符 session 時，該任務列為待開 session 或待切換模型，告訴使用者需要什麼。選擇寫進派工內容與該任務 progress，不寫進 `Claim-ID`。

- **來源**：派工前以 UTF-8 讀 Aget 的 `rules/model-profiles.json`（可用 `node scripts/model-prompt.mjs <model-id>` 取該模型的精簡指令；PowerShell 5.1 讀檔要加 `-Encoding UTF8`），取目標模型的 tier 與 directives；不要從記憶推定，也不要複製成固定路由表。檔案找不到或沒有該模型時，說明缺口並用 tier 描述配置。
- **寫入 board**：建立 board 時，每個任務的 contract 都要填 `Model`（模型 id 或 tier 加一句理由）與 `Effort`（建議值）；status／validate 會回傳這兩個值，回報使用者時一併列出。
- **契約優先**：任務契約的 `Model`／`Effort` 欄是預設；COORD 依風險調整時，在 progress 記理由。
- **模型與 effort**：選擇、派工格式與升級依 [模型派工](../start-work/references/model-dispatch.md)。既有 session 先核對模型是否符合派工配置，effort 沿用實際設定。配置調整涉及更換預算時，依測試批次授權，以 `budgetReason` 保存理由。

## 退場

逐一核對終態、active／orphan claim、共用輸出與目前版本的驗證證據。保留尚存風險、未重跑項目與身分異動紀錄；需要跨 session 接續或結案時依 handover／finalize 契約處理。不能以執行者或 reviewer 的文字結論單獨標記完成。

## 任務 session 先啟動：待命登記

COORD 維護任務狀態、claim、progress、派工與驗收。COORD 啟動前，任務 Session 讀完契約可透過 `register-session` 自登或更新自己的 `standby` 列。即使依賴尚未完成，也可以登記待命；登記不取得 claim。COORD 核對 Plan-ID、Task-ID、context、依賴與資源後放行，將登記改為 `dispatched`。直接派出的子代理取得宿主回傳後也要登記。失聯標 `unavailable`，缺少聯絡工具時提供可轉貼的派工訊息。

合併表以 TASK 列顯示名稱與建議配置，Session 列顯示名稱、宿主、Session ID、model、effort、來源、狀態、登記 ID 與時間。Session ID 使用宿主提供的路由識別；待命時取不到填 `unavailable` 並告知使用者。歷史缺證填 `unknown`。配置來源用 `host-report`、`launch-args`、`dispatch-history` 或 `unknown`，保留宿主原始 effort，確認不支援才填 `n/a`。

兩宿主共用 [JSON 登記介面](../../docs/runtime.md)。更新前取 `status` 的 hash，衝突時重讀。執行者只可操作自己的列，COORD 可設定 TASK 顯示名稱及補登歷史。核對 `/clear` 重用後將舊列標 `released`，再建新列。任務狀態、進度及 claim 仍走 `update`。

### Claude Code／Codex session id 取得方式

- Claude Code：本機 skill 載入時的目前 session id 為 `${CLAUDE_SESSION_ID}`。使用 Claude 已展開的實際值；若仍是原樣 placeholder（例如直接 Read SKILL.md 或不支援替換的宿主），不可登記該字串。改取目前 SessionStart hook JSON 的 `session_id`（宿主已提供時），或請使用者以 `/status` 確認目前 session id。不要假設 shell 存在同名環境變數。
- Claude Code COORD 聯絡：`SendMessage` 只認 `ListAgents` 列出的名稱（`name [ref]`），不認 session UUID；`/clear` 也會換新 UUID。登記時除 Session-ID 外，於 Name 欄附註 ListAgents 名稱（例 `claude-code (docs-14)`）；COORD 以名稱傳訊，對不上時向候選 session 發身分確認並以回覆核對，不憑名稱猜測。
- Codex：在目前頂層任務的 shell 讀取 `CODEX_THREAD_ID`；PowerShell：`[Environment]::GetEnvironmentVariable('CODEX_THREAD_ID')`，POSIX shell：`printenv CODEX_THREAD_ID`。登記 Host=codex、Session-ID=該 thread id。Codex 不執行 Claude 的 placeholder 替換，不可用上列 Claude 字串。
- Codex 的 COORD 可用可用的 `list_threads`／`read_thread(threadId)` 核對，再以 `send_message_to_thread(threadId)` 派工。無環境值時可從宿主明確提供的目前 thread id 取得；不能只憑標題或最新時間猜中清單中的一筆。巢狀 CLI／子程序的繼承環境可能指向父任務，須以其啟動結果的 thread id 為準。
- Claude 與 Codex 的 id 分屬不同宿主，配對鍵為 Host＋Session-ID；跨宿主沒有可用聯絡工具時提供轉貼訊息，不把 Claude id 傳入 Codex thread 工具。取得失敗仍依 unavailable 流程處理。

來源：Claude skills https://code.claude.com/docs/en/skills#available-string-substitutions ；Codex thread https://learn.chatgpt.com/docs/app-server 。CODEX_THREAD_ID 已在本機 Codex shell 實測取得非空值；Claude placeholder 依官方規格，尚未在獨立 Claude session 實測。
## 共用預算與一致驗收

派工前依 [模型派工](../start-work/references/model-dispatch.md) 記錄任務 scale 與配置。所有 Task 不論 session 或 subagent 均依 [測試預算與驗收](../verify/references/test-budget.md) 定義並核對標準；不得以不同執行形式省略驗收。全部 Task completed 後，COORD 核對計畫完成條件與豁免，再以 start-plan complete 明確完成計畫，不以收波自動結案。

## 派工前預算與現場確認

先確認任務契約與預算，再用 start-plan update 保存並 validate，最後才啟動執行者。預算以 progress 的 Budget 為準；handover 需要時引用該 board／task，不維護第二份互相漂移的數字。派工 prompt 帶相同模型、建議 effort、時間及修補上限、驗證方法與授權依據。欄位見 [runtime](../../docs/runtime.md#dispatch-budget)。

- 放行前確認本機驗證工具、必要掃描服務連線／授權及負責人；不可用時記替代證據或 unverified，需豁免時取得明確授權，不自動以其他檢查宣稱掃描通過。
- 派工約定中途回報點（預設時間一半），可觀測用量或時間達 80% 時回報；到上限交回成果、未完成項與剩餘估時，不自行續跑或升級模型。blocked 恢復沿用原預算、起算時間及已用修補輪數；續行授權須留下來源與修改理由。board 的時間提示不是宿主停止機制，輪數及用量仍由 COORD 核對。
- attempt 識別及已用輪數記 progress summary／證據包，claim 只表示所有權；重新派工不能靠改 claim 規避預算。執行者記錄自己啟動程序的識別及啟動證據，退場先清理；停止前核對所有權，無法確認交 COORD 處理。
- 交付明列「需使用者決定／核准」的項目、用途與待決事項，以及「參考資料」的用途與驗證狀態；沒有待決事項就明寫無。
