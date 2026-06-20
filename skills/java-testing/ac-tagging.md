# AC Tagging（Java）

每條測試必須能追蹤回 spec 的 `AC-XX`。

## 命名規則

```java
// AC-01: messageEvents 未設值時不拋 NPE
@Test
@DisplayName("AC-01: should not throw NullPointerException when messageEvents is not set")
void ac01_replaceUw_shouldNotThrowNPE_whenMessageEventsIsNotSet() {
    ...
}
```

## 規則

- `@DisplayName` 必須以 `AC-XX:` 或 `IT-XX:` 開頭
- 方法名使用 `ac{NN}_{method}_{condition}` 格式（camelCase）
- 測試前一行加入 `// AC-XX: ...` 單行註解，便於 grep 追蹤
- 一條 AC 可對應多個 `@Test`，但每個都必須保留 `AC-XX`
- 若同一測試涵蓋多個 AC，拆開，不混在同一個 `@Test`

## API Integration Test 命名

```java
// IT-01: 缺少 messageEvents 欄位 → HTTP 200
@Test
@DisplayName("IT-01: should return 200 when messageEvents is absent from request body")
void it01_replaceUw_shouldReturn200_whenMessageEventsAbsent() throws Exception {
    ...
}
```

## 禁止事項

- 不得使用無 `AC-XX` / `IT-XX` 前綴的測試名稱混入同一輪 TDD
- 不得一次為所有 AC 先建立完整測試後再實作（horizontal slicing 禁止）
- 不得用 `Assertions.fail("Not yet implemented")` 製造假紅燈
