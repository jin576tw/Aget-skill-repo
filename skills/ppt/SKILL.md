---
name: ppt
description: 從文字內容生成投影片（MARP），輸出 PDF（快速）或 PPTX（可編輯），支援 Mermaid 流程圖。TRIGGER：使用者提到 slide / ppt / 投影片 / 簡報 / presentation，且需要從文字內容生成或匯出。
inclusion: manual
---

# PPT 投影片生成 Skill

依據使用者提供的文字內容（大綱、條列、需求描述），自動生成 MARP 格式投影片並匯出為 PDF 或 PPTX。

## 輸出模式

| 模式 | 旗標 | 特性 | 適合情境 |
|------|------|------|---------|
| **PDF** | `--pdf` | 快速、固定版面、不可編輯 | 簡報、分享、歸檔 |
| **PPTX** | `--pptx` | 可在 PowerPoint/Keynote 開啟編輯，略慢 1–2 秒 | 後續需要調整內容或樣式 |

**若使用者未指定格式，先詢問：**
> 請問要輸出 PDF（快速、適合直接簡報）還是 PPTX（可用 PowerPoint 編輯）？

---

## 輸出目錄

所有產出檔案統一放至：`C:\Users\003689\Desktop\Slides\`

- 若目錄不存在，執行前先建立
- 檔名依簡報標題自動命名（小寫、連字號，例如 `ai-sdlc-intro.pdf`）
- MARP Markdown 暫存檔也放此目錄，完成後保留（方便日後修改）

---

## 工作流程

### Step 1：確認輸出格式

若使用者未指定，詢問 PDF 或 PPTX。

### Step 2：分析輸入並規劃架構

根據使用者提供的文字內容：
- 決定張數（建議 8–15 張）
- 規劃章節結構（封面 → 目錄 → 內容章節 → 結語）
- 每張投影片列出 3–5 個重點

### Step 3：建立輸出目錄

```bash
mkdir -p "C:\Users\003689\Desktop\Slides"
```

（Bash 工具執行，非 PowerShell 工具）

### Step 4：生成 MARP Markdown

將投影片內容寫入 `C:\Users\003689\Desktop\Slides\<title>.md`。

**MARP frontmatter 範本：**

```markdown
---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
color: #333333
style: |
  section {
    font-family: "Microsoft JhengHei", "微軟正黑體", "PingFang TC", sans-serif;
    font-size: 28px;
  }
  h1 { font-size: 44px; color: #1a1a2e; }
  h2 { font-size: 36px; color: #16213e; border-bottom: 2px solid #0f3460; }
  strong { color: #0f3460; }
---

# 簡報標題
## 副標題

作者 ｜ 日期

---

## 目錄

1. 第一章
2. 第二章
3. 結語

---

## 章節標題

- 重點一
- 重點二
- 重點三

---
```

**投影片分頁**：每張以 `---` 分隔，禁止使用其他分頁方式。

### Step 5：偵測 Mermaid 流程圖

掃描生成的 `.md` 是否含有 ` ```mermaid ` 區塊：
- **有** → 執行 Step 5a（mmdc 預處理）
- **無** → 直接跳至 Step 6

### Step 5a：Mermaid 預處理

> MARP PDF/PPTX 模式下 Puppeteer 不保證等待 Mermaid CDN 渲染完成，
> 必須用 mmdc 預先將流程圖轉為 SVG 圖片嵌入。

**Mermaid 流程圖規範（生成時必須遵守）：**

1. **方向一律使用 `LR`（左到右）**，禁止使用 `TD`（上到下）：
   ```
   flowchart LR      ✅
   graph LR          ✅
   flowchart TD      ❌
   graph TD          ❌
   ```
2. **控制節點數量防止溢出**：LR 方向圖寬度有限，單一流程圖節點數建議 ≤ 8 個；若流程較長，拆成多張投影片、每張一段。
3. **節點標籤簡短**：每個節點文字 ≤ 10 字，避免橫向撐寬。
4. **mmdc 輸出寬度設定**：加 `--width 1200` 限制 SVG 最大寬度，符合 16:9 投影片：
   ```bash
   npx mmdc -i "<file.md>" -o "<file_processed.md>" -e svg --width 1200
   ```

```bash
# Step 5a-1：確認 mmdc 已安裝
npx mmdc --version 2>/dev/null || echo "MMDC_NOT_INSTALLED"
```

若出現 `MMDC_NOT_INSTALLED` 或 `MODULE_NOT_FOUND`：
```bash
npm install -g @mermaid-js/mermaid-cli
```

```bash
# Step 5a-2：預處理，將 mermaid 區塊轉為 SVG <img> 標籤
npx mmdc -i "C:\Users\003689\Desktop\Slides\<title>.md" \
         -o "C:\Users\003689\Desktop\Slides\<title>_processed.md" \
         -e svg
```

後續 Step 6 改用 `<title>_processed.md` 作為輸入。

### Step 6：執行 marp-cli 轉換

> **必用 Bash 工具執行。PowerShell 工具會將長時間指令排入背景，導致無法取得結果。**

```bash
# 確認 marp 已全域安裝
marp --version 2>/dev/null || echo "USE_NPX"
```

**PDF 模式：**
```bash
marp --no-stdin "C:\Users\003689\Desktop\Slides\<title>.md" \
     --pdf \
     --output "C:\Users\003689\Desktop\Slides\<title>.pdf" \
     --allow-local-files
```

**PPTX 模式：**
```bash
marp --no-stdin "C:\Users\003689\Desktop\Slides\<title>.md" \
     --pptx \
     --output "C:\Users\003689\Desktop\Slides\<title>.pptx" \
     --allow-local-files
```

若 `marp` 未全域安裝，前綴改用 `npx @marp-team/marp-cli`（首次執行需下載 ~數十 MB）。

### Step 7：清理暫存（若有 Mermaid 預處理）

```bash
rm -f "C:\Users\003689\Desktop\Slides\<title>_processed.md"
rm -f "C:\Users\003689\Desktop\Slides\<title>_processed"-*.svg
```

### Step 8：驗證並回報

確認輸出檔案存在且大小合理（非 0 bytes），回報：
- 輸出路徑
- 檔案大小
- 投影片張數（PDF 可從 marp 輸出取得）

---

## 常見問題

| 問題 | 解法 |
|------|------|
| 指令永久掛起，輸出 `waiting data from stdin` | 缺少 `--no-stdin` 旗標，加上即可 |
| mmdc 出現 MODULE_NOT_FOUND | `npm install -g @mermaid-js/mermaid-cli` 後重試 |
| PPTX 在 PowerPoint 開啟版面跑掉 | 調整 MARP theme 的 `style:` 區塊字型與字號 |
| 中文字型顯示為方塊 | 確認 CSS 含 `Microsoft JhengHei`；Windows 系統內建，無需另裝 |
| PPTX 比 PDF 慢 | 正常現象，PPTX 需額外轉換步驟，約多 1–2 秒 |
| Mermaid 圖表在 PDF 空白 | 確認已執行 Step 5a mmdc 預處理；若跳過會空白 |
| 流程圖超出投影片右側邊界 | 節點數減少至 ≤ 8；節點標籤縮短；或拆成多張投影片 |
| 流程圖方向是由上而下 | 改為 `flowchart LR` 或 `graph LR` |

---

## 工具安裝（首次使用）

```bash
# 全域安裝 marp-cli（建議，避免每次 npx 下載）
npm install -g @marp-team/marp-cli

# 若需要 Mermaid 流程圖支援
npm install -g @mermaid-js/mermaid-cli
```

---

## 禁止事項

- **禁止**對 MARP 格式的 `.md` 使用 `md-to-pdf`（底層 marked 不支援 `marp: true` 語法）
- **禁止**在 PowerShell 工具中執行 `marp` 長時間指令（會被排入背景）
- **禁止**省略 `--no-stdin` 旗標（指令會永久掛起）
- **禁止**對含 Mermaid 的投影片跳過 Step 5a 預處理（圖表會空白）
- **禁止**使用 `TD`（上到下）方向的流程圖，一律改為 `LR`（左到右）
- **禁止**單一流程圖超過 8 個節點，過長則拆成多張投影片
