---
name: goal-preflight
description: Preflight check for /goal command format. TRIGGER when the user mentions /goal and hasn't confirmed format, asks "how to write it", or the condition appears vague/incomplete. Validates the 8-element framework (tool + task + result + constraints + safety valve + verifiable stop condition + maker/checker split + human gate). Outputs a checklist, a Goal Contract block, and a corrected condition ready to copy. Rejects unverifiable conditions with GOAL_NEEDS_CONTRACT.
---

# goal-preflight

`/goal` 指令預檢。在使用者使用 `/goal` 前確認條件格式正確且具備 Loop Engineering 防線：機器可驗證停止條件、Maker/Checker 分離、斷路器、Human Gate。避免 evaluator 腦補「完成」標準、無限燒 token、或 loop 自行通過高風險操作。

| 檔案 | 用途 |
|------|------|
| [goal-contract.md](goal-contract.md) | Goal Contract 模板、執行協議全文、狀態碼定義、正反範例 |

## 觸發時機（TRIGGER）

- 使用者提到 `/goal` 且尚未確認條件格式
- 使用者詢問「/goal 怎麼寫」、「幫我寫一個 /goal」
- 使用者貼出的 `/goal` 條件太模糊或缺少必要欄位

## 背景知識

**語法**：`/goal <condition>`

**evaluator 機制**：
- 每輪結束由小型快速模型（預設 Haiku）讀取 Claude 的對話輸出，判斷條件是否達成
- evaluator **不執行指令、不讀檔案**，只能根據 Claude 已在對話裡呈現的內容判斷
- 因此條件必須能被「輸出文字」所驗證；checker 裁決與 rubric 分數必須浮上對話，寫在磁碟的報告 evaluator 看不到

**條件寫作框架**：
```
[工具/agent] 對 [範圍] 做 [動作]，最後一次輸出顯示 [具體結果]，且 [限制條件]，或 N 輪後停止
```

**限制**：
- 最低版本需求：Claude Code v2.1.139+
- `disableAllHooks` 或 `allowManagedHooksOnly` 未被關閉（evaluator 是 hooks 系統的一部分）
- 用量上限到達時不會自動續跑，需手動 continue

## 執行步驟

1. 要求使用者提供（或直接分析已給出的）/goal 條件草稿
2. 對照下列 8 項檢查清單逐一評分
3. 第 6 項 `❌` 時輸出 `GOAL_NEEDS_CONTRACT` 並停止，不產出條件
4. 通過則依 [goal-contract.md](goal-contract.md) 模板輸出 Goal Contract 區塊 + 修正後條件

## 檢查清單（8 項）

| # | 項目 | 判斷標準 |
|---|------|---------|
| 1 | **工具/agent** | `❌` 未指定工具（evaluator 無依據）；`✅` 有明確工具或 agent（如 `test-writer`、`gate-keeper`、`/start-work`） |
| 2 | **任務範圍** | `❌` 完全模糊；`⚠️` 範圍不明確；`✅` 有具體動作與範圍（如「針對 AC-01~05」） |
| 3 | **具體結果** | `❌` 沒有可驗證的輸出描述；`⚠️` 描述模糊；`✅` 有具體可核對的文字（如「輸出顯示『未完成項目：0』」） |
| 4 | **限制條款** | `⚠️` 未說明（多輪推進後範圍可能跑掉）；`✅` 有明確限制（如「不修改 spec 檔案」） |
| 5 | **停損子句** | `❌` 完全沒有（無限燒 token）；`✅` 有明確輪數上限（如「或 10 輪後停止」） |
| 6 | **停止條件可驗證性** | `❌` 無法轉成測試 / build / lint / typecheck / AC / DoD / rubric 分數 / 明確輸出檢查（如「看起來不錯」「盡量修好」）→ 回報 `GOAL_NEEDS_CONTRACT`，不產出條件；`✅` 機器可驗證 |
| 7 | **Maker/Checker 分離** | `⚠️` 未指定獨立 checker（自己做自己驗，self-grading bias）；`✅` 指定 checker 與門檻（如 `code-reviewer rubric 總分 ≥16`、`gate-keeper DoD 通過`）；若走 `/start-work` 則沿用其 reviewer/gate-keeper，不疊加第二層 |
| 8 | **Human Gate** | 不涉及高風險操作則 `－`；`⚠️` 涉及（commit/push/merge/deploy/依賴升版/刪檔/CI 設定/secret）但未聲明門禁；`✅` 明示遇高風險操作輸出 `GOAL_NEEDS_HUMAN_GATE` 並暫停 |

**判斷等級**：`✅` 通過；`⚠️` 警告（建議補充）；`❌` 缺失（需修正後再執行）。

## 輸出格式

```
## /goal preflight 結果

| 項目 | 狀態 | 說明 |
|------|------|------|
| 工具/agent | ✅/⚠️/❌ | ... |
| 任務範圍 | ✅/⚠️/❌ | ... |
| 具體結果 | ✅/⚠️/❌ | ... |
| 限制條款 | ✅/⚠️ | ... |
| 停損子句 | ✅/❌ | ... |
| 停止條件可驗證性 | ✅/❌ | ... |
| Maker/Checker | ✅/⚠️ | ... |
| Human Gate | ✅/⚠️/－ | ... |

**結論**：（全部通過 / 有 N 項需修正 / GOAL_NEEDS_CONTRACT）

## Goal Contract
{依 goal-contract.md 模板填寫}

**修正後條件**（可直接複製）：
```
/goal ...完整條件，含工具、範圍、具體結果、限制、Human Gate、停損子句...
```

**執行協議提醒**：STOP gate 優先於 goal 推進；checker 裁決浮上對話；每輪 append goal-evidence.md。
（全文見 goal-contract.md）
```

若有 `❌`（第 6 項除外），在修正後條件中自動補齊缺少欄位；僅 `⚠️` 則輸出條件並標注建議。
第 6 項 `❌` 一律 `GOAL_NEEDS_CONTRACT`，說明缺口後停止。

## 範例

正反範例（含 GOAL_NEEDS_CONTRACT 反例與完整 Goal Contract 正例）見 [goal-contract.md](goal-contract.md)。
