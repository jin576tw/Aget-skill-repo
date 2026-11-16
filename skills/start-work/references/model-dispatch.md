# 模型派工

適用主會話委派 subagent 及 COORD 派獨立 session，不構成自動委派授權。

派工前讀 Aget rules/model-profiles.json 的目標模型 tier 與 directives。記錄任務 scale（範圍、耦合、風險、不確定性）、選定模型、effort 與理由，不固定以檔案數或角色選模型。

- 明確規則的整理、分類與小型固定任務優先 efficient；範圍清楚的多步實作及驗證用 balanced；架構、安全或高度不確定工作用 frontier。選足以完成任務的最小配置。
- 使用者指定優先，否則依難度選 low／medium／high／xhigh；max 僅明確要求才用。依模型能力與宿主實際選項設定，不支援 effort 時省略並說明。
- 宿主可設定時實際傳入模型／effort；獨立 session 的 effort 沿用使用者設定並記明建議值。無法指定、確認或模型不在表中時回報限制，不假稱已套用或默默替換；不得為取得設定能力擅自啟動額外 CLI。
- efficient 任務用「目標／輸入與範圍／明確規則／步驟／完成標準／不做的事」。能力不足才調整配置並記理由，額外付費與重派遵循測試批次預算。
