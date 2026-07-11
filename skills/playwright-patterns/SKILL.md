---
name: playwright-patterns
description: Playwright E2E 測試撰寫通用指南。TRIGGER when 使用者提及 Playwright、E2E 測試、UI 測試、自動化測試、撰寫測試。提供選擇器策略、認證繞過、API mock、測試報告格式。
---

# Playwright E2E Testing Patterns

## Overview

本 skill 提供 Playwright 測試撰寫的通用模式與最佳實踐，適用於任何 Angular / React / Vue 專案。

## Quick Start

測試檔放置於 `tests/{feature-name}.spec.ts`。

```typescript
import { test, expect } from '@playwright/test';

test.describe('{Feature} — {Description}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/{route}');
    await page.waitForLoadState('networkidle');
  });

  test('{scenario} — {expected behavior}', async ({ page }) => {
    // Given
    // When
    // Then
  });
});
```

## Selector Strategy

See [selectors.md](selectors.md) for detailed selector priority and examples.

**Priority order:**
1. `page.getByRole('button', { name: '...' })` — ARIA role (best)
2. `page.getByLabel('...')` — Form label
3. `page.getByPlaceholder('...')` — Placeholder text
4. `page.getByTestId('...')` — data-testid attribute
5. `page.locator('css-selector')` — CSS (last resort)

## API Mocking

```typescript
// Mock all API calls
await page.route('**/api/**', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({ data: null }),
  }),
);

// Mock specific endpoint with data
await page.route('**/api/search', (route) =>
  route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      data: { results: [...], totalPages: 3 },
    }),
  }),
);
```

## Auth Bypass

See [auth-mock.md](auth-mock.md) for authentication bypass patterns.

## Web Worker Mocking

See [worker-mock.md](worker-mock.md) — Blob URL SecurityError、uid echo 靜默失敗、worker 純函式測試策略、真實降級路徑驗證。

## Component State Injection（Angular）

下拉選單等由 API mock 填充的資料，若因路由時序或 `forkJoin` 未完成導致 mock 沒生效，改在 `page.evaluate()` 直接注入元件屬性，不依賴 API 時序：

```typescript
await page.evaluate(() => {
  const el = document.querySelector('app-my-component');
  const comp = (window as any).ng.getComponent(el);
  comp.caseStatusList = [...];
  comp.cdr?.detectChanges?.();
});
```

## Dev Server 生命週期

- **先探測、確認、必要時自啟、自己開的自己收**：(1) 探測常用 port（4200→4203），比對頁面 `<title>` 是否為目標 app——**port 可能被別的 app 佔用**，症狀是選擇器逾時 + snapshot 顯示 404 頁；(2) 未找到則自行啟動（指定空閒 port）並記錄；(3) 結束後只清理自己啟動的 server。
- 測試時以 `PW_BASE_URL` 之類環境變數指定實際 port，不寫死 4200。

## Test Report Format

See [report-template.md](report-template.md) for standardized test report format.

## Layout / CSS Assertions

See [layout-assertions.md](layout-assertions.md) for CSS property assertions (`toHaveCSS`), scroll behavior verification, and screenshot evidence patterns — required for any AC that changes `overflow`, `max-height`, `height`, `display`, or other visual container properties.

## Best Practices

- Use `await expect(locator).toBeVisible()` instead of `page.waitForTimeout()`
- Each `test` maps to one acceptance criterion (Given-When-Then)
- Use `test.describe` to group by page/feature
- Test names: `{scenario} — {expected behavior}` in project language
- Fill → Interact → Assert order for form testing
- Dev server 未啟動（`ECONNREFUSED`）時依「Dev Server 生命週期」節自行探測/啟動，僅在無法啟動時才停下通知使用者
