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
2. 若需求沒有精確檔案路徑、symbol 或 failing behavior，呼叫 `preflight` skill 做 intake 與 routing。
3. 呼叫 `gate-keeper` skill 跑 DoR 檢查。
   - **若有關鍵缺口（缺 API contract、缺商業規則、缺 spec 依據）**：輸出 Open Questions，標示 `WAITING_FOR_OQ_CONFIRMATION`，**STOP**，等使用者補齊後才繼續。
   - 若 DoR 無缺口，直接繼續 Step 1，不中斷。

### Step 1 — 更新 Spec（透過 `@spec-writer`，不中斷）

4. 啟動 `@spec-writer` subagent，依需求在對應 `specs/views/{view}/spec.md` 或 `specs/feature/{feature}/spec.md` 補充或新增：
   - 畫面行為規格（EARS 語法）
   - 驗收條件（Given-When-Then）
   - 手動測試步驟
5. `@spec-writer` 完成後直接進入 Step 2，**不在此中斷**。若無對應 spec 檔，`@spec-writer` 先建立最小 spec。

### Step 2 — 計畫（**STOP gate #1**，使用者確認後才進入實作）

6. 產出計畫，包含：
   - 驗收項 切分清單
   - 每個 驗收項 的測試層級（unit / E2E / 免測）
   - 影響檔案清單
7. 標示 `WAITING_FOR_PLAN_CONFIRMATION`，**STOP**，等使用者明確確認（或修正 驗收項 切分）後才繼續。

### Step 3–6 — 實作循環（每個 驗收項 一輪，透過 subagents，不中斷）

依單一 驗收項 節奏重複以下循環，**不得跳過或 inline**，每輪自動執行完畢後繼續下一個 驗收項：

```
┌─────────────────────────────────────────────────────────────┐
│  AC-XX                                                      │
│                                                             │
│  1. @unit-test-writer → 寫紅燈測試（.spec.ts）              │
│     若為純 template 變更（無邏輯），可標記「免 unit」        │
│                                                             │
│  2. @implementer → 最小實作使測試綠燈                       │
│                                                             │
│  3. @code-reviewer → review，不通過則回 @implementer        │
│                                                             │
│  4. refactor（若 reviewer 提出需 refactor）                  │
└─────────────────────────────────────────────────────────────┘
```

所有 驗收項 完成後直接進入 Step 7，**不在 驗收項 循環中間中斷**。

### Step 7 — E2E Harness 決策（不中斷，依情況詢問）

8. 若專案沒有 Playwright config，詢問是否建立 `C:\Users\003689\Desktop\playwright-harness`；若同意，再詢問是否協助安裝 Playwright。
9. 若不需要或已有，直接繼續 Step 8。

### Step 8 — 驗收條件收尾（**STOP gate #2**）

10. 啟動 `@spec-writer` subagent 更新 spec.md「變更歷程」表格（**HARD RULE 5，不可略過**）。
11. `@spec-writer` 完成後，標示 `READY_FOR_ACCEPTANCE`，詢問使用者確認是否進入驗收條件。
12. 確認後依 `gate-keeper` 的驗收條件規則輸出收尾結果。

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

| Subagent | 何時啟動 |
|----------|----------|
| `@spec-writer` | Step 1（spec 更新）、Step 8（變更歷程） |
| `@unit-test-writer` | Step 3 每個 驗收項 的測試撰寫 |
| `@implementer` | Step 3 每個 驗收項 的最小實作 |
| `@code-reviewer` | Step 3 每個 驗收項 的 review |

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

---

## 若資訊不足

- 缺 spec 依據：`@spec-writer` 先建立最小 spec，不進入測試或實作
- 缺 API contract / 商業規則：先問答確認，不進 `/plan`
- 缺 E2E 環境：先問是否建立共享 harness；若否，記錄略過理由
