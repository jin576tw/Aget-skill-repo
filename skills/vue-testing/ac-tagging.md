# AC Tagging（Vue 2 / Nuxt 2）

每條測試必須能追蹤回 spec 的 `AC-XX`。

## 命名規則

```js
// AC-01: 輸入為空時顯示必填錯誤
it('AC-01: should show required error when input is empty', () => {
  ...
});
```

## 規則

- `it(...)` 名稱必須以 `AC-XX:` 開頭
- 測試前一行加入 `// AC-XX: ...` 單行 comment，便於 grep 追蹤
- 一條 AC 可對應多個 `it(...)`，但每個都必須保留 `AC-XX`
- 若同一測試涵蓋多個 AC，拆開，不混在同一個 `it(...)`

## describe 結構建議

```js
describe('AC-XX: [AC 描述]', () => {
  // Given: [前置條件說明]
  it('AC-XX: should [happy path Then]', ...);        // 必填
  it('AC-XX: should [boundary/null Then]', ...);     // 若 AC 有定義邊界值
  it('AC-XX: should [error/disabled Then]', ...);    // 若 AC 的 Then 含異常狀態
});
```

## 禁止事項

- 不得使用無 `AC-XX` 前綴的測試名稱混入同一輪 TDD
- 不得一次為所有 AC 先建立完整測試後再實作（horizontal slicing 禁止）
- 不得用 `expect(true).toBe(true)` 或空測試體製造假綠燈
