---
name: ppt
description: 從內容建立 MARP 投影片並匯出 PDF 或 PPTX；版面依讀者與使用者格式需求。
---

# ppt

## 完成目標與驗收

投影片清楚表達內容，符合要求格式，中文、圖表、頁數與版面可讀；渲染逐頁檢查。PPTX 的可編輯程度取決於實際輸出模式，不能把影像投影片稱為原生可編輯元素。

## 技術參考與邊界

MARP Markdown 使用 `marp: true` 與 `---` 分頁；沿用專案的 @marp-team/marp-cli。呼叫範例：`marp --no-stdin input.md --pdf --output output.pdf`，PPTX 用 `--pptx`。先以安裝版本 help 核對；需要原生可編輯內容時選適合工具，不以 MARP 強行替代。

Mermaid 可用 mmdc 預先輸出 SVG，確保匯出時圖表已渲染。圖方向、節點數及張數以內容與版面決定，不固定 LR 或 8–15 張。只在需要讀取受信任本地圖片時開啟對應檔案權限，不默認全域安裝或下載。保留可修改來源，輸出目錄依使用者或目前專案，不要求機器專屬路徑。
