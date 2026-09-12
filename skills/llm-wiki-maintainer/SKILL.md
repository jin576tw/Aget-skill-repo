---
name: llm-wiki-maintainer
description: 維護知識庫的穩定知識、來源及導航；用於蒸餾、整理或查詢知識，不在每次 checkpoint 重整全庫。
---

# llm-wiki-maintainer

## 完成目標

讓知識可追溯、可找到、可核對鮮度，保持 raw、來源、穩定知識、專案狀態與暫時 handover 的責任分離。

## 驗收與邊界

遵循目標 vault 的入口及寫入契約；依問題載入相關頁面，不每輪全庫讀取。新知識附穩定來源與日期，區分觀察、推論與規則；重複知識更新既有頁，過期或相反證據留下更正及適用限制。來源不只引用將刪除的 handover。

raw 不改寫；知識不是 session 日誌。業務內容留對應業務 vault，不搬入個人通用知識庫；不記錄機密或完整 transcript。checkpoint 使用 handover 的單檔模式；結案時由 finalize 保存蒸餾與 status，再安全刪除交接。

結構變更時同步入口、索引及連結健康檢查；小幅內容修改不順帶整庫重整。不預設向量 DB、圖譜、metrics 或新 Agent；現有 Markdown 導航與來源不足以滿足具體需求時才評估。
