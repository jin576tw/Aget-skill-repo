# Unit Test Patterns（Vue 2 / Nuxt 2）

適用：純函式、composable、utility、API service 邏輯（不需掛載 Component）。

## 測試框架

```js
// Jest + 原生 describe/it/expect
describe('myUtil', () => {
  it('AC-01: should ...', () => {
    // Given
    const input = ...;
    // When
    const result = myUtil(input);
    // Then
    expect(result).toEqual(expected);
  });
});
```

## 優先驗證內容

- 金額計算、日期推算、狀態判斷
- API response → domain model 轉換（mapper / formatter）
- 錯誤碼對應邏輯
- null / undefined / 空陣列防禦行為

## API Service Mock 模式

```js
import axios from 'axios';
jest.mock('axios');

it('AC-02: should call correct endpoint', async () => {
  axios.get.mockResolvedValue({ data: mockData });
  const result = await myService.fetchList();
  expect(axios.get).toHaveBeenCalledWith('/api/path');
  expect(result).toEqual(expectedModel);
});
```

## 非同步工具

- `jest.fn().mockResolvedValue(...)` — async stub
- `await flushPromises()` — 等所有 Promise resolve（需 import `@vue/test-utils` 的 `flushPromises`）

## 建議模式

- mock 只 mock 直接依賴（axios / $http），不 mock 深層實作
- 每條 AC 最低覆蓋：happy path + null/undefined + 邊界值
- 避免測試實作細節（內部變數名稱、中間計算步驟）
