# 2026-11-16 驗收調整

需求：測試先規劃成本並逐批核准；所有派工按模型表與 scale；所有 Task 具同等驗收標準；整體 plan 明確驗收才完成。

- Board 回歸初版 12/12；完整本機 npm test 81/81；npm run check 35 skills 通過。
- Claude CLI 一次唯讀 review：claude-opus-5-5 / high，認為程式適度、文件有重複；採納文件精簡及 plan completed 但 Task 未完成的防護測試。未擴張 superseded 自動完成語意，保留既有全部 Task completed 的要求。
- 顧問輸出有前段缺漏，未憑缺漏的 M1/L1 編號推定完整結論；已核對可讀建議與程式，未追加付費呼叫。
- CLI 回報 input=10、cache creation=253978、cache read=499821、output=9182（含 thinking=5375），牌價估值 USD 2.3154682；不是訂閱實扣或剩餘額度。超過事前 prompt 估值及預期輸出上限，原因範圍包含宿主 context／工具多回合，不能將環境設定當已驗證硬上限。共用指引已補此限制。
- 程式僅檢查狀態、hash、非空 reviewer/evidence 及 inflight=[]；證據內容、Sign-off、豁免由驗收者核對。未宣稱完成模型行為情境測試。
- 未安裝到全域，未 commit/push；保留既有 agents/spec-reviewer.md 異動。

最終補測：board 13/13、package check 35 skills 與 git diff --check 通過；完整 81/81 為補測前版本，補測後僅重跑受影響 board 與 package check。

2026-11-16 後續授權：全域 user-scope both/hooks 更新完成，SETUP_CURRENT（changes/removed 空），核心變更檔案與 repo bytes 一致。保留本機 plan-coord 聯絡補充與原 spec-reviewer 版本；兩宿主規範僅正規化相同內容的空白。新 session 才載入新定義，未宣稱既有 session 重載。
