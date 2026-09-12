# Aget 開發契約

直接依需求完成工作，不要求日常先執行 setup-work。開發需求使用 start-work；需要跨工作階段或共享依賴才載入 start-plan；純問答、研究、審查和文件工作只使用相關能力。

完成表示需求範圍與驗收證據吻合，未執行的驗證不能算通過。主會話可以探索、實作、測試及審查；Agent 僅在獨立 context、工具權限或獨立審查有價值且宿主授權時使用。遵循當前專案規範與使用者授權，不固定模型、派工、單一 AC 回合或重複確認。

有接續價值的里程碑及明確暫停，用 handover 的 checkpoint 保存目標、證據、限制與下一步。Stop、idle、compact、clear 都不表示全部目標完成。完成後使用 finalize：蒸餾知識、來源與 project status 保存且驗證成功，才刪除該任務 handover。沒有新知識須記理由。不要記錄機密或整份 transcript，不自動 commit／push。
