# Playwright Layout / CSS Assertions

## 何時使用

任何 AC 涉及 `overflow`, `max-height`, `height`, `display`, `flex`, `grid` 等視覺容器屬性變更時，使用本模式驗證。

## CSS 屬性斷言

```typescript
// 驗證 overflow-x 已啟用水平捲動
await expect(page.locator('.table-responsive-md')).toHaveCSS('overflow-x', 'auto');

// 驗證 overflow-y 已啟用垂直捲動
await expect(page.locator('.table-responsive-lg')).toHaveCSS('overflow-y', 'auto');

// 驗證 max-height 已設定（比對計算後的像素值或 computed style）
const el = page.locator('.table-responsive-lg');
const maxHeight = await el.evaluate(node => getComputedStyle(node).maxHeight);
expect(maxHeight).not.toBe('none'); // 確認有設定限制
```

## 捲動行為驗證

```typescript
// 驗證容器可水平捲動（scrollWidth > clientWidth）
const canScrollX = await page.locator('.table-responsive-md').evaluate(el =>
  el.scrollWidth > el.clientWidth
);
expect(canScrollX).toBe(true);

// 驗證容器可垂直捲動
const canScrollY = await page.locator('.table-responsive-lg').evaluate(el =>
  el.scrollHeight > el.clientHeight
);
expect(canScrollY).toBe(true);
```

## 截圖 Evidence（必填）

```typescript
// 截圖前先 mock 足夠多資料讓 overflow 觸發
await page.route('**/api/search', route =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: { results: generateMockRows(30) } }),
  }),
);

await page.goto('/core-ui/target-route');
await page.waitForLoadState('networkidle');

// 截圖作為 evidence
await page.screenshot({ path: 'evidence/ac-layout-pass.png', fullPage: false });
```

## 完整範例 — 驗證 table overflow

```typescript
import { test, expect } from '@playwright/test';

test.describe('AC-XX — table 容器 overflow 驗證', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('token', 'mock-token');
    });
    await page.route('**/api/**', route =>
      route.fulfill({ status: 200, contentType: 'application/json',
        body: JSON.stringify({ data: { results: Array.from({ length: 30 }, (_, i) => ({ id: i })) } }) })
    );
    await page.goto('http://localhost:4200/core-ui/target-route');
    await page.waitForLoadState('networkidle');
  });

  test('AC-XX — table-responsive-md 應有 overflow-x: auto', async ({ page }) => {
    // Given: 查詢結果已載入
    // When: 容器呈現
    const container = page.locator('.table-scroll-container .table-responsive-md');
    // Then: overflow-x 應為 auto
    await expect(container).toHaveCSS('overflow-x', 'auto');
    await page.screenshot({ path: 'evidence/ac-overflow-x.png' });
  });

  test('AC-XX — 彈窗 table 列數超出時容器應可垂直捲動', async ({ page }) => {
    // Given: 點擊開啟彈窗
    await page.getByRole('link').first().click();
    // When: 彈窗內 table 呈現
    const tableContainer = page.locator('.table-responsive-lg');
    // Then: 容器 scrollHeight > clientHeight（有垂直 overflow）
    const canScrollY = await tableContainer.evaluate(el => el.scrollHeight > el.clientHeight);
    expect(canScrollY).toBe(true);
    await expect(tableContainer).toHaveCSS('overflow-y', 'auto');
    await page.screenshot({ path: 'evidence/ac-overflow-y.png' });
  });
});
```

## 注意事項

- `toHaveCSS()` 比對的是 **computed style**，不是 source CSS 字串
- `overflow: auto` 在 computed style 中仍為 `auto`；Bootstrap 的 `overflow-x: auto` 也一致
- 若元素尚不存在（彈窗未開啟），先等待 `await expect(locator).toBeVisible()`
- `scrollWidth > clientWidth` 需要真實資料撐寬，確保 mock 資料有足夠欄位
