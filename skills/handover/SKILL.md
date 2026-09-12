---
name: handover
description: 保存或讀取跨 Agent 的任務接續，處理明確暫停、里程碑及完成後的知識蒸餾與結案；一般問答不建立 handover。
---

# handover

## 完成目標

讓另一個 Codex 或 Claude Code 從 Markdown 得知目標、已驗證成果、限制與下一步。這不是 /compact 的宿主內部摘要；compact 不保證提供跨工具接續檔。

## checkpoint

依目前 workspace prefix 找出匹配的 handover，目標一致才接續；多份可能匹配時釐清 task，不改配其他工作。保存所有目標與 state、每項已完成的 evidence、inflight（未知用 null）、簡潔 summary（決策、改動、未完成／阻塞、恢復條件）。明確暫停用 paused；全部通過且在途為空才用 completed。呼叫 `node scripts/memory.mjs checkpoint`，只寫選定交接；expectedHash 為最新檔案 SHA256，新檔用 MISSING。

舊格式可讀。轉入 Aget 格式時先對照所有目標、決策及證據，使用 `node scripts/migrate-handover.mjs` 明確列出預期 hash 與完整 checkpoint，不自動掃描或刪除其他交接。

## finalize

完成 checkpoint 後由正常工作執行 `node scripts/memory.mjs finalize`。判斷新知識／既有知識／沒有新增價值，準備適當 knowledge、來源與 project status；三種結果都留可核對紀錄。來源不可只指向即將刪除的交接。vault 需明確採用 [結案契約](../../rules/memory-contract.md)。

只有所有目標已驗收、相關在途工作確定為空、蒸餾與 status 已寫入並讀回成功，才刪除該交接。無新知識寫明理由，不虛構知識。不能因檔案過舊、session 結束或測試 exit 0 就結案。錯誤保留 handover；已保存的相同內容可重試，不重複蒸餾。

## hooks

里程碑立即 checkpoint 最可靠。需要退出備援時使用 `node scripts/stage-checkpoint.mjs` 保存已整理的 request，宿主的暫停、等待、compact、Stop／SessionEnd 只 flush 它。沒有 pending request 就無副作用；hook 不掃 transcript、不產生語意摘要、不 finalize。clear 無法保證有足夠時間產生新摘要，所以不要只靠退出事件。

精確 JSON 欄位、鎖恢復與重試見 [runtime](../../docs/runtime.md)。不自動 commit／push，也不記錄完整 transcript、機密或業務內容到個人 vault。
