# Plan board 格式

根據實際目標建立任務，沒有必要時不增加 INTEGRATION。contract hash 是 CONTRACT marker 內文字經換行正規化、trim 後的 SHA256。`node .../plan-board.mjs` 的 hash action 可計算；補入 hash 後 validate。

```markdown
# Plan Board — FEATURE-P01

- Handover-Type: plan-board
- Workspace: `<absolute-workspace>`
- Plan-ID: FEATURE-P01
- Plan-Status: active
- Plan-Revision: 1
- Updated: <timestamp>

## Session Registry

任務 session 先登記 standby，COORD 核對後才放行；登記不取得 claim。

| Plan-ID | Task-ID | Host | Session-ID | Model | State | Updated |
|---|---|---|---|---|---|---|

## 工作目標
<goal>

## 計畫完成條件
<plan-level Done: required deliverables, integration evidence and who signs off the whole plan>

## 協調規則
寫入權限：COORD 專屬寫入範圍為任務狀態、claim、progress、派工與驗收；每個任務 session 明確獲准在 COORD 尚未啟動時新增或更新 Session Registry 中自己的登記列。此登記不需 COORD 預先核准，不受「COORD 唯一 board writer／執行者不寫 board」的概括文字阻擋；不得藉此修改其他列或任務契約。既有 board 若仍使用概括文字，先依使用者已授權的登記流程將協調規則同步為上述範圍；若 locked contract 明文禁止登記則回報具體衝突。
<COORD identity, wave dispatch allowed or not, escalation path and shared resources outside any single task>

| Done | Task | Status | Claim | Revision | Updated |
|---|---|---|---|---:|---|
| [ ] | IMPLEMENT | ready | - | 0 | - |

<!-- START-PLAN:TASK:IMPLEMENT:BEGIN -->
## IMPLEMENT
- Status: ready
- Claim-ID: -
- Task-Revision: 0
- Contract-SHA256: <hash>
<!-- START-PLAN:CONTRACT:IMPLEMENT:BEGIN -->
- Objective: <goal>
- Scope: <repository, files or modules>
- Non-Goals: <excluded changes and behavior to preserve>
- Context: <approved spec/SA, code entry points and accepted decisions>
- Acceptance: <AC and observable expected behavior>
- Tests: <applicable verification, known commands/environment or explicit unknowns>
- Completion Evidence: <required results, evidence locations and task Done>
- Priority: P1
- Depends-On: NONE
- Resources: <exclusive files, working tree or environment, comma-separated; NONE if read-only>
- Sign-off: <none, or who must decide/approve during or before completion>
- Stop: <conditions that halt the task and return it to COORD, e.g. same root cause twice>
- Model: <model id or tier plus one-line reason, e.g. claude-sonnet-5-5（balanced：範圍明確的實作與測試）>
- Effort: <suggested low|medium|high|xhigh|max, or n/a when the model has no effort parameter；依使用者設定執行>
<!-- START-PLAN:CONTRACT:IMPLEMENT:END -->
<!-- START-PLAN:PROGRESS:IMPLEMENT:BEGIN -->
- Summary: 尚未開始
- Evidence: 無
<!-- START-PLAN:PROGRESS:IMPLEMENT:END -->
<!-- START-PLAN:TASK:IMPLEMENT:END -->
```

`Resources`、`Sign-off`、`Stop`、`Model`、`Effort` 為選填，寫在 contract 內，因此鎖定後同受 hash 保護。

- `Model`、`Effort` 是 COORD 依 plan-coord「派工配置」選定的預設，status／validate 的 tasks 會回傳 `model`、`effort`，未填為 `null`。
- 新 board 每個任務都應填寫這兩個欄位。舊 board 缺欄可讀，不為補欄而重寫 locked contract；需要時以 progress 記錄配置。
- `Effort` 是建議值，不阻擋派工；實際採用的模型、effort 與調整理由記在 progress。status 只把 ready、依賴完成、`Sign-off: none`、`Resources` 已宣告且未與進行中或同波任務重疊的任務列入 `wave_candidates`；缺欄位視為未知而不入波，原因列在 `wave_excluded`。是否跨多次 checkpoint、能否隔離仍由 COORD 判斷。計畫完成條件與協調規則位於 contract 外，變更時在 progress 留紀錄。

update 會把舊 progress 壓成一行移入 `- History:`（新到舊），不再覆蓋先前證據。

舊版附帶 Execution-Mode／Session-Budget／Worker 等欄位可讀且 hash 保持，不要求新計畫加入。修改 locked contract 須有明確需求變更依據，不能藉更新狀態偷改。

任務資訊按 [Execution Brief](../../start-work/references/execution-brief.md) 準備，可引用既有 spec 而不複製全文。新增欄位提供撰寫提示，不改變舊 board 的必要欄位或 hash 規則；既有 locked contract 不為套用新版範本而重寫。
