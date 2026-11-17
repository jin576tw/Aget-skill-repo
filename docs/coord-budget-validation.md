# COORD dispatch budget validation

2026-11-17. Minimal extension of the existing plan-board update path; no new action, scheduler, billing tracker, process killer or scan connector.

## Decisions and coverage

| Handover item | Decision and evidence |
|---|---|
| Budget before dispatch | Gate entry to in_progress and atomically persist Budget with claim. Tests reject missing/invalid budgets without writing, accept unknown token/cost estimates and zero repair rounds. |
| Progress/time control | Keep original startedAt on blocked resume; show 80%/expiry hints. Tests reject expired resume and preserve clock on authorized extension. COORD handles reporting and stopping the host. |
| Board root | Add resolved path and handovers hint to PLAN_NOT_FOUND. No search or automatic root change. |
| Claim/attempt | Preserve claim ownership; keep attempt and used repair rounds in progress/evidence. Released claim needs explicit budget on relaunch; no new attempt API. |
| Validation environment | Skill requires preflight of local tools and records unavailable checks as unverified. No environment provisioning. |
| Process cleanup | Skill requires ownership evidence and cleanup of this attempt's processes. No bulk termination. |
| Delivery clarity | Skill separates decisions/approval from reference material and states purpose/status. |
| Scan dependency | Skill checks service/license/owner before launch; unavailable scan stays unverified unless explicit waiver is recorded. No scan orchestration. |
| Goal-state error | Keep INVALID_GOAL prefix; report pending/pass/blocked and required goal fields. Dedicated regression assertion. |

Budget belongs in mutable progress, not locked contract. It survives updates; changed values and reasons remain in History. Legacy boards stay readable, legacy active tasks can report and complete. Wave candidates retain their resource-only meaning. Authorization text is a reference, not machine-verified approval. Repair counts and actual usage remain COORD responsibilities; releasing a claim must not be used to evade the approved task budget.

## Executed checks

- Full npm test: 88/88 passed before the final review fixes.
- After review fixes: node --test tests/board.test.mjs: 20/20 passed, including literal dollar replacement characters and released-claim/legacy-blocked cases.
- Memory suite: 29/29 passed as part of the full regression.
- npm run check: 35 skills, syntax/manifests/links pass; git diff --check pass before adding this record, repeated at release.

## Independent Claude check

One user-approved Sonnet 5.5/medium call, safe-mode, explicit system prompt, no tools, no retries. Three model scenarios: valid budget with unknown estimates accepted; missing/invalid budget rejected; expired blocked resume rejected while legacy active reporting/completion remains allowed. These are text-based model checks, not live host execution.

Claude's material finding was String.replace interpreting dollar sequences in supplied verification/evidence. Replaced dynamic data-bearing replacements with callbacks; regression verifies exact preservation of budget, claim, summary and evidence. Also aligned the skill's fixed two-round wording with maxRepairRounds and made model escalation follow budget authorization. Other suggestions were optional noise reduction, not additional framework work. No second paid review was run after these fixes.

Observed CLI usage: 23,470 cache-creation input + 2 input + 10,233 output = 33,705 tokens; 81.282 seconds; list-price estimate USD 0.196214. This is not subscription debit or quota percentage. Five-minute process timeout, one turn/call; the CLI dollar-budget flag was not proven as a subscription hard cap.

## Installation and limits

Install through the existing setup implementation with a temporary source overlay: preserve currently installed unrelated files and the local plan-coord contact supplement; replace only this change's runtime, skills and evidence. Verify SETUP_CURRENT with no changes/removals against that overlay, byte hashes, and an installed CLI smoke. A plain repo-source check may still report the preserved pre-existing differences. Do not publish the unrelated spec-reviewer working-tree change.

No live multi-session dispatch, actual token enforcement, external scan, nginx validation or force-stop was performed or claimed. Those are environment/host responsibilities. New sessions are needed to observe newly installed skill definitions; existing-session reload is unverified.
