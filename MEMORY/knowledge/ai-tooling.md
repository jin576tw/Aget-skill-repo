# 個人 Skills 與 Agents 索引

本檔整理個人建立或常用的 Skills / Agents，作為跨專案工具索引。實際行為、限制與最新內容仍以原始定義檔為準。

## 使用原則

- 本檔只記錄「何時用、何時不要用、來源在哪裡」，不複製完整 prompt 或 SKILL.md 全文。
- 若工具只適用單一 project family 或 leaf project，優先補到對應 `projects/{family}/{family}.md`、`projects/{family}/{leaf}.md` 或專案內指引。
- 更新工具定義後，若適用情境或限制改變，需同步更新本檔。

## Skills

### docx

- 類型：Skill
- 用途：建立、讀取、編輯或整理 Word 文件。
- 適用：報告、memo、正式文件、需要 `.docx` 交付物的任務。
- 不適用：PDF、試算表、一般程式碼修改。
- 來源：`c:\Users\003689\.agents\skills\docx\SKILL.md`
- 最後驗證：2026-05-14

### find-skills

- 類型：Skill
- 用途：協助找出可安裝或可用的 skill。
- 適用：詢問「有沒有 skill 可以做某件事」或想擴充能力時。
- 不適用：已經確定要直接實作或修改程式碼。
- 來源：`c:\Users\003689\.agents\skills\find-skills\SKILL.md`
- 最後驗證：2026-05-14

### frontend-design

- 類型：Skill
- 用途：產生具有設計感、可落地的前端 UI。
- 適用：新頁面、元件、landing page、版型與視覺優化。
- 不適用：純後端邏輯修正、非 UI 類任務。
- 來源：`c:\Users\003689\.agents\skills\frontend-design\SKILL.md`
- 最後驗證：2026-05-14

### tdd

- 類型：Skill
- 用途：以 red-green-refactor 流程撰寫功能或修 bug。
- 適用：要求 test-first、想補明確測試保護時。
- 不適用：純文件整理、一次性簡單文案調整。
- 來源：`c:\Users\003689\.agents\skills\tdd\SKILL.md`
- 最後驗證：2026-05-14

### web-design-guidelines

- 類型：Skill
- 用途：檢查 UI 是否符合 Web 介面與可用性原則。
- 適用：UI review、可及性檢查、UX audit。
- 不適用：非前端介面問題。
- 來源：`c:\Users\003689\.agents\skills\web-design-guidelines\SKILL.md`
- 最後驗證：2026-05-14

### xlsx

- 類型：Skill
- 用途：建立、讀取、清理、轉換或修正試算表檔案。
- 適用：`.xlsx`、`.xlsm`、`.csv`、`.tsv` 為主要輸入或輸出時。
- 不適用：Word 文件、純程式碼實作。
- 來源：`c:\Users\003689\.agents\skills\xlsx\SKILL.md`
- 最後驗證：2026-05-14

### preflight

- 類型：Skill
- 用途：需求 intake 與上下文路由 — 在需求仍是業務縮寫或畫面口語時，先正規化並定位候選檔案，再進入實作或 review。
- 適用：任何 Angular 專案（core-ui / pa-ui / pos-ui 皆可）；觸發時機：prompt 提到 view/tab/form/field 但無精確路徑或 symbol。
- 不適用：使用者已提供精確檔案路徑、symbol 或 failing behavior 時（直接進入分析）。
- 機制：Step 0 自動讀 `CLAUDE.md` 推導目錄結構；若有 `.github/instructions/preflight.instructions.md` 則以它為 routing guide，否則以 CLAUDE.md 為準。
- 來源：`c:\Users\003689\.claude\skills\preflight\SKILL.md`
- 最後驗證：2026-06-05

### angular-conventions

- 類型：Skill
- 用途：提供 Angular Standalone Components 通用開發慣例。
- 適用：Angular 元件建立、元件架構討論、生命週期與 DI 模式。
- 不適用：非 Angular 專案。
- 來源：`c:\Users\003689\.claude\skills\angular-conventions\SKILL.md`
- 最後驗證：2026-05-14

### angular-testing

- 類型：Skill
- 用途：提供 Angular Unit / Component 測試規範，支援 `AC-XX` 紅燈測試寫法。
- 適用：Jasmine、TestBed、ComponentFixture、fakeAsync、單一 AC 的 unit/component test。
- 不適用：Playwright E2E、非 Angular 測試框架。
- 來源：`c:\Users\003689\.claude\skills\angular-testing\SKILL.md`
- 最後驗證：2026-06-08

### gate-keeper

- 類型：Skill
- 用途：提供 Step 0 / Step 8 的 DoR、Open Questions、DoD 與 human checkpoint 規則。
- 適用：檢查是否可進入 `/plan`、是否要停下來問答確認、是否可收尾。
- 不適用：直接撰寫程式碼、直接做實作決策。
- 來源：`c:\Users\003689\.claude\skills\gate-keeper\SKILL.md`
- 最後驗證：2026-06-08

### playwright-patterns

- 類型：Skill
- 用途：提供 Playwright E2E 測試撰寫通用指南。
- 適用：Playwright、UI 自動化、E2E 測試設計。
- 不適用：非測試任務或非 Playwright 測試框架。
- 來源：`c:\Users\003689\.claude\skills\playwright-patterns\SKILL.md`
- 最後驗證：2026-05-14

### review-checklist

- 類型：Skill
- 用途：提供程式碼審查清單與驗收報告格式。
- 適用：code review、驗收、功能完整性與規範檢查。
- 不適用：純規格撰寫或純實作任務。
- 來源：`c:\Users\003689\.claude\skills\review-checklist\SKILL.md`
- 最後驗證：2026-05-14

### spec-conventions

- 類型：Skill
- 用途：規格文件撰寫規範，包含 EARS 與 Given-When-Then。
- 適用：spec 撰寫、驗收條件整理、需求文件標準化。
- 不適用：只做程式碼實作、不涉及規格輸出時。
- 來源：`c:\Users\003689\.claude\skills\spec-conventions\SKILL.md`
- 最後驗證：2026-05-14

### get-search-view-results

- 類型：Skill
- 用途：取得 VS Code Search view 的目前搜尋結果。
- 適用：需要整理已存在的搜尋視圖結果時。
- 不適用：可直接用一般搜尋工具完成的簡單搜尋。
- 來源：`c:\Users\003689\.vscode\extensions\github.copilot-chat-0.43.0\assets\prompts\skills\get-search-view-results\SKILL.md`
- 最後驗證：2026-05-14

### agent-customization

- 類型：Skill
- 用途：建立、修正、除錯 agent customization 檔案。
- 適用：`.instructions.md`、`.prompt.md`、`.agent.md`、`SKILL.md`、`copilot-instructions.md` 等設定調整。
- 不適用：一般產品功能開發或執行期 bug 修復。
- 來源：`c:\Users\003689\.vscode\extensions\github.copilot-chat-0.43.0\assets\prompts\skills\agent-customization\SKILL.md`
- 最後驗證：2026-05-14

## Agents

### code-reader

- 類型：Agent
- 用途：閱讀專案程式碼與規格，輸出結構化摘要與影響面。
- 適用：需求分析、功能盤點、讀 spec、理解既有實作。
- 不適用：直接修改程式碼或執行測試。
- 來源：目前個人 agent 設定中的 `code-reader`
- 最後驗證：2026-05-14

### code-reviewer

- 類型：Agent
- 用途：依規格做純 code review，聚焦缺陷、風險與測試缺口。
- 適用：開發完成後的程式碼審查。
- 不適用：撰寫測試、執行測試、直接修改程式碼。
- 補充：目前 prompt 已明寫先讀 `P:\MEMORY\memory.md`、`knowledge\knowledge.md`、任務相關 `knowledge/` 與 family `status.md`，再回到 spec / diff / 原始碼做審查。
- 來源：目前個人 agent 設定中的 `code-reviewer`
- 最後驗證：2026-06-04

### spec-writer

- 類型：Agent
- 用途：新增或更新 spec 文件與驗收條件。
- 適用：規格撰寫、EARS、Given-When-Then、變更記錄整理。
- 不適用：直接做產品程式碼實作。
- 來源：目前個人 agent 設定中的 `spec-writer`
- 最後驗證：2026-06-08

### implementer

- 類型：Agent
- 用途：TDD 最小實作者，只根據當前 failing tests 與單一 AC 做最小綠燈實作。
- 適用：Step 4 綠燈實作、單一 AC 的最小修改。
- 不適用：需求探索、規格撰寫、E2E、超前開發。
- 來源：`c:\Users\003689\.claude\agents\implementer.md`
- 最後驗證：2026-06-08

### test-writer

- 類型：Agent
- 用途：撰寫 Playwright 規格、執行測試並回報結果。
- 適用：需要補 E2E 測試時。
- 不適用：非 Playwright 測試、非測試任務。
- 來源：目前個人 agent 設定中的 `test-writer`
- 補充：若產品專案沒有 Playwright，可在使用者確認後切換到共享 harness `C:\Users\003689\Desktop\playwright-harness`，並在該 harness 內安裝 Playwright。
- 最後驗證：2026-06-08

### unit-test-writer

- 類型：Agent
- 用途：依 spec 的單一 AC 產生紅燈 Jasmine / TestBed 測試。
- 適用：Step 3、Angular unit / component test、`AC-XX` 測試追蹤。
- 不適用：產品程式碼實作、E2E 測試。
- 來源：`c:\Users\003689\.claude\agents\unit-test-writer.md`
- 最後驗證：2026-06-08

### Explore

- 類型：Agent
- 用途：快速、唯讀地探索大型程式碼庫並回傳重點。
- 適用：需要先盤點檔案、關聯與關鍵實作路徑時。
- 不適用：需要實際寫碼、改檔或執行驗證時。
- 來源：目前個人 agent 設定中的 `Explore`
- 最後驗證：2026-05-14

## 更新觸發條件

- 新增、移除或重新命名 Skill / Agent。
- 調整某個工具的適用情境、限制或主要輸出。
- 真實來源位置改變。
- 工具已失效、被取代或不再維護。