---
name: windows-shell-gotchas
description: Windows / PowerShell 環境陷阱速查（編碼、BOM、語法、execution policy、檔案鎖定）。TRIGGER when 在 Windows 環境撰寫或除錯 PowerShell 腳本、產生 JSON/XML 檔案、跑 npm/npx/mvn 等 CLI 工具、遇到編碼或路徑亂碼問題。DO NOT TRIGGER when 在 macOS/Linux 環境。
---

# Windows / PowerShell 陷阱速查

> 這些坑在多個專案反覆踩過（kiro JSON、BSD docx、Maven、Playwright harness），寫任何 Windows 端腳本前先掃一遍。

## 編碼

- **UTF-8 BOM 使 Rust serde_json（kiro-cli 等）靜默失敗**：報 `expected value at line 1 column 1`，但 PowerShell 自己的 `ConvertFrom-Json` 容忍 BOM，自建驗證腳本測不出來。寫 JSON 一律用 `[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))`（無 BOM），或 Claude Code Write tool（天然無 BOM）。驗證：`Format-Hex` 確認首 3 bytes 非 `EF BB BF`；`Test-Path` 通過不代表 BOM 已排除。
- **zh-TW Windows 的 `Get-Content` 預設用 Big5（CP950）讀檔**：含中文的 UTF-8 JSON 會解析失敗。讀寫都必加 `-Encoding UTF8`（避免雙重轉碼破壞）。
- **heredoc/字串 pipe 給 `node` 時中文路徑損毀**（轉成 `?` → `ENOENT`）：先用 Write tool 把腳本寫成 `.js` 檔再 `node script.js`，完全繞過 pipe 編碼。

## PowerShell 語法

- **`$pid` 是保留變數（process ID）**：函式參數命名踩到會取到 PID 而非傳入值。同類保留名先查 `Get-Variable`。改用 `$docId`、`$itemId` 等。
- **零參數函式呼叫不加括號**：`xblank()` 會 parse error，正確為 `xblank`。
- **多參數用空格分隔，禁逗號**：`ximg 'a' 'b' 'c'` 正確；`ximg('a','b','c')` 會把整個陣列塞給第一個參數。
- **`--%`（stop-parsing token）**：PowerShell 會把 `-Dkey=value` 的 `-D` 切成獨立參數；`mvn --% test -Dmaven...=true` 讓後續參數原樣傳給程式。
- **PS 5.1 不支援 `here-string | Set-Content -Encoding utf8` 某些組合**：改用 `[System.IO.File]::WriteAllText()`。

## 環境 / 工具

- **execution policy 擋 `npm.ps1` / `npx.ps1`**（`PSSecurityException`）：直接改呼叫 `npm.cmd` / `npx.cmd`。
- **`pwsh` 常未安裝**（那是 PowerShell 7）：驗證腳本用 `powershell -NoProfile -ExecutionPolicy Bypass -File ...`。
- **WindowsApps Python stub**：`python` 指向 `...\WindowsApps\` 時任何指令回 exit code 49，`pip` 也不存在。識別：`(Get-Command python).Source` 含 `WindowsApps`。需真正安裝 Python 或改用 Node.js 方案。
- **檔案被鎖定（如 docx 在 Word 開著）時 `Move-Item` 拋 IOException**：改用 `Copy-Item -Force`；要清來源放 try/catch 中選擇性刪除，複製失敗不影響檔案完整性。
- **`ZipFile::CreateFromDirectory` 目標已存在會拋例外**：先 `Test-Path` + `Remove-Item`。
- **長時間 CLI 指令在 PowerShell tool 會被自動排入背景**（無法同步取得輸出）：需同步確認輸出的轉換類指令（md-to-pdf 等）優先用 Bash tool。
- **`.gitignore` 路徑一律用正斜線 `/`**：反斜線 `\` 不被 Git 解析為目錄分隔符，規則靜默無效。
- **多行指令貼入 PowerShell 會把後續行當獨立指令**（`claude mcp add`、curl 常中招）：必須單行執行。
