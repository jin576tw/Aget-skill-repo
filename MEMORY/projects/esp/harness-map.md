# ESP Harness Map

> 目的：把 ESP Harness 的固定骨架寫成可重用知識，讓新 session 或新 agent 不必再從 prompt 與 run artifact 反推整個模型。

## 何時先讀

- 任務涉及 `start-analysis` orchestrator、worker handoff、`runs.md`、`state.json`、`.kiro/.harness/` fallback。
- 需要判斷某個異常是 run-level 問題還是 session-level 蒸餾問題。
- 需要知道哪一份檔案才是進度、交接、完成摘要的權威來源。

## 固定模型

- ESP Harness = `start-analysis` orchestrator + 10 個 worker stages 的多代理分析骨幹。
- Harness 只管理 **run-level** 狀態與交接，不直接承擔 **session-level** 知識蒸餾。
- `P:\MEMORY\projects\esp\harness\<run_id>\` 是 run artifact 主路徑；`P:\MEMORY` 不可用時才 fallback 到 workspace 內 `.kiro/.harness/<run_id>/`。

## 建議讀取順序

1. 先讀本頁，建立角色與邊界模型。
2. 再讀 `knowledge/harness-protocol.md`，看完整協議與寫入限制。
3. 需要看當前進度時讀 `projects/esp/harness/runs.md`。
4. 需要看單次 run 細節時再下鑽 `state.json`、`handoff-*.md`、`summary.md`。
5. 需要知道今日工作進度時才讀 `projects/esp/status.md`。

## Artifact Roles

- `projects/esp/harness/runs.md`：全部 run 的主清單；回答「最近跑了哪些 run、終態是什麼」。
- `projects/esp/harness/<run_id>/state.json`：single source of truth；回答「每個 stage 現在在哪個狀態」。
- `projects/esp/harness/<run_id>/handoff-*.md`：壓縮版交接；回答「下游 worker 被要求帶著哪些前提繼續做」。
- `projects/esp/harness/<run_id>/run-log.md`：run 內時序事件；回答「這個 run 途中發生過什麼」。
- `projects/esp/harness/<run_id>/summary.md`：run 結尾摘要；回答「這次分析最後完成了什麼、卡在哪裡、下一步是什麼」。

## 不變條件

- `state.json` 永遠是 run 內 stage 狀態的唯一權威來源，不能用 `runs.md` 取代。
- orchestrator 只能寫 run-level artifact，不得直接寫 `journal/log.md`、`projects/esp/status.md`、`knowledge/lessons-learned.md`。
- `/save` 才能把 run 的終態提升到 session-level 的 `journal/log.md` 與 `status.md`。
- `handoff-*.md` 必須是壓縮資訊，不應把 `.kiro/docs/` 內容整份轉貼。
- fallback 目錄只是一時暫存，不是知識沉澱位置；恢復後應回補到 `P:\MEMORY` 正式路徑。

## 生命周期模板

1. orchestrator 建立 `<run_id>/state.json` 與第一份 handoff。
2. worker 依 DAG 讀 state + handoff，產出 `.kiro/docs/.../*.md`。
3. worker 回寫 stage 狀態與新的 handoff。
4. orchestrator 更新 `runs.md`，寫 `summary.md`，提示使用者若要完成 session 蒸餾需執行 `/save`。
5. session 結束時，`/save` 依 `runs.md` 與 `summary.md` 決定是否更新 `journal/log.md`、`status.md`、`lessons-learned.md`。

## 典型判斷規則

- **只想看 run 進度**：先看 `runs.md`，再看對應 run 的 `state.json`。
- **想知道某個 worker 為何這樣做**：看進入該 worker 的 `handoff-*.md`。
- **run 完成但 status 沒更新**：通常不是 bug；這代表 `/save` 尚未把 run-level 結果升到 session-level。
- **看到 `.kiro/.harness/` 有資料**：先判斷是否因 `P:\MEMORY` 不可用而 fallback，不要直接當成正式知識來源。
- **需要確認可寫路徑**：以 `knowledge/harness-protocol.md` 與 `start-analysis.json` 的 `fs_write.allowedPaths` 為準。

## 常見問題

- **run-level 與 session-level 最容易混淆的是什麼？** → `summary.md` 完成不等於 `status.md` 已更新；後者仍要靠 `/save`。
- **哪裡看單次 run 最後失敗原因？** → 先看 `<run_id>/summary.md`，再回查 `state.json` 與 `run-log.md`。
- **如果想補新的固定知識，應寫哪裡？** → run-specific 規則寫本頁或 `harness-protocol.md`；只屬於單次 run 的資訊留在 `<run_id>/summary.md`。