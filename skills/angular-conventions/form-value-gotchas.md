# 表單值型別與驗證陷阱

## `<select><option [value]>` 一律字串化（SelectControlValueAccessor）

`[value]` 底層讀 DOM `element.value`，DOM 只存字串，所有非字串值被 `.toString()`：`null` → `"null"`、`undefined` → `"undefined"`、`true` → `"true"`、`50` → `"50"`。後果：送出值型別與 API/model 不符，檢核失敗或 null 無法清空。

**口訣：只要是 `<select><option>`，非字串一律改 `[ngValue]`**——它繞過 DOM `.value`，以內部 Map 追蹤選項，完整保留 JS 型別（null/boolean/number/object）。

| 元素 | ValueAccessor | `.toString()` 風險 | 處理 |
|---|---|---|---|
| `<select><option [value]>` | SelectControlValueAccessor | **有** | 改 `[ngValue]` |
| `<select><option [ngValue]>` | SelectControlValueAccessor | 無 | 原生保留型別 |
| `<input type="radio" [value]>` | RadioControlValueAccessor | 無（內部追蹤） | 安全 |
| `<input type="number">` | NumberValueAccessor | 無（parseFloat） | 安全 |

其他要避免的組合：`[(ngModel)]` + `[value]` 雙重綁定衝突、`[value]` + `[formControl]` 競態。

## 空字串是合法業務值時，禁用 falsy 驗證

後端以 `""` 代表「未回覆/未選」這類**合法選項**時，`!value` 會把它誤攔成「未填」。**規則：真正未填只有 `null`/`undefined`，驗證用 `value == null`**，讓空字串通過。

## 非 ISO 日期字串 + `new Date()` 靜默失敗

自組日期字串若不補零（`"2026-6-2"`），`new Date(str)` 回 Invalid Date（V8 只認 ISO 8601 `YYYY-MM-DD`），依賴它的邏輯靜默輸出空字串/NaN。**陷阱**：`moment("2026-6-2")` 是合法的——所以走 moment 的路徑正常、走 `new Date()` 的壞掉，容易漏診。解法優先序：string split 手動解析 > 來源元件補零輸出（需評估所有消費者）。

## ng-bootstrap / Angular 升版

- **Angular 必須逐 major 升級**，不可跳版（17→18→19 分兩步 `ng update`）。
- 版本對應：ng-bootstrap@16=NG17、17=NG18、18=NG19、20=NG21；peer dep 衝突先 `--force`/`--legacy-peer-deps`，升完消除。
- **ng-bootstrap@18 datepicker navigation 消失**：v18 模板加了 i18n 標記需要 `$localize` runtime；`angular.json` polyfills 補 `"@angular/localize/init"` 即解。**教訓：升版後 UI 異常永遠先看 Console**（此案 `ReferenceError: $localize is not defined` 一眼可解，猜 CSS 猜了好幾個 session）。
- ng-bootstrap@18 breaking：`NgbDatepickerI18n.getWeekdayLabel()` 的 `width` 參數改為字串字面量型別，移除 `TranslationWidth` import。
