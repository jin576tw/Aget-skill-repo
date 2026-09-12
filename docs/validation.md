# 驗證狀態

本頁區分已執行與尚未由環境證明的能力，不把 fixture 當成宿主端到端結果。

- Node 自動測試（39 項通過，macOS；Node 18 與 24）：checkpoint／finalize、三種知識蒸餾、衝突／symlink、失敗注入與重啟重試、board 的 hash／claim／依賴、setup 的衝突與恢復、pending session 所有權、DOCX ZIP/Unicode/CRC、既有 hooks。
- 官方 skill validator：30 skills 通過。
- 官方 plugin validator：Codex manifest 通過；Claude plugin validate 通過。
- 實際 Codex app-server 0.153.4：隔離專案的 skills/list 找到全部 30 個 Aget skills，hooks/list 找到 6 個對應事件，無解析錯誤／警告；hook trust 仍為 untrusted，未繞過信任。
- Hook payload fixtures 驗證 flush、無資料／錯誤輸入／錯 session 不寫入；這不等於宿主已執行所有事件。

2026-09-12 已在 macOS 以 user scope 安裝 Claude＋Codex 與 hooks；首次安裝回傳 `SETUP_COMPLETE`（30 skills），讀回檢查回傳 `SETUP_CURRENT`、changes／removed 皆空。檔案清冊確認 `.agents/skills` 與 `.claude/skills` 各 30 個可讀 `aget-*` skill、Claude 5 個 `aget-*` agent，兩宿主 hook 事件均已寫入且既有 hooks 保留。這證明安裝器在目前 macOS 使用者層的落地與冪等性，不證明既有 session 已重載或模型已正確路由。

Native Windows 執行、真實 Claude／Codex 對話的自動選用與 compact／clear／idle 全生命週期仍未執行。Windows 路徑與舊 hash 的單元案例不能代替原生平台驗證。description 提供選用線索，不能保證每次模型都選對。沒有修改或繞過使用者既有宿主信任設定。

手動宿主驗收：在隔離專案執行 setup，依宿主正常信任機制啟用後開新 session；從自然開發需求核對 start-work，小需求不建立 board；研究需求核對 ask-arxiv。保存 paused checkpoint 後用另一宿主讀取並核對目標、限制及下一步；在已有 pending request 下觸發該宿主支援的 Stop／compact／結束事件，確認只 flush 一次且不結案。全部目標完成後再驗證 finalize 的來源與 status 链接。測試不可用時保留交接，不標成功。
