---
name: md-to-pdf
description: 將指定 Markdown 檔案轉換為 PDF，支援中文、Mermaid 圖表、內嵌圖片。
inclusion: manual
---

# Markdown 轉 PDF Skill

> [!WARNING]
> 若 Markdown 含 `marp: true` frontmatter 或為投影片／簡報格式，請改用 `/ppt` skill。
> `md-to-pdf` 底層無法處理 MARP 語法，強行使用會產出損壞的 PDF。

> 將指定的 Markdown 檔案轉換為 PDF，支援中文字型、Mermaid 圖表渲染、內嵌圖片。

## 前置條件

- Node.js 已安裝 (>= 16)
- 首次使用需安裝依賴：`npm install -g md-to-pdf`
- 若 MD 含 Mermaid 圖表，另需：`npm install -g @mermaid-js/mermaid-cli`

## 使用方式

使用者提供：
1. **來源 MD 檔案路徑**（相對於 workspace root）
2. **輸出 PDF 路徑**（可選，預設與 MD 同目錄同名 `.pdf`）
3. **是否包含 Mermaid 圖表**（可選，預設自動偵測）

## 執行步驟

### Step 1：確認工具已安裝

```bash
# 檢查 md-to-pdf
npx md-to-pdf --version

# 檢查 mmdc（僅 Mermaid 需要）
npx mmdc --version 2>/dev/null || echo "MMDC_NOT_INSTALLED"
```

若未安裝，執行：

```bash
npm install -g md-to-pdf
npm install -g @mermaid-js/mermaid-cli
```

### Step 2：確認 MD 檔案存在並分析內容

- 讀取使用者指定的 MD 檔案
- 確認檔案中是否有 Mermaid code block（` ```mermaid `）
- 確認檔案中是否有圖片引用（`![](...)` 或 `<img>`）

### Step 3：確認樣式檔存在

檢查 `.kiro/pdf-style.css` 是否存在。若不存在，建立以下內容：

```css
/* 中文字型 + 排版樣式 */
body {
  font-family: "Microsoft JhengHei", "微軟正黑體", "PingFang TC", "Noto Sans TC", sans-serif;
  font-size: 11pt;
  line-height: 1.8;
  color: #333;
}

h1, h2, h3, h4, h5, h6 {
  font-family: "Microsoft JhengHei", "微軟正黑體", "PingFang TC", "Noto Sans TC", sans-serif;
  font-weight: bold;
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  page-break-after: avoid;
}

h1 { font-size: 22pt; border-bottom: 2px solid #333; padding-bottom: 0.3em; }
h2 { font-size: 18pt; border-bottom: 1px solid #ccc; padding-bottom: 0.2em; }
h3 { font-size: 14pt; }

code {
  font-family: "Consolas", "Source Code Pro", monospace;
  font-size: 9pt;
  background-color: #f5f5f5;
  padding: 0.2em 0.4em;
  border-radius: 3px;
}

pre {
  background-color: #f5f5f5;
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  page-break-inside: avoid;
}

pre code { background: none; padding: 0; }

table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
  font-size: 10pt;
  page-break-inside: avoid;
}

th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; }
th { background-color: #f0f0f0; font-weight: bold; }
tr:nth-child(even) { background-color: #fafafa; }

img, svg { max-width: 100%; height: auto; display: block; margin: 1em auto; }

blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1em;
  margin-left: 0;
  color: #666;
}

h1 { page-break-before: always; }
h1:first-of-type { page-break-before: avoid; }
```

### Step 4：處理 Mermaid 圖表（如有）

若 MD 中包含 ` ```mermaid ` 區塊，使用 **mmdc 預處理**（最穩定的方式）：

```bash
npx mmdc -i "<來源MD>" -o "<來源MD_processed.md>" -e svg
```

這會將 mermaid 區塊替換為 `<img>` 標籤指向產生的 SVG 檔案。

> 若 mmdc 未安裝或失敗，改用 **script injection 備選方案**：
> 1. 將 ` ```mermaid ` 區塊改為 `<div class="mermaid">...</div>`
> 2. 在轉換指令加入 `--script '{"url":"https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"}'`

### Step 5：執行轉換

```bash
# 無 Mermaid 的情況
npx md-to-pdf "<來源MD>" \
  --stylesheet ".kiro/pdf-style.css" \
  --pdf-options '{"format":"A4","margin":{"top":"20mm","right":"15mm","bottom":"20mm","left":"15mm"},"printBackground":true}' \
  --launch-options '{"args":["--no-sandbox"]}'

# 有 Mermaid 的情況（使用預處理後的檔案）
npx md-to-pdf "<來源MD_processed.md>" \
  --stylesheet ".kiro/pdf-style.css" \
  --pdf-options '{"format":"A4","margin":{"top":"20mm","right":"15mm","bottom":"20mm","left":"15mm"},"printBackground":true}' \
  --launch-options '{"args":["--no-sandbox"]}'
```

若需指定輸出路徑，加上 `--dest "<輸出PDF路徑>"`。

**替代方式：使用 front-matter（適合固定設定的檔案）**

在 MD 檔案最前面加入：

```yaml
---
pdf_options:
  format: A4
  margin: { top: 20mm, right: 15mm, bottom: 20mm, left: 15mm }
  printBackground: true
  displayHeaderFooter: true
  footerTemplate: '<span style="font-size:8pt;width:100%;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></span>'
stylesheet: .kiro/pdf-style.css
---
```

然後直接執行 `npx md-to-pdf "<來源MD>"`。

### Step 6：驗證產出並清理

1. 確認 PDF 檔案已產生且大小合理（非 0 bytes）
2. 清理中間檔案（若有 Mermaid 預處理）：
   ```bash
   rm -f "<來源MD_processed.md>"
   rm -f "<來源MD_processed>"-*.svg
   ```
3. 告知使用者輸出路徑和檔案大小

## 完整指令範例

```bash
# 範例：轉換 SA.md（含 Mermaid）
npx mmdc -i ".kiro/docs/esp-system-ui/premium/manualBatchJob/SA.md" -o ".kiro/docs/esp-system-ui/premium/manualBatchJob/SA_processed.md" -e svg

npx md-to-pdf ".kiro/docs/esp-system-ui/premium/manualBatchJob/SA_processed.md" --stylesheet ".kiro/pdf-style.css" --pdf-options '{"format":"A4","margin":{"top":"20mm","right":"15mm","bottom":"20mm","left":"15mm"},"printBackground":true}' --launch-options '{"args":["--no-sandbox"]}'

# 清理
rm -f ".kiro/docs/esp-system-ui/premium/manualBatchJob/SA_processed.md"
rm -f ".kiro/docs/esp-system-ui/premium/manualBatchJob/SA_processed"-*.svg
```

## 常見問題

| 問題 | 解法 |
|------|------|
| 中文亂碼 | 確認 CSS 中有指定中文字型；確認系統已安裝字型（Windows 內建微軟正黑體） |
| Mermaid 圖表空白 | 改用 mmdc 預處理方式；確認 `npx mmdc --version` 可執行 |
| 圖片路徑找不到 | 圖片路徑需相對於 MD 檔案所在目錄 |
| PDF 太大 | 移除 `printBackground`；Mermaid 用 SVG 而非 PNG |
| Puppeteer 啟動失敗 | 加入 `--no-sandbox` launch option |
| 表格被截斷 | 在 CSS 中縮小 table font-size 或調整 margin |

## 注意事項

- md-to-pdf 底層使用 Puppeteer (Chromium)，首次安裝會下載 ~170MB 的 Chromium
- 若公司網路有限制，可設定 `PUPPETEER_SKIP_DOWNLOAD=true` 並指定本機 Chrome 路徑
- 產出的 PDF 預設放在與 MD 同目錄，建議在 `.gitignore` 加入 `*.pdf`
- mmdc 首次執行也會下載 Chromium，後續不需重複下載
- 建議 md-to-pdf >= 5.0.0，@mermaid-js/mermaid-cli >= 10.0.0
