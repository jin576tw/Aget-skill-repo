---
name: gate-keeper
description: Step 0 / Step 8 workflow gate skill. TRIGGER when 使用者需要檢查 Definition of Ready、Open Questions、驗收條件（DoD）、是否可進入 /plan、或是否可進入收尾。提供 DoR / 驗收條件（DoD）/ human checkpoint 規則，不直接寫程式碼。
---

# Gate Keeper

本 skill 提供 md 工作流的守門規則，涵蓋 Step 0 與 Step 8。

使用以下文件：

- [dor-checklist.md](dor-checklist.md) — 開發前檢查
- [open-questions.md](open-questions.md) — OQ 格式與阻擋原則
- [human-checkpoints.md](human-checkpoints.md) — 何時必須人工介入
- [dod-checklist.md](dod-checklist.md) — 收尾與合併前檢查

## 用途

- 在 `/start-work` 啟動後先檢查需求是否可進入 Step 1 / `/plan`
- 在流程中遇到不確定決策時，判斷是否需要停下來問答確認
- 在所有 AC 完成後，檢查是否可進入收尾與合併

## Guardrails

- 本 skill 只提供規則與輸出格式，不直接充當獨立 agent
- 遇到會影響商業規則、API contract、資料流或測試預期的不明處時，不可自行假設
- `P:\MEMORY` 只作為背景輔助，不可取代本地 spec、instructions 與原始碼
- Step 7 是否建立共享 Playwright harness，必須以問答方式取得使用者確認
- `/plan` 產出後必須先停在計畫確認點，得到使用者確認後才可進入 Step 3

## Required Output

- DoR 結果：可開始 / 待確認 / 不可開始
- Open Questions 清單（若有）
- Human checkpoint 類型與需要確認的事項
- 驗收條件結果：可收尾 / 待補項目
