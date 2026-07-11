---
description: 以需求變更 prompt 啟動 md 工作流，並在流程中用問答方式處理 DoR、/plan 確認、E2E harness 與驗收條件（DoD）收尾
model: opus
---

# /start-work

以自由文字需求啟動 md 工作流。

---

## 🧠 Orchestrator 角色宣告

**主會話 = Orchestrator（想），Subagents = Workers（做）。**

主會話只負責：**規劃、拆解、委派、審核信號、整合結果**。除此之外的一切細節工作都委派出去。

| 原則 | 規則 |
|------|------|
| 禁止 inline 實作 | 所有程式碼變更透過 `@implementer`（HARD RULE 3） |
| 禁止讀 worker 產出全文 | 審核交給 `@code-reviewer`；orchestrator 只依 compact signal 判斷，不 Read worker 已寫入的檔案 |
| 委派 prompt 精簡 | 只傳「AC 編號 + GWT 驗收標準 + 目標檔案路徑」，不得貼整份 spec 全文 |
| 每個子任務有驗收標準 | 委派時必附該 AC 的 Given-When-Then，worker 依此自我驗證 |
| 低成本 worker | 所有 subagents 均為 `model: sonnet`（見「Subagent 分工一覽」） |

> **模型策略（Opus 想、Sonnet 做）**：本 command frontmatter 設 `model: opus` — Step 0–2（規劃、拆解、計畫）由 Opus 執行至 STOP gate #1。注意 model override **僅作用於當前 turn**，使用者確認計畫後回到 session 模型做信號路由；實作細節始終由 sonnet workers 承擔。後續 turns 的決策品質建議由 Advisor 補位（見「Advisor 升級點」）。

---

## ⛔ HARD RULES（不論任務大小，一律執行，不得以「需求簡單」為由跳過）

1. **Spec 先於 Code**：任何 `Edit` / `Write` 工具呼叫之前，`@spec-writer` 必須已完成 spec.md 更新。
2. **計畫確認前禁止動 code**：在使用者明確回覆確認計畫之前，禁止呼叫 `Edit` / `Write`。
3. **實作必須透過 `@implementer` subagent**：不得 inline 自行實作。
4. **實作完成後必須透過 `@code-reviewer` subagent**：每個 驗收項（AC）完成後強制執行。
5. **驗收條件前必須由 `@spec-writer` 更新 spec 變更歷程**：所有 驗收項 完成後，spec.md 的「變更歷程」表格必須補上本次異動。
6. **E2E 一律自動執行，不得以「詢問」為由延後或跳過**：Step 7 判定需要 E2E 時，直接啟動 `@test-writer`，不等使用者額外確認。「詢問使用者後沒回應/沒明確要求」不構成豁免理由。
7. **Plan Input Report 三必填欄位**：`@plan-formatter` 回傳的 Plan Input Report 必須包含以下三欄，**缺任一欄不得進入 Step 2**：
   - **適用 skills**：從 `~/.claude/skills/` 比對本任務，輸出候選清單；無適用填「無」。
   - **lessons-learned 對應段**：依任務類型引用 `P:\MEMORY\knowledge\lessons-learned.md` 段落標題；無對應填「無對應段」。
   - **知識庫進度**：`P:\MEMORY\projects/{family}/status.md` Current Focus 一行摘要；不可用時填「P:\MEMORY 不可用」。

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
2. 啟動 `@plan-formatter` subagent，將需求正規化為目標畫面、候選 spec 與候選檔案，回傳 Plan Input Report（含三必填欄位：適用 skills、lessons-learned 對應段、知識庫進度；見 ⛔ HARD RULE 7）。
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

> ⛔ **HARD RULE：測試 writer 與 `@implementer` 必須遵循 TDD，禁止 horizontal slicing（一次寫所有 AC 測試再統一實作）。**

**語言路由（Step 3 進入前先判定，整個任務只判定一次）：**

| 專案特徵 | 測試 agent | 實作 agent skill |
|---------|-----------|----------------|
| `pom.xml` 或 `build.gradle` 存在（後端） | `@backend-unit-test-writer`（agent 內偵測語言，載入 `java-testing`） | `@implementer`（不載入 angular-conventions） |
| `package.json` 存在（前端） | `@frontend-unit-test-writer`（agent 內偵測 Angular/Vue，載入對應 skill） | `@implementer`（Angular：載入 `angular-conventions`；Vue：不載入） |

**測試層級對應規則：**

| 行為類型 | 測試層級 |
|---------|---------|
| 金額計算、日期判斷、狀態轉換、商業規則 | pure function / domain unit |
| API 轉換、錯誤映射、流程協調 | service unit |
| Input/Output、表單互動、DOM 顯示、按鈕狀態 | component test（Angular 限定） |
| 關鍵使用者旅程 / HTTP endpoint 行為 | Step 7 決策（見下） |

依單一 驗收項 節奏重複以下循環，**不得跳過或 inline**，每輪自動執行完畢後繼續下一個 驗收項：

```
┌─────────────────────────────────────────────────────────────┐
│  AC-XX                                                      │
│                                                             │
│  1. @frontend-unit-test-writer（前端：Angular/Vue 自動偵測）│
│     @backend-unit-test-writer（後端：Java 等自動偵測）      │
│     → 寫紅燈測試                                            │
│     每條 AC 最低案例：happy path + 邊界值/空值 + 異常       │
│     若為純 template 變更（無邏輯），可標記「免 unit」        │
│                                                             │
│  2. @implementer → 最小實作使測試綠燈                       │
│     Angular：載入 angular-conventions                       │
│     Java：不載入 angular-conventions                        │
│                                                             │
│  3. @code-reviewer → review，不通過則回 @implementer        │
│                                                             │
│  4. refactor（若 reviewer 提出需 refactor）                  │
└─────────────────────────────────────────────────────────────┘
```

**Angular 測試骨架（`@unit-test-writer` 強制遵循）：**
```ts
describe('AC-XX: [AC 描述]', () => {
  // Given / When / Then
  it('should [happy path Then]', ...);
  it('should [boundary/null Then]', ...);
});
```

**Java 測試骨架（`@java-unit-test-writer` 強制遵循）：**
```java
// AC-XX: [AC 描述]
@Test
@DisplayName("AC-XX: should ... when ...")
void acXX_method_condition() { /* Given / When / Then */ }
```

> ⚡ **Compact Signal（AC 循環）**：每個 subagent 完成後**只回傳一行信號**，禁止回傳代碼：
> - 測試 writer → `AC-XX | N/M red`
> - `@implementer` → `AC-XX PASS | file1, file2` 或 `AC-XX FAIL | {原因}`
> - `@code-reviewer` → `AC-XX PASS | R:{總分}/20` 或 `AC-XX FAIL | R:{總分}/20 | H:N M:N | 最低面向:{面向名}`（rubric 定義見 review-checklist skill；分數浮上對話是 /goal 迴圈可核對的品質介面）

所有 驗收項 完成後直接進入 Step 7，**不在 驗收項 循環中間中斷**。

### Step 7 — 整合測試 / E2E 三層決策（不中斷，自動執行）

> ⛔ **HARD RULE：「需連 SIT/後端環境」絕對不是跳過測試的理由。**
> Angular E2E 一律 mock-based 本地 Playwright。Java API 整合測試一律 MockMvc，不需啟動真實 server。

**四層判定表（由上往下，首先命中者執行）：**

| 層級 | 判定條件 | 執行 |
|------|---------|------|
| **UI 互動** | 任何 AC 涉及 click / input / toast / dialog | 直接啟動 `@test-writer`（Playwright mock-based） |
| **CSS layout 可見變化** | 任何 AC 改動 `overflow`, `overflow-x`, `overflow-y`, `max-height`, `height`, `display`, `flex`, `grid` 等視覺容器屬性 | 直接啟動 `@test-writer`（`toHaveCSS()` + 截圖斷言，見 `playwright-patterns` → layout-assertions） |
| **後端 API endpoint** | 改動含 `@RestController` / `@PostMapping` / `@PutMapping` / `@DeleteMapping`；或 DTO / Service 改動影響 HTTP 回應碼 | 直接啟動 `@java-unit-test-writer`（MockMvc 模式，`IT-XX`） |
| **純邏輯 / 無 HTTP 邊界** | 純 utility / domain，無 endpoint、無 UI、無視覺容器屬性變更 | 豁免，明文說明理由後繼續 Step 8 |

8. 依四層判定表決定測試類型，**不需詢問使用者，直接執行**。
9. **UI 互動**：啟動 `@test-writer`（`playwright-patterns` skill），撰寫 mock-based Playwright spec 至 `playwright-harness`。
   - ⚡ Compact Signal：`{spec}.spec.ts | TC-01~TC-N | PASS N/N`
10. **CSS layout 可見變化**：啟動 `@test-writer`，使用 `toHaveCSS()` 斷言目標元素的 CSS 屬性值，並以截圖作為 evidence。
    - ⚡ Compact Signal：`{spec}.spec.ts | TC-01~TC-N | PASS N/N`
11. **後端 API endpoint**：啟動 `@backend-unit-test-writer`（`java-testing` skill MockMvc 模式），建立 `*IT.java`，測試重點為「觸發 bug 的 request body → 應回 2xx，不應 NPE 500」。
    - ⚡ Compact Signal：`IT-XX | N/M red`（測試寫完後交 `@implementer` 補綠燈）
12. **豁免**：明文輸出豁免類型與理由後繼續 Step 8。

### Step 8 — 驗收條件收尾（**STOP gate #2**）

11. 啟動 `@spec-writer` subagent 更新 spec.md「變更歷程」表格（**HARD RULE 5，不可略過**）。
    - ⚡ **Compact Signal**：`@spec-writer` 僅回傳 `changelog updated`。
12. `@spec-writer` 完成後，標示 `READY_FOR_ACCEPTANCE`，詢問使用者確認是否進入驗收條件。
13. 確認後以 `Skill` 工具 inline 載入 `gate-keeper`（非 subagent spawn），依其 DoD checklist 輸出收尾結果。
    - ⚡ **Compact Signal**：gate-keeper 僅輸出 `READY_FOR_ACCEPTANCE` 或 `BLOCKED: {原因}`，不展開 DoD checklist 全文。

---

## ⚡ 平行委派規則

在無檔案衝突的前提下，盡量平行 spawn 加速（單一 message 內多個 Agent 呼叫）：

| 位置 | 平行機會 | 條件 |
|------|---------|------|
| Step 7 | 四層判定同時命中多層時（如 UI E2E + 後端 MockMvc），平行 spawn `@test-writer` 與 `@backend-unit-test-writer` | 兩者寫入不同測試檔，無衝突 |
| Step 3 循環 | `@code-reviewer` 審 AC-XX 的同時，平行 spawn 下一條 AC 的測試 writer 寫紅燈測試 | reviewer 唯讀、test writer 只寫新測試檔；若 reviewer 回 FAIL 需回修，暫停下一條 AC 的實作直到回修完成 |

**不可平行**：同一 AC 內的「測試 → 實作 → review」必須依序（TDD 節奏）；多條 AC 的 `@implementer` 不得同時進行（避免同檔案寫入衝突）。

---

## 🔁 Loop Engineering 整合（在 /goal 迴圈中執行時）

當本 command 由 `/goal` 迴圈驅動（通常由 `/start-goal` 產生的 Goal Contract 啟動）：

1. **STOP gate 優先於 goal 推進**：三個 STOP gate（`WAITING_FOR_OQ_CONFIRMATION`、`WAITING_FOR_PLAN_CONFIRMATION`、`READY_FOR_ACCEPTANCE`）視同 Human Gate — 到達時輸出 `GOAL_NEEDS_HUMAN_GATE` 暫停等待使用者，**不得為了讓 evaluator 判定達成而跳過確認**。
2. **證據落盤**：每完成一條 AC，orchestrator append 一行至工作目錄 `goal-evidence.md`：`| R{輪次} | AC-XX | {signal} | R:{rubric}/20 | {reviewer 報告路徑} | {下一步} |`，防止長迴圈 context compaction 後失憶；報告路徑是信號的審計錨點。
3. **品質介面 = compact signal**：`/goal` evaluator 只讀對話輸出、不讀檔案。`@code-reviewer` 的 rubric 分數（`R:{總分}/20`）浮上信號即為 loop 的機器可驗證停止條件（如「rubric 總分 ≥16」）。
4. **不產出 per-worker handoff 檔**（`handoff-*.md`、`state.json`）：evaluator 讀不到磁碟檔案，且逐 worker 讀寫 handoff 會把內容灌回 orchestrator context，違反 compact-signal 原則、徒增 token 成本。單一 `goal-evidence.md` ledger 已滿足「狀態寫磁碟」。
5. **Checker 不疊加**：`@code-reviewer`（rubric）與 `gate-keeper`（DoD）即為 Goal Contract 的 Checker，goal 層不再另 spawn 第二層 reviewer 重審同一份證據。
6. **信號不可代打**：orchestrator 只能**原文轉述** `@code-reviewer` 回傳的信號行，不得自行產生、修改或省略 R 分數；未實際 spawn reviewer 的輪次不得出現 R 信號——orchestrator 同時協調 maker，代打信號即球員兼裁判。

---

## 🎯 Advisor 升級點（選用，Anthropic API 限定）

搭配 `/advisor` 讓強模型在決策點提供指導、便宜模型執行日常工作：

- **建議配置**：`/model sonnet` + `/advisor fable`（需 v2.1.170+ 與 Fable 5 access）或 `/advisor opus`（需 v2.1.98+）
- **Subagent 繼承 advisor 設定**：sonnet workers 卡關時同樣受益

Advisor 由模型自行決定何時諮詢；以下時機應主動 consult：

| 時機 | 原因 |
|------|------|
| Step 2 產出計畫前 | 架構決策點，計畫品質決定整體結果 |
| 同一 AC 的 `@implementer` 連續 2 次回 `FAIL` | 卡關循環，需要獨立視角 |
| Step 8 `READY_FOR_ACCEPTANCE` 前 | 宣告完成前的最終獨立檢查 |

> 詳細用法見知識庫 `knowledge/claude-code-advisor.md`。

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

| Subagent | model | 何時啟動 | 載入 skill | Orchestrator 回傳信號 |
|----------|-------|----------|-----------|----------------------|
| `@plan-formatter` | sonnet | Step 0（固定執行） | preflight | Plan Input Report（精簡表格） |
| `@spec-writer` | sonnet | Step 1 / Step 8 | spec-conventions | `spec.md updated \| AC-XX` / `changelog updated` |
| `@frontend-unit-test-writer` | sonnet | Step 3（前端專案，自動偵測 Angular/Vue） | 內部偵測後載入 angular-testing 或 vue-testing | `AC-XX \| N/M red` |
| `@backend-unit-test-writer` | sonnet | Step 3（後端專案）/ Step 7（API endpoint 改動） | java-testing（含 MockMvc integration test） | `AC-XX \| N/M red` / `IT-XX \| N/M red` |
| `@implementer` | sonnet | Step 3 每個 AC | Angular：`angular-conventions`；Java：不載入 | `AC-XX PASS \| files` / `FAIL \| 原因` |
| `@code-reviewer` | sonnet | Step 3 每個 AC | review-checklist | `AC-XX PASS \| R:{總分}/20` / `FAIL \| R:{總分}/20 \| H:N M:N \| 最低面向:{面向名}` |
| `@test-writer` | sonnet | Step 7（UI 互動） | playwright-patterns | `{spec}.spec.ts \| PASS N/N` |

> 全部 workers 固定 `sonnet`，成本大宗由低成本模型消耗；Orchestrator 的規劃 turn 用 opus（frontmatter `model: opus`），決策點可再疊加 advisor。

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
