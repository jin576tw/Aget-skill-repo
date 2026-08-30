# 個人 Claude Code 全域指南

> 骨架依循 `personal-memory/templates/claude-md-template.md`，改寫為全域（`~/.claude/CLAUDE.md`）版本。此檔為本機專屬設定，只版控在 `Aget-skill-repo` 的 `for-mac` 分支（不進共用的 `main`），因此可直接寫本機絕對路徑。

@/Users/jjin576tw/personal-memory/memory.md

---

## 與 work-memory 的分工

- **personal-memory**（本檔預設對象）：個人跨情境、與特定工作專案無關的通用知識庫（協作慣例、教訓、工具登錄等）。
- **work-memory**：特定工作專案（ADP/ESP/POS/PA 等）的知識庫，內容不搬進 personal-memory。各工作專案 repo 若有自己的 `CLAUDE.md`，會各自 `@import` work-memory，不受這份全域檔案影響；若專案內 `CLAUDE.md` 與此檔規則衝突，以專案內指引為準。

---

## Session 生命週期

### 開始時

若可存取 `/Users/jjin576tw/personal-memory/memory.md`：
1. 讀取該檔（含「常見陷阱」）。
2. 讀取 `personal-memory/knowledge/knowledge.md`，依任務補讀對應知識檔。
3. 若已判斷主題領域，讀取 `personal-memory/projects/{topic}/{topic}.md` 與 `status.md`（若存在）。

若目前工作屬於特定工作專案（而非個人一般性任務），改以該專案自己的 `CLAUDE.md`／`work-memory` 為主，本檔僅作為全域補充。

### 結束時

當使用者說「結束 / 收工 / close session / end session」或 `/clear`、`/save` 時，若本次工作內容屬於 personal-memory 範疇，依 `personal-memory/knowledge/conventions.md`「Session 結束協議」執行：更新 `journal/log.md`、視需要蒸餾知識、三個月清理。處理完成後顯示 `Memory has updated!`。

---

## 工具使用原則

- 優先使用內建工具完成操作；禁止用腳本取代可由內建工具直接完成的任務，以減少 token 消耗。
- 不確定需求時先詢問；能查證時先查證再執行。

---

## 本機工具庫路徑對應（Aget-skill-repo → 本機）

`~/.claude/` 下的 `agents/` `commands/` `skills/` `hooks/` 由 `Aget-skill-repo`（HEAD `e6c17d1`）鏡像而來（見 `personal-memory/decisions/decisions.md` ADR-0002）。內文中的中性佔位符在**本機**解析如下；fenced shell block 內用的同名值另由 `~/.claude/settings.json` 的 `env` 區塊提供，供 `$VAR` 展開（Claude Code 不載入 `~/.claude/settings.local.json`，使用者層設定只認 `~/.claude/settings.json`）。

| 佔位符 | 本機實際路徑 | 說明 |
|---|---|---|
| `{MEMORY_VAULT}` | `/Users/jjin576tw/personal-memory` | honey / save / handover / todo 等工具操作的知識庫。對應 Windows 的 `P:\MEMORY`。**本機指個人 vault，非 work-memory。** |
| `~/.claude` | `/Users/jjin576tw/.claude` | 個人工具庫根（CLAUDE_HOME） |
| `{JIRA_TOKEN_FILE}` | `/Users/jjin576tw/.claude/jira-token.txt` | Jira PAT 純文字檔（一行、無換行）；不存在時提示使用者建立 |
| `{SLIDES_OUT}` | `/Users/jjin576tw/Desktop/Slides` | `ppt` skill 產出目錄 |
| `{PLAYWRIGHT_HARNESS}` | （尚未建立）`/Users/jjin576tw/Desktop/playwright-harness` | 共享 E2E harness；需要時才建，建立後補進 `settings.local.json` 的 `env` 與 `additionalDirectories` |
| `{WORK_REPOS_ROOT}` | （未設定） | `pos-ui` / `core-ui` / `pa-ui` 的上層目錄；用到再設 |
| `{SESSION_METRICS_CMD}` | （本機無） | session-metrics 收集器；本機不存在，`save` / `handover` / `honey` 相關步驟一律略過並如實記為「本機無收集器」 |

`honey` / `save` / `handover` 內的 `cd "$MEMORY_VAULT"`、`git -C "$MEMORY_VAULT" …` 等 shell 片段一律讀 `~/.claude/settings.json` 的 `env` 環境變數。

### 結構落差（已知）

`personal-memory` 沒有 `projects/{core,pa,pos,esp,adp,sdd}/` 家族頁，也沒有 `knowledge/ai-tooling.md`（個人 vault 的等價檔是 `knowledge/tool-registry.md`）。`print-work-status`、`save` 的家族路由在個人情境下無家族可路由；`save.md` step 8a 對 `ai-tooling.md` 的參照目前指向不存在的檔（改讀 `tool-registry.md` 或建立 `ai-tooling.md` 為 ADR-0002 後續待決）。
