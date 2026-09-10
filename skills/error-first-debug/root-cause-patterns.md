# 常見根因辨識模式

## Auto-unboxing NPE

**辨識**：stack trace 出現 `Integer.intValue()`、`Long.longValue()`、`Double.doubleValue()` 時，必定是某個包裝型別（Integer/Long/Double）欄位為 `null` 被自動拆箱。

**回追法**：優先找該欄位的 setter 呼叫鏈——`prepareXxxCmd()` → `toXxxCmd()` → DTO 來源，逐層確認哪一層未賦值。

**已知案例模式**：欄位賦值三行必須連續（`setInsuranceAge → toXxxCmd → setAge`），被其他設定程式碼分隔後，規則引擎觸發時取到 null。Rebase 解衝突時若 ours/theirs 各有一行對同名欄位的 `setXxx()`，先判斷是否針對**不同物件**——是則兩行都保留，順序以業務邏輯連續性為優先，不以行數為優先。

## Drools 規則 NPE 特殊性

Drools 在 rule fire 時的 NPE stack trace **通常不含業務方法名**（只有 rule file/line）。診斷流程：

1. 先找到 rule 文字（如 `getAge().intValue()`）
2. 回推 Java 呼叫端的 `prepareXxxCmd()` / cmd 組裝處
3. 確認欄位賦值時機是否在 rule fire 之前

## `LocalDate.plusMonths()` 月底日期累積漂移

**症狀**：生效日為月底（如 1/31）時，迴圈中 `currentDate.plusMonths(1)` 從 Jan 31 → Feb 28 → **Mar 28**（錯，應為 Mar 31）。每次 plusMonths 以「上次結果」為基礎，月底的日數被逐輪帶偏。

**錨定模式（正確寫法）**：

```java
YearMonth ym = YearMonth.from(current).plusMonths(n);
LocalDate next = ym.atDay(Math.min(originalDay, ym.lengthOfMonth()));
```

day 永遠錨定**原始日**（originalPayDate.getDayOfMonth()），只有月份前進。適用所有涉及月份加減的應繳日/保費計算場景。若專案已封裝共用轉換工具（如 `nextPayDateConverter` / `prevPayDateConverter`），優先重用，不重造。

## LocalDateTime vs LocalDate 轉換

不同 entity 的日期 getter 回傳型別不一致：有的回傳 `LocalDateTime`（需 `.toLocalDate()` 再傳入工具方法），有的直接回傳 `LocalDate`（不需轉換）。混淆會造成編譯錯誤。

**Check pattern**：修改前先搜尋 entity class 中 `getEff*()` / `get*Date()` 方法的回傳型別宣告，或看 `@Column` / JPA 映射，逐 class 確認。

## 框架 CSS 交互造成的視覺 bug

前端視覺 bug 若涉及框架/套件底層 CSS（sticky、z-index、`!important` 蓋寫），手刻 mock 驗證會給**假陽性**——必須對真實跑起來的頁面驗證。診斷方式見 `vue-conventions` skill。

## 先前結論被實測推翻（效能／行為類特有模式）

**辨識**：同一個排查過程中，「先下一個看起來確定的結論、後來被進一步實測正面證偽」不是單一意外，而是一種會重複發生的模式——根因通常是上面 HARD RULE 第 5、6 條講的兩件事：把上限切斷值當耗時、只在既有框架內找優化點。

**已知案例（`docs/ESP_PM_0002-issue-explanation.md` §14「推翻表」）**：

| 先下的結論 | 後來的實測結果 | 對應的 HARD RULE |
|---|---|---|
| 索引缺失，需補索引 | 索引早已存在 | 第 5 條——沒先查證就下結論 |
| 下 `PRINT_TIME` 索引 hint 可加速 | 用 `EXPLAIN PLAN` 查證後慢 785 倍 | 第 6 條——沒窮舉候選路徑就直接動手調 |
| CR 報表服務已劣化，需對外提報 | 拉高上限重測，132 秒正常完成 | 第 5 條——把 timeout 切斷值當耗時 |
| 一年查詢範圍需縮短或改非同步 | 同步執行 275.984 秒即可完成 | 第 5 條——同上 |
| 迄日邊界是新系統缺陷 | 新舊系統行為一致、規格本身沉默 | 第 6 條——沒先比對候選（新舊系統）就下結論 |

**與 plan-board 決策 #12 同一類根因**：憑「workspace 內找不到 seed script」就推論資料缺失，沒有先用已有的真實環境查詢手段驗證——同樣是「沒有可查證的真實環境證據就下結論」。

**處置**：遇到效能／行為類異常，看到一個「看起來合理」的結論時，先問自己兩句：這個數字有沒有可能是被我自己設的上限切斷的？我是不是只想到了一條路徑就下手改，還有沒有其他候選路徑沒列出來、沒實測？沒有把這兩句的答案寫下來之前，不要把結論說出口。
