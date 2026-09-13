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
<!-- START-PLAN:CONTRACT:IMPLEMENT:END -->
<!-- START-PLAN:PROGRESS:IMPLEMENT:BEGIN -->
- Summary: 尚未開始
- Evidence: 無
<!-- START-PLAN:PROGRESS:IMPLEMENT:END -->
<!-- START-PLAN:TASK:IMPLEMENT:END -->
```

舊版附帶 Execution-Mode／Session-Budget／Worker 等欄位可讀且 hash 保持，不要求新計畫加入。修改 locked contract 須有明確需求變更依據，不能藉更新狀態偷改。

任務資訊按 [Execution Brief](../../start-work/references/execution-brief.md) 準備，可引用既有 spec 而不複製全文。新增欄位提供撰寫提示，不改變舊 board 的必要欄位或 hash 規則；既有 locked contract 不為套用新版範本而重寫。
