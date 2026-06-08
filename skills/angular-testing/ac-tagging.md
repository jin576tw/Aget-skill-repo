# AC Tagging

每條測試必須能追蹤回 spec 的 `AC-XX`。

## 命名規則

```typescript
// AC-01: premium 為空時顯示錯誤
it('AC-01: should show validation error when premium is empty', () => {
  ...
});
```

## 規則

- `it(...)` 名稱必須以 `AC-XX:` 開頭
- 測試前一行加入 `// AC-XX: ...` 註解，便於檢索
- 一條 AC 可對應多個測試，但每個測試都必須保留 `AC-XX`
- 若同一測試涵蓋多個 AC，需拆開，不混在同一個 `it(...)`

## 禁止事項

- 不得用沒有 `AC-XX` 的測試名稱混入同一輪 TDD
- 不得一次為所有 AC 先建立完整測試後再實作
