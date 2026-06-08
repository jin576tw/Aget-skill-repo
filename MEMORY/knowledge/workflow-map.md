# Workflow Map

> 目的：記錄高頻工作流與狀態轉移，讓 agent 不需要每次從 spec 或畫面重新推導流程。

## Standard Session Start

1. 讀 `P:\MEMORY\memory.md`。
2. 讀 `knowledge/knowledge.md`，再依任務補讀 `domain-map`、`workflow-map`、`lookup-map` 或其他知識檔。
3. 判斷 project family，讀 `projects/{family}/{family}.md`。
4. 讀 `projects/{family}/status.md` 取得目前進度與待辦。
5. 已知 leaf project 時，再讀 `projects/{family}/{leaf}.md` 與專案內指引。

## Standard Session End

1. 更新 `journal/log.md`。
2. 更新 `projects/{family}/status.md` 的進度與待辦。
3. 判斷本次是否產生可減少未來理解成本的知識。
4. 情境性知識寫入 `knowledge/lessons-learned.md`。
5. 持久規則寫入 `knowledge/conventions.md`。
6. 背景理解、流程語意、查找路徑寫入對應 knowledge map。

## Knowledge Escalation Rule

- 如果未來 agent 仍會問「這是什麼、流程怎麼走、要去哪裡找」，就不該只留在 session 或 status。
- 如果知識只是本次 ticket 的暫時判斷，保留在 session 或 journal 即可。
- 如果知識已經穩定，且跨兩次以上工作會重用，就應升級到 `knowledge/`。

## SDCRELEASE 上線單流程（PA / POS）

**觸發時機**：UAT 與 SIT 測試完成後，在正式部署前提出。

**填單截止**：當天 **16:30** 前完成填單，確保 IED 有足夠作業時間。

**包版時間**：每週**二、五**；上線申請手續請在這兩天內盡快完成，錯過需等下次包版日。

**JIRA 專案**：`SDCRELEASE`（正式環境佈版申請）

### 上線單必填欄位

| 欄位 | 說明 |
|------|------|
| 申請類別 | 執行 資料庫 ALTER、Jenkins 發佈後端、前端（共 3 個動作） |
| 佈版環境 | Prod |
| 平台系統 | 業務中台支援核心 BMPCORE |
| 後端版本編號 | `release_v{x.y.z}` |
| 前端版本編號 | `release_v{x.y.z}` |
| 上線時間 | 預計部署時間 |
| 關聯 JIRA 單 | 本次 release 涵蓋的票號連結（可多張） |

### 上線前行政程序（**缺一不可**）

1. **上傳資訊安全開發檢核表**：在對應 JIRA ticket 附上「資訊安全開發檢核」`.xlsx` 檔案。
2. **調整 JIRA 狀態**：將 ticket 狀態更新為 **IT主管核准**。
3. 若本次涉及**核心包版（Base-Image 更新）**：需於**下週**才能正式上線（申請隔日生效），請提前規劃；普通前端版本當週包版日即可上線。

### 附件：版本差異 diff（**必附，缺少無法提出上線單**）

上線單 **MUST** 附上版本差異 diff 檔；未附則視為上線單不完整，不得送出。

合併分支至 release 後，需產出 git diff 文字檔附入上線單：

```powershell
# POS 前端
git diff origin/release/v1.0.{舊版} origin/release/v1.0.{新版} `
  > "K:/06.專案/06.19.保全前掃/11_正式環境上線單/2026/SDCRELEASE_{版號}/前端v1.0.{新版}_diff.txt"

# PA 前端
git diff origin/release/v1.0.{舊版} origin/release/v1.0.{新版} `
  > "K:/06.專案/06.19.保費前掃/11_正式環境上線單/2026/SDCRELEASE_{版號}/前端v1.0.{新版}_diff.txt"
```

> **注意**：每次合併都需覆蓋產出（非累加），確保 diff 對應本次 release 範圍。

### /save 後自動產生 diff

當本次 session 涉及**合併分支至 release** 時，執行 `/save` Session 結束協議時需額外執行：
1. 確認本次合入的前一個 release tag / 分支版本。
2. 執行上述 git diff 指令，覆蓋產出 diff.txt。
3. 在 log.md 記錄「已產出 前端v{x}_diff.txt」。

### 上線單步驟結構（供填寫參考）

```
Step 1：請 DBA 優先執行 Production Alter Table
  資料庫別名：bmpcore
  依照附件 AlterTable.sql 執行

Step 2：請執行 Production Jenkins
  服務名稱 | 新版號 | Jenkins 任務
  sdc-bmpcore-{project}-api | release_v{x} | [api-deploy-v1]
  sdc-bmpcore-{project}-ui  | release_v{x} | [ui-deploy-v1]
```

> 聯絡窗口（問題回報）：Edward Yuan、Patrick Yang、James Wu、Devin Chen

---

## SDC01 Working Pattern

1. 先確認需求屬於哪個 family 與 leaf project。
2. 若是功能理解或規格問題，先讀對應 spec / view spec / family lookup。
3. 若是實作問題，再進原始碼找 base class、service、types 與頁面元件。
4. 若是跨 session 重複出現的背景知識，工作結束前升級到 knowledge map，而不是只留在 ticket 對話。