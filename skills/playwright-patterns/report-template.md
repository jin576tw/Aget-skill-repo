# Playwright Test Report Template

## Standard Format

```markdown
## Playwright E2E 測試報告

### 測試對象
- 頁面：{view-name}
- 規格文件：{spec path}
- 測試檔：tests/{view-name}.spec.ts
- 執行時間：{date}

### 測試結果摘要
| 瀏覽器 | 通過 | 失敗 | 略過 |
|--------|------|------|------|
| Chromium | X | X | X |

### 測試場景明細
| # | 場景描述 | 狀態 | 備註 |
|---|---------|------|------|
| 1 | {scenario description} | PASS/FAIL | {notes} |

### 失敗項目分析（若有）
| # | 測試名稱 | 失敗原因 | 建議修正 |
|---|---------|---------|---------|
| 1 | {name} | {error message} | {suggestion} |

### 結論
- 通過率：X%
- 結論：[通過 / 有條件通過 / 不通過]
- 後續行動：[fix suggestions or escalation target]
```

## Execution Commands

```bash
# Single spec file (dev server must be running)
npx playwright test tests/{view-name}.spec.ts --project=chromium --reporter=list

# Headed mode (observe browser)
npx playwright test tests/{view-name}.spec.ts --headed

# With trace on failure
npx playwright test tests/{view-name}.spec.ts --trace on-first-retry
```

## Error Handling

- `ECONNREFUSED` → dev server not running, stop and notify user
- Timeout on `waitForLoadState` → page may need auth bypass or API mock
- Element not found → check selector strategy, verify HTML structure
