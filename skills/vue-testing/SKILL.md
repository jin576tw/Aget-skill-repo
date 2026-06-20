---
name: vue-testing
description: Vue 2 / Nuxt 2 前端測試規範（Jest + @vue/test-utils v1）。TRIGGER when 使用者需要 Vue 元件或 composable 的 unit / component test、vue-unit-test-writer 支援。提供 Step 3 紅燈測試規則，不處理 Playwright。
---

# Vue Testing

本 skill 提供 md 工作流 Step 3 的測試規則，供 `vue-unit-test-writer` 使用。

使用以下文件：

- [unit-patterns.md](unit-patterns.md) — Service / composable / utility 純邏輯 unit test（Jest）
- [component-patterns.md](component-patterns.md) — Vue Component test（shallowMount / mount + Vue Test Utils v1）
- [ac-tagging.md](ac-tagging.md) — `AC-XX` 命名與追蹤規則

## 用途

- 依 spec 的 `AC-XX` 產生紅燈 unit / component tests（Vue 2 / Nuxt 2）
- 明確區分哪類邏輯用 pure function test，哪類驗證需掛載 Component
- 讓測試失敗原因來自尚未實作，不製造假紅燈

## Guardrails

- 預設使用 **Jest** + **`@vue/test-utils` v1**（Nuxt 2 / Vue 2 生態）
- 一次只處理一條 AC
- 不得產生空測試體或 `expect(true).toBe(true)` 假紅燈
- 測試需驗證行為結果，不得過度綁定 component 內部實作細節
