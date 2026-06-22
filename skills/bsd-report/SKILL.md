---
name: bsd-report
description: 產生 BSD 測試報告 docx 文件，支援任意票號格式（BMPPOS、BMPPCORE 等）。
---

# BSD 測報文件產生器

## 概述

產生 BSD 測試報告 (.docx)。docx 本質是 ZIP 包裝的 XML，本 skill 直接用 Write 工具產生 XML + PowerShell `ZipFile` 打包，無需安裝任何 npm 套件。

本 skill 支援任意票號格式，票號由呼叫端傳入（如 `BMPPCORE-280`、`BMPPOS-20`），統一以 `{TICKET}` 變數代入文件標題與輸出路徑。

## 風格參考

以下為從既有測報歸納的撰寫風格要點，產出新測報時須保持一致：

- **項目標題**：用簡短的功能描述，如「受理變更文件-份數可編輯調整」、「資料檢核」
- **規則條列**：以「條件: 結果」格式逐條列出，如「有影像且有份數: 份數不可編輯」
- **模式區分**：若功能有不同模式（如唯讀/編輯），分別說明各模式下的畫面行為
- **驗證規則**：每條規則搭配實際錯誤訊息，如「規則一: 若有相對應的掃描檔，則份數不得為0 → 錯誤訊息: xxx文件數量不得為0」
- **截圖標籤**：在截圖前加上情境說明，如「唯讀模式份數顯示（純文字）：」、「編輯模式份數可編輯（number input）：」
- **後端處理標註**：涉及中台/核心/API 的處理邏輯，以括號標註請後端補充
- **文件名稱使用全稱**：如「保險契約個人資料異動申請書」而非縮寫

## 撰寫角度

文件閱讀者為非技術人員（USER），撰寫時須遵守下列原則：

- **以畫面出發**：所有說明須描述使用者在畫面上看到的變化，例如「欄位移至頁面下方」、「新增提示文字於輸入框下方」
- **禁止使用技術用語**：不得出現變數名稱、API 路徑、元件名稱、CSS class 等程式碼層級細節
- **使用畫面元素名稱**：以畫面上可見的標籤、按鈕文字、區塊名稱來描述，例如「送件方式」欄位、「變更內容」核取方塊
- **操作步驟應可被非技術人員理解**：如「勾選 A 後系統自動帶入 B」而非「A checkbox onChange 觸發 B patch」

## 詳細規則撰寫指引

- 每個項目的說明須清楚描述**變更前行為**與**變更後行為**的差異
- 若涉及欄位卡控/驗證規則，須明確說明觸發條件與結果（例如：「當 X 欄位為空時，點擊送出會顯示紅色提示訊息 'Y'」）
- **後端卡控註解**：若某項卡控邏輯是由後端 API 執行（前端僅顯示後端回傳的錯誤），在該規則旁加註 `<!-- 後端卡控，請後端補充詳細驗證邏輯 -->`，文件中以括號標示：「（此驗證由後端執行，詳細規則請洽後端團隊補充）」
- 前端可觀察到的即時驗證（如格式檢查、必填提示）應完整描述觸發時機與顯示訊息

## 輸出路徑

輸出路徑由呼叫端 command 以 `{OUTPUT_PATH}` 形式傳入。

若無 command 指定（直接觸發 skill），預設為 `C:\tmp\{TICKET}_BSD.docx`。

## 範本格式規格

| 項目 | 值 |
|------|-----|
| 紙張 | A4 (w:w="11906" w:h="16838" twips) |
| 邊界 | 上下 1440 / 左右 1800 twips |
| 預設字體 | 12pt (sz=24)、新細明體 |
| 標題 | 16pt (sz=32)、置中、新細明體 |
| PCR 標籤 | 11pt (sz=22)、粗體、新細明體 |
| 項目標題 | 粗體、新細明體 |
| 說明文字 | 12pt、新細明體 |
| 圖片寬度 | 5461000 EMU (≈14.4cm)，等比例縮放高度 |
| 語言 | zh-TW |

## 文件結構

```
{TICKET}_BSD文件           ← 16pt 置中標題
[PCR單 : {TICKET}]        ← 11pt 粗體
                           ← 空行
項目一：{標題}             ← 粗體
{說明文字行1}              ← 12pt 正文
{說明文字行2}
畫面截圖 — {描述}：
[嵌入截圖]                ← inline image, 14.4cm 寬
                           ← 空行
項目二：{標題}
...（重複）
```

## 環境注意事項（Windows）

> 本 skill 執行環境為 **Windows**，所有路徑須使用 Windows 格式（`C:\tmp\...`），且：
> - ❌ 不使用 Write 工具寫入新 XML 檔案（Write 工具對新檔案會報「File has not been read yet」）
> - ❌ 不使用 Bash `zip` 指令（Windows 無此指令）
> - ❌ 不使用 Bash `node readFileSync('/tmp/...')` 讀取圖片（Windows node.js 讀不到 WSL `/tmp` 路徑）
> - ❌ 不使用 PowerShell `here-string | Set-Content -Encoding utf8`（PS 5.1 不支援此語法）
> - ✅ 所有 XML 寫入改用 PowerShell `[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))`
> - ✅ 圖片尺寸讀取改用 node 並傳入 Windows 路徑（`C:/path/to/file.png`）
> - ✅ 打包改用 PowerShell `[System.IO.Compression.ZipFile]::CreateFromDirectory()`

## 產生流程（8 步驟）

### Step 1: 建立暫存目錄（PowerShell）

```powershell
if (Test-Path "C:\tmp\bsd-build") { Remove-Item -Recurse -Force "C:\tmp\bsd-build" }
@("C:\tmp\bsd-build\_rels",
  "C:\tmp\bsd-build\word\_rels",
  "C:\tmp\bsd-build\word\media",
  "C:\tmp\bsd-build\word\theme") | ForEach-Object { New-Item -ItemType Directory -Path $_ -Force | Out-Null }
```

### Step 2: 寫入靜態 XML（PowerShell）

**不可用 Write 工具**，一律用 PowerShell `[System.IO.File]::WriteAllText()` 寫入（UTF-8 無 BOM）：

```powershell
$enc = [System.Text.UTF8Encoding]::new($false)
$b = "C:\tmp\bsd-build"

[System.IO.File]::WriteAllText("$b\[Content_Types].xml", '<XML內容>', $enc)
[System.IO.File]::WriteAllText("$b\_rels\.rels",          '<XML內容>', $enc)
[System.IO.File]::WriteAllText("$b\word\styles.xml",       '<XML內容>', $enc)
[System.IO.File]::WriteAllText("$b\word\settings.xml",     '<XML內容>', $enc)
[System.IO.File]::WriteAllText("$b\word\fontTable.xml",    '<XML內容>', $enc)
[System.IO.File]::WriteAllText("$b\word\webSettings.xml",  '<XML內容>', $enc)
[System.IO.File]::WriteAllText("$b\word\numbering.xml",    '<XML內容>', $enc)
[System.IO.File]::WriteAllText("$b\word\theme\theme1.xml", '<XML內容>', $enc)
```

完整 XML 內容見 `docx-structure.md`。

### Step 3: 複製截圖到 word/media/（PowerShell）

```powershell
Copy-Item "<screenshot-path-1>" "C:\tmp\bsd-build\word\media\image1.png"
Copy-Item "<screenshot-path-2>" "C:\tmp\bsd-build\word\media\image2.png"
# ... 依序編號
```

### Step 4: 讀取圖片尺寸（Windows 路徑）

用 node 讀取 PNG 尺寸並計算 EMU，**路徑必須使用 Windows 格式**（`C:/...`）：

```bash
node -e "
const fs = require('fs');
const targetW = 5461000;
[1,2,3].forEach(n => {
  const buf = fs.readFileSync('C:/path/to/image' + n + '.png');
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  const cy = Math.round(h * (targetW / w));
  console.log('image' + n + ': cx=' + targetW + ' cy=' + cy);
});
"
```

### Step 5: 產生 document.xml（PowerShell）

組裝 document.xml 字串後，用 `[System.IO.File]::WriteAllText()` 寫入。使用 `docx-structure.md` 中的動態 XML 片段模板，替換變數：

- `{TICKET}` → 完整票號（如 `BMPPCORE-280`、`BMPPOS-20`）
- `{ITEM_NUM}` → 項目編號（一、二、三...）
- `{TITLE}` → 項目標題
- `{TEXT}` → 說明文字
- `{rId}` → 圖片 relationship ID（rId5 起算）
- `{cx}` → 圖片寬度 EMU
- `{cy}` → 圖片高度 EMU
- `{docPrId}` → 圖片 docPr ID（流水號）
- `{name}` → 圖片名稱

```powershell
$enc = [System.Text.UTF8Encoding]::new($false)
$docXml = '<完整 document.xml 字串>'
[System.IO.File]::WriteAllText("C:\tmp\bsd-build\word\document.xml", $docXml, $enc)
```

### Step 6: 產生 document.xml.rels（PowerShell）

根據圖片數量動態產生 relationship XML（模板見 `docx-structure.md`）。圖片 rId 從 rId5 開始。

```powershell
$enc = [System.Text.UTF8Encoding]::new($false)
$relsXml = '<完整 rels 字串>'
[System.IO.File]::WriteAllText("C:\tmp\bsd-build\word\_rels\document.xml.rels", $relsXml, $enc)
```

### Step 7: 打包 docx（PowerShell ZipFile）

**不可用 Bash `zip`**，改用 PowerShell，`{TICKET}` 為完整票號：

```powershell
if (Test-Path "C:\tmp\{TICKET}_BSD.docx") { Remove-Item "C:\tmp\{TICKET}_BSD.docx" -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory("C:\tmp\bsd-build", "C:\tmp\{TICKET}_BSD.docx")
```

### Step 8: 移動到目標路徑 + 清理（PowerShell）

`{OUTPUT_PATH}` 由呼叫端 command 提供（如 `K:\06.專案\...\{TICKET}_BSD.docx`）；若未指定則留在 `C:\tmp\{TICKET}_BSD.docx`。

```powershell
$outPath = "{OUTPUT_PATH}"   # 由 command 替換為實際路徑
$outDir  = Split-Path $outPath -Parent
if (!(Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force }
Move-Item "C:\tmp\{TICKET}_BSD.docx" $outPath -Force
Remove-Item -Recurse -Force "C:\tmp\bsd-build"
```

## 截圖模式

### 模式 A — 使用者提供截圖

1. 使用者提供截圖檔案路徑
2. 驗證路徑存在：`ls <path>`
3. 直接複製到 `word/media/`

### 模式 B — Playwright 截圖

1. 根據項目需求撰寫臨時 Playwright spec
2. 使用現有 mock token 認證模式（參考 `test-writer` agent）
3. 執行截圖：`npx playwright test <spec> --project=chromium`
4. 截圖儲存至專案 `e2e/bsd-screenshots/` 目錄

#### ⚠️ Viewport 規定（必須遵守）

BSD 截圖 spec 的 `setupPage()` 函式**必須**在 `page.goto()` 之前呼叫 `page.setViewportSize()`，
將視窗設定為 **1920×1080**，避免複雜版面因寬度不足而壅擠：

```typescript
async function setupPage(page: Page, ...) {
  await page.addInitScript(...);   // 注入 token
  await page.route(...);           // mock API

  // ✅ 必須在 goto 前設定 viewport
  await page.setViewportSize({ width: 1920, height: 1080 });

  await page.goto('/SomeView?readOnly=true');
  await page.waitForLoadState('networkidle');
  ...
}
```

- 預設的 `Desktop Chrome` preset 為 1280×720，對多欄版面截圖不足
- 若特定頁面需要更寬（如橫向表格），可調高至 2560×1440，但 1920×1080 為最低要求

## 圖片尺寸計算

```
targetWidth = 5461000 EMU (固定，≈14.4cm)
targetHeight = originalHeight * (5461000 / originalWidth)
```

PNG IHDR chunk 位於 offset 16-23：
- bytes 16-19: width (big-endian uint32)
- bytes 20-23: height (big-endian uint32)
