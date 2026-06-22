# Playwright Layout / CSS Assertions

## 兩層防線策略

| 層次 | 方法 | 能抓到什麼 | 抓不到什麼 |
|------|------|-----------|-----------|
| **第一層** | `toHaveCSS()` + `scrollWidth` | CSS 屬性值正確、容器確實可捲動 | CSS 值對但視覺仍破版 |
| **第二層** | `toHaveScreenshot()` | 整體視覺輸出，像素級比對，破版一定被抓 | 需維護 baseline 截圖 |

**兩層都要寫**，缺一不可。`toHaveCSS` 快速定位根因；`toHaveScreenshot` 保障整體視覺正確性。

---

## 何時使用

任何 AC 涉及 `overflow`, `overflow-x`, `overflow-y`, `max-height`, `height`, `display`, `flex`, `grid` 等視覺容器屬性變更時，強制執行兩層驗證。

---

## 第一層 — CSS 屬性與捲動行為斷言

### CSS 屬性斷言

```typescript
// 驗證 overflow-x 已啟用水平捲動
await expect(page.locator('.table-responsive-md')).toHaveCSS('overflow-x', 'auto');

// 驗證 overflow-y 已啟用垂直捲動
await expect(page.locator('.table-responsive-lg')).toHaveCSS('overflow-y', 'auto');

// 驗證 max-height 已設定（不為 none）
const el = page.locator('.table-responsive-lg');
const maxHeight = await el.evaluate(node => getComputedStyle(node).maxHeight);
expect(maxHeight).not.toBe('none');
```

### 捲動行為驗證

```typescript
// 驗證容器實際可水平捲動（需要資料撐寬才有效）
const canScrollX = await page.locator('.table-responsive-md').evaluate(el =>
  el.scrollWidth > el.clientWidth
);
expect(canScrollX).toBe(true);

// 驗證容器實際可垂直捲動（需要資料超出 max-height）
const canScrollY = await page.locator('.table-responsive-lg').evaluate(el =>
  el.scrollHeight > el.clientHeight
);
expect(canScrollY).toBe(true);
```

---

## 第二層 — 視覺快照（Visual Snapshot）

### 基本用法

```typescript
// 頁面級快照 — 第一次執行建立 baseline，後續每次比對
await expect(page).toHaveScreenshot('page-layout.png', {
  animations: 'disabled',       // 停止 CSS 動畫避免誤判
  maxDiffPixelRatio: 0.02,      // 允許 2% 像素差異（處理字體渲染差異）
});

// 元素級快照 — 只截取特定容器，更精準
await expect(page.locator('.modal-body')).toHaveScreenshot('dialog-table.png', {
  animations: 'disabled',
  maxDiffPixelRatio: 0.02,
});
```

### 遮蔽動態內容（避免誤報）

```typescript
// 遮蔽日期、時間、使用者名稱等動態內容
await expect(page).toHaveScreenshot('table-layout.png', {
  animations: 'disabled',
  mask: [
    page.locator('.update-time'),   // 更新時間欄
    page.locator('.user-name'),     // 使用者姓名
  ],
  maxDiffPixelRatio: 0.02,
});
```

### 更新 baseline

```bash
# 視覺有意為之的改動時，更新 baseline
npx playwright test --update-snapshots
```

---

## 完整範例 — 兩層並用

```typescript
import { test, expect } from '@playwright/test';

test.describe('AC-XX — table 容器 overflow 驗證', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('token', 'mock-token');
    });
    // mock 足夠多資料讓 overflow 觸發（欄位夠寬 + 列數夠多）
    await page.route('**/api/**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { results: Array.from({ length: 30 }, (_, i) => ({ id: i })) }
        }),
      })
    );
    await page.goto('http://localhost:4200/core-ui/target-route');
    await page.waitForLoadState('networkidle');
  });

  test('AC-XX — 主表格水平捲動（第一層：CSS + 行為）', async ({ page }) => {
    const container = page.locator('.table-scroll-container .table-responsive-md');
    // CSS 屬性正確
    await expect(container).toHaveCSS('overflow-x', 'auto');
    // 實際可水平捲動
    const canScrollX = await container.evaluate(el => el.scrollWidth > el.clientWidth);
    expect(canScrollX).toBe(true);
  });

  test('AC-XX — 主表格視覺無破版（第二層：視覺快照）', async ({ page }) => {
    // 等待表格穩定
    await expect(page.locator('.table-scroll-container table')).toBeVisible();
    // 元素級快照，遮蔽動態欄位
    await expect(page.locator('.table-scroll-container')).toHaveScreenshot(
      'main-table-overflow.png',
      {
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
        mask: [page.locator('td.update-time'), page.locator('td.user-name')],
      }
    );
  });

  test('AC-XX — 彈窗 table 列數超出時垂直捲動（第一層：CSS + 行為）', async ({ page }) => {
    await page.getByRole('link').first().click();
    await expect(page.locator('.modal-body')).toBeVisible();
    const tableContainer = page.locator('.table-responsive-lg');
    // CSS 屬性正確
    await expect(tableContainer).toHaveCSS('overflow-y', 'auto');
    // 實際可垂直捲動
    const canScrollY = await tableContainer.evaluate(el => el.scrollHeight > el.clientHeight);
    expect(canScrollY).toBe(true);
  });

  test('AC-XX — 彈窗 table 視覺無破版（第二層：視覺快照）', async ({ page }) => {
    await page.getByRole('link').first().click();
    await expect(page.locator('.modal-body')).toBeVisible();
    // 彈窗整體快照，確認兩側無破版
    await expect(page.locator('.modal-content')).toHaveScreenshot(
      'dialog-table-overflow.png',
      {
        animations: 'disabled',
        maxDiffPixelRatio: 0.02,
        mask: [page.locator('.update-time'), page.locator('.reply-date input')],
      }
    );
  });
});
```

---

## Baseline 管理規則

| 情況 | 處理方式 |
|------|---------|
| 第一次執行（無 baseline） | Playwright 自動建立，測試標記為 pass |
| CSS 有意調整（如本次 AC-09/AC-10） | 實作後執行 `--update-snapshots` 更新 baseline |
| 非預期視覺差異（破版） | 測試失敗，`test-results/` 內有 expected / actual / diff 三張截圖 |
| 動態內容造成誤報 | 用 `mask` 遮蔽，不要調高 `maxDiffPixelRatio` |

---

## 注意事項

- `toHaveCSS()` 比對的是 **computed style**，不是 source CSS 字串
- `scrollWidth > clientWidth` 需要真實資料撐寬，確保 mock 資料有足夠欄位與列數
- `toHaveScreenshot()` baseline 以 **OS + browser** 為維度分開儲存（Chromium/Windows baseline 不可混用 Linux CI）
- CI 環境與本地截圖可能有 1~2px 差異，建議 `maxDiffPixelRatio: 0.02` 而非 `0`
- 若元素尚不存在（彈窗未開啟），先 `await expect(locator).toBeVisible()` 再截圖
