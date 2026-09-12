<!-- aget-finalize:v1 -->
## Aget 接續與结案契約 v1

本節對 Aget checkpoint／finalize 取代舊版與其衝突的 handover 格式、保留與自動 Git 規則。其他 vault 規則仍有效。

checkpoint 為 handover 模式，只能更新選定 workspace/task 的 handover；不寫 durable 層。Aget 產生 Markdown，包含可讀 JSON metadata（身分、revision、目標、驗收證據、狀態、在途工作）與接續摘要。不要求 Session Metrics。舊版交接可讀，不靜默覆寫或自動遷移；先確認相同目標及資料映射才轉為此格式。

finalize 是正常工作的結案模式，不是 handover-only 模式：允許將已蒸餾內容保存到指定 knowledge／projects 頁與 sources/sources.md、更新指定 projects/*/status.md 的該任務區塊，再刪除該 handover。raw 只讀。目標全部有完成證據、在途工作確定為空才可結案；未知不等於空。沒有新增知識須保存理由，已有知識保存來源連結。不得刪減目標來湊完成。

所有 Aget 寫入方共用 vault 鎖、預期 hash、路徑白名單與讀回驗證。不覆蓋其他任務；錯誤保留交接，不在退出 hook 執行結案；不自動 commit／push。鎖檔不是任務資料，程序中斷留下鎖時先確認沒有寫入者並核對資料，不能只因過期自動清鎖。

跨檔案不是原子交易：中斷可保留已保存的知識；重試相同內容不重複寫入。status 或刪除失敗仍保留 handover；修復原因並重新讀取 hash 後重試。不把腳本驗證當成語意驗收，模型仍對目標及蒸餾內容負責。
