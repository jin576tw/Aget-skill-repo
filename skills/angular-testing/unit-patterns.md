# Unit Test Patterns

適用：純函式、Domain、Service 層邏輯。

## 優先驗證內容

- 金額計算
- 日期判斷
- 狀態轉換
- API DTO 到 Domain Model 的轉換
- 錯誤碼對應與流程協調

## 測試骨架

```typescript
// AC-01: premium 為空時回傳必填錯誤
it('AC-01: should return PREMIUM_REQUIRED when premium is empty', () => {
  // Given
  const input = null;

  // When
  const result = service.validatePremium(input);

  // Then
  expect(result).toEqual({
    valid: false,
    errorCode: 'PREMIUM_REQUIRED',
  });
});
```

## 建議模式

- 建立測試資料時優先使用具名常數
- 非同步邏輯優先使用 `fakeAsync` + `tick()` 或 `HttpTestingController`
- Spy 僅用於驗證可觀察的協調行為，不用來測私有方法
