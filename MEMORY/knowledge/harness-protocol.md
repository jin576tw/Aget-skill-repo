# ESP Harness 協議

> 本協議規範 `start-analysis` orchestrator 與 10 個 worker agents 透過 `P:\MEMORY` 進行任務交握的格式與流程。
>
> 對應的人類可讀規範：`<workspace>\.kiro\prompts\write-spec.md`
> 對應的執行入口：`.kiro/agents/start-analysis.json`（快捷鍵 `Ctrl+Shift+S`）

---

## 1. 目錄結構

```
P:\MEMORY\projects\esp\harness\
├── _template\
│   ├── state.json              # state schema 範本
│   ├── state.schema.json       # JSON Schema 驗證
│   └── handoff-template.md     # handoff 交接書範本
├── _archive\                   # 7 天後 summary.md 歸檔處（按年）
│   └── 2026\
│       └── <run_id>-summary.md
├── runs.md                     # 主清單（最新在上）
└── <run_id>\                   # 單一 run 工作目錄
    ├── state.json              # 當前狀態（single source of truth）
    ├── handoff-init-to-esp-deps.md
    ├── handoff-esp-deps-to-esp-vars.md
    ├── handoff-esp-deps-to-esp-erd.md
    ├── handoff-esp-deps-to-esp-funcs.md
    ├── handoff-esp-{vars,erd,funcs}-to-esp-flow.md
    ├── handoff-esp-flow-to-esp-rules.md
    ├── handoff-esp-rules-to-esp-ui-verify.md
    ├── handoff-esp-{rules,ui-verify}-to-esp-sd.md
    ├── handoff-esp-sd-to-esp-{api-contract,sa}.md
    ├── run-log.md              # 時序事件紀錄（每 stage 一段）
    └── summary.md              # 完成或失敗時產出
```

## 2. run_id 命名規則

格式：`YYYYMMDD-HHmm-<feature>`

- `YYYYMMDD-HHmm`：啟動當下的本地時間（Asia/Taipei）
- `<feature>`：與 `state.json.feature` 一致；只允許 `[A-Za-z0-9_.-]`

範例：`20260518-1620-reissuebyESP`

## 3. 檔案生命週期

```
[啟動] start-analysis 建立 <run_id>/ 目錄
   │   複製 _template/state.json → <run_id>/state.json 並填入欄位
   │   追加一行到 runs.md
   │   建立 <run_id>/handoff-init-to-esp-deps.md
   ▼
[各 stage 執行] worker agent 依序：
   1. 讀 state.json 確認自己的 stage 為 pending/running
   2. 讀對應的 handoff-*-to-<self>.md
   3. 跑 skill 產出 .kiro/docs/.../*.md
   4. 寫 handoff-<self>-to-<next>.md
   5. 更新 state.json：status=done, doc_path, confidence, ended_at
   6. 追加一段到 run-log.md
   ▼
[完成] start-analysis stop hook：
   1. 寫 <run_id>/summary.md
   2. 追加一條 journal/log.md
   3. 更新 projects/esp/status.md
   4. 更新 runs.md 該行 status
   5. 視情況蒸餾 knowledge/lessons-learned.md
   ▼
[7 天後] 下次 start-analysis 啟動時自動清理：
   - summary.md 移至 _archive/<year>/<run_id>-summary.md
   - 刪除 state.json、handoff-*.md、run-log.md
   - 從 runs.md 移除該行
```

## 4. state.json 更新規則

- **single source of truth**：所有 stage 的當前狀態以 state.json 為準
- **原子寫入**：必須「讀全文 → 修改記憶體中物件 → 整檔寫回」，禁止只 append
- **status 流轉**：`pending` → `running` → (`done` | `failed`)；`skipped` 由 orchestrator 在啟動時設定
- **retry_count**：每次失敗 +1，達到 2 後不再重試
- **timestamps**：使用 ISO-8601 含時區（`+08:00`）

## 5. handoff-*.md 規則

- 檔名規則：`handoff-<from>-to-<to>.md`，多個下游時為每個下游各寫一份（內容可相同或精簡）
- 必含章節：`你需要讀` / `關鍵假設` / `待人工確認項` / `信心度`
- 信心度判定：
  - `high`：從程式碼直接可推、無待人工項
  - `medium`：部分推論、1~2 待人工項
  - `low`：多處推論、≥3 待人工項
- 內容應「壓縮」而非「轉貼」— 不重複 .kiro/docs/ 文件中已有內容

## 6. 嚴格未完成判定（C-2）

`start-analysis` 啟動時掃描 `harness/<*>/state.json`：

- 若任一 stage 的 `status` 不為 `done` 或 `skipped` → 該 run 視為**未完成**
- 主動詢問使用者：「發現未完成 run `<run_id>`（`<feature>`，<未完成 stage 數>/10 stages 待完成），是否續跑？(y/n/abandon)」
- `y` → 從 status≠done 的 stage 接著跑
- `n` → 不動，下次啟動再問
- `abandon` → 將該 run 的 state.json 中所有 pending/running stage 改為 `failed`，run 整體標 `partial`，移到 _archive

## 7. 重試策略（E-1）

- 每個 stage 失敗時 `retry_count += 1`
- `retry_count ≤ 2` → orchestrator 自動重 spawn 該 worker agent
- `retry_count == 2` 仍失敗 → status=failed，後續依賴此 stage 的 stages 也標 skipped
- 不依賴的 stages 繼續執行（fail-soft，但只在 DAG 允許時）

## 8. 失敗能見度（E-2）

`summary.md` 失敗段落必含：
- 失敗 stage id 與所在 layer
- 最後一次的 error 摘要（從 state.json 讀）
- **建議補救命令**，例如：
  - `/agent esp-flow` → 手動切到該 worker 重跑
  - `修正 .kiro/agents/esp-flow.json 的 model 欄位後再 /agent start-analysis`

## 9. P:\MEMORY 不可用時的 Fallback

當 `\\tglcifs\personal$\003689\MEMORY` 不可達：
1. orchestrator 將 `state.json.vault_available` 設為 `false`
2. 所有 harness 檔案改寫至 `.kiro/.harness/<run_id>/`（workspace 內）
3. `.kiro/.harness/` 預設加入 `.gitignore`
4. run 結束時 summary.md 提示：
   ```
   ⚠️ P:\MEMORY 不可用，本次狀態存於 .kiro/.harness/<run_id>/。
   恢復連線後請手動執行：
     1. 複製 .kiro/.harness/<run_id>/ 到 P:\MEMORY\projects\esp\harness\
     2. 追加一條到 P:\MEMORY\projects\esp\harness\runs.md
     3. 追加 journal 條目到 P:\MEMORY\journal\log.md
     4. 刪除 .kiro/.harness/<run_id>/
   ```

## 10. 蒸餾規則（run-level / session-level 分工）

> ⚠️ **邊界宣告**：本協議區分兩個層次的蒸餾，不可混為一談。
>
> | 層次 | 觸發點 | 由誰執行 | 寫入目標 |
> |------|--------|---------|----------|
> | **run-level** | 單次分析 run 結束（DAG 跑完或重試耗盡） | `start-analysis` orchestrator | `harness/<run_id>/summary.md` + `harness/runs.md` |
> | **session-level** | 使用者觸發 `/save`、`/clear`、「結束」、「收工」等結束詞 | `/save` prompt（依 `conventions.md` Session 結束協議） | `journal/log.md`、`projects/esp/status.md`、必要時 `knowledge/lessons-learned.md` |
>
> 理由：一次使用者 session 可能跑多個 run；若 orchestrator 在每個 run 結束就自動寫 `journal/log.md` + `status.md`，會造成：
> - 同一 session 多條 log 條目（語意應為一條 session 摘要）
> - `Current Focus` 被 run 自動覆寫、與使用者實際工作焦點脫節
> - 與 `/save` 雙寫衝突

### 10.1 orchestrator run 結束時（run-level）

run 結束時 orchestrator **只**做：

1. **更新 `harness/runs.md`**：
   - 該 run 的 status 從 `running` → `done` / `failed` / `partial`
   - 更新 docs 欄位（如 `9/10`），更新 ended 欄位
   - 操作必須「讀全文 → 修改該行 → 寫回」，不破壞表頭與其他列

2. **寫 `harness/<run_id>/summary.md`**（格式由 `prompts/start-analysis.md` §8 規範）：
   - 末尾必含「下一步」段落，提示使用者「結束今日工作前執行 `/save`」
   - 失敗 run 額外列「失敗 stages 補救建議」（單 worker 重跑指令、續跑指令）

3. **印出 run-level 完成訊息**（**禁用** `Memory has updated!`，那是 `/save` 的訊息）：
   ```
   ✅ Run <run_id> 完成（status: <done|failed|partial>，N/10 stages，M 待人工項）
      summary: <harness path>/summary.md
      runs.md: <harness path>/runs.md
   提醒：今日工作結束前執行 `/save` 完成 session-level 蒸餾。
   ```

> orchestrator **禁止寫入**：`journal/log.md`、`status.md`、`lessons-learned.md`。
> 對應的 `start-analysis.json` 的 `fs_write.allowedPaths` 只允許：`.kiro/docs/**`、`P:/MEMORY/projects/esp/harness/**`、`.kiro/.harness/**`。

### 10.2 使用者 `/save` 時（session-level）

依 `conventions.md` Session 結束協議步驟 2-8。額外針對 ESP 補充：

- **掃 `harness/runs.md`**：找出本日（`YYYY-MM-DD`）所有 status 已從 `running` 變為終態（`done` / `failed` / `partial`）的 run
- **彙整為 1~N 條 `journal/log.md` 條目**：
  - 同一 feature 的多次 run 合併為一條
  - 條目格式：
    ```
    [<ISO with .SSS+08:00>][ESP] <feature> 完成全套分析（N 份文件，M 待人工項，run-id: <id>）
    ```
  - 失敗 run 改為：
    ```
    [<ISO>][ESP] <feature> 分析失敗於 <stage>（<error 摘要>，run-id: <id>）
    ```
- **更新 `status.md`**：
  - `Done this week`：本日完成的 run 各加一行（最新在上）；自動移除 7 天前條目
  - `Current Focus`：依使用者實際工作脈絡更新（不單純依 run 結果）
  - `Next Actions`：依使用者實際待辦更新
- **蒸餾教訓**（選擇性）：失敗模式、新發現的技術陷阱 → `knowledge/lessons-learned.md`
- **顯示** `Memory has updated!`

> 若本日無 harness run 完成，session-level 蒸餾依 `conventions.md` 一般流程執行（不掃 runs.md）。

## 11. 嚴守協議邊界

- 本協議**不取代** `.kiro/steering/session-memory.md`，僅補充自動化路徑下的執行細節
- 本協議**不修改** `knowledge/conventions.md` 既有「Session 結束協議」格式；§10.2 是針對 ESP 補充「掃 runs.md 彙整 log 條目」的執行細節，不更動既有步驟編號與通用流程
- 本協議**不寫入** P:\MEMORY 中的敏感資訊（帳密、IP、URL、個資）— 蒸餾時若發現須自動遮蔽
- **run-level 與 session-level 嚴格分工**（見 §10）：orchestrator 不寫 `journal/log.md` / `status.md` / `lessons-learned.md`，避免和 `/save` 重複寫入或誤覆寫使用者實際工作焦點
- 若協議與既有 `conventions.md` / `session-memory.md` 衝突，以後者為準

---

## 變更紀錄

| 日期 | 變更 |
|------|------|
| 2026-05-18 | 初版（隨 write-spec Harness 化重構建立） |
| 2026-05-19 | §10 重構為 run-level / session-level 分工；orchestrator 不再寫 journal/log.md 與 status.md，session-level 蒸餾交回 `/save`；§11 補強邊界條款 |
