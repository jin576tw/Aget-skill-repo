# BootstrapVue 已知陷阱

## `b-table stickyColumn` 多欄凍結（bootstrap-vue@2.23.1）

### 三層根因（缺一不可，第 3 層最容易漏）

1. **`left:0` 打平手**：`dist/bootstrap-vue.css` 對所有 `.b-table-sticky-column` 一律套 `left:0`，沒有依欄位順序自動疊加偏移的邏輯（官方 README「Sticky column notes」承認此限制）。多個 stickyColumn 會疊在同一畫面位置。
2. **同列群組 z-index 相同**：thead 內 sticky 欄一律 `z-index:5`、tbody/tfoot 一律 `z-index:2`。z-index 打平手時由 **DOM 順序決定疊放：較後面的欄位蓋住較前面的**——這是判斷「誰蓋住誰」方向的關鍵。
3. **表頭的 sticky 從未真正生效**：BootstrapVue 對 thead 可排序欄位（有 `sortLabel` 時）加上 Bootstrap 工具 class `.position-relative`，其定義是 `position: relative !important;`——直接蓋掉 `.b-table-sticky-column` 需要的 `position: sticky`。結果 **thead 凍結欄從頭到尾不是真 sticky，只有 tbody 是**。用 `getComputedStyle(cell).position` 對照可直接證實：tbody 顯示 `sticky`、thead 顯示 `relative`。

### 可重用修法 pattern（頁面層級，不動共用元件/套件/全域 scss）

1. `fields` 陣列：需固定寬度的 sticky 欄位加 `thClass`/`tdClass`（引用既有寬度 class）。
2. `<style scoped>`：
   - **關鍵**：`.my-table >>> .table.b-table > thead > tr > .b-table-sticky-column { position: sticky !important; }`——用同優先權覆寫回 BootstrapVue 自己蓋掉的 `position:relative`。
   - z-index 防禦層：互動元素（按鈕）所在的 sticky 欄 z-index 明確高於後面的純顯示欄，即使 left 有微幅誤差也不會蓋住可點擊元件。
3. `mounted()` 用 `MutationObserver`（資料列增減）+ `ResizeObserver`（尺寸變化）動態量測每個 `.b-table-sticky-column[aria-colindex="N"]` 的實際寬度，累加計算後以 inline style 設定 `left`——inline style 優先權天然高於 class CSS，且隨資料/按鈕數量自動重算，不會「換個按鈕組合就壞掉」。

### 失敗路徑備忘（不要重蹈）

- ❌ 加 `white-space: normal` 讓按鈕換行 → 按鈕直向堆疊、欄寬崩壞收縮。
- ❌ 憑空估算靜態 `left: 450px` → 實測寬度差距大、欄位飄移。
- ❌ JS 動態算 left 但沒先確認 thead 的 `position` 是否真為 sticky → `left` 套在 `position:relative` 元素上語意完全不同（相對自身原位偏移 vs 相對捲動容器錨定），對不齊。
