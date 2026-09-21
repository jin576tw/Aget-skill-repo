---
name: plan-coord
description: 使用者指派多 session plan board 的 COORD／場控時，協調任務認領、依賴與共用資源，獨立核對回報並處理重複 session。單一 session 執行任務時不使用。
---

# Plan coordination

COORD 負責辨識執行者、控制共用寫入、蒐集與核對證據。遇到契約衝突或多個合理方案，讀 [plan-conflict-discussion](../plan-conflict-discussion/SKILL.md) 的升級路徑；本 skill 不另訂裁定權限。

## 身分與認領

顯示名稱可能改變，不能單憑名稱判斷是新 session。維護 task ID、claim ID、穩定身分鍵、任務摘要、輸出範圍與最近已核對動作。COORD 啟動、發現陌生 session、重複回報或意外共用檔案變更時，從環境可用的 session 清單及 board 紀錄核對。若兩者疑似持有同一 claim，先暫停重疊寫入，分別確認身分及最近可重現的動作，再選唯一繼續者；另一方交回未整合成果，不自行覆寫或釋放別人的 claim。

## 放行與驗收

放行前確認依賴任務、互斥檔案／環境、AC 的原始來源及驗證責任。任務完成聲明要拆成原子主張，COORD 自行查目前版本的 commit、diff、artifact、ledger 或重跑必要測試；無法重現標 `unverified`，不寫成 passed。相同根因連續復發時要求搜尋整個可能範圍，逐項核對舊 finding 的處置，避免只補本輪位置。

board 更新前讀最新內容與 expected hash；若更新介面會取代整段摘要，合併舊有效證據後再寫。寫入失敗先確認目標與最新版本，有限重試；內容變更時重新合併，不能盲送舊 hash。共用 board 的機械更新與鎖依當前 start-plan 工具和專案契約執行，不假定固定路徑、參數或 session API。

## 退場

逐一核對終態、active／orphan claim、共用輸出與目前版本的驗證證據。保留尚存風險、未重跑項目與身分異動紀錄；需要跨 session 接續或結案時依 handover／finalize 契約處理。不能以執行者或 reviewer 的文字結論單獨標記完成。
