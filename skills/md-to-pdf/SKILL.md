---
name: md-to-pdf
description: 將一般 Markdown 文件轉成含中文、圖片及必要 Mermaid 圖表的 PDF。
---

# md-to-pdf

## 完成目標與驗收

PDF 保留原文內容、表格、圖片與圖表，中文可讀、分頁及版面無截斷；驗收實際渲染，檔案存在與非零大小不足以判斷成功。MARP 投影片使用 ppt 的能力。

## 工具與邊界

沿用專案安裝的 md-to-pdf，Mermaid 需要時用 @mermaid-js/mermaid-cli 預渲染 SVG，再轉換處理後副本。必要依賴安裝在專案範圍，版本依專案 lockfile，不強制全域安裝。CSS 以來源／使用者樣式為準，中文字型使用實際可用字型；相對圖片路徑以來源文件位置解析。

轉換方式例：`md-to-pdf input.md --dest output.pdf`；Mermaid 預處理例：`mmdc -i input.md -o processed.md -e svg`。用目前安裝版本的 help 核對選項；不要預設關閉瀏覽器 sandbox 或加入 CDN 程式。中間檔放獨立暫存目錄，驗證後只清本次產物，保留來源。
