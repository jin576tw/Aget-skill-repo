# Agent Skill Repo — Claude Code 個人工具庫

個人化的 Claude Code 工具集，包含 Skills、Agents、Commands，用於日常開發與工作自動化。

---

## 目錄結構

```
.claude/
├── skills/      # 知識模組（可複用的 Skill 定義）
├── agents/      # 自訂代理程式
├── commands/    # 快捷命令（/slash command）
├── hooks/       # Session 自動化腳本
├── CLAUDE.md    # 全域 AI 協作偏好設定
└── settings.json# 外掛啟用與 Marketplace 設定
```

---

## Skills（31 個）

Skills 是可組合的知識模組，透過 `/skill-name` 觸發或由 Claude 自動判斷使用。

### Angular 開發

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **angular-conventions** | 撰寫 Angular 元件/服務時 | 統一命名、模組組織、依賴注入等開發慣例；表單值型別陷阱（`[ngValue]`）、ng-bootstrap 升版對應 |
| **angular-testing** | 撰寫 Angular 單元測試時（由 `@angular-unit-test-writer` 載入） | TestBed 設定、Component 測試模式、AC 標記規則 |

### Vue 開發

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **vue-conventions** | Vue 2 / Nuxt 2 / BootstrapVue 頁面開發或視覺 bug 除錯時 | DOM 診斷先行的除錯原則、BootstrapVue stickyColumn 修法、頁面入口定位法 |

### 文件與簡報

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **bsd-report** | 開發完成需產出 BSD 測試報告時 | 產生 BSD .docx 測試報告，支援任意票號（BMPPOS、BMPPCORE 等）；截圖支援手動提供或 Playwright 自動截圖；各專案透過 project-local command 設定輸出路徑 |
| **docx** | 需要操作 Word 文件時 | 讀取、產生、修改 .docx 檔案 |
| **md-to-pdf** | 需要將 Markdown 轉 PDF 時 | 支援中文、Mermaid 圖表、內嵌圖片 |
| **pdf** | 需要操作 PDF 時 | 讀取、合併、分割、旋轉、表單填充、OCR |
| **ppt** | 需要製作投影片時 | 從文字產生 MARP 格式投影片，輸出 PDF 或 PPTX |
| **xlsx** | 需要操作試算表時 | 讀取/編輯/建立 .xlsx、.csv、.tsv，支援公式與格式化 |

### 測試與品質

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **angular-testing** | 撰寫 Angular 單元測試時 | TestBed 設定、Component 測試模式、AC 標記規則 |
| **vue-testing** | 撰寫 Vue 2 / Nuxt 2 單元測試時 | Jest + Vue Test Utils v1、Component/composable 測試模式、AC 標記規則 |
| **java-testing** | 撰寫 Java 後端單元 / API 整合測試時 | JUnit 5 + Mockito + AssertJ、MockMvc API 整合測試模式、AC 標記規則 |
| **java-explain** | 提供 Java 類別路徑或程式碼片段，詢問「這段在做什麼」等初學者學習請求時（專為 adp-policy 設計） | Java 程式碼初學者解說器 |
| **playwright-patterns** | 撰寫 E2E 測試時 | Selector 策略、Auth Mock、測試報告模板 |
| **tdd** | 進行 TDD 開發時 | 測試設計、介面設計、Mocking、重構指引 |
| **review-checklist** | 執行 Code Review 時 | 技術與功能雙軌檢查清單、報告模板、Rubric 四面向計分（總分 ≥16 且單項 ≥3 為通過門檻，分數浮上 compact signal 供 loop 機制核對）＋評分紀律（defect-first、5 分需檢查依據、結論公式機械推導） |
| **verify** | 需要驗證實作是否符合規格時 | 對照 spec 驗證程式碼正確性 |
| **error-first-debug** | 收到 bug report / 500 / NPE / 資料值錯誤時 | Error-First 強制診斷順序（先取證據再讀碼）、auto-unboxing NPE / 日期漂移等根因辨識模式 |

### 規格與工作流程

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **spec-conventions** | 撰寫規格文件時 | EARS 語法、Given-When-Then、文件模板 |
| **gate-keeper** | 檢查 DoR / DoD 時 | 定義完備條件、驗收條件、人工檢查點 |
| **preflight** | 需求模糊或缺乏 spec 時 | 探索 spec、查詢業務規則、釐清需求再開始 |
| **compact-signal** | Subagent 完成工作回傳時 | 定義 Subagent→Orchestrator 的標準回傳格式 |
| **llm-wiki-maintainer** | 整理或維護知識資料夾時 | 將 markdown/Obsidian vault 對齊 raw sources / wiki / schema / ingest / query / lint 的 LLM Wiki 結構 |
| **loop-preflight** | 使用 /loop 前格式不確定時 | 檢查 interval/prompt/停止條件/寫入安全/狀態回報格式（LOOP_* 狀態碼）/停止提醒六項，輸出修正後指令 |
| **goal-preflight** | 使用 /goal 前條件不確定時 | 八項框架預檢（工具+任務+結果+限制+停損+停止條件可驗證性+Maker/Checker+Human Gate），輸出 Goal Contract 與修正後條件；不可驗證即回 GOAL_NEEDS_CONTRACT |
| **ticket-workflow** | 處理 Jira 票、開分支、commit、建 MR、交 QA 時 | 接票到交付的流程骨架：git 慣例、衝突解法、Jira 附件上傳 REST、交付檢查清單（專案特定值指回 vault） |

### Jira 整合

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **jira-get-attachments** | 要求「下載 Jira 附件」「看 Jira 截圖」，或 start-analysis 前需確認功能入口時 | 從 Jira ticket 下載附件圖片並用 Read tool 讀取內容（強制原則：推論入口 ≠ 實際入口，有附件必先看） |
| **jira-fix-comment** | Bug Fix 完成（已有 spec.md + commit）後要求「留言到 Jira」時 | 依 spec.md 與 git 紀錄產生並張貼「【Bug Fix 完成】」格式留言 |

### 設計與前端

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **frontend-design** | 設計前端 UI 時 | 前端設計指南與最佳實踐 |
| **web-design-guidelines** | 評估 Web 設計時 | Web 設計規範與檢查標準 |

### 輔助

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **find-skills** | 不確定要用哪個 Skill 時 | 列出所有可用 Skill 並說明用途；⚠️ 本項為通用 skill 生態系探索工具，非本 repo 自製領域知識，撰寫風格不同，不宜作為新 skill 的參考範本 |
| **windows-shell-gotchas** | Windows 端寫 PowerShell / 跑 CLI / 遇編碼問題時 | BOM、Big5、保留變數、execution policy、檔案鎖定等跨情境陷阱速查 |

---

## Agents（9 個）

Agents 是承載特定角色與能力的自訂代理程式，由主 Claude 透過 `Agent` 工具呼叫。

| Agent | 角色 | 適用場景 |
|-------|------|---------|
| **code-reader** | 程式碼閱讀師 | 解析業務邏輯、架構、評估變更影響範圍 |
| **code-reviewer** | 程式碼審查員 | 對照規格做純 Code Review，產出結構化驗收報告 |
| **implementer** | TDD 最小實作者 | 依 failing tests 與 AC 做最小綠燈實作，不超前開發 |
| **honey** | 跨專案知識管理 | 讀寫 P:\MEMORY Obsidian Vault，管理工作日誌、知識蒸餾、來源 catalog 與 wiki lint |
| **plan-formatter** | 需求 intake 路由 | 將自由文字需求正規化為結構化 Plan Input，定位相關 spec；已整合原 preflight 功能 |
| **spec-writer** | 規格文件撰寫師 | 新增/修改 spec、EARS 規格、Given-When-Then 驗收條件 |
| **test-writer** | Playwright 測試工程師 | 撰寫 E2E 測試、執行測試、回報結果 |
| **frontend-unit-test-writer** | 前端單元測試師（語言中立） | 自動偵測 Angular（Jasmine/TestBed）或 Vue 2/Nuxt2（Jest/Vue Test Utils），依 AC 產生紅燈測試 |
| **backend-unit-test-writer** | 後端單元 / API 整合測試師（語言中立） | 自動偵測語言（目前 Java：JUnit 5/Mockito/MockMvc），依 AC 產生紅燈測試；Step 7 補 MockMvc 整合測試 |

---

## Commands（8 個）

Commands 是可用 `/command-name` 直接呼叫的快捷命令。

| 命令 | 呼叫方式 | 功能 |
|------|---------|------|
| **todo** | `/todo` | 從 P:\MEMORY 讀取待辦事項，依優先度分類輸出 |
| **save** | `/save` | 保存 Session 至 P:\MEMORY 日誌（狀態更新、知識蒸餾、來源同步、必要時 wiki lint） |
| **start-work** | `/start-work` | 以需求 prompt 啟動 Markdown 工作流（DoR→計畫→DoD）；Orchestrator 模式 — 規劃 turn 用 opus，實作全數委派 sonnet workers，以 compact-signal 保持 context 精簡，支援平行委派與 advisor 升級點；code-reviewer 信號含 rubric 分數（R:X/20），在 /goal 迴圈中依「Loop Engineering 整合」節運作（STOP gate 優先、goal-evidence.md ledger、信號不可代打） |
| **review-change** | `/review-change` | 對照規格 Code Review，通過後更新規格變更歷程 |
| **print-work-status** | `/print-work-status` | 產生工作狀態週報，按業務領域與 JIRA 票號分組 |
| **start-loop** | `/start-loop <意圖描述>` | 自動執行 loop-preflight 6 項預檢（含 LOOP_* 狀態碼回報格式），輸出修正後的完整 `/loop` 指令供複製；週期巡檢定位，不推進開發目標 |
| **start-goal** | `/start-goal <意圖描述>` | Loop Engineering 主要落地點 — 8 項預檢，輸出 Goal Contract（機器可驗證停止條件、斷路器、Human Gate）+ 修正後 `/goal` 條件 + 執行協議；停止條件不可驗證即回 GOAL_NEEDS_CONTRACT |
| **adp-test-verify** | `/adp-test-verify` | ADP SIT 環境後端 Bug 手動驗收全流程 — 測試情境建立、AC 驗收、BSD 測報產出 |

---

## Hooks

| 腳本 | 執行時機 | 功能 |
|------|---------|------|
| `pitfall-guard.ps1` | PreToolUse（Bash\|PowerShell） | 比對 `P:\MEMORY\knowledge\pitfalls.json` 已知陷阱模式，命中則注入警告；warn-only、fail-open，不會擋下指令 |
| `session-start-context.ps1` | Session 開始時 | 自動載入工作上下文（P:\MEMORY 狀態）；⚠️ 目前存在於 repo 但未接進 `settings.json`／`settings.local.json.example`，接線狀態待確認 |

Hook 的實際接線（`hooks.PreToolUse` 等）屬機器專屬設定，見下方「使用方式」的 `settings.local.json` 說明，不寫在共用的 `settings.json` 裡。

---

## Plugins（外掛，非此 repo 管理）

以下外掛透過 `settings.json` 啟用，原始碼位於各自 repo：

| 外掛 | 來源 | 提供的 Skills/Agents |
|------|------|---------------------|
| **outlook-tools** | [gabrieldenny-del/outlook-extension](https://github.com/gabrieldenny-del/outlook-extension) | `outlook:triage-inbox`、`outlook:daily-digest`、`outlook:draft-reply`、`outlook:clean-inbox` |
| **code-analysis-package** | 本地目錄 `C:\Users\003689\Desktop\code-analysis-package` | 10+ 個程式碼分析 skills（deps/erd/flow/rules/sd/sa 等） |

---

## 使用方式

### 前提

- 安裝 [Claude Code](https://claude.ai/code)（CLI 或 Desktop App）
- 將此 repo clone 至 `~/.claude`（或 Windows 的 `%USERPROFILE%\.claude`）

### Clone

```bash
# 備份現有 .claude（如果有的話）
mv ~/.claude ~/.claude.bak

# Clone repo
git clone https://github.com/jin576tw/Aget-skill-repo.git ~/.claude
```

### 機器專屬設定

`settings.json` 只放跨機器共通的設定。機器/專案專屬的內容（hook 實際路徑、`additionalDirectories` 等）請自行建立 `settings.local.json`（已被 `.gitignore` 排除，不會進 repo）：

```bash
cp settings.local.json.example settings.local.json
# 依當前機器路徑修改 settings.local.json 內容
```

### 啟用外掛

於 `settings.json` 的 `enabledPlugins` 加入需要的外掛，或參考現有設定。

---

## 維護說明

每當 `skills/`、`agents/`、`commands/` 或 `hooks/` 下有新增、修改、刪除時：

```bash
git add skills/ agents/ commands/ hooks/ CLAUDE.md settings.json README.md
git commit -m "chore: <描述異動內容>"
git push
```

README.md 若有相應工具說明變動，請一併更新。

自訂 SKILL.md 超過約 150–200 行時，把細節/範例拆到同資料夾的 companion reference 檔（如 `angular-conventions/form-value-gotchas.md`、`ticket-workflow/git-conventions.md`），SKILL.md 本身只留摘要與索引。docx/pdf/xlsx 等 Anthropic 官方隨附的 proprietary skill 不適用此守則，也不應被修改。
