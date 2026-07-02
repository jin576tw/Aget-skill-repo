---
name: jira-get-attachments
description: 從 Jira ticket 下載附件圖片並用 Read tool 讀取內容。TRIGGER when 使用者要求「下載 Jira 附件」「看 Jira 截圖」「取得 Jira 圖片」「分析前先看截圖」，或在 start-analysis 前需要確認功能入口時（強制原則：推論入口 ≠ 實際入口，有附件必先看）。
---

# Jira 附件圖片下載工具

從 Jira Data Center 取得附件圖片，供確認功能入口、問題截圖分析使用。

## 背景知識

- `atlassian-jira-dc` MCP 不支援直接讀取圖片內容（描述中 `!image.png!` 只有檔名）
- 需要透過 Jira REST API + PAT（Personal Access Token）下載
- PAT 存於 `P:\jira-token.txt`（純文字，一行，無換行）
- Jira 基底 URL：`https://jira.transglobe.com.tw:8443`
- **強制原則**：`/start-analysis` 前若 Jira 有附件截圖，必須先執行本 skill 確認入口頁面，再啟動分析

## 執行步驟

### STEP 1 — 取得附件清單

用 `mcp__atlassian-jira-dc__jira_getIssue`（若未載入先 ToolSearch）：

```
fields: ["attachment", "summary", "description"]
```

從回傳的 `attachment[]` 陣列取得每個附件的：
- `content`：下載 URL（例：`https://jira.transglobe.com.tw:8443/secure/attachment/142556/image.png`）
- `filename`：原始檔名
- `mimeType`：確認是 `image/png` 或 `image/jpeg`

### STEP 2 — 讀取 PAT

```bash
PAT=$(cat "P:/jira-token.txt" | tr -d '[:space:]')
```

> **注意**：PAT 值只用於 curl 執行，不輸出至 console、不寫入任何檔案或記憶庫。

### STEP 3 — 下載附件

將每個圖片附件下載至 scratchpad 目錄：

```bash
PAT=$(cat "P:/jira-token.txt" | tr -d '[:space:]')
DEST="$TEMP/jira-attachments"
mkdir -p "$DEST"

# 對每個附件執行（單行，禁止換行）：
curl -k -L -s -o "$DEST/img1.png" -H "Authorization: Bearer $PAT" "<content_url>"

# 驗證是否為真正的 PNG（非 HTML 登入頁）
xxd "$DEST/img1.png" | head -1
# 正確輸出應以 "8950 4e47" 開頭（PNG magic bytes）
# 若開頭為 "0a0a 0a3c"（<!DOCTYPE）→ PAT 失效，提示使用者更新 P:\jira-token.txt
```

### STEP 4 — 讀取圖片

```
Read tool：讀取 "$DEST/img1.png"（Read tool 原生支援 PNG/JPG 視覺辨識）
```

依照圖片內容：
- 確認畫面標題（page_title）
- 確認 URL 路徑或選單路徑
- 標記問題區域（紅框、標注等）
- 輸出入口分析摘要

### STEP 5 — 回報結果

輸出格式：

```
## 附件分析結果

**[圖1] {filename}**
- 畫面：{頁面標題}
- 路徑：{選單路徑 → 頁籤}
- 關鍵資訊：{問題區域描述}

**[圖2] {filename}**
...

## 功能入口確認
- 前端頁面：`pages/{path}/{filename}.vue`
- 後端 API 推測：`{method} /gi/{path}`
```

## 常見問題排除

| 症狀 | 原因 | 解法 |
|---|---|---|
| 下載檔案為 HTML（magic bytes `0a0a 0a3c`） | PAT 失效或 Bearer 格式不符 | 請使用者更新 `P:\jira-token.txt`（Jira → 個人設定 → Personal Access Tokens） |
| `curl: no URL specified` | curl 指令換行導致參數解析失敗 | 確保 curl 指令為**單行**，或透過 Bash tool 執行 |
| 附件 `mimeType` 非 image | 附件為 docx/pdf 等非圖片格式 | 跳過，改用 `docx` 或 `pdf` skill 處理 |
| Jira MCP 未連線 | session 初始化問題 | 執行 `/mcp` 重連，或改用 `jira_searchIssues` 驗證連線 |

## 注意事項

- **PAT 安全**：PAT 值只出現在 Bash 執行環境中，絕不輸出、不寫檔、不入記憶庫
- **PAT 位置**：`P:\jira-token.txt`（純文字一行）；若不存在，提示使用者建立
- **前置原則**：推論的功能入口可能錯誤（見 `lessons-learned.md` 2026-06-19），截圖是最可靠的入口確認來源

## 參考

- 知識庫：`P:\MEMORY\knowledge\lessons-learned.md`（§ ADP 分析入口定位工作流 / Jira 附件圖片下載）
- 上傳附件：`P:\MEMORY\knowledge\lessons-learned.md`（§ Jira Data Center 附件上傳）
