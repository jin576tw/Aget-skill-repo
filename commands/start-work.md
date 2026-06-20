---
description: 以需求變更 prompt 啟動 md 工作流，並在流程中用問答方式處理 DoR、/plan 確認、E2E harness 與驗收條件（DoD）收尾
---

# /start-work

以自由文字需求啟動 md 工作流。

---

## ⛔ HARD RULES（不論任務大小，一律執行，不得以「需求簡單」為由跳過）

1. **Spec 先於 Code**：任何 `Edit` / `Write` 工具呼叫之前，`@spec-writer` 必須已完成 spec.md 更新。
2. **計畫確認前禁止動 code**：在使用者明確回覆確認計畫之前，禁止呼叫 `Edit` / `Write`。
3. **實作必須透過 `@implementer` subagent**：不得 inline 自行實作。
4. **實作完成後必須透過 `@code-reviewer` subagent**：每個 驗收項（AC）完成後強制執行。
5. **驗收條件前必須由 `@spec-writer` 更新 spec 變更歷程**：所有 驗收項 完成後，spec.md 的「變更歷程」表格必須補上本次異動。
6. **E2E 一律自動執行，不得以「詢問」為由延後或跳過**：Step 7 判定需要 E2E 時，直接啟動 `@test-writer`，不等使用者額外確認。「詢問使用者後沒回應/沒明確要求」不構成豁免理由。

---

## 用途

- 將需求變更 prompt 正規化為可執行的規格與計畫
- 在 Step 0 先做 DoR 與 Open Questions 檢查
- 在 `/plan` 產出後先向使用者確認計畫，再進入實作（**第一個 STOP gate**）
- 在 Step 7 前詢問是否建立共享 Playwright harness
- 在所有 驗收項 完成後，以問答方式確認是否進入驗收條件收尾（**第二個 STOP gate**）

---

## 執行步驟

### Step 0 — Preflight & DoR

1. 讀取使用者提供的需求變更 prompt。
2. 啟動 `@plan-formatter` subagent，將需求正規化為目標畫面、候選 spec 與候選檔案，回傳 Plan Input Report。
3. 以 `Skill` 工具 inline 載入 `gate-keeper`（非 subagent spawn）跑 DoR 檢查。
   - **若有關鍵缺口（缺 API contract、缺商業規則、缺 spec 依據）**：輸出 Open Questions，標示 `WAITING_FOR_OQ_CONFIRMATION`，**STOP**，等使用者補齊後才繼續。
   - 若 DoR 無缺口，直接繼續 Step 1，不中斷。
   - ⚡ **Compact Signal**：gate-keeper 僅輸出 `PASS` 或 `WAITING_FOR_OQ_CONFIRMATION: Q1, Q2...`，不展開 checklist 全文。

### Step 1 — 更新 Spec（透過 `@spec-writer`，不中斷）

4. 啟動 `@spec-writer` subagent（必須載入 `spec-conventions` skill：EARS 語法、GWT 格式、手動測試步驟必填），依需求在對應 `specs/views/{view}/spec.md` 或 `specs/feature/{feature}/spec.md` 補充或新增：
   - 畫面行為規格（EARS 語法）
   - 驗收條件（Given-When-Then）
   - 手動測試步驟
5. `@spec-writer` 完成後直接進入 Step 2，**不在此中斷**。若無對應 spec 檔，`@spec-writer` 先建立最小 spec。
   - ⚡ **Compact Signal**：`@spec-writer` 僅回傳 `spec.md updated | AC-01, AC-02`，禁止回傳 spec 全文。

### Step 2 — 計畫（**STOP gate #1**，使用者確認後才進入實作）

6. 產出計畫，包含：
   - 驗收項 切分清單
   - 每個 驗收項 的測試層級（unit / E2E / 免測）
   - 影響檔案清單
7. 以以下格式輸出計畫摘要，標示 `WAITING_FOR_PLAN_CONFIRMATION`，**STOP**，等使用者明確確認（或修正 驗收項 切分）後才繼續：

```
**Spec 路徑**：specs/views/{view}/spec.md
**驗收項清單**：
| AC    | 描述摘要 | 測試層級                      |
|-------|----------|-------------------------------|
| AC-01 | ...      | unit / component / E2E / 免測 |
**影響檔案**：[列表]
**E2E 預告**：需要 / 豁免（理由：...）

WAITING_FOR_PLAN_CONFIRMATION — 請確認後繼續。
```

### Step 3–6 — 實作循環（每個 驗收項 一輪，透過 subagents，不中斷）

> ⛔ **HARD RULE：`@unit-test-writer` 與 `@implementer` 必須遵循 `tdd` skill 規則，禁止 horizontal slicing（一次寫所有 AC 測試再統一實作）。**

**測試層級對應規則**（`@unit-test-writer` 依 Step 2 計畫表執行）：

| 行為類型 | 測試層級 |
|---------|---------|
| 金額計算、日期判斷、狀態轉換、商業規則 | pure function / domain unit |
| API 轉換、錯誤映射、流程協調 | service unit |
| Input/Output、表單互動、DOM 顯示、按鈕狀態 | component test |
| 關鍵使用者旅程、前後端整合 | E2E（Step 7） |

依單一 驗收項 節奏重複以下循環，**不得跳過或 inline**，每輪自動執行完畢後繼續下一個 驗收項：

```
┌─────────────────────────────────────────────────────────────┐
│  AC-XX                                                      │
│                                                             │
│  1. @unit-test-writer（載入 tdd skill）→ 寫紅燈測試         │
│     每條 AC 最低測試案例：happy path + 邊界值/空值 + 異常    │
│     測試結構對應 GWT：describe('AC-XX: ...') { it(...) }    │
│     若為純 template 變更（無邏輯），可標記「免 unit」        │
│                                                             │
│  2. @implementer（載入 tdd skill + angular-conventions）    │
│     → 最小實作使測試綠燈（禁 any，遵循 Standalone/RFM）     │
│                                                             │
│  3. @code-reviewer → review，不通過則回 @implementer        │
│                                                             │
│  4. refactor（若 reviewer 提出需 refactor）                  │
└─────────────────────────────────────────────────────────────┘
```

**測試骨架規則（`@unit-test-writer` 強制遵循）：**

- 測試名稱格式：`it('AC-XX: should ...')`，禁止用 `fail('Not implemented')` 製造假紅燈
- 測試結構必須顯式對應 spec AC 的 Given/When/Then：
  ```ts
  describe('AC-XX: [AC 描述]', () => {
    // Given: [前置條件]
    // When: [觸發動作]
    it('should [happy path Then]', ...);       // 必填
    it('should [boundary/null Then]', ...);    // 若 AC 有定義邊界值
    it('should [error/disabled Then]', ...);   // 若 AC 的 Then 含異常狀態
  });
  ```
- 測試驗證行為結果，不得綁定私有方法或呼叫次數
- Service 層純函式優先，迫使商業規則從 Component 中分離

> ⚡ **Compact Signal（AC 循環）**：每個 subagent 完成後**只回傳一行信號**，禁止回傳代碼：
> - `@unit-test-writer` → `AC-XX | N/M red`
> - `@implementer` → `AC-XX PASS | file1.ts, file2.ts` 或 `AC-XX FAIL | {原因}`
> - `@code-reviewer` → `AC-XX PASS` 或 `AC-XX FAIL | H:N M:N`

所有 驗收項 完成後直接進入 Step 7，**不在 驗收項 循環中間中斷**。

### Step 7 — E2E Harness 決策（不中斷，依情況詢問）

> ⛔ **HARD RULE：「需連 SIT/後端環境」絕對不是跳過 E2E 的理由。**
> Angular GUI 的 E2E 一律採 **mock-based 本地 Playwright**（`page.route()` mock API 回應），
> 使用共享 harness `C:\Users\003689\Desktop\playwright-harness`，完全不依賴外部環境。

**合法豁免條件（需明文說明，滿足其中之一）：**
- 無 UI 表面（純 service / worker / utility，無 component 互動）
- 純靜態 template 文字變更（無 click / input / toast / dialog 等互動邏輯）
- 已有完整覆蓋此路徑的既有 E2E spec

8. 判斷是否需要 E2E：若任何 AC 涉及 component 互動（點按鈕、填欄位、觀察 toast / dialog），則需要 E2E，不得豁免。
9. 若需要：**直接啟動 `@test-writer` subagent**（載入 playwright-patterns skill），撰寫 mock-based Playwright spec（`playwright-harness`），**不需詢問使用者**。
   - ⚡ **Compact Signal**：`@test-writer` 僅回傳 `{spec}.spec.ts | TC-01~TC-N | PASS N/N`，禁止回傳 Playwright 代碼或 CLI 完整輸出。
10. 若合法豁免：**明文輸出豁免理由**後繼續 Step 8。

### Step 8 — 驗收條件收尾（**STOP gate #2**）

11. 啟動 `@spec-writer` subagent 更新 spec.md「變更歷程」表格（**HARD RULE 5，不可略過**）。
    - ⚡ **Compact Signal**：`@spec-writer` 僅回傳 `changelog updated`。
12. `@spec-writer` 完成後，標示 `READY_FOR_ACCEPTANCE`，詢問使用者確認是否進入驗收條件。
13. 確認後以 `Skill` 工具 inline 載入 `gate-keeper`（非 subagent spawn），依其 DoD checklist 輸出收尾結果。
    - ⚡ **Compact Signal**：gate-keeper 僅輸出 `READY_FOR_ACCEPTANCE` 或 `BLOCKED: {原因}`，不展開 DoD checklist 全文。

---

## STOP gate 一覽

| Gate | 位置 | 等待原因 |
|------|------|----------|
| `WAITING_FOR_OQ_CONFIRMATION` | Step 0 DoR（有缺口才觸發） | 缺關鍵資訊，需使用者補齊 |
| `WAITING_FOR_PLAN_CONFIRMATION` | Step 2 計畫完成後 | 等使用者確認 驗收項 切分與計畫 |
| `READY_FOR_ACCEPTANCE` | Step 8 spec 更新後 | 等使用者確認進入驗收條件 |

> 除以上三個 gate，其餘步驟（Spec 更新、實作循環、E2E 決策）均自動執行，**不主動中斷詢問**。

---

## Subagent 分工一覽

| Subagent | 何時啟動 | 載入 skill | Orchestrator 回傳信號 |
|----------|----------|-----------|----------------------|
| `@plan-formatter` | Step 0（固定執行） | preflight | Plan Input Report（精簡表格） |
| `@spec-writer` | Step 1 / Step 8 | spec-conventions | `spec.md updated \| AC-XX` / `changelog updated` |
| `@unit-test-writer` | Step 3 每個 AC | tdd | `AC-XX \| N/M red` |
| `@implementer` | Step 3 每個 AC | angular-conventions | `AC-XX PASS \| files` / `FAIL \| 原因` |
| `@code-reviewer` | Step 3 每個 AC | review-checklist | `AC-XX PASS` / `FAIL \| H:N M:N` |
| `@test-writer` | Step 7（有 UI 互動） | playwright-patterns | `{spec}.spec.ts \| PASS N/N` |

---

## 簡單任務的豁免規則（明文化）

即使需求只是「一行修改」或「加一個 pipe」，仍然**必須**執行：
- ✅ Step 0 Preflight + DoR
- ✅ Step 1 `@spec-writer` 更新 spec
- ✅ Step 2 計畫確認（STOP gate #1）
- ✅ Step 3 `@implementer` subagent
- ✅ Step 3 `@code-reviewer` subagent
- ✅ Step 8 `@spec-writer` 更新變更歷程（STOP gate #2 前）

**可豁免**（純 template 變更、無業務邏輯）：
- ⚠️ `@unit-test-writer`（標記「免 unit — 純 template」並說明理由）

**不得以環境為由豁免**：
- ❌ `@test-writer` E2E 不得以「需連 SIT」、「需後端資料」為由跳過；Angular GUI 一律 mock-based 本地執行（完整豁免條件見 Step 7）
- ❌ `@test-writer` E2E 不得以「詢問使用者後沒有明確要求」為由跳過；判定需要 E2E 時直接啟動，不等確認

---

> **Note**：`/review-change` command 整合了 code review（`@code-reviewer`）與 spec 變更歷程更新（`@spec-writer`），等效於 Step 3–6 的 review 環節 + Step 8 的歷程更新。若需在流程外獨立執行整批審查，可用 `/review-change`。

---

## 若資訊不足

- 缺 spec 依據：`@spec-writer` 先建立最小 spec，不進入測試或實作
- 缺 API contract / 商業規則：先問答確認，不進 `/plan`
- 缺 E2E 環境：先問是否建立共享 harness；若否，記錄略過理由
