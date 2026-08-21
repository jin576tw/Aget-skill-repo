---
name: start-plan
description: "Research and split a feature into executable cross-session tasks stored in one shared plan-board handover. Use when the user invokes /start-plan or $start-plan, asks to plan multi-repo work before implementation, wants task IDs for separate sessions, requests plan status, or wants compatible legacy handovers consolidated."
---

# Start Plan

Create one confirmed plan-board handover per plan. Keep project repositories read-only during planning and make each planned task directly executable by `start-work --task` without another plan phase.

## Inputs

Accept one of these forms:

- `start-plan <requirement>` — research and draft a new plan.
- `start-plan --status <plan-id>` — read and summarize an existing plan board.
- `start-plan --migrate-handovers <plan-id>` — consolidate user-approved legacy handovers after showing the source-to-target mapping.

Read `P:\MEMORY\handovers\handovers.md`, `P:\MEMORY\AGENTS.md`, project instructions, relevant specs, and every matching handover before planning. Treat local specs and source as authoritative over Memory.

## Planning Workflow

1. Run the plan formatter and bounded code reading in read-only mode. For multiple repositories, inspect each independently when their ownership boundaries do not overlap.
2. Run the DoR gate. Explicitly compare the current request with approved specs; a direction conflict is blocking even when a spec exists.
3. Ask only the single highest-impact unresolved question. Repeat one question at a time until the DoR passes.
4. Split work by independently verifiable ownership boundaries. Prefer repo or service ownership; split further only when tasks have independent acceptance evidence and no shared-file ownership. Default to `Execution-Mode: single-session`; when a real integration run cannot safely fit one session, use `checkpointed` with a stable Claim-ID, explicit milestone evidence, and a bounded `Session-Budget`.
5. Record both scheduling priority (`P0`, `P1`, `P2`) and hard `Depends-On` edges. Priority chooses among runnable tasks and never overrides a dependency. Add one `INTEGRATION` checker-only task depending on every artifact/runtime prerequisite, including frontend availability when UI is required.
6. Assign a readable plan ID: `{ticket-or-feature}-P{NN}`. Scan matching plan boards and increment `NN`; never reuse an existing plan ID for a different contract.
7. Assign task IDs as `{plan-id}:{UPPER-KEBAB-TASK}`, such as `ESP-PM-0001-P01:BACKEND`.
8. Render a preview containing the goal, task board, dependencies, locked task contracts, agents, tests, the one target handover path, and copy-ready `start-work --task` commands.
9. Output `WAITING_FOR_PLAN_CONFIRMATION` and stop. Do not modify branches, specs, code, or handovers before explicit confirmation.
10. After confirmation, delegate exactly one plan-board write to Honey plan-board mode. Validate it with `scripts/plan-board.ps1 -Action Validate`, commit/push only that handover, and return `PLAN_BOARD_READY` with the path and commands.

## Plan Board Contract

Use [references/plan-board-template.md](references/plan-board-template.md). Maintain these invariants:

- One shared handover file per plan: `{workspace-prefix}--{normalized-plan-id}.md`.
- One task row and one uniquely marked task block per task.
- Check `[x]` only when task status is `completed`.
- Keep the locked contract immutable; hash its normalized UTF-8 content and store `Contract-SHA256`.
- Update only the selected task row and mutable progress block. A checkpointed task may write multiple in-progress checkpoints with the same Claim-ID.
- Store no credentials, personal data, production endpoints, internal hosts, process IDs, temp log paths, transcripts, or session metrics in a plan board.
- Treat mock evidence as simulation. Do not mark runtime integration complete when material runtime evidence is unavailable.

## Agents and Tests

Record the exact execution route in each task contract:

- Spec changes: `spec-writer` with `spec-conventions`.
- Frontend tests: `frontend-unit-test-writer`; Angular or Vue skill selected by the repo.
- Backend tests: `backend-unit-test-writer`; Java uses `java-testing` and MockMvc where applicable.
- Implementation: `implementer` after a failing test.
- Review: `code-reviewer` after each acceptance item.
- UI integration: `test-writer` with `playwright-patterns`.
- Final integration: checker-only; route failures back to the owning task ID.
- Keep unit/component tests with their owning implementation task. Put cross-repository, real UI/API, or environment-coupled tests in `INTEGRATION`; do not force them into an unrelated maker session.

## Status and Updates

Use `scripts/plan-board.ps1` for deterministic lookup, validation, status, claims, and progress updates. Each state change must use the plan mutex and, in live mode, commit/push only the shared handover.

Status must compute the highest-priority runnable task from tasks whose dependencies are completed. A lower-priority task can run concurrently only when it has no dependency edge and does not share file ownership or a runtime fixture with the selected task.

Valid task states are `ready`, `waiting`, `in_progress`, `blocked`, `completed`, and `superseded`. Return:

- `TASK_ALREADY_COMPLETED` for completed work.
- `TASK_ALREADY_CLAIMED` when another claim owns an in-progress task.
- `TASK_DEPENDENCY_BLOCKED` when prerequisites are incomplete.
- `TASK_CONTRACT_BLOCKED` when the task block or hash is invalid.
- `INTEGRATION_RUNTIME_BLOCKED` when mock/local evidence cannot support a real runtime claim.

## Legacy Consolidation

Consolidate only handovers with the same goal. First produce a mapping of every source goal, status, decision, verification result, and blocker into the new plan board. Preserve verified branches, commits, test conclusions, accepted constraints, and remaining gaps; drop stale runtime details and prohibited data.

Write and validate the new plan board in one commit. Delete user-approved superseded source handovers only in a later, separate path-scoped commit so Git remains a recovery point. Never merge unrelated tooling or feature goals merely because they share a workspace prefix.
