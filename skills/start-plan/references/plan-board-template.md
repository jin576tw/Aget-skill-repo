# Shared Plan Board Template

Replace every `<placeholder>`. Use one task block per task and keep marker names identical to the uppercase task key.

```markdown
# Plan Board — <PLAN-ID>

- Handover-Type: plan-board
- Workspace: `<resolved-workspace-path>`
- Workspace-Prefix: `<workspace-prefix>`
- Plan-ID: <PLAN-ID>
- Plan-Status: active
- Plan-Revision: 1
- Updated: `<ISO-8601 timestamp with timezone>`

## 工作目標

<confirmed goal>

## 任務進度

| Done | Task | Status | Claim | Revision | Updated |
|---|---|---|---|---:|---|
| [ ] | BACKEND | ready | - | 0 | - |
<!-- Optional INTEGRATION task: add only when end-to-end evidence is needed that no single task's own acceptance evidence can produce (shared/changed contract, cross-repo behavior or message-consistency requirement, shared runtime). Cross-repo/cross-task structure alone is not a trigger. -->

<!-- START-PLAN:TASK:BACKEND:BEGIN -->
## Task: BACKEND

- Status: ready
- Claim-ID: -
- Task-Revision: 0
- Contract-SHA256: <sha256-of-normalized-locked-contract>

### Locked Contract
<!-- START-PLAN:CONTRACT:BACKEND:BEGIN -->
- Objective: <task objective>
- Priority: P0
- Depends-On: NONE
- Execution-Workflow: governed-start-work
- Execution-Mode: single-session
- Session-Budget: 1 session
- Non-Goals: <explicit exclusions>
- Repository: `<repo path>`
- Branch Rule: <project instruction reference>
- Spec: `<spec path>`
- Acceptance: <Given/When/Then summary>
- Agents: <ordered agent route>
- Tests: <unit/component/integration/e2e requirements>
- Completion Evidence: <required proof>
<!-- START-PLAN:CONTRACT:BACKEND:END -->

### Mutable Progress
<!-- START-PLAN:PROGRESS:BACKEND:BEGIN -->
- Updated: -
- Summary: 尚未開始
- Evidence: 無
<!-- START-PLAN:PROGRESS:BACKEND:END -->
<!-- START-PLAN:TASK:BACKEND:END -->

## 整體決策與限制

<cross-task contracts and confirmed constraints>

## 最終驗收

<integration success criteria and runtime evidence policy>
```
