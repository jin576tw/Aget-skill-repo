---
name: sit-verify
description: 在 SIT 環境以真實登入（login API 取 token → 導頁）驗證前端功能、標頭與部署版本，全程攔截寫入、不改既有資料。用於「到 SIT 驗測」「SIT 功能驗證」；需要產測報文件時改用 testdoc-supplement／bsd-report。
---

# sit-verify

## 完成目標

在 SIT 取得功能、標頭與部署版本的實際證據，逐項標 pass／fail／unverified；不修改既有資料、不產測報。

## 規則

- **連線資訊不外洩**：SIT 網址、empNo、功能清單放 scratchpad 的 `sit.env`（使用者提供），不寫入 repo、board、memory、skill 或回報；token 只存記憶體，不印、不寫檔，不存 HAR／trace，log 與截圖檔名遮罩 token（`accessToken=`、JWT、Bearer）。回報以 `<SIT_HOST>` 遮罩主機。
- **token 預檢是閘門**：任何瀏覽器操作前先以 `NODE_USE_SYSTEM_CA=1` 執行 `precheck`，只記 HTTP 狀態與有無 token。`ok` 為 false（連線失敗、非 2xx、轉址或無 token）立即中止回報；不重試硬闖、不關 TLS 驗證（`UNABLE_TO_VERIFY_LEAF_SIGNATURE` 多為未讀系統憑證庫）。
- **不改既有資料；新增須逐項放行**：預設擋全部寫入。先只讀原始碼列 API 清單（含 GET）分 READ／CREATE／WRITE，不確定歸 WRITE，交使用者核准後才連 SIT。白名單只收 READ 類 POST（查詢、匯出）與使用者逐項明示放行的 CREATE；PUT／PATCH／DELETE 與更新型 POST 一律不放行；有副作用的 GET（logout、標記類）列入 `denyGet`。被擋回 403 JSON（不要回 401，會觸發 refreshToken）。會間接觸發寫入的操作（例如下載後自動 PUT 註記）停在前一步。
- **守衛不可繞過**：驗測腳本只用 `startSession` 回傳的 page 操作；不得用 `page.request`／`context.request`，不得另行註冊 route。報告必列 `log.blocked`（非預期應為 0）與 `log.leaked`（必須為 0）。
- **先確認部署版本**：驗修正前比對 SIT `index.html` 的 hash 檔名、Last-Modified、關鍵 bundle 版本字串與待驗 commit 的 build；不符即回報「SIT 未部署該版」，常見原因是套件升級後 base image 未重包導致 build 未換映像。
- **確認環境注入**：導頁後讀前端環境（如 `window.profile`）與第一支 API 的實際主機；打到 localhost 即中止功能驗測回報。使用者核准才可用 `initScript` 注入，結果須註明「注入設定，非實際部署行為」。
- **資料**：用頁面預設條件或使用者提供的區間／案號；無資料的項目標 unverified，不為造資料而寫入。截圖含業務資料者只留本機。
- **程序**：Chrome 以 `--<marker>-marker=<pid>` 標記（新版 Playwright 無 `browser.process()`），結束以 CIM 查 CommandLine 只清自己的。

## 用法

`sit.env`（鍵名可依專案調整）：`SIT_BASE`、`LOGIN_PATH`、`AUTH_PATH`（如 `/app-ui/AuthView?accessToken=`）、`EMPNO`、`FUNCS`（逗號分隔）。

```js
// NODE_USE_SYSTEM_CA=1 PLAYWRIGHT_CORE=file:///.../playwright-core/index.mjs node run.mjs
import { loadEnv, precheck, startSession } from 'file:///<plugin>/skills/sit-verify/scripts/sit-guard.mjs';
const env = loadEnv('<scratchpad>/sit.env');
const pre = await precheck(env.SIT_BASE, env.LOGIN_PATH, { empNo: env.EMPNO, accessFunctionList: env.FUNCS.split(',') });
console.log(pre.status, pre.hasToken); if (!pre.ok) process.exit(1);
const s = await startSession({ base: env.SIT_BASE, allowPost: [{ path: '/app-api/v1/query' }] });
await s.page.goto(env.SIT_BASE + env.AUTH_PATH + pre.token);
// …驗測…；最後輸出 s.log（已遮罩），await s.browser.close()
```

## 步驟

1. 讀目標專案 `CLAUDE.md`、data-privacy instructions；只讀原始碼產出頁面清單、API 分類與白名單（`plan.md`），交使用者核准。
2. `precheck` 做 token 預檢，`ok` 才繼續。
3. 免登入以 Node fetch 驗標頭（入口、deep link、靜態資源、env 檔）與 bundle 版本。
4. `startSession` 啟動攔截瀏覽器、導頁登入，依清單驗頁面、查詢、匯出（讀檔核內容後刪除）、列印，收集 console／pageerror。
5. 回報：預檢結果、逐項結果與證據路徑、`blocked`／`leaked`／`foreign` 清單、未驗項與原因、風險、PID 清理。

## 已知踩坑

- 日期選擇器上限常為系統營業日而非今日；部分查詢區間限 30 天，需分段。
- 400「找不到資料」是業務訊息；app 對 4xx/5xx 自行 console.error，不等於前端例外，以 pageerror 判斷。
- 擋外部字型主機會產生 `ERR_FAILED` 與 worker 字型降級訊息，屬守衛造成，報告須註明。
- 回應標頭重複值（如 `nosniff, nosniff`）可能來自 nginx 多層 add_header 或閘道疊加，客戶端無法分辨。
- Windows 下 ESM 匯入絕對路徑用 `file:///C:/...`；長腳本用 Write 工具建立，避免 heredoc 引號問題。
