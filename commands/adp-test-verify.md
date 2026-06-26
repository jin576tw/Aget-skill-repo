---
description: ADP SIT 環境後端 Bug 手動驗收全流程 — 測試情境建立、AC 驗收、BSD 測報產出
---

# /adp-test-verify

ADP 後端 Bug Fix 手動驗收工具。從 spec.md 讀取驗收條件，引導在 SIT 環境建立測試情境，完成後產出 BSD 測報至 `ADP/docs/`。

**呼叫方式**：`/adp-test-verify <JIRA_ID>`（例：`/adp-test-verify ADPSITUAT-4799`）

---

## STEP 1 — 讀取驗收條件

讀取 `specs/feature/{JIRA_ID}/spec.md`，擷取：
- 觸發條件（Given）
- 驗收條件列表（AC-01、AC-02...）
- 對應 API 端點（NB / MOD 路徑）
- 商業規則觸發點（如 Drools rule ID、條件欄位）

> 💡 **Drools 觸發識別法**：若 spec 提到 `Rule ID`（如 `GI_UW_I_0026`）且觸發條件含業務金額欄位（如 `sumFuneralExpensesAmount > 0`），表示需要確認對應業務資料欄位已填，才能進入規則路徑。

---

## STEP 2 — SIT 環境建立（路由）

依 spec 的 API 路徑判斷：

### NB 路徑（`/gi/nb/policies/...`）→ NB UWFAIL 情境 SOP

| 步驟 | 操作 | 注意事項 |
|------|------|---------|
| 1 | 以 **30user** 登入 SIT | 60user 無 `ROLE_GI_UW*`，會報 E300 |
| 2 | 新契約作業 → 受理作業查詢/新增 → 新增 | |
| 3 | **要保單位**：業務員輸入 `1A1K01`，儲存後選擇專員 | 1A1K01 = 直營團險，`teamCode` + `coordinatorCode` 均有值；其他業務員可能 `teamCode = null` → 送審失敗 |
| 4 | **險種內容**：依觸發條件填入對應險種 | 如 Drools 需要公會照會喪葬費用，需勾選對應保費項目 |
| 5 | **計劃內容設定**：填入計劃 | `childrenAmount` 不可 null |
| 6 | **被保險人**：新增員工，填寫生日、生效日 | 計劃別輸入後按 Enter 觸發 `checkPlanCode()` |
| 7 | 被保險人頁面按「受理完成」 | |
| 8 | **Swagger 推關**：`http://localhost:9001/swagger-ui/index.html` → `GiModPolicyReviewTaskAp` → `POST /gi/mod/policies/task/review/insured/rule` | 需瀏覽器 OAuth token（重整 SIT 頁面重新取得） |
| 9 | 回到 UI → 核保審核 → 檢核不通過 → 員工列表出現 | 情境建立完成 |

### MOD 路徑（`/gi/mod/policies/...`）

類似 NB 路徑，改以契變案件開始（受理作業查詢/新增 → 選既有保單 → 申請契變）。

---

## STEP 3 — 執行 AC 驗收

依 spec 的 AC 逐一操作：

1. 確認前置條件符合（業務員、被保人資料、觸發欄位值）
2. 執行操作路徑（見 spec 手動測試步驟）
3. 截圖紀錄：
   - **最小三張**：觸發入口頁（如 UWFAIL 員工列表）+ 操作頁（如 編輯頁）+ 結果（儲存成功訊息）
   - 儲存至 `C:\Users\{user}\Pictures\Screenshots\`

> 💡 **截圖順序建議**：
> - 前置條件頁（業務員設定、被保人填寫）
> - 核保審核 → 檢核不通過員工列表
> - 編輯員工核保審核內容頁面
> - 儲存成功對話框（AC 驗收結果）

---

## STEP 4 — BSD 測報產出

驗收完成後，呼叫 `/bsd-report {JIRA_ID}`：

```
/bsd-report ADPSITUAT-XXXX
```

- 輸出路徑：`C:\Users\003689\Desktop\ADP\docs\{JIRA_ID}_BSD.docx`
- `ADP/docs/` 已列入 `.gitignore`，不進版控

---

## SIT 環境常見問題速查

| 症狀 | 根因 | 解法 |
|------|------|------|
| E300：非核保人員不可建立新契約 | 帳號無 GI_UW 角色 | 換 30user |
| `責任區細號不可為空白` | 業務員 `teamCode = null` | 業務員改 1A1K01 |
| 專員下拉為空 | `coordinatorCode = null` | 選 1A1K01 後儲存，再看專員下拉 |
| 核保審核無員工列表 | 案件未進入 UWFAIL 狀態 | 執行 Swagger 推關（STEP 2 步驟 8） |
| Swagger 回 401 | OAuth token 過期 | 重整 SIT 瀏覽器頁面，再從 Network 取最新 token |

---

## 知識來源

本工具蒸餾自 ADPSITUAT-4799（2026-06-26）驗收 session 的完整操作記錄。
- NB UWFAIL SOP：`P:\MEMORY\projects\adp\` 記憶節點 `project-sit-test-scenario-nb`
- Drools NPE 根因與商業規則：`specs/feature/ADPSITUAT-4799/spec.md`
