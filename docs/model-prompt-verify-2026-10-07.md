# 模型提示驗證（2026-10-07，macOS）

接續任務：`model-prompt-tune-verify`。測試期間未修改模型表、全域設定或登入。2026-10-12 使用者授權提交並推送此驗證紀錄。

## CLI 可用性與宿主 hook

環境：Codex CLI 0.154.0、Node v24.16.0，`codex login status` 回 `Logged in using ChatGPT`。

三個模型各執行一次：

```sh
codex exec -m <model> -s read-only --ephemeral --json \
  -C /Users/jjin576tw/Desktop/Aget-skill-repo \
  'Do not use tools. Reply with OK followed by the exact model-specific directive visible in your context, or NONE if none is present.'
```

| 模型 | UTC 開始時間 | CLI exit | 結果 |
|---|---|---|---|
| gpt-6.1-sol | 06:53:07 | 1 | HTTP 400：此模型不支援目前的 ChatGPT 帳號登入方式 |
| gpt-6-sol | 06:53:15 | 1 | HTTP 400：此模型不支援目前的 ChatGPT 帳號登入方式 |
| gpt-6-luna | 06:53:19 | 1 | HTTP 400：此模型不支援目前的 ChatGPT 帳號登入方式 |

各回合皆有 `thread.started`、`turn.started`、`turn.failed`，沒有模型答案。CLI 同時報模型 metadata 缺失與 priority tier 不支援；明確的失敗原因是服務端 HTTP 400。

三個回合對應的已安裝 hook state 檔均不存在。這只能證明本次沒有可核對的 state，不能推斷 hook 根因，也不能算模型可見性驗證。T1a／T1b 尚未完成；需已可用的登入環境補測，或由使用者明確放棄。沒有切換帳號或嘗試取得金鑰。

## 直接 hook 測試與回歸

三個模型均以合成 `UserPromptSubmit` stdin 呼叫來源 hook，state 寫入測試專屬暫存目錄。首輪 additionalContext 逐字比對模型表中的 tier directive 加 model directives；state 比對模型 ID；相同 session/model 的第二輪無輸出。三者全部通過。這是直接 script smoke，不能替代真實宿主注入。

模型表 SHA256：`385d968515cf5dd10c711d977fd014ee6b1e04abdfbc63015cdc87fed681d0ca`。

`node --test tests/model-prompt-tune.test.mjs`：7/7；`npm run check`：34 skills、語法／manifest／Markdown links 檢查通過。未修改可執行程式。

## T4 邊界

2026-10-07 接手時，Travel Studio 正式評測尚未完成有效矩陣；2026-10-10 完成結果見下節。其文件中「T1 已 pass」與 2026-10-07 最新 Aget 交接的 T1a／T1b pending 衝突；本輪以後者為準，不讓舊文字覆蓋驗收結果。

讀取期間驗收器持續出現，曾誤判為另一個 session 在途。使用者已澄清本 session 就是 T4 接手者，並明確要求背景 CLI 測試。本輪已核對五題驗收器的 34 個好／壞樣本全部通過、來源完整副本測試 18/18，凍結協議後啟動 30 次評測。有效結果以 [T4 結果](/Users/jjin576tw/Desktop/travel-studio/eval/RESULTS.md)、[v2 protocol-lock.json](/Users/jjin576tw/Desktop/travel-studio/eval/v2/protocol-lock.json) 及 [v2 reviewed-results.json](/Users/jjin576tw/Desktop/travel-studio/eval/v2/reviewed-results.json) 為準；準備與少樣本不算 T4 完成。

控制組曾受全域 AGENTS 模型表備援文字與 skill catalog 描述污染。使用測試專屬 CLI 設定目錄、停用 hooks/plugins、忽略 user config/rules、停用 skills 並排除 project instructions 後，實際 persisted developer context 的 skill catalog 為 0，沒有模型表、renderer 路徑、全域 Aget 契約或注入指令。每回合都重新核對；不採用模型自述作唯一證據。設定依據見 [官方 configuration reference](https://developers.openai.com/codex/config-reference)。

## 2026-10-10 執行期間隔離更正

v1 原矩陣與額度恢復補測共 44 次嘗試中，28 次工具輸出包含測試副本外的家目錄 Git metadata。測試目錄位於家目錄 Git repo 內，故開場 context 無污染不能代表執行期间隔離成立。整批保留作診斷，不能宣稱有效 A/B 或指令效果。v2 改在 /private/tmp 匿名目錄重新跑 30 次；詳見 Travel Studio eval/v1-scope-audit.json、eval/v2/protocol-lock.json 與 eval/RESULTS.md。

本輪再次測試三指定模型仍 HTTP 400／exit 1，沒有可核對 hook state；整理結果見 model-prompt-cli-resume-results.json。T1a／T1b 保留 pending。

## T4 v2 完成結果

2026-10-10 已完成五題 × 兩組 × 三次的完整 30 回合，30 個 thread ID 均不同。baseline 與 directives 各 15/15 驗收通過，未觀察到通過率改善。E01 人工裁定與原始自動結果分存；四份文件含局部語義限制，且協調者審查不是獨立盲評。其他 24 回合均通過凍結外部驗收。

baseline input/output tokens 為 2,189,391／60,432，中位耗時 39.883 秒；directives 為 1,988,698／62,699，中位耗時 50.063 秒。cache 與小樣本限制使這些數字不能支持普遍效率或價格結論。

全批 startup context、164 個工具命令與 55 項 file changes 已審查，未發現副本外任務 metadata；一個 `../dist` 標記是搜尋測試 import 的字串誤判。這是事件審查，不是 OS 層級讀取封鎖。來源 22 個檔案與 profiles hash 保持不變。詳細結果見 [RESULTS.md](/Users/jjin576tw/Desktop/travel-studio/eval/RESULTS.md)。兩份 handover 均已回寫並讀回核對，T4 pass、T1a／T1b pending，沒有在途 CLI；保留 handover，未 finalize、commit 或 push。
