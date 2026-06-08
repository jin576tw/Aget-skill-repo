# ESP Worker DAG

> 目的：固定記錄 10 個 worker stages 的順序、依賴、輸入輸出責任與 skip 判定，避免每次都從 orchestrator prompt 反推整張 DAG。

## 何時先讀

- 需要判斷某個 stage 為何被卡住、被跳過、或必須等待前序輸入。
- 需要知道某份 `.kiro/docs/` 文件應由哪個 worker 產出。
- 需要調整 orchestrator、stage 依賴、重試邏輯或 skip 規則。

## 固定順序

1. `esp-deps`
2. `esp-vars`
3. `esp-erd`
4. `esp-funcs`
5. `esp-flow`
6. `esp-rules`
7. `esp-ui-verify`（可選）
8. `esp-sd`
9. `esp-api-contract`（WS/API only）
10. `esp-sa`

## Layer 心智模型

- **Layer 1**：`esp-deps` 建立分析範圍與入口上下文。
- **Layer 2**：`esp-vars`、`esp-erd`、`esp-funcs` 平行展開資料、表結構、方法清單。
- **Layer 3**：`esp-flow` 整合 Layer 2；`esp-rules` 從流程萃取商業規則。
- **Layer 4**：`esp-ui-verify`、`esp-sd`、`esp-api-contract`、`esp-sa` 收斂成驗證、設計與最終分析。

## 依賴圖

- `esp-deps` → DAG 起點。
- `esp-vars` / `esp-erd` / `esp-funcs` → 平行依賴 `esp-deps`。
- `esp-flow` → 同時依賴 `esp-vars` + `esp-erd` + `esp-funcs`。
- `esp-rules` → 依賴 `esp-flow`。
- `esp-ui-verify` → 依賴 `esp-rules`，僅 XHTML/UI 分析使用。
- `esp-sd` → 依賴 `esp-rules` 與 `esp-ui-verify` 的終態；若 `ui-verify` 被 `skipped`，仍可往下流轉。
- `esp-api-contract` → 依賴 `esp-sd`，僅 WS/API 模組使用。
- `esp-sa` → 依賴 `esp-sd`，若 `esp-api-contract` 未被 skip 則也需等待它完成。

## Stage 責任模板

- `esp-deps`：決定分析範圍、入口點、依賴樹與初始 handoff。
- `esp-vars`：整理欄位、變數、來源與使用情境。
- `esp-erd`：整理資料表、欄位關聯、資料流中的持久層角色。
- `esp-funcs`：整理方法、呼叫鏈與進出點。
- `esp-flow`：整合 Layer 2 三份輸入，形成流程圖與步驟分段。
- `esp-rules`：把流程轉譯成商業規則、條件分支與例外處理。
- `esp-ui-verify`：補 UI/XHTML 的畫面驗證、互動觀察與截圖。
- `esp-sd`：形成設計層摘要，串起 UI、規則、資料與模組邊界。
- `esp-api-contract`：補齊 WS/API 契約、欄位與呼叫界面。
- `esp-sa`：收斂成最終系統分析文件，供人類閱讀與後續 spec 使用。

## 不變條件

- 真正可平行的只有 `esp-vars`、`esp-erd`、`esp-funcs` 三個 stage。
- `esp-flow` 是整張 DAG 最常見瓶頸，因為它需要 Layer 2 三份輸入都可用。
- `esp-sa` 的責任是收斂，不應回頭替代前面 stages 補做缺失。
- stage 的狀態與 retry 以 `state.json` 為準，不以 `summary.md` 或 `runs.md` 為準。

## Skip 判定模板

- **非 UI 入口**：`esp-ui-verify` 標 `skipped`。
- **非 WS/API 模組**：`esp-api-contract` 標 `skipped`。
- **模式 B 局部分析**：未受影響 stage 可由 orchestrator 直接標 `skipped`，但必須保留原因。
- **上游失敗導致無法繼續**：由 orchestrator 把相依 stage 標 `skipped`，而不是任由 worker 自行猜測。

## 常見判斷規則

- **哪三個 stage 可平行？** → `esp-vars`、`esp-erd`、`esp-funcs`。
- **哪個 stage 最容易卡住整條 DAG？** → `esp-flow`。
- **為什麼 `esp-sd` 不是直接接 `esp-flow`？** → 因為設計層需要建立在已萃取好的 business rules 之上；UI 類入口還要看 `esp-ui-verify` 是否補到畫面資訊。
- **為什麼 `esp-sa` 可能要等 `esp-api-contract`？** → 最終分析需要把 API/WS 契約一起收斂進整體設計與流程理解。
- **worker 的真實規範看哪裡？** → `.kiro/prompts/agents/esp-*.md` + `.kiro/skills/esp-*.md`。

---

## esp-verify-spec 家族（獨立手動，不在 start-analysis DAG）

> 更新日期: 2026-06-05
> 觸發：手動 `/agent esp-verify-spec <FUNCTION_NAME>` 或 Ctrl+Shift+V

### 角色

| Agent | 類型 | 依賴 | 產出 |
|-------|------|------|------|
| `esp-verify-spec` | mini-orchestrator（含 subagent） | 無（手動觸發） | state.json + runs.md + summary.md |
| `esp-vspec-mock` | 子 agent | 無（與 e2e 並行） | `mock/*.java` + MOCK-OUT handoff |
| `esp-vspec-e2e` | 子 agent（execute_bash/playwright） | 無（與 mock 並行）；非 XHTML → skipped | `images/` + UI-DIFF handoff |
| `esp-vspec-static` | 子 agent | mock done | STATIC-DIFF handoff |
| `esp-vspec-report` | 子 agent | static done + e2e done/skipped | `<doc_root>/SD-review.md` |

### Model 分級（2026-06-05 調整，原全 opus 過度配置）

| Agent | 工作性質 | Model | 理由 |
|-------|---------|-------|------|
| `esp-vspec-static` | 三層比對 + 防幻覺判定 | `claude-opus-4.6` | **唯一保留 opus**：差異判定品質直接決定報告價值，是家族裡「最需推理」棒，對應主 DAG 的 esp-sd |
| `esp-vspec-mock` | SD→Java 骨架抄寫，禁止推測 | `claude-haiku-4.5` | 純結構化轉換，與 esp-deps/vars/funcs 同類；mock 被限制忠實抄寫含 SD 錯誤，不需推理 |
| `esp-vspec-e2e` | Playwright 截圖 + UI 比對 | `claude-sonnet-4.6` | 流程化 SOP，與 esp-ui-verify 同類 |
| `esp-vspec-report` | 套模板收斂 + 算 diff_rate | `claude-sonnet-4.6` | 格式化收斂，非深推理 |
| `esp-verify-spec` | 編排 + Gate + 門檻判定 | `claude-sonnet-4.6` | 編排層，與 start-analysis 同類 |

> 分級邏輯沿用 2026-05-21「模型分派 agent-level」決策：結構化提取用 haiku、流程/編排用 sonnet、架構級推理用 opus。
> mock 品質會傳導到 static（mock 是 static 的 Layer A 輸入），但 mock 限定為「忠實抄寫、不推測」，haiku 足夠；真正判斷壓力在 static，由 opus 吸收。

### 並行拓樸

```
esp-verify-spec
  ├─ 並行批次：[esp-vspec-mock, esp-vspec-e2e]
  │             ↓ Gate
  ├─ esp-vspec-static（依賴 mock）
  │             ↓ Gate
  └─ esp-vspec-report（依賴 static + e2e）
                ↓
       diff_rate > 10%？→ 詢問 → y: start-analysis mode B/A；n: 結束
```

### 關鍵設計決策

- **不在 start-analysis DAG**：不讀 runs.md gate，自行 harness init
- **不修改既有分析文件**：report 只寫 `SD-review.md`
- **兩階段握手 Gate**：寫入端回讀驗證 + 收受端確認上游 done 才開工
- **差異率門檻**：`diff_rate = (❌+⚠️) / 總條目`；>10% 才詢問重產
- **E2E 軌條件**：僅 `module=esp-system-ui` 且 `.xhtml` 進入點；環境不可用走降級（confidence=low）
- **Harness 路徑**：primary `P:\MEMORY\projects\esp\harness\<run_id>\`；fallback `.kiro/harness/<run_id>/`
- **run_id 格式**：`YYYYMMDD-HHmm-verify-<feature>`（+08:00）

### verify-run State Schema

state.json 位於 `<harness_path>/<run_id>/state.json`，stages：`mock` / `e2e` / `static` / `report`。
每個 stage 含：`status`、`started_at`、`ended_at`、`confidence`、`handoff_in`、`handoff_out`、`gate_passed`、`pending_review`、`retry_count`。
`report` stage 額外含：`diff_rate`（float）、`sd_review_path`。

### Handoff 命名

| Handoff | 寫入方 | 讀取方 |
|---------|--------|--------|
| `handoff-init-to-mock.md` | orchestrator | esp-vspec-mock |
| `handoff-init-to-e2e.md` | orchestrator | esp-vspec-e2e |
| `handoff-mock-to-static.md` | esp-vspec-mock | esp-vspec-static |
| `handoff-e2e-to-report.md` | esp-vspec-e2e | esp-vspec-report |
| `handoff-static-to-report.md` | esp-vspec-static | esp-vspec-report |
