# Aget Work

給 Claude Code 與 Codex 使用的開發工具庫：32 個 skills、5 個 Agents、Node 腳本與選用 hooks。

安裝後不需要每次先執行初始化指令，也不必記指令名稱。直接用自然語言提出需求（例如「修正登入頁錯誤訊息」「幫我找這個設計的論文佐證」），模型會依 skill 的 description 自動選用；也可以手動點名。

## 安裝

需要 Node.js 18 以上。有兩種安裝方式，**請擇一**：兩種都裝會讓同一個 skill 載入兩份。

| | A. Claude Code plugin | B. setup-work 腳本 |
|---|---|---|
| 支援宿主 | Claude Code | Claude Code、Codex |
| 安裝位置 | Claude Code plugin 快取 | 指定專案，或使用者家目錄 |
| 手動點名 skill | `/aget-skill-repo:start-work` | `/aget-start-work` |
| 規範區塊（CLAUDE.md／AGENTS.md） | 不寫入 | 寫入受管理區塊 |
| hooks | 隨 plugin 啟用；未設定 `MEMORY_VAULT` 時不寫 journal | 加 `--hooks` 才啟用 |
| 更新 | `/plugin` 更新 | 重跑同一行指令 |

`npx` 安裝不支援：本套件沒有發佈到 npm。

### A. Claude Code plugin

在 Claude Code 中執行。在本分支合併進 `main` 之前，需在 repo 後面加 `@start-work-plugin` 指定分支：

```text
/plugin marketplace add jin576tw/Aget-skill-repo@start-work-plugin
/plugin install aget-skill-repo@aget
```

裝完開新的 session 才會載入。`aget` 是 marketplace 名稱，`aget-skill-repo` 是 plugin 名稱。

終端機寫法等效：

```sh
claude plugin marketplace add jin576tw/Aget-skill-repo@start-work-plugin
claude plugin install aget-skill-repo@aget
```

plugin 會載入 skills、agents 與 `hooks/hooks.json`，但不會修改你的 CLAUDE.md。要讓每輪結束時寫入 journal，需在 `~/.claude/settings.json` 的 `env` 設定 `MEMORY_VAULT`（知識庫的絕對路徑）；沒設定時 hook 只會 flush 既有的 checkpoint，不輸出任何訊息。若同一個目錄已有啟用 hooks 的 setup-work 安裝，journal 交給該安裝寫入，不會重複。

### B. setup-work 腳本

先 clone 本 repo，再在 repo 目錄內執行：

```sh
git clone -b start-work-plugin https://github.com/jin576tw/Aget-skill-repo.git
cd Aget-skill-repo
```

安裝到單一專案（Claude 與 Codex 都裝）：

```sh
node scripts/setup-work.mjs --target /absolute/project --platform both
```

安裝到使用者層，對所有專案生效，並啟用 hooks 與 journal：

```sh
node scripts/setup-work.mjs --scope user --target "$HOME" --platform claude --hooks --vault /absolute/vault
```

| 參數 | 說明 |
|---|---|
| `--target` | 安裝目標的絕對路徑。project scope 填專案根目錄，user scope 填家目錄。 |
| `--platform` | `claude`、`codex` 或 `both`（預設）。 |
| `--scope` | `project`（預設）或 `user`。 |
| `--hooks` | 啟用事件 hooks。之後更新時會沿用。 |
| `--vault` | 每輪 journal 要寫入的知識庫路徑。 |
| `--check` | 只檢查是否需要更新，不寫入。 |

安裝內容：

- 工具本體放在 `<target>/.aget/plugin`。
- skills 以 `aget-*` symlink 放進 `.claude/skills` 與 `.agents/skills`。
- agents 以 `aget-*` 放進 `.claude/agents`。
- CLAUDE.md／AGENTS.md 只更新 `<!-- aget:work -->` 區塊。

手動改過受管理的檔案時，腳本會回報衝突，不會覆寫。完整行為見 [runtime](docs/runtime.md)。

## 工具總表

「何時用」是模型自動選用的依據。手動點名時，plugin 安裝加前綴 `aget-skill-repo:`，setup 安裝加前綴 `aget-`。

### 開發流程

| Skill | 何時用 |
|---|---|
| [start-work](skills/start-work/SKILL.md) | 開發需求、bug 修正、接續既有實作。日常開發的主要入口：判斷規劃、技術能力與驗收方式。 |
| [start-plan](skills/start-plan/SKILL.md) | 需求跨多個 session、有共享依賴或多項交付時，建立或接續 plan-board。小任務不需要。 |
| [handover](skills/handover/SKILL.md) | 暫停或到達里程碑時保存 checkpoint；全部完成後 finalize，蒸餾知識並清除交接。 |
| [tdd](skills/tdd/SKILL.md) | 你要求 test-first，或專案本身採用 TDD 時。 |
| [verify](skills/verify/SKILL.md) | 實際執行變更，觀察行為是否符合需求。 |
| [error-first-debug](skills/error-first-debug/SKILL.md) | bug、例外、錯誤資料、效能異常的根因診斷。 |
| [review-checklist](skills/review-checklist/SKILL.md) | code review、規格追溯、交付驗收。 |
| [spec-conventions](skills/spec-conventions/SKILL.md) | 撰寫或維護需求與規格（EARS、Given-When-Then）。 |
| [setup-work](skills/setup-work/SKILL.md) | 首次安裝、更新或修復本工具庫。不是日常啟動步驟。 |

### 技術棧

| Skill | 何時用 |
|---|---|
| [angular-conventions](skills/angular-conventions/SKILL.md) | Angular Standalone 元件的結構、生命週期、依賴注入。 |
| [angular-testing](skills/angular-testing/SKILL.md) | Angular 單元與元件測試（沿用專案的 Jasmine／TestBed 等 runner）。 |
| [vue-conventions](skills/vue-conventions/SKILL.md) | Vue 2／Nuxt 2／BootstrapVue 開發與視覺 bug（凍結欄、遮蓋、破版）。 |
| [vue-testing](skills/vue-testing/SKILL.md) | Vue 單元與元件測試（依 Vue 版本選工具）。 |
| [java-testing](skills/java-testing/SKILL.md) | Java 單元與 API 測試（JUnit、Mockito、AssertJ、MockMvc）。 |
| [java-explain](skills/java-explain/SKILL.md) | 依讀者程度解說 Java 程式碼與語言機制。 |
| [playwright-patterns](skills/playwright-patterns/SKILL.md) | Playwright 瀏覽器／E2E 測試：選擇器、mock、版面斷言。 |
| [jspdf-autotable-worker](skills/jspdf-autotable-worker/SKILL.md) | jsPDF + autoTable 報表的欄寬、換行、對齊與跑版。 |
| [frontend-design](skills/frontend-design/SKILL.md) | 設計並實作高品質的網頁介面。 |
| [web-design-guidelines](skills/web-design-guidelines/SKILL.md) | 依 Web Interface Guidelines 審查 UI、無障礙與 UX。 |

### 文件與報告

| Skill | 何時用 |
|---|---|
| [docx](skills/docx/SKILL.md) | 建立、讀取、編輯 Word 檔。 |
| [pdf](skills/pdf/SKILL.md) | PDF 讀取、合併、分割、填表、OCR。 |
| [xlsx](skills/xlsx/SKILL.md) | 試算表的讀寫、公式、清理與格式轉換。 |
| [md-to-pdf](skills/md-to-pdf/SKILL.md) | Markdown 轉 PDF，支援中文、圖片與 Mermaid。 |
| [ppt](skills/ppt/SKILL.md) | 用 MARP 產生投影片並匯出 PDF／PPTX。需要 `@marp-team/marp-cli`。 |
| [bsd-report](skills/bsd-report/SKILL.md) | 依指定格式與截圖產生 BSD 測報 Word 檔。 |

### 研究、票務與知識

| Skill | 何時用 |
|---|---|
| [consult-claude](skills/consult-claude/SKILL.md) | Codex 透過本機 `claude` CLI 請 Claude 做獨立 review、第二意見、架構挑戰、除錯或辯論；Codex 驗證後決策。需要已登入的 Claude Code CLI。 |
| [consult-codex](skills/consult-codex/SKILL.md) | Claude Code 透過本機 `codex exec` 請 Codex 做獨立 review、第二意見、架構挑戰、除錯或辯論，依任務規模路由 GPT-5.6 Luna／Terra／Sol；Claude 驗證後決策。需要已登入的 Codex CLI。 |
| [ask-arxiv](skills/ask-arxiv/SKILL.md) | 找近期 arXiv 論文佐證或反證設計，或核對他人引用的研究數字。 |
| [jira-get-attachments](skills/jira-get-attachments/SKILL.md) | 讀取 Jira 附件與截圖，確認實際功能入口。需要 Jira connector 或受信任的端點。 |
| [jira-fix-comment](skills/jira-fix-comment/SKILL.md) | 依已驗證的修正整理 Jira 留言草稿。你明確授權才會張貼。 |
| [llm-wiki-maintainer](skills/llm-wiki-maintainer/SKILL.md) | 查詢、整理、蒸餾知識庫。 |
| [find-skills](skills/find-skills/SKILL.md) | 目前能力不足時，查找可用的 skill 或 plugin。 |

### Agents

在需要獨立 context 或獨立審查視角、且宿主允許時才由主會話委派，不是每次都用。

| Agent | 用途 | 工具權限 |
|---|---|---|
| [code-reader](agents/code-reader.md) | 閱讀指定範圍，回報架構、呼叫鏈與證據位置。 | 唯讀 |
| [code-reviewer](agents/code-reviewer.md) | 獨立審查變更與規格追溯，回報可定位的缺陷與未驗證項目。 | 唯讀 |
| [spec-reviewer](agents/spec-reviewer.md) | 核對規格是否可驗收，以及是否符合已核准來源。 | 唯讀 |
| [test-writer](agents/test-writer.md) | 撰寫並執行指定範圍的行為測試。 | 讀寫＋Bash |
| [honey](agents/honey.md) | 整理任務接續或可重用知識，依 handover 契約保存。 | 讀寫＋Bash |

### Node 腳本

一般由 skill 呼叫，也可手動執行。JSON 輸入格式見 [runtime](docs/runtime.md)。

| 腳本 | 用途 |
|---|---|
| `scripts/setup-work.mjs` | 安裝、更新、檢查（見上方參數表）。 |
| `scripts/memory.mjs checkpoint` ／ `finalize` | 保存 handover；完成後蒸餾知識、更新 status 並刪除交接。從 stdin 讀 JSON。 |
| `scripts/stage-checkpoint.mjs` | 先暫存 checkpoint，讓 hook 在 Stop、compact 等事件時補寫。 |
| `scripts/migrate-handover.mjs` | 把舊格式 handover 轉成新格式。 |
| `scripts/enable-vault.mjs <vault>` | 在知識庫入口加入 Aget 契約，只需執行一次。 |
| `scripts/pack-docx.mjs <parts-dir> <out.docx>` | 把 OOXML parts 打包成 .docx（bsd-report 使用）。 |
| `skills/start-plan/scripts/plan-board.mjs` | plan-board 的查詢、驗證、認領與狀態更新。 |
| `npm test` ／ `npm run check` | 回歸測試；套件、manifest 與連結檢查。 |

### Hooks

| 檔案 | 作用 | 由誰啟用 |
|---|---|---|
| `hooks/record.mjs` | 在 Stop、PreCompact、SessionEnd 等事件時 flush 暫存的 checkpoint（不會自動結案），並在每輪 Stop 於 `journal/log.md` 追加一行。 | plugin 的 `hooks/hooks.json`，或 setup 加 `--hooks` |
| `hooks/pitfall-guard.mjs` | PreToolUse 時比對 `$MEMORY_VAULT/knowledge/pitfalls.json`，命中就提示，永不阻擋。 | 預設不啟用，需自行加進 settings |
| `hooks/session-start-context.mjs` | SessionStart 時偵測專案技術棧（package.json、pom.xml）。 | 預設不啟用，需自行加進 settings |

## 舊版指令對照

舊版的 10 個 slash commands 已移除，功能併入以下 skills：

| 舊指令 | 現在用 |
|---|---|
| `/start-work`、`/start-plan` | 同名 skills，或直接描述需求 |
| `/handover` | handover（checkpoint） |
| `/save`、`/todo`、`/print-work-status` | llm-wiki-maintainer（查詢與維護）＋ handover（finalize） |
| `/print-sd` | spec-conventions ＋ docx／md-to-pdf |
| `/review-change` | review-checklist |
| `/start-goal`、`/start-loop` | start-work（持續目標與排程的邊界） |

已合併的舊 skills：preflight、gate-keeper、goal-preflight、loop-preflight、compact-signal、ticket-workflow 併入 start-work；windows-shell-gotchas 隨 PowerShell 一起移除。

## 延伸文件

- [runtime](docs/runtime.md)：安裝細節與 checkpoint、finalize、plan-board 的 JSON 介面
- [recording-lifecycle](docs/recording-lifecycle.md)：紀錄與 handover 的生命週期
- [tool-design-audit](docs/tool-design-audit.md)：每個工具保留或移除的理由
- [validation](docs/validation.md)：已驗證與尚未驗證的範圍

## 驗證

```sh
npm test
npm run check
```

測試通過只證明套件與 fixture 行為正確，不代表模型在真實對話中每次都會選對 skill。實機驗證範圍見 [validation](docs/validation.md)。
