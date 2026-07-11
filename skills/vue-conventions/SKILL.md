---
name: vue-conventions
description: Vue 2 / Nuxt 2 / BootstrapVue 開發慣例與視覺 bug 除錯模式（adp-gi-ui 等）。TRIGGER when 使用者在 Vue 2 / Nuxt / BootstrapVue 專案開發頁面、修視覺 bug（欄位凍結、遮蓋、破版、定位）、或需要定位 Vue 頁面入口。DO NOT TRIGGER when 純測試撰寫（用 vue-testing）。
---

# Vue 2 / BootstrapVue Conventions

## 視覺 bug 除錯原則（依序執行）

1. **先拿結構化 DOM 數據，再推理**：與其反覆看截圖臆測像素位置，直接請使用者在 DevTools console 貼一段診斷腳本（遍歷相關 cell，dump `getBoundingClientRect()` + `getComputedStyle()` 的 `position`/`left`/`width`/`x`），一次執行就能鎖定光看畫面看不出來的根因。
2. **驗證 `position` 實際生效值**：套用任何 `left`/`position` 修正前，先用 `getComputedStyle(el).position` 確認元素真的是預期的 `sticky`/`relative`——不要只看 class 名稱或自己寫的 CSS 規則存在與否；`!important` 或更高優先權規則可能已在背後蓋掉。
3. **框架內建 CSS 行為的 bug，手刻 mock 驗證不可靠**：mock 幾乎不可能重現套件內部 CSS 交互（如工具 class 的 `!important` 蓋寫），會給假陽性 PASS。必須對真實 dev server 頁面驗證；mock 只適合驗證我方自訂邏輯。
4. **CSS layout 屬性變更必跑 E2E**（`overflow`/`max-height`/`height`/`display`/`flex`/`grid`）：雙層驗證——`toHaveCSS()` 確認屬性值 + `toHaveScreenshot()` 確認整體無破版。「無互動行為」不是豁免理由。
5. 在有實證前，誠實區分「推測」與「已證實」，不要連續給看似自信的錯誤修正。

## Table 欄寬原則

- HTML table 同一欄天生對所有列套用一致寬度（= 該欄所有 cell 的最大寬度）；**欄寬要固定時維持 `nowrap`**，加 `white-space: normal` 反而讓瀏覽器判定可換行、欄寬不可預期地收縮。
- `width: 400px` 這種 CSS 寬度提示在 `table-layout: auto` 下不保證生效；**靜態猜測的 px 偏移值幾乎不可能一次猜對**，需要偏移時用 JS 實測（`getBoundingClientRect().width`）動態計算。

## BootstrapVue 已知陷阱

詳見 [bootstrapvue-gotchas.md](bootstrapvue-gotchas.md)：`b-table stickyColumn` 多欄凍結的三層根因與可重用修法。

## 頁面入口定位

詳見 [page-entry-lookup.md](page-entry-lookup.md)：從選單/截圖反查 Vue 頁面檔案的方法。
