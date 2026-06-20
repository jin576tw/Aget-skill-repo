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

## Skills（18 個）

Skills 是可組合的知識模組，透過 `/skill-name` 觸發或由 Claude 自動判斷使用。

### Angular 開發

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **angular-conventions** | 撰寫 Angular 元件/服務時 | 統一命名、模組組織、依賴注入等開發慣例 |
| **angular-testing** | 撰寫 Angular 單元測試時 | TestBed 設定、Component 測試模式、AC 標記規則 |

### 文件與簡報

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **docx** | 需要操作 Word 文件時 | 讀取、產生、修改 .docx 檔案 |
| **md-to-pdf** | 需要將 Markdown 轉 PDF 時 | 支援中文、Mermaid 圖表、內嵌圖片 |
| **pdf** | 需要操作 PDF 時 | 讀取、合併、分割、旋轉、表單填充、OCR |
| **ppt** | 需要製作投影片時 | 從文字產生 MARP 格式投影片，輸出 PDF 或 PPTX |
| **xlsx** | 需要操作試算表時 | 讀取/編輯/建立 .xlsx、.csv、.tsv，支援公式與格式化 |

### 測試與品質

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **playwright-patterns** | 撰寫 E2E 測試時 | Selector 策略、Auth Mock、測試報告模板 |
| **tdd** | 進行 TDD 開發時 | 測試設計、介面設計、Mocking、重構指引 |
| **review-checklist** | 執行 Code Review 時 | 技術與功能雙軌檢查清單、報告模板 |
| **verify** | 需要驗證實作是否符合規格時 | 對照 spec 驗證程式碼正確性 |

### 規格與工作流程

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **spec-conventions** | 撰寫規格文件時 | EARS 語法、Given-When-Then、文件模板 |
| **gate-keeper** | 檢查 DoR / DoD 時 | 定義完備條件、驗收條件、人工檢查點 |
| **preflight** | 需求模糊或缺乏 spec 時 | 探索 spec、查詢業務規則、釐清需求再開始 |
| **compact-signal** | Subagent 完成工作回傳時 | 定義 Subagent→Orchestrator 的標準回傳格式 |

### 設計與前端

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **frontend-design** | 設計前端 UI 時 | 前端設計指南與最佳實踐 |
| **web-design-guidelines** | 評估 Web 設計時 | Web 設計規範與檢查標準 |

### 輔助

| Skill | 觸發時機 | 功能 |
|-------|---------|------|
| **find-skills** | 不確定要用哪個 Skill 時 | 列出所有可用 Skill 並說明用途 |

---

## Agents（9 個）

Agents 是承載特定角色與能力的自訂代理程式，由主 Claude 透過 `Agent` 工具呼叫。

| Agent | 角色 | 適用場景 |
|-------|------|---------|
| **code-reader** | 程式碼閱讀師 | 解析業務邏輯、架構、評估變更影響範圍 |
| **code-reviewer** | 程式碼審查員 | 對照規格做純 Code Review，產出結構化驗收報告 |
| **implementer** | TDD 最小實作者 | 依 failing tests 與 AC 做最小綠燈實作，不超前開發 |
| **memory** | 跨專案知識管理 | 讀寫 P:\MEMORY Obsidian Vault，管理工作日誌與知識蒸餾 |
| **plan-formatter** | 需求 intake 路由 | 將自由文字需求正規化為結構化 Plan Input，定位相關 spec |
| **preflight** | 規格探索代理 | 需求模糊時探索 spec 與元件，供主 agent 路由使用 |
| **spec-writer** | 規格文件撰寫師 | 新增/修改 spec、EARS 規格、Given-When-Then 驗收條件 |
| **test-writer** | Playwright 測試工程師 | 撰寫 E2E 測試、執行測試、回報結果 |
| **unit-test-writer** | Angular 單元測試師 | 依 AC 產生紅燈 Jasmine/TestBed 測試（不負責實作） |

---

## Commands（5 個）

Commands 是可用 `/command-name` 直接呼叫的快捷命令。

| 命令 | 呼叫方式 | 功能 |
|------|---------|------|
| **todo** | `/todo` | 從 P:\MEMORY 讀取待辦事項，依優先度分類輸出 |
| **save** | `/save` | 保存 Session 至 P:\MEMORY 日誌（知識蒸餾、狀態更新） |
| **start-work** | `/start-work` | 以需求 prompt 啟動 Markdown 工作流（DoR→計畫→DoD） |
| **review-change** | `/review-change` | 對照規格 Code Review，通過後更新規格變更歷程 |
| **print-work-status** | `/print-work-status` | 產生工作狀態週報，按業務領域與 JIRA 票號分組 |

---

## Hooks

| 腳本 | 執行時機 | 功能 |
|------|---------|------|
| `session-start-context.ps1` | Session 開始時 | 自動載入工作上下文（P:\MEMORY 狀態） |
| `session-end-detector.sh` | Session 結束時 | 偵測結束信號並觸發 /save 流程 |

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
