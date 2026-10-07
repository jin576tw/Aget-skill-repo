# 模型提示對照表維護

`rules/model-profiles.json` 是 Claude Code、Codex 與 consult-codex 派工共用的模型指令來源。它只收短指令；來源文件的操作建議是整理依據，不會覆蓋使用者當輪要求。收錄的模型與來源以 JSON 為準。

## 更新流程

1. 核對來源文件與目前模型 ID，再編輯 `rules/model-profiles.json`。每筆需有錨定的 `match`、`family`、`tier`、短 `directives`、`source` 與 `reviewed` 日期。未知模型保持無動作。
2. 執行 `npm test` 與 `npm run check`，再看 `git diff`。若新增模型，更新 `tests/model-prompt-tune.test.mjs` 的預期 ID 與 tier。
3. 重跑原先的 `node scripts/setup-work.mjs` 指令更新安裝；以同一指令加 `--check` 確認 `SETUP_CURRENT`。Codex 若提示 hook 信任審查，應在 `/hooks` 檢視並信任目前定義。

`hooks/model-prompt-tune.mjs` 在 Claude Code 的 `SessionStart` 注入對照表中 Claude 家族的精簡指引；Claude hook 的 stdin 不提供目前模型，因此只讓模型套用自身型號的一行。Codex 的 `UserPromptSubmit` 提供目前 `model`，hook 只在 session 首次或模型變更時注入該型號指令。狀態只存 session ID 對應的上次模型，不存 prompt。未知模型清除該 session 的 state，之後回到已知模型時重新注入。解析或寫入失敗時 hook 無輸出並讓工作繼續；替換 state 失敗時保留舊 state，並嘗試清除本次暫存檔，檔案系統拒絕清理時仍讓工作繼續。

`node --test tests/model-prompt-tune.test.mjs` 涵蓋正常注入、模型切換、session 隔離、無效輸入與 state 讀寫失敗。rename 拒絕以故障注入重現，不代表原生 Windows 檔案鎖或宿主事件已驗證；這些測試也不衡量 directives 對任務結果的效果。

Hook 只加 context，不改寫使用者輸入，也不能切換模型。模型選用仍由使用者、宿主或派工流程決定；`scripts/model-prompt.mjs <model-id>` 供派工時取得同一份指令。
