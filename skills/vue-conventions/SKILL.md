---
name: vue-conventions
description: Vue 2 / Nuxt 2 / BootstrapVue 開發慣例與視覺 bug 除錯模式（既有 Vue 專案）。TRIGGER when 使用者在 Vue 2 / Nuxt / BootstrapVue 專案開發頁面、修視覺 bug（欄位凍結、遮蓋、破版、定位）、或需要定位 Vue 頁面入口。DO NOT TRIGGER when 純測試撰寫（用 vue-testing）。
---

# Vue 2 / BootstrapVue Conventions

## 完成目標與驗收

讓指定畫面行為與版面符合需求。以實際 DOM／computed style／截圖核對位置、尺寸、CSS 優先權與互動；不固定診斷順序，也不將工具能做的取證一律交給使用者。

框架內建 CSS 交互須在實際頁面验证，手刻 mock 不證明套件樣式正確。依改動選相關 CSS、幾何或視覺斷言；不是每次都需要全量 screenshot baseline。推測與實證分開。

## Table 欄寬原則

- HTML table 同一欄天生對所有列套用一致寬度（= 該欄所有 cell 的最大寬度）；**欄寬要固定時維持 `nowrap`**，加 `white-space: normal` 反而讓瀏覽器判定可換行、欄寬不可預期地收縮。
- `width: 400px` 這種 CSS 寬度提示在 `table-layout: auto` 下不保證生效；**靜態猜測的 px 偏移值幾乎不可能一次猜對**，需要偏移時用 JS 實測（`getBoundingClientRect().width`）動態計算。

## BootstrapVue 已知陷阱

詳見 [bootstrapvue-gotchas.md](bootstrapvue-gotchas.md)：`b-table stickyColumn` 多欄凍結的三層根因與可重用修法。

## 頁面入口定位

詳見 [page-entry-lookup.md](page-entry-lookup.md)：從選單/截圖反查 Vue 頁面檔案的方法。
