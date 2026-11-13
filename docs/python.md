# Python 文件工具環境

Aget 的安裝、hooks、handover、plan-board 與 testdoc-supplement 維持 Node.js 核心，不需要 Python。Word／PDF／Excel 的既有 Python 腳本為選用能力，最低 Python 3.10；本機驗證版本與限制見 [驗證紀錄](python-validation.md)。

## 隔離安裝

在 repo 根目錄執行，不修改全域 PATH，不需啟用虛擬環境：

```powershell
python -m venv .venv
.venv/Scripts/python.exe -m pip install -r skills/docx/requirements.txt -r skills/pdf/requirements.txt -r skills/xlsx/requirements.txt
node scripts/check-python.mjs --skill all
npm run check:python
```

macOS／Linux 使用 `python3 -m venv .venv`，再將上述 `.venv/Scripts/python.exe` 改成 `.venv/bin/python`。可只安裝需要的 skill。`requirements-optional.txt` 是文件範例用套件，需使用對應範例時再裝；它們不包含在必要清單。套件採相容版本範圍，非鎖版環境。

唯讀檢查入口：

```sh
node scripts/check-python.mjs --skill docx
node scripts/check-python.mjs --skill pdf --python "/path with spaces/python"
node scripts/check-python.mjs --skill xlsx
npm run check:python
```

預設優先 repo `.venv`，其次尋找 `python3`／`python`（Windows 亦嘗試 `py -3`）；`--python` 或 `AGET_PYTHON` 可指定執行檔。缺 Python、版本不足、必要套件缺漏或 AST 解析失敗回傳非零；外部工具缺漏會逐項顯示，因其依功能才需要，不影響純 Python 功能的檢查結果。檢查不會安裝或修改環境。AST 檢查涵蓋 repo 所有 Python 原始檔，排除 `.venv`、`.git`、`node_modules`、`__pycache__`，不會匯入模組或產生 bytecode。`npm run check` 仍只需 Node。

## 依賴與外部工具

| 能力 | 必要 Python 套件 | 額外條件 |
|---|---|---|
| Word OOXML 解包／重包／驗證／註解 | defusedxml、lxml | 不需 LibreOffice；建立新文件的 JS 範例另需 npm docx |
| Word 格式轉換／接受修訂 | 同上 | 另裝 LibreOffice；接受修訂腳本尚未做跨平台實測 |
| PDF 欄位擷取／填寫／文字註解 | pypdf | 不需系統工具 |
| PDF 結構擷取 | pdfplumber | 不需系統工具 |
| PDF 轉頁面圖片 | pdf2image、Pillow | 另裝 Poppler（pdftoppm、pdfinfo）並使其可被找到 |
| 圖片紅藍框標註 | Pillow | 不需 Poppler |
| PDF OCR 範例 | 選用 pytesseract | 另裝 Tesseract 與所需語言資料；PDF 轉圖亦需 Poppler |
| Excel 讀寫／重算檢查 | openpyxl；Office helpers 另需 defusedxml、lxml | 重算另裝 LibreOffice |
| 範例生成／分析 | 選用 python-docx、reportlab、pandas | 依個別範例安裝 |

不自動安裝上述系統工具。Office helper 與 Excel 重算優先使用 PATH 的 soffice，再找 Windows 標準安裝位置與 macOS Applications；非標準位置可由使用者自行設定程序環境。Linux 只有 AF_UNIX socket 被封鎖時才編譯 shim，需要 gcc；macOS 與 Windows 不載入 Linux LD_PRELOAD shim。

Excel 重算仍使用 `python skills/xlsx/scripts/recalc.py <file.xlsx> [timeout_seconds]`，輸出原有 JSON 欄位。每次建立獨立臨時 LibreOffice profile，逾時回 `error`，不再將逾時當作成功。實際重算需確認資料快取更新；模擬測試不代表 LibreOffice 已可轉換。
