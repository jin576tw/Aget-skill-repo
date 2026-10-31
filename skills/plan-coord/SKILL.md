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
- **執行者邊界**：執行者不寫 board、不釋放 claim、不自行標記完成；回傳證據包，含 task／claim／attempt ID、基準版本、改動範圍、逐條 AC 結果與證據位置、未執行的驗證、風險及需升級事項。
- **收波**：COORD 依「放行與驗收」逐項重現，並由 COORD 依序寫入 board；全波處理完才派下一波。失敗或 `unverified` 的任務退回 ready 或升級，不整波重跑。
- **停止條件**：同一次派工內修補與審查最多兩輪；同根因再現或需要裁定時停止，交回 COORD 走升級路徑。
- **模型與顧問**：依風險、耦合與不確定性選擇模型或唯讀第二意見，不寫成固定規則；實際選擇、理由與 COORD 採納結果記在該任務 progress。

## 派工配置：模型與 effort

COORD 依模型指引實際指派模型：每個任務先選定一組「模型＋建議 effort＋理由」，確認有相符模型的 session 後才記 claim 並派工（effort 不列為派工前提）；沒有相符 session 時，該任務列為待開 session 或待切換模型，告訴使用者需要什麼。選擇寫進派工內容與該任務 progress，不寫進 `Claim-ID`。

- **來源**：派工前以 UTF-8 讀 Aget 的 `rules/model-profiles.json`（可用 `node scripts/model-prompt.mjs <model-id>` 取該模型的精簡指令；PowerShell 5.1 讀檔要加 `-Encoding UTF8`），取目標模型的 tier 與 directives；不要從記憶推定，也不要複製成固定路由表。檔案找不到或沒有該模型時，說明缺口並用 tier 描述配置。
- **契約優先**：任務契約的 Model 欄是預設；COORD 依風險調整時，在 progress 記理由。
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
