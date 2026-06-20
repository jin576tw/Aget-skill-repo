---
name: verify
description: Verify that a code change actually does what it's supposed to by running the app and observing behavior. Use when asked to verify a PR, confirm a fix works, test a change manually, check that a feature works, or validate local changes before pushing.
---

# Verify Skill — Angular GUI 補充規則

> 本 skill 繼承 bundled `verify` 的完整協議。
> 以下為 **Angular GUI 專案的強制補充規則**，當 surface 為瀏覽器 GUI 時，這些規則優先適用。

---

## ⛔ Angular GUI 的 BLOCKED 條件

若以下任一情況發生，verdict 必須為 **BLOCKED**，不得回報 PASS：

| 行為 | Verdict |
|------|---------|
| 只執行 `npm run build` / `ng build` | **BLOCKED** — 僅確認 TypeScript 編譯，未觀察任何執行時行為 |
| 只執行 `npm test` / Karma unit tests | **BLOCKED** — CI 產出，非 app 執行時行為 |
| 只閱讀程式碼確認邏輯正確 | **BLOCKED** — code review，非 verify |
| 瀏覽器未實際啟動 | **BLOCKED** — 未觸達 GUI 表面 |

**正確的 Angular GUI verify 方法**：用 Playwright 驅動瀏覽器到達變更程式碼執行的路徑，mock 必要的 API 回應，截圖作為 evidence。

---

## Angular GUI Mock 標準流程

```typescript
// 1. mock 認證（避免 guard 重導）
await page.addInitScript(() => {
  sessionStorage.setItem('token', 'mock-token');
});

// 2. mock API 回應
await page.route('**/api/**', route =>
  route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ data: { /* mock data */ } }) })
);

// 3. 導覽到目標頁面
await page.goto('http://localhost:4200/core-ui/target-route');
await page.waitForLoadState('networkidle');

// 4. 執行操作
await page.click('button:has-text("存檔")');

// 5. 截圖 / 斷言
await expect(page.locator('.toast-warning')).not.toBeVisible();
await page.screenshot({ path: 'evidence/ac01-pass.png' });
```

共享 harness 路徑：`C:\Users\003689\Desktop\playwright-harness`

---

## 常見 Angular Guard 繞過

見 `playwright-patterns` skill → `auth-mock.md`。

---

## 當 dev server 未啟動

若 `ECONNREFUSED`：
1. 先執行 `npm start`（dev server，port 4200）
2. 等待 `Compiled successfully` 後再驅動 Playwright

---

## Verdict 基準（Angular GUI）

| 情況 | Verdict |
|------|---------|
| Playwright 驅動瀏覽器，操作成功，截圖為證 | **PASS** |
| 操作後行為與預期不符 | **FAIL** |
| 無法啟動 dev server / 無法 mock auth / build 失敗 | **BLOCKED** |
| 僅 build 通過，未驅動瀏覽器 | **BLOCKED** |
