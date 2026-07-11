---
name: loop-preflight
description: Preflight check for /loop command format. TRIGGER when the user mentions /loop and hasn't confirmed format, asks "how to write it", or the prompt appears to be missing required fields. Validates interval, prompt/command, stop condition, write safety, status report format (LOOP_NO_CHANGE/CHANGED/BLOCKED/DONE), and stop reminder. Outputs a checklist plus a corrected command ready to copy.
---

# loop-preflight

`/loop` 指令格式預檢。在使用者使用 `/loop` 前確認 prompt 格式正確，避免 interval 太短燒 token、無停止條件造成無限迴圈、或每輪重複輸出無變化的雜訊。

**邊界**：`/loop` 是週期性巡檢工具。loop-preflight 不負責 Maker/Checker、不推進開發目標、不取代 `/start-goal`（目標推進請用 `/start-goal` 產生 Goal Contract）。

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

**狀態碼（每輪回報開頭）**：

| 狀態碼 | 意義 |
|--------|------|
| `LOOP_NO_CHANGE` | 巡檢無變化，一行帶過，不展開細節 |
| `LOOP_CHANGED` | 偵測到狀態變化，附變化摘要 |
| `LOOP_BLOCKED` | 無法取得目標狀態（如 connector 失效），附原因 |
| `LOOP_DONE` | 巡檢目的已達成，提醒使用者手動 `/loop clear` |

## 執行步驟

1. 要求使用者提供（或直接分析已給出的）/loop 指令草稿
2. 對照下列 6 項檢查清單逐一評分
3. 輸出評分結果
4. 產出修正後的完整指令供複製貼上

## 檢查清單（6 項）

| # | 項目 | 說明 | 判斷標準 |
|---|------|------|---------|
| 1 | **interval** | 時間間隔是否存在且合理 | `❌` 未指定；`⚠️` 小於 5m（過短）；`✅` ≥ 5m（≥ 10m 更佳） |
| 2 | **prompt/command** | 是否有明確要執行的動作 | `❌` 完全沒有；`⚠️` 太模糊無法執行；`✅` 有具體 slash command 或清楚的任務描述 |
| 3 | **停止條件** | 是否說明何時該手動停止 | `⚠️` 未說明（session 結束自動消失，但建議明示）；`✅` 有明確條件或「完成後手動停止」說明 |
| 4 | **寫入安全** | 若涉及寫入/commit/push | 不涉及寫入則 `－`；`⚠️` 有寫入操作但未先唯讀試跑；`✅` 先唯讀試跑或明確標示此為預期行為 |
| 5 | **狀態回報格式** | 是否要求「有狀態變化才展開回報」 | `⚠️` 未要求（每輪重複輸出雜訊、燒 token）；`✅` 要求每輪以 `LOOP_NO_CHANGE` / `LOOP_CHANGED` / `LOOP_BLOCKED` / `LOOP_DONE` 開頭，無變化不展開 |
| 6 | **完成後停止提醒** | 目的達成後是否提醒停止 | `⚠️` 未提醒（loop 會空轉到 session 結束）；`✅` prompt 含「輸出 LOOP_DONE 時提醒使用者手動 `/loop clear`」 |

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
| 狀態回報格式 | ✅/⚠️ | ... |
| 完成後停止提醒 | ✅/⚠️ | ... |

**結論**：（全部通過 / 有 N 項需修正）

**修正後指令**（可直接複製）：
```
/loop <interval> <prompt，含狀態碼回報要求與停止說明>
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
- 狀態回報格式 `⚠️` — 未要求
- 完成後停止提醒 `⚠️` — 未提醒

修正後：
```
/loop 30m 執行 /todo，回報以 LOOP_NO_CHANGE / LOOP_CHANGED 開頭，
無新項目時一行帶過；全部待辦完成時輸出 LOOP_DONE 並提醒我 /loop clear
```

### 正例（完整）
使用者輸入：
```
/loop 10m 重新執行測試，回報以 LOOP_NO_CHANGE / LOOP_CHANGED 開頭，
出現新 failing test 才展開細節；全部通過輸出 LOOP_DONE 並提醒我手動停止
```

結果：六項全 `✅`（不涉及寫入，寫入安全 `－`）。
