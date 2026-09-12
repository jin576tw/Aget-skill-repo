---
name: bsd-report
description: 依指定格式與截圖產生 BSD 測報 Word 文件，適用需要該報告樣式的交付。
---

# bsd-report

## 完成目標

交付能開啟、版面正確且對應實際驗證的 BSD 報告，保留指定票號、敘述、截圖、字型與頁面設定。

## 格式與驗收

使用 既有報告樣本、[OOXML 結構](docx-structure.md)、既有報告樣本 中與需求相符的格式。依使用者提供的樣本或專案規範決定版面；截圖不能冒充測試通過。檢視實際輸出，確認中文、圖片比例、分頁與文字無截斷。

用 Node fs 建立 UTF-8 無 BOM 的 OOXML parts，將已核對截圖放入 word/media，維持 relationship ID 與圖片尺寸一致。`node scripts/pack-docx.mjs <parts-directory> <output.docx>` 提供跨平台打包，輸出已存在時拒絕覆蓋；沒有第二条 shell 打包實作。參數為 plugin 根目錄相對腳本，亦可使用其絕對路徑。

包裝成功不等於 Word 內容正確，仍需 OOXML 檢查及實際渲染。格式規範可調整但技術依賴（關聯、content types、唯一 ID）不可省略。保留來源與已產生輸出，失敗不清掉原件；不自動發布 Jira 留言。
