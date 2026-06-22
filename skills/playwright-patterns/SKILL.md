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
- If dev server is not running (`ECONNREFUSED`), stop and notify user
