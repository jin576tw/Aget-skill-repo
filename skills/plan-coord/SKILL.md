---
name: plan-coord
description: 使用者指派多 session plan board 的 COORD／場控時，協調任務認領、依賴與共用資源，以一任務一 session 或宿主支援的平行執行者分波派工，獨立核對回報並處理重複 session。單一 session 執行任務時不使用。
---

# Plan coordination

COORD 負責辨識執行者、控制共用寫入、蒐集與核對證據。遇到契約衝突或多個合理方案，讀 [plan-conflict-discussion](../plan-conflict-discussion/SKILL.md) 的升級路徑；本 skill 不另訂裁定權限。

## 身分與認領

顯示名稱可能改變，不能單憑名稱判斷是新 session。維護 task ID、claim ID、穩定身分鍵、任務摘要、輸出範圍與最近已核對動作。COORD 啟動、發現陌生 session、重複回報或意外共用檔案變更時，從環境可用的 session 清單及 board 紀錄核對。若兩者疑似持有同一 claim，先暫停重疊寫入，分別確認身分及最近可重現的動作，再選唯一繼續者；另一方交回未整合成果，不自行覆寫或釋放別人的 claim。

## 放行與驗收

放行前確認依賴任務、互斥檔案／環境、AC 的原始來源及驗證責任。任務完成聲明要拆成原子主張，COORD 自行查目前版本的 commit、diff、artifact、ledger 或重跑必要測試；無法重現標 `unverified`，不寫成 passed。相同根因連續復發時要求搜尋整個可能範圍，逐項核對舊 finding 的處置，避免只補本輪位置。

board 更新前讀最新內容與 expected hash；若更新介面會取代整段摘要，合併舊有效證據後再寫。寫入失敗先確認目標與最新版本，有限重試；內容變更時重新合併，不能盲送舊 hash。共用 board 的機械更新與鎖依當前 start-plan 工具和專案契約執行，不假定固定路徑、參數或 session API。

## 分波派工

宿主能在一次呼叫內啟動多個獨立執行者（例如 subagent 或 workflow）時，COORD 可以分波派工，代替逐一開關 session；不支援或不確定時維持一任務一 session。

- **入波條件**：任務為 ready、依賴均 completed、執行中不需使用者裁定、互斥資源未被其他進行中任務占用。寫入同一 working tree 的任務分在不同波，除非各自隔離。需中途裁定、預期跨多次 checkpoint 或無法單次完成的任務維持獨立 session。
- **派工**：COORD 先在 board 記 claim 與本次 attempt 識別，再交給執行者該任務契約、必要 context 與回報格式；執行期間不改該任務契約。
- **執行者邊界**：執行者不寫 board、不釋放 claim、不自行標記完成；回傳證據包，含 task／claim／attempt ID、基準版本、改動範圍、逐條 AC 結果與證據位置、未執行的驗證、風險及需升級事項。
- **收波**：COORD 依「放行與驗收」逐項重現，並由 COORD 依序寫入 board；全波處理完才派下一波。失敗或 `unverified` 的任務退回 ready 或升級，不整波重跑。
- **停止條件**：同一次派工內修補與審查最多兩輪；同根因再現或需要裁定時停止，交回 COORD 走升級路徑。
- **模型與顧問**：依風險、耦合與不確定性選擇模型或唯讀第二意見，不寫成固定規則；實際選擇、理由與 COORD 採納結果記在該任務 progress。

## 退場

逐一核對終態、active／orphan claim、共用輸出與目前版本的驗證證據。保留尚存風險、未重跑項目與身分異動紀錄；需要跨 session 接續或結案時依 handover／finalize 契約處理。不能以執行者或 reviewer 的文字結論單獨標記完成。
