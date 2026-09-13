# 任務判斷

| 情境 | 目標與適用能力 |
|---|---|
| 小範圍開發 | 直接實作並核對行為；不建 board |
| 共享依賴或跨 session | start-plan 保存 scope、依賴、驗收與目前證據 |
| bug／效能異常 | error-first-debug，保留假設與證實差別 |
| 審查需求 | review-checklist；純審查唯讀 |
| 研究支持／核對論文 | ask-arxiv；不把研究加到所有開發 |
| 暫停／接續／結案 | handover，區分 checkpoint 與 finalize |
| 能力確實缺失 | find-skills；設定缺口才 setup-work |
| 持續或定時執行 | 宿主原生 goal／排程，依明確授權；不是新增控制器 |

委派依獨立 context、唯讀邊界或獨立驗收價值判斷。主會話能完成的小工作不必委派；多項工作只有在檔案、依賴與 runtime 不互相衝突時才能並行，仍須符合宿主授權。

委派或換 session 前，以 [Execution Brief](execution-brief.md) 補足執行所需資訊。控場與執行可分工，模型依本次配置選用；任務包詳細度依未知與風險調整，不要求每次建立 board。
