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

## 工作目標
<goal>

## 計畫完成條件
<plan-level Done: required deliverables, integration evidence and who signs off the whole plan>

## 協調規則
<COORD identity, board writer, wave dispatch allowed or not, escalation path and shared resources outside any single task>

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
<!-- START-PLAN:CONTRACT:IMPLEMENT:END -->
<!-- START-PLAN:PROGRESS:IMPLEMENT:BEGIN -->
- Summary: 尚未開始
- Evidence: 無
<!-- START-PLAN:PROGRESS:IMPLEMENT:END -->
<!-- START-PLAN:TASK:IMPLEMENT:END -->
```

`Resources`、`Sign-off`、`Stop` 為選填，寫在 contract 內，因此鎖定後同受 hash 保護。status 只把 ready、依賴完成、`Sign-off: none`、`Resources` 已宣告且未與進行中或同波任務重疊的任務列入 `wave_candidates`；缺欄位視為未知而不入波，原因列在 `wave_excluded`。是否跨多次 checkpoint、能否隔離仍由 COORD 判斷。計畫完成條件與協調規則位於 contract 外，變更時在 progress 留紀錄。

update 會把舊 progress 壓成一行移入 `- History:`（新到舊），不再覆蓋先前證據。

舊版附帶 Execution-Mode／Session-Budget／Worker 等欄位可讀且 hash 保持，不要求新計畫加入。修改 locked contract 須有明確需求變更依據，不能藉更新狀態偷改。

任務資訊按 [Execution Brief](../../start-work/references/execution-brief.md) 準備，可引用既有 spec 而不複製全文。新增欄位提供撰寫提示，不改變舊 board 的必要欄位或 hash 規則；既有 locked contract 不為套用新版範本而重寫。
