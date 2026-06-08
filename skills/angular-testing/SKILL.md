---
name: angular-testing
description: Angular Unit / Component 測試規範。TRIGGER when 使用者需要 Jasmine、TestBed、ComponentFixture、fakeAsync、AC-XX 測試命名、unit-test-writer 支援。提供 Step 3 紅燈測試規則，不處理 Playwright。
---

# Angular Testing

本 skill 提供 md 工作流 Step 3 的測試規則，供 `unit-test-writer` 使用。

使用以下文件：

- [unit-patterns.md](unit-patterns.md) — Service / Domain unit test 模式
- [component-patterns.md](component-patterns.md) — Component test 模式
- [ac-tagging.md](ac-tagging.md) — `AC-XX` 命名與追蹤規則

## 用途

- 依 spec 的 `AC-XX` 產生紅燈 unit / component tests
- 明確區分哪類邏輯應放在 Service / Domain，哪類驗證屬於 Component Test
- 讓測試失敗原因來自尚未實作或結果不符預期，而不是人造假紅燈

## Guardrails

- 預設使用 Jasmine + TestBed
- 一次只處理一條 AC
- 不得產生 `fail('Not implemented')` 這類假紅燈
- 測試需驗證行為結果，不得過度綁定私有實作細節
