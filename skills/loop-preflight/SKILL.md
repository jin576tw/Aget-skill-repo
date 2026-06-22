---
name: loop-preflight
description: Preflight check for /loop command format. TRIGGER when the user mentions /loop and hasn't confirmed format, asks "how to write it", or the prompt appears to be missing required fields. Validates interval, prompt/command, stop condition, and write safety. Outputs a 3-level checklist plus a corrected command ready to copy.
---

# loop-preflight

`/loop` 指令格式預檢。在使用者使用 `/loop` 前確認 prompt 格式正確，避免 interval 太短燒 token 或無停止條件造成無限迴圈。

## 觸發時機（TRIGGER）

- 使用者提到 `/loop` 且尚未確認格式
- 使用者詢問「/loop 怎麼寫」、「幫我寫一個 /loop」
- 使用者貼出的 `/loop` prompt 疑似缺少必要欄位

## 背景知識

**語法**：`/loop <interval> [prompt 或 slash command]`

**限制**：
- Session-scoped：關閉 session 即消失，不會自動補跑
- Interval 建議 ≥ 5m；短於 5m 每小時可觸發 12 次以上，token 成本高
- 涉及寫入（commit/push/覆寫檔案）前，先以唯讀模式試跑確認輸出正確
- 最低版本需求：Claude Code v2.1.72+

## 執行步驟

1. 要求使用者提供（或直接分析已給出的）/loop 指令草稿
2. 對照下列 4 項檢查清單逐一評分
3. 輸出評分結果
4. 產出修正後的完整指令供複製貼上

## 檢查清單（4 項）

| # | 項目 | 說明 | 判斷標準 |
|---|------|------|---------|
| 1 | **interval** | 時間間隔是否存在且合理 | `❌` 未指定；`⚠️` 小於 5m（過短）；`✅` ≥ 5m（≥ 10m 更佳） |
| 2 | **prompt/command** | 是否有明確要執行的動作 | `❌` 完全沒有；`⚠️` 太模糊無法執行；`✅` 有具體 slash command 或清楚的任務描述 |
| 3 | **停止條件** | 是否說明何時該手動停止 | `⚠️` 未說明（session 結束自動消失，但建議明示）；`✅` 有明確條件或「完成後手動停止」說明 |
| 4 | **寫入安全** | 若涉及寫入/commit/push | 不涉及寫入則跳過；`⚠️` 有寫入操作但未先唯讀試跑；`✅` 先唯讀試跑或明確標示此為預期行為 |

**判斷等級**：
- `✅` 通過
- `⚠️` 警告（建議補充，不會造成錯誤但可能有風險）
- `❌` 缺失（必填，需修正後再執行）

## 輸出格式

```
## /loop preflight 結果

| 項目 | 狀態 | 說明 |
|------|------|------|
| interval | ✅/⚠️/❌ | ... |
| prompt/command | ✅/⚠️/❌ | ... |
| 停止條件 | ✅/⚠️/❌ | ... |
| 寫入安全 | ✅/－/⚠️ | ... |

**結論**：（全部通過 / 有 N 項需修正）

**修正後指令**（可直接複製）：
```
/loop <interval> <prompt>
```
```

## 範例

### 反例（不完整）
使用者輸入：`/loop /todo`

結果：
- interval `❌` — 未指定間隔
- prompt `✅` — `/todo` 為有效指令
- 停止條件 `⚠️` — 未說明
- 寫入安全 `－` — 不涉及寫入

修正後：`/loop 30m /todo`（並說明：完成後請手動輸入 `/loop clear`）

### 正例（完整）
使用者輸入：`/loop 10m 重新執行測試並回報新 failing tests，若全部通過請提醒我手動停止`

結果：
- interval `✅` — 10m 合理
- prompt `✅` — 任務清楚
- 停止條件 `✅` — 有明示
- 寫入安全 `－` — 不涉及寫入
