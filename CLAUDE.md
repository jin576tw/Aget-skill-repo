# User-Level Claude Code Preferences

## AI Collaboration Style
- Respond in the language the user uses (default: Traditional Chinese for this user)
- Be concise — lead with answers, not reasoning
- Do not add features or refactor beyond what was asked
- When unsure, ask before acting
- 優先使用內建工具（檔案讀寫、搜尋、編輯等）完成操作，禁止透過 Python 或其他程式語言腳本執行可由內建工具直接完成的任務，以減少不必要的 token 消耗

## Commit Conventions
- Commit messages in English, concise (1-2 sentences)
- Use conventional commit prefixes: feat, fix, refactor, docs, test, chore

## Code Review Preferences
- Flag issues with file path and line number
- Categorize by severity: high / medium / low
- Provide fix suggestions, not just problem descriptions

## Session 開始
- 開始前先執行 `git -C "P:\MEMORY" pull` 確認知識庫為最新狀態；若失敗或有衝突則略過，不阻塞工作。
- 開始專案工作時，**依序執行**：
  1. 讀 `P:\MEMORY\memory.md`（**含「常見陷阱」段落，逐條確認是否與本次任務相關**）
  2. 讀 `P:\MEMORY\knowledge\knowledge.md`，依任務類型補讀對應知識檔
     （bug fix → `lessons-learned`；分析 → `domain-map` + `lookup-map`；工具使用 → `ai-tooling`；新功能 → `workflow-map`）
  3. 讀 `projects/{family}/{family}.md` 與 `projects/{family}/status.md`
  4. 若已鎖定子專案，再讀 `projects/{family}/{leaf}.md`
- 若無法存取 `P:\MEMORY`，以專案內 `CLAUDE.md`、instructions 與原始碼為依據，不阻塞工作。

## 工作中知識庫查詢

接到任務時，動手前依任務類型主動查詢知識庫（不等「需要理解時」才翻）：

| 任務類型 | 必查文件 | 查詢位置 |
|---|---|---|
| Bug Fix / 業務邏輯修改 | 對應功能的業務規則文件 + lessons-learned 最新段 | `P:\MEMORY\knowledge\lessons-learned.md` + 專案知識庫 |
| 新功能實作 | 對應功能的流程圖、設計文件、API 契約 | 專案知識庫（各專案 CLAUDE.md 定義路徑） |
| 程式碼分析 | 先確認專案知識庫是否已有對應功能的分析輸出 | 專案知識庫目錄結構 |
| 不確定功能路徑 | lookup-map | `P:\MEMORY\knowledge\lookup-map.md` |

**強制原則**：
- 專案知識庫有對應功能 → 以知識庫為準，不直接翻原始碼
- 專案知識庫無對應功能 → 確認是否需要先執行分析，再看原始碼
- `lessons-learned` 有對應教訓段 → 必須在動手前讀完該段，確認已知問題

## Session 結束
- 當使用者說「結束」、「收工」、「close session」、「end session」、`/clear` 或 `/save` 時，若可存取 `P:\MEMORY\knowledge\conventions.md`，則依「Session 結束協議」執行：更新日誌、更新專案狀態、知識蒸餾、三個月清理。若無法存取則略過。處理完成後顯示 `Memory has updated!`。

## 工具庫 Repo 同步規則
- `C:\Users\003689\.claude` 已連結至 GitHub repo：https://github.com/jin576tw/Aget-skill-repo
- 每當 `skills/`、`agents/`、`commands/`、`hooks/` 下有任何新增、修改、刪除，完成後請 commit 並 push 至 repo
- Commit message 使用 `chore:` prefix，簡述異動內容
- `README.md` 若相應工具說明有變動，一併更新後再 commit
