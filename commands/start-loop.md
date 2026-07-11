Analyze the user's loop intent from the arguments below and run a full preflight check, then output the validated command.

ARGUMENTS: $ARGUMENTS

---

# /start-loop — Loop 預檢 + 指令產生器

讀取 `$ARGUMENTS` 作為使用者的 loop 意圖描述，執行 6 項預檢，輸出修正後的完整 `/loop` 指令。

**邊界**：`/loop` 是週期性巡檢工具。本 command 不負責 Maker/Checker、不推進開發目標、不取代 `/start-goal`（目標推進請改用 `/start-goal` 產生 Goal Contract）。

## 背景知識

**語法**：`/loop <interval> [prompt 或 slash command]`

**限制**：
- Session-scoped：關閉 session 即消失，不會自動補跑
- Interval 建議 ≥ 5m；短於 5m 每小時可觸發 12 次以上，token 成本高
- 涉及寫入（commit/push/覆寫檔案）前，先以唯讀模式試跑確認輸出正確
- 最低版本需求：Claude Code v2.1.72+

**狀態碼（每輪回報開頭）**：`LOOP_NO_CHANGE`（無變化，一行帶過）/ `LOOP_CHANGED`（附變化摘要）/ `LOOP_BLOCKED`（附原因）/ `LOOP_DONE`（提醒手動 `/loop clear`）

## 執行步驟

1. 分析 `$ARGUMENTS` 的內容
2. 對照 6 項檢查清單逐一評分
3. 輸出評分結果表格
4. 自動產出修正後的完整 `/loop` 指令供複製

## 檢查清單（6 項）

| # | 項目 | 判斷標準 |
|---|------|---------|
| 1 | **interval** | `❌` 未指定；`⚠️` 小於 5m（過短）；`✅` ≥ 5m（≥ 10m 更佳） |
| 2 | **prompt/command** | `❌` 完全沒有；`⚠️` 太模糊無法執行；`✅` 具體 slash command 或清楚任務描述 |
| 3 | **停止條件** | `⚠️` 未說明；`✅` 有明確條件或「完成後手動停止」說明 |
| 4 | **寫入安全** | 不涉及寫入則 `－`；`⚠️` 有寫入但未先唯讀試跑；`✅` 先唯讀試跑或明示預期行為 |
| 5 | **狀態回報格式** | `⚠️` 未要求「有變化才展開」（每輪重複雜訊、燒 token）；`✅` 要求每輪以 `LOOP_NO_CHANGE` / `LOOP_CHANGED` / `LOOP_BLOCKED` / `LOOP_DONE` 開頭 |
| 6 | **完成後停止提醒** | `⚠️` 未提醒（loop 空轉到 session 結束）；`✅` prompt 含「輸出 LOOP_DONE 時提醒使用者手動 `/loop clear`」 |

## 輸出格式

輸出以下結構：

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
/loop <interval> <完整 prompt，含狀態碼回報要求與停止說明>
```

**KB 背景**（供本次 loop 任務期間參考）：
| 項目 | 內容 |
|------|------|
| 適用 skills | {`~/.claude/skills/` 中相關 skill，無則填「無」} |
| lessons-learned 對應段 | {對應段落標題，無則填「無對應段」} |
| 知識庫進度 | {Current Focus，P:\MEMORY 不可用時填「不可用」} |
```

若有 ❌ 項目，在修正後指令中自動補齊缺少的欄位（推斷合理的 interval、補上停止條件與狀態碼要求等）。
若僅有 ⚠️，仍輸出指令但標注建議改善處。
