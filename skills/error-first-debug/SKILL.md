---
name: error-first-debug
description: Bug 根因診斷方法論（Error-First Analysis）。TRIGGER when 使用者回報 bug、收到 Jira 問題票、HTTP 500、NPE、資料值錯誤（應繳日/保費/年度別/日期計算），或要求「分析根因」「查為什麼壞掉」。DO NOT TRIGGER when 純新功能開發或規格撰寫。
---

# Error-First Debug — Bug 根因診斷方法論

> 核心教訓：曾因跳過取證步驟、憑 ticket summary 直接讀碼推根因，導致 3 個 commit（fix / test / spec）全部基於錯誤假設而報廢。**先拿到實際錯誤證據，才開始讀程式碼。**

## HARD RULE：強制診斷順序

收到 bug report 後，依序執行，**不得跳步**：

1. **取得票務資訊與截圖**：`getIssue` 取票號、summary、附件；有截圖必先看（用 `/jira-get-attachments` skill）——推論入口 ≠ 實際入口。
2. **取得實際錯誤證據**：完整 HTTP error response（status code、error detail message、stack trace 前 10 行），或 DB 實際值 vs 期望值。來源：使用者提供、log、DevTools Network。**沒有證據前，禁止開始讀原始碼推斷根因。**
3. **對照 stack trace 定位確切呼叫鏈**，再開始閱讀原始碼。
4. 在有實證前，回答時明確區分「推測」與「已證實」；不確定就說還沒證實，不給看似自信的錯誤修正。
5. **上限切斷值 ≠ 實測耗時**：任何耗時數字若接近或等於當下設定的 timeout／上限（例如剛好落在 30s、300s 附近），一律先判定為「被自己的上限切斷」，不得直接當作耗時證據。下任何效能結論前必須先拉高上限重測一次，並在結論中同時記錄「當時上限值」與「實測值」兩個數字——只寫「耗時 300 秒」而不寫「timeout 設 300 秒」是不完整的證據。曾發生過的真實案例：CR 報表服務一度被判定「已劣化、需對外提報」，實際拉高上限重測後 132 秒即正常完成，一開始拿到的數字只是被 timeout 切斷的假象（見 `docs/ESP_PM_0002-issue-explanation.md` §9.2.1、§5.2）。
6. **效能／行為結論前先窮舉候選資料路徑**：診斷效能或行為異常時，不得只在「目前這條呼叫鏈／這段 SQL」的框架內找優化點——先列出取得同一份資料或完成同一件事的所有候選路徑（不同 schema、不同服務、不同連線方式），每條路徑各標「已實測值」或「未量測」，再判斷該改哪一段。只有一條候選路徑時，要能講出「已確認無其他取得路徑」的依據，不能只是沒想到。曾發生過的真實案例：一開始預設只能調既有 SQL，於是嘗試加索引、下 hint，實測後發現下 hint 反而慢 785 倍；後來才發現同一份資料還有另一條路徑（換一個服務直接查詢），一比較就是候選清單裡本該列出的選項（見 `docs/ESP_PM_0002-issue-explanation.md` §4.3、§17.3、§18）。

## 分流判斷

- **資料值錯誤類**（查詢結果錯、日期/金額算錯）：先分清是「**查詢過濾**」還是「**資料產生**」兩條路徑的問題——查詢層條件綁錯欄位可在本 repo 修；資料產生層問題根因常在外部服務/批次，需追到源頭再決定修哪裡。
- **例外/當機類**（500、NPE、stack trace）：見 [root-cause-patterns.md](root-cause-patterns.md) 的辨識模式。
- **效能／延遲類**（查詢慢、API 逾時、報表產製久）：先套用上方 HARD RULE 第 5、6 條——確認拿到的數字不是被上限切斷、且已窮舉候選資料路徑並各標實測值——才進入「加索引／下 hint／縮查詢範圍／改非同步／對外提報」等處置判斷。見 [root-cause-patterns.md](root-cause-patterns.md) 的「先前結論被實測推翻」一節。

## 純截圖票的入口判斷優先序

description 只有截圖時，依序判斷功能入口：

1. ticket summary 標題關鍵字（最可靠）
2. attachment diff 檔名
3. attachment docx/xlsx/pdf 檔名
4. description 中的系統代號或 Jira 參照

批量盤點可先靠 summary 分群；**實際啟動分析前必須下載截圖確認**（summary 仍可能指向錯誤頁面）。

## 常見根因模式

詳見 [root-cause-patterns.md](root-cause-patterns.md)：

- Auto-unboxing NPE 辨識與回追法
- Drools 規則 NPE 的 stack trace 特殊性
- `LocalDate.plusMonths()` 月底日期累積漂移（錨定模式）
- LocalDateTime vs LocalDate entity getter 型別確認

## 收尾

- 根因確認後才寫修正與測試；修正說明中引用實際錯誤證據（status/訊息/規則名）。
- 若功能缺少知識庫分析文件，bug fix 後至少補一份修正摘要（如 BUSINESS-RULES.md），避免下次同類 bug 找不到歷史脈絡。
