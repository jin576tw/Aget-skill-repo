# 弱點掃描工作指南

> 收錄三類弱掃工具的流程、常見問題處理與回應範本。  
> 工具正式名稱以系統顯示為準（括號內為對外通用名）。

---

## 工具對照

| 類型 | 系統顯示名稱 | 通用名稱 | 說明 |
|---|---|---|---|
| 白箱 / 靜態分析 | Checkmarx One SAST | SAST | 掃描原始碼結構與資料流 |
| 套件掃描 | Checkmarx One SCA | SCA | 開源套件弱點、授權合規、惡意套件 |
| 黑箱 / 動態測試 | WebInspect | Fortify WebInspect / OpenText DAST（同一產品） | 執行期滲透測試（UAT 環境） |

---

## SCA 套件掃描流程

1. 建立獨立分支（不混入功能開發）
2. 清空 `package.json` 的 `devDependencies`
3. 刪除 `node_modules/` 與 `package-lock.json`
4. 重新執行 `npm install`
5. 查詢問題套件來源：`npm explain [套件名稱]`

---

## WebInspect 黑箱掃描流程

1. 透過 Jenkins 部署指定 git repo branch
2. 帶參數建置，設定版號
3. 進入 **tracko** 系統 → 項目「組態」→ 設定 WebInspect 的 URL
4. 設定已部署的 node port（UAT 環境）執行掃描

---

## 誤報（False Positive）處理流程

1. 重新弱掃確認
2. 匯入追蹤管理系統
3. 填寫「處理情形說明」（見下方範本）
4. 附上截圖佐證
5. 重新送審

---

## 處理情形說明範本

### Clickjacking 誤報（SPA 架構）

> 適用：Angular 單頁應用（SPA）被掃到個別 HTML 檔案未加 Clickjacking 防護

```
此為 Angular 單頁應用（SPA）架構，所有頁面皆由 index.html 動態載入，
Clickjacking 防護已集中實作於 index.html，個別 HTML 檔案不會被獨立載入，故為誤報。
```

**詳細說明（送審備用）：**

```
由於本系統是 SPA（單頁式應用），所有頁面路由都會回到同一個入口 index.html 載入，
因此點擊劫持（Clickjacking）的防護必須放在 index.html 才能涵蓋全站。
現行作法是：預設先用 CSS 隱藏畫面（body{display:none}），再用 self === top 判斷是否
被 iframe 嵌入；若為頂層頁面才解除隱藏，若被嵌入則維持不顯示並嘗試跳出框架，
降低根入口被 iframe 包裹後遭點擊劫持的風險。
```

### CSP / 安全回應標頭修正說明

> 適用：黑箱掃描回報缺少安全 HTTP Response Header

**修正方式**：在 `default.conf` 的 `server` 區塊統一加上 `always` 安全回應標頭，包含：
- `Content-Security-Policy`（CSP）
- `X-Frame-Options`
- `Referrer-Policy`
- `Permissions-Policy`

**送審說明範本：**

```
本系統已啟用 Content Security Policy，並採取下列防護：

在 script-src 嚴格限制為 self 與必要雜湊值，未使用 unsafe-inline、unsafe-eval，
降低以內嵌或動態 JS 造成的 XSS 風險。
因前端框架與既有元件需依賴部分內嵌 CSS 才能正常呈現畫面與互動功能，
目前僅在 style-src 保留 unsafe-inline，避免系統無法使用。
另搭配 object-src 'none'、frame-ancestors 等指令強化點擊劫持與外掛防護，
整體殘餘風險評估為可接受，後續將持續評估改為 nonce／hash 方案的可行性。
```

---

## 實用指令

### 上線前程式清單（file-list.txt）

```powershell
Get-ChildItem -Recurse -File |
  ForEach-Object { $_.FullName.Replace((Get-Location).Path + '\', '') -replace '\\', '/' } |
  Set-Content .\file-list.txt -Encoding UTF8
```
