# Playwright Selector Strategy

## Priority Order

### 1. ARIA Role (Best)
```typescript
page.getByRole('button', { name: '查詢' })
page.getByRole('textbox', { name: '保單號碼' })
page.getByRole('checkbox', { name: '全選' })
page.getByRole('link', { name: '詳情' })
page.getByRole('heading', { name: '查詢結果' })
```

### 2. Form Label
```typescript
page.getByLabel('受理日期起')
page.getByLabel('保單號碼')
```

### 3. Placeholder
```typescript
page.getByPlaceholder('請輸入保單號碼')
page.getByPlaceholder('請選擇')
```

### 4. Test ID
```typescript
// Requires data-testid in HTML
page.getByTestId('submit-button')
page.getByTestId('search-results-table')
```

### 5. CSS Selector (Last Resort)
```typescript
// Angular attributes render as lowercase in DOM
page.locator('input[formcontrolname="policyCode"]')
page.locator('.table-striped tbody tr')
page.locator('[appuppercase]') // Angular directive
```

## Handling Disabled Inputs

When Angular FormControl starts disabled, use evaluate to enable:

```typescript
await page.evaluate((idx) => {
  const inputs = document.querySelectorAll('input[your-directive]');
  const el = inputs[idx] as HTMLInputElement;
  if (el?.disabled) {
    el.disabled = false;
    el.removeAttribute('disabled');
  }
}, 0);
```

## Waiting Strategies

```typescript
// Preferred: wait for element visibility
await expect(page.getByRole('table')).toBeVisible();

// Wait for network idle after navigation
await page.waitForLoadState('networkidle');

// Wait for specific API response
const responsePromise = page.waitForResponse('**/api/search');
await page.getByRole('button', { name: '查詢' }).click();
await responsePromise;

// Avoid: arbitrary timeouts
// await page.waitForTimeout(2000); // ❌
```
