Analyze the user's goal intent from the arguments below and run a full preflight check, then output the validated command.

ARGUMENTS: $ARGUMENTS

---

# /start-goal — Goal 預檢 + 條件產生器（Loop Engineering 主要落地點）

讀取 `$ARGUMENTS` 作為使用者的 goal 意圖描述，執行 8 項預檢，輸出 Goal Contract 區塊與修正後的完整 `/goal` 條件。

> 詳細規則以 `~/.claude/skills/goal-preflight/` 為準：`SKILL.md`（8 項清單）＋ `goal-contract.md`（Contract 模板、執行協議、狀態碼、範例）。執行本 command 時先讀取這兩個檔案。

## 背景知識

**語法**：`/goal <condition>`

**evaluator 機制**：
- 每輪結束由小型快速模型（預設 Haiku）讀取 Claude 的對話輸出，判斷條件是否達成
- evaluator **不執行指令、不讀檔案**，只能根據對話中已呈現的內容判斷
- 因此 checker 裁決與 rubric 分數必須浮上對話（如 `AC-XX PASS | R:18/20`），磁碟上的報告 evaluator 看不到

**條件寫作框架**：
```
[工具/agent] 對 [範圍] 做 [動作]，最後一次輸出顯示 [具體結果]，且 [限制條件]，或 N 輪後停止
```

**限制**：
- 最低版本需求：Claude Code v2.1.139+
- `disableAllHooks` 或 `allowManagedHooksOnly` 未被關閉（evaluator 是 hooks 系統的一部分）

## 執行步驟

1. 讀取 `~/.claude/skills/goal-preflight/SKILL.md` 與 `goal-contract.md`
2. 分析 `$ARGUMENTS` 的內容，對照 8 項檢查清單逐一評分
3. **第 6 項（停止條件可驗證性）`❌` 時輸出 `GOAL_NEEDS_CONTRACT`，說明缺口後停止，不產出條件**
4. 通過則輸出：評分表格 → Goal Contract 區塊 → 修正後 `/goal` 條件 → 執行協議提醒 → KB 背景

## 檢查清單（8 項）

| # | 項目 | 判斷標準 |
|---|------|---------|
| 1 | **工具/agent** | `❌` 未指定；`✅` 明確工具或 agent（如 `test-writer`、`/start-work`） |
| 2 | **任務範圍** | `❌` 完全模糊；`⚠️` 不明確；`✅` 具體動作與範圍（如「針對 AC-01~05」） |
| 3 | **具體結果** | `❌` 無可驗證輸出；`⚠️` 模糊；`✅` 具體可核對文字（如「輸出顯示『未完成項目：0』」） |
| 4 | **限制條款** | `⚠️` 未說明；`✅` 明確限制（如「不修改 spec 檔案」） |
| 5 | **停損子句** | `❌` 沒有；`✅` 明確輪數上限（如「或 10 輪後停止」） |
| 6 | **停止條件可驗證性** | `❌` 無法轉成測試/build/lint/typecheck/AC/DoD/rubric 分數/明確輸出檢查 → `GOAL_NEEDS_CONTRACT`；`✅` 機器可驗證 |
| 7 | **Maker/Checker 分離** | `⚠️` 未指定獨立 checker；`✅` 指定 checker 與門檻（如 `code-reviewer rubric ≥16`、`gate-keeper DoD`）；走 `/start-work` 則沿用其 reviewer，不疊加第二層 |
| 8 | **Human Gate** | 不涉及則 `－`；`⚠️` 涉及高風險操作（commit/push/merge/deploy/依賴升版/刪檔/CI/secret）未聲明門禁；`✅` 明示遇之輸出 `GOAL_NEEDS_HUMAN_GATE` 暫停 |

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
{依 goal-contract.md 模板：目標、範圍、不做事項、機器可驗證停止條件、
完成證據清單、高風險操作清單、斷路器（最大輪數、連續 3 輪同錯誤、連續 5 輪空 diff）}

**修正後條件**（可直接複製）：
```
/goal ...完整條件，含工具、範圍、具體結果、限制、Human Gate、停損子句...
```

**執行協議提醒**（/goal 執行期間遵循，全文見 goal-contract.md）：
- STOP gate（WAITING_/READY_）優先於 goal 推進，遇之輸出 GOAL_NEEDS_HUMAN_GATE 暫停
- Checker 裁決與 rubric 分數浮上對話供 evaluator 核對
- 每輪 append 一行至 goal-evidence.md；失敗帶回 checker 評語做診斷式修正
- 完成必以 GOAL_DONE + Evidence 區塊宣告；斷路器觸發輸出 GOAL_BLOCKED

**KB 背景**（供本次 goal 執行期間參考）：
| 項目 | 內容 |
|------|------|
| 適用 skills | {`~/.claude/skills/` 中相關 skill，無則填「無」} |
| lessons-learned 對應段 | {對應段落標題，無則填「無對應段」} |
| 知識庫進度 | {Current Focus，P:\MEMORY 不可用時填「不可用」} |
```

若有 `❌`（第 6 項除外），在修正後條件中自動補齊缺少的欄位（推斷合理的 agent、補上停損子句等）。
若僅有 `⚠️`，仍輸出條件但標注建議改善處。
第 6 項 `❌` 一律回報 `GOAL_NEEDS_CONTRACT`，不可開始 loop。
