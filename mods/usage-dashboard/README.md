# usage-dashboard

Claude Code Mod：在提示框上方顯示用量。需 Claude Code 2.1.287 以上（CLI 與 Desktop Code 分頁）。

## 載入

- Aget setup：`setup-work.mjs --scope user ... --mods`（寫入 `CLAUDE_CODE_PLUGIN_DIRS`）
- Aget marketplace：`/plugin install usage-dashboard@aget`
- 單次 CLI：`claude --plugin-dir <本資料夾>`
- Desktop／SDK 常駐：在 `~/.claude/settings.json` 的 `env` 設 `CLAUDE_CODE_PLUGIN_DIRS=<本資料夾>`
- 確認已啟用：提示框上方出現 `Context` 列；`/usage-dashboard` 會切換顯示或隱藏。載入錯誤會出現在 transcript 的灰字或 `claude --debug` 的紀錄。

## 欄位與限制

| 欄位 | 來源 | 限制 |
| --- | --- | --- |
| Context | `$.session.usage().context` | 首筆回應前沒有 `tokens`，會顯示「等待首筆用量」 |
| 5 小時／7 天額度（其他 kind 顯示原名） | `rateLimits[].percentUsed`、`resetsAt` | 只有百分比，**沒有剩餘 token 數**；API key 登入時為空 |
| Session 費用 | `cost.usd` | 按 API 牌價累計，不是訂閱方案的餘額 |

更新時機：`session.start`、`session.measure`（引擎推送）、主對話的 `turn.complete`。另有每 60 秒一次的計時器，只更新重置倒數。時區在啟動時用 `date +%z` 取得。不讀取憑證、不發網路請求，也不呼叫模型。

## 開發

```sh
claude plugin validate .
claude plugin test .
```
