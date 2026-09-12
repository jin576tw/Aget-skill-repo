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

## 效能結論被實測推翻

常見失誤是把 timeout 截尾當作完整耗時，或假設既有 SQL 是唯一可用路徑。診斷證據要求見 [SKILL.md](SKILL.md)。

| 假設 | 可核對的證據 |
|---|---|
| 缺索引造成緩慢 | 實際索引定義、執行計畫與量測；索引存在不保證使用 |
| hint 能改善速度 | 相同條件下的執行結果，而非只看語句形式 |
| 服務劣化 | timeout、完成狀態、完整耗時及可比基準 |
| 只能縮短查詢或改非同步 | 合理替代路徑的已量測結果與未量測限制 |
| 新系統邊界行為錯誤 | 已核准需求、新舊行為差異，避免把規格未定義當缺陷 |

來源：上游 f23efe4 的診斷教訓；本通用資源保留判斷方法，不依賴未隨工具提供的業務案例文件。
