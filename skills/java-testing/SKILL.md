---
name: java-testing
description: Java 後端測試規範（JUnit 5 + Mockito + AssertJ + MockMvc）。TRIGGER when 使用者需要 Spring Boot 後端 unit test 或 API integration test、java-unit-test-writer 支援。提供 Step 3 紅燈測試規則，不處理 Playwright。
---

# Java Testing

本 skill 提供 md 工作流 Step 3 與 Step 7 的測試規則，供 `java-unit-test-writer` 使用。

使用以下文件：

- [unit-patterns.md](unit-patterns.md) — Service / Domain / Controller slice unit test 模式（Mockito）
- [mockmvc-patterns.md](mockmvc-patterns.md) — API integration test 模式（`@WebMvcTest` / `@SpringBootTest` + MockMvc）
- [ac-tagging.md](ac-tagging.md) — `AC-XX` 命名與追蹤規則（Java `@DisplayName` 版）

## 用途

- 依 spec 的 `AC-XX` 產生紅燈 unit / integration tests（Java）
- 明確區分哪類邏輯用 Mockito slice，哪類驗證需 MockMvc 全棧
- 讓測試失敗原因來自尚未實作或結果不符預期，不造假紅燈

## Guardrails

- 預設使用 JUnit 5（`@ExtendWith(MockitoExtension.class)`）+ AssertJ
- API integration test 使用 `@SpringBootTest(webEnvironment = MOCK)` + `MockMvc` 或 `@WebMvcTest`
- 一次只處理一條 AC
- 不得產生空方法或 `Assertions.fail()` 假紅燈
- 測試需驗證行為結果，不得過度綁定私有實作細節
