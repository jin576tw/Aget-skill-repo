---
name: goal-preflight
description: Preflight check for /goal command format. TRIGGER when the user mentions /goal and hasn't confirmed format, asks "how to write it", or the condition appears vague/incomplete. Validates the 5-element framework (tool + task + result + constraints + safety valve). Outputs a 3-level checklist plus a corrected condition ready to copy.
---

# goal-preflight

`/goal` 指令格式預檢。在使用者使用 `/goal` 前確認條件（condition）格式正確，避免 evaluator 腦補「完成」的標準或條件永遠不成立時無限燒 token。

## 觸發時機（TRIGGER）

- 使用者提到 `/goal` 且尚未確認條件格式
- 使用者詢問「/goal 怎麼寫」、「幫我寫一個 /goal」
- 使用者貼出的 `/goal` 條件太模糊或缺少必要欄位

## 背景知識

**語法**：`/goal <condition>`

**evaluator 機制**：
- 每輪結束由小型快速模型（預設 Haiku）讀取 Claude 的對話輸出，判斷條件是否達成
- evaluator **不執行指令、不讀檔案**，只能根據 Claude 已在對話裡呈現的內容判斷
- 因此條件必須能被「輸出文字」所驗證，不能只靠 Claude 口頭說「完成了」

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
2. 對照下列 5 項檢查清單逐一評分
3. 輸出評分結果
4. 產出修正後的完整條件供複製貼上

## 檢查清單（5 項）

| # | 項目 | 說明 | 判斷標準 |
|---|------|------|---------|
| 1 | **工具/agent** | 是否指定誰來執行並產出可查的輸出 | `❌` 未指定工具（evaluator 只能靠 Claude 嘴說，無依據）；`✅` 有明確工具或 agent（如 `test-writer`、`gate-keeper`、`/todo`） |
| 2 | **任務範圍** | 是否說明做什麼、查哪裡 | `❌` 完全模糊；`⚠️` 範圍不明確；`✅` 有具體動作與範圍（如「針對 AC-01~05」） |
| 3 | **具體結果** | 最後輸出長什麼樣才算完成 | `❌` 沒有可驗證的輸出描述；`⚠️` 描述模糊；`✅` 有具體可核對的文字（如「輸出顯示『未完成項目：0』」） |
| 4 | **限制條款** | 是否說明過程中不能動什麼 | `⚠️` 未說明（多輪推進後範圍可能跑掉）；`✅` 有明確限制（如「不修改 spec 檔案」） |
| 5 | **停損子句** | 是否加上「或 N 輪後停止」 | `❌` 完全沒有（條件若不可能成立則無限燒 token）；`✅` 有明確輪數上限（如「或 20 輪後停止」） |

**判斷等級**：
- `✅` 通過
- `⚠️` 警告（建議補充，不會造成錯誤但有風險）
- `❌` 缺失（必填，需修正後再執行）

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

**結論**：（全部通過 / 有 N 項需修正）

**修正後條件**（可直接複製）：
```
/goal ...完整條件...
```
```

## 範例

### 反例（過於模糊）
使用者輸入：`/goal 完成所有待辦事項`

結果：
- 工具/agent `❌` — 未指定工具，evaluator 無從判斷
- 任務範圍 `⚠️` — 「所有待辦」不明確
- 具體結果 `❌` — 沒有可核對的輸出
- 限制條款 `⚠️` — 未說明
- 停損子句 `❌` — 未設上限

修正後：
```
/goal 重新執行 /todo，輸出顯示「未完成項目：0」，
且過程中不修改任何 spec 文件，或 10 輪後停止
```

### 正例（完整框架）
使用者輸入：
```
/goal test-writer 針對 AC-01~05 產生測試，
最後一次執行結果全部 PASS，
過程中不修改 spec，或 25 輪後停止
```

結果：
- 工具/agent `✅` — `test-writer` 明確
- 任務範圍 `✅` — AC-01~05 明確
- 具體結果 `✅` — 「全部 PASS」可核對
- 限制條款 `✅` — 不修改 spec
- 停損子句 `✅` — 25 輪上限
