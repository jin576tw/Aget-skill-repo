# Shared Playwright Harness

## 用途

共享 Playwright harness 用於產品專案本身沒有 Playwright 環境，但在 Step 7 仍需要做 E2E 驗證的情況。

固定路徑：`C:\Users\003689\Desktop\playwright-harness`

## 何時使用

- 功能屬於關鍵使用者旅程
- 需要驗證前後端整合後的關鍵結果
- 專案本身沒有 Playwright 環境
- 使用者在流程問答中同意建立或使用共享 harness

## 何時略過

- 功能不涉及跨頁面流程或整合結果
- 單靠 Unit / Component Test 已足夠驗證
- 使用者不同意建立共享 harness
- 使用者不同意在共享 harness 內安裝 Playwright 與瀏覽器

若略過 Step 7，需在 Step 2 計畫與 Step 8 DoD 記錄理由。

## 安裝與更新

在 `C:\Users\003689\Desktop\playwright-harness` 執行：

```powershell
npm install
npm run install:browsers
```

更新依賴時：

```powershell
npm install
```

## 執行方式

```powershell
$env:PW_BASE_URL='http://localhost:4200'; $env:PW_TARGET_PROJECT='pos-ui'; npm run test:list
```

- `PW_BASE_URL`：目標應用程式網址
- `PW_TARGET_PROJECT`：目前測試的專案識別，例如 `pos-ui`、`pa-ui`、`core-ui`

## `/start-work` 在 Step 7 的決策規則

1. 先看 Step 2 是否判定需要 E2E。
2. 若專案已有 Playwright，優先用專案內環境。
3. 若專案沒有 Playwright，流程需問答確認是否建立 / 使用共享 harness。
4. 若使用者同意，可協助在共享 harness 內安裝 Playwright 與必要瀏覽器。
5. 若使用者拒絕，則跳過 E2E，並在收尾時記錄略過理由。

## 注意事項

- `P:\MEMORY` 只放使用說明，不放實際 Node 專案。
- 共享 harness 不可存放真實個資、正式環境 URL、內部 IP、帳密或憑證。
- `test-writer` 不應在產品 repo 內建立新的 Playwright 設定檔。
