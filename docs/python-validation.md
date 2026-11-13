# Python 支援驗證紀錄

環境：Windows、Python 3.12.10、Node.js 22.22.3。最低版本宣告為 Python 3.10，其他版本與非 Windows 平台未做真實執行驗證。

## 重現方式

```powershell
.venv/Scripts/python.exe -m pip install -r skills/docx/requirements.txt -r skills/pdf/requirements.txt -r skills/xlsx/requirements.txt -r skills/docx/requirements-optional.txt -r skills/pdf/requirements-optional.txt
.venv/Scripts/python.exe tests/python-smoke.py
node scripts/check-python.mjs --skill all
npm run check:python
npm test
npm run check
```

Smoke 的 python-docx 與 reportlab 僅用於建立暫存樣本，不是 bundled scripts 的必要依賴。樣本放在有中文與空白的暫存子目錄，測後移除。測試原始碼見 [Python smoke](../tests/python-smoke.py) 與 [Node 檢查](../tests/python-support.test.mjs)。

## 本機結果（2026-11-13）

| 驗證 | 結果 |
|---|---|
| `npm test` | 80/80 通過（含新增兩項索引／診斷測試） |
| `npm run check` | 35 skills；Node 語法、manifest、Markdown 連結檢查通過 |
| `npm run check:python` | 37 份 Python 原始檔 AST 解析通過 |
| `tests/python-smoke.py` | 3/3 通過：文件／圖片實作、中文與空白執行檔路徑及缺依賴診斷、平台／逾時模擬 |
| `check-python.mjs --skill all` | 必要模組皆可匯入，外部工具缺口如上，exit 0 |
| `.venv/Scripts/python.exe -m pip check` | No broken requirements found |

實測套件：defusedxml 0.7.1、lxml 6.1.3、pypdf 6.21.4、pdfplumber 0.11.10、pdf2image 1.17.0、Pillow 12.3.0、openpyxl 3.1.5；樣本生成用 python-docx 1.2.0、reportlab 4.5.1。這是本輪解析結果，不是所有相容版本的實測保證。

第一輪 Node 回歸 77/78，唯一失敗為 user-scope 安裝冪等檢查；當時仍在修改受測來源。停止編輯後完整重跑 80/80（含新增測試）通過，未修改安裝器邏輯。中文執行檔首次探測曾超過原 10 秒限制，調整為 30 秒並輸出候選失敗原因後通過。
## 證據與界限

- AST 解析全部 repo Python 原始檔；排除虛擬環境與依賴目錄。未把單純語法通過當成文件功能驗證。
- 缺 Python 指定執行檔回非零並提示最低版本與指定方式；不存在的 skill／缺少參數回 usage error。
- 安裝依賴前的 `.venv` 實測列出七個缺漏模組，並列出 LibreOffice、Poppler、Tesseract、gcc 缺口；不會自動安裝。
- Word 解包／重包以 python-docx 重新讀取內容驗收；PDF 表單擷取與填寫以 pypdf 重新讀取值驗收；圖片標註以輸出像素顏色驗收。這些不代表已驗證 Word／PDF 的最終視覺版面。
- 平台分支與 timeout／失敗回應為模擬測試；沒有以 mock 宣稱跨平台轉換成功。
- 本機找不到 LibreOffice：Excel 真實重算與 Word 轉換／接受修訂未驗證。Poppler 與 Tesseract 未安裝：PDF 頁面轉圖及 OCR 未驗證。不自動安裝系統工具。
- README 盤點：35 skills、5 agents、4 hooks（2 個預設註冊、2 個選用）、1 mod。根目錄腳本、skill 入口與 helper 分開說明；以 manifest、實際定義與 README 連結檢查核對。

本次未變更 Node 安裝、hooks、handover、plan-board 或 testdoc-supplement 的執行契約；實作驗證階段未更新全域安裝或 commit／push；後續發布與安裝依使用者另行授權。既有 agents/spec-reviewer.md 修改保留。
