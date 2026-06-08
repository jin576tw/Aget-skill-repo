# 蒸餾知識庫 (Lessons Learned)

> 從工作日誌蒸餾出的可重用知識。按主題分類，每條附來源日期與事件概述。
> 通用技術慣例應升級到 `conventions.md`；此檔收錄情境性教訓與踩坑經驗。

---

## AI Workflow / Skill 設計

- [2026-06-08] **`/start-work` 軟語言導致 AI 繞過 subagent**：`/start-work` skill 若用「引導進入」、「建議使用」等軟語氣描述 subagent，AI 遇到「加一個 pipe」等小任務會判斷「需求簡單」而直接 inline 實作，跳過 `@spec-writer`、`@implementer`、`@code-reviewer`。**修正模式**：(1) 頂部加 HARD RULES 區塊，明列不可繞過的規則；(2) subagent 名稱一律用 `@` 前綴強調強制性；(3) 簡單任務豁免規則**明文列出可免項目**，不留給 AI 自行判斷。（來源：BMPPOS-19 resultDisplay pipe 實作）

- [2026-06-08] **`/start-work` STOP gate 位置錯誤**：原始設計在「Spec 更新完成後」設了 STOP gate，導致中間步驟不必要地中斷詢問使用者。**正確的中斷點只有兩個**：(1) 計畫確認後（`WAITING_FOR_PLAN_CONFIRMATION`）— 確認 AC 切分與影響範圍；(2) DoD 前（`READY_FOR_DOD`）— 確認進入收尾。Spec 更新、實作循環等中間步驟應自動完成，不中斷。（來源：BMPPOS-19 resultDisplay pipe + `/start-work` 修正討論）

- [2026-06-08] **Spec 更新應由 `@spec-writer` subagent 執行，不應 inline**：AI orchestrator 直接呼叫 Edit/Write 工具更新 spec，等同繞過 spec-writer 的行為規範（EARS 語法、驗收條件格式、手動測試步驟等），可能輸出不符合 Spec-Kit 憲法的格式。**規則：所有 spec.md 操作（包括補變更歷程）一律啟動 `@spec-writer` subagent，不得 inline**。（來源：BMPPOS-19 `/start-work` 未正確啟動 spec-writer）

- [2026-06-08] **`/start-work` 完整流程驗證通過**：修正後的 `/start-work`（含 HARD RULES、正確 STOP gate 位置、強制 `@subagent` 命名）已由使用者驗證，完整跑通以下 8 個階段：preflight → DoR → spec-writer → 計畫確認（STOP gate #1）→ implementer → code-reviewer → spec 變更歷程更新（`@spec-writer`）→ DoD 收工（STOP gate #2）。確認任務「任務重分配空值顯示 `-`」端到端成功，無繞過任何 subagent。此為 `/start-work` 工作流程可信賴的基準版本。

---

## PDF 讀取（Windows 環境）

- [2026-05-28] **Claude Code `Read` 工具讀 PDF 需要 `pdftoppm`**：內建 Read tool 讀取 `.pdf` 時底層呼叫 `pdftoppm`（poppler-utils）。Windows 預設不安裝此工具，會收到 `pdftoppm failed: Command not found` 錯誤。**解法：改用 Node.js 的 `pdfreader` 套件，或手動安裝 poppler for Windows。**

- [2026-05-28] **Windows Store Python stub 造成 exit code 49**：`python.exe` / `python3.exe` 若指向 `C:\Users\...\AppData\Local\Microsoft\WindowsApps\`，執行任何 Python 指令都會回傳 exit code 49（Microsoft Store redirect stub）。`pip` 也不存在。**識別方式**：`(Get-Command python).Source` 路徑含 `WindowsApps` 即為 stub。**解法：需要真正安裝 Python，或改用 Node.js 方案。**

- [2026-05-28] **`pdf-parse` npm 套件與 Node.js v18 不相容**：`pdf-parse`（較新版）在 Node.js v18 執行時拋出 `ReferenceError: DOMMatrix is not defined`，因其依賴瀏覽器 API。**解法：改用 `pdfreader` 套件，純 Node.js 實作，v18 正常運作。**

- [2026-05-28] **PowerShell heredoc pipe 給 `node` 時中文路徑損毀**：用 PowerShell `$script | node` 的方式把含中文字元路徑的腳本傳給 node，路徑會被轉成 `?`（`ENOENT`）。**解法：先用 Write tool 將腳本寫成 `.js` 檔，再執行 `node script.js`，完全繞過 pipe 編碼問題。**

- [2026-05-28] **`pdfreader` 成功讀取中文 PDF 的最短路徑（Node.js v18，Windows）**：
  1. `cd $env:TEMP; mkdir pdf_read; cd pdf_read; npm install pdfreader`
  2. 用 Write tool 寫 `read_pdf.js`（含 `PdfReader().parseFileItems(path, cb)`）
  3. `node read_pdf.js` 執行，逐頁輸出文字
  > 注意：安裝目錄需先 `cd` 進去，或在腳本中使用絕對路徑 require。

---

## 日期格式與轉換

- [2026-06-02] **`StartEndDatePickerComponent` 發出非 ISO 補零日期，`new Date()` 無法解析**：`StartEndDatePickerComponent.emitStartEndDate()` 用 template literal 組字串（`"${year}-${month}-${day}"`），月/日不補零，發出如 `"2026-6-2"` 的格式。Chrome/V8 的 `new Date("2026-6-2")` 返回 Invalid Date（不符合 ISO 8601 的 `YYYY-MM-DD`），任何依賴 `new Date(str)` 的轉換邏輯都會靜默失敗回傳空字串或 NaN。**注意**：`moment("2026-6-2")` 是合法的，所以 API 查詢端（用 `moment`）正常，只有用 `new Date()` 的邏輯出錯——這類差異容易漏診。**解法選項**：(a) 前端用 string split 解析（`dateStr.split('-')`，不依賴 `new Date()`）；(b) 後端直接回傳民國年字串，前端不做轉換；(c) `StartEndDatePickerComponent` 補零輸出（影響所有消費者需評估）。（來源：CORE-UI MedicalReplyView02 查證核銷清冊 PDF header 顯示 "~"）

---

## Angular 表單驗證

- [2026-06-02] **空字串是合法業務值時，`!value` / truthy 驗證會造成誤攔**：`invst-letter` 的「收據狀況」欄位後端以空字串 `""` 代表「未回覆」，`"1"/"2"/"3"` 為已選取的有效值。原驗證 `!row.paper`（falsy check）把 `""` 當作「未填」攔截，導致「未回覆」無法儲存。**正確做法：用 `row.paper == null`（`null` 或 `undefined` 才是真正未填），讓空字串通過驗證**。通用規則：後端 API 若以空字串代表「選項之一」（而非「未填」），驗證一律用 `== null` 而非 falsy check。（來源：BMPPCORE-280 收據狀況必填驗證修正）

---

## Angular 版本升級

- [2026-06-02] **ng-bootstrap v18 升級後 datepicker navigation 消失 → 先看 Console**：ng-bootstrap v18 在 datepicker navigation template 加入 Angular i18n 標記（`i18n-aria-label="@@ngb.datepicker.previous-month"` 等），需要 `$localize` runtime。若 `angular.json` 的 `polyfills` 未加入 `"@angular/localize/init"`，開啟日曆時拋出 `ReferenceError: $localize is not defined`，整個 navigation（箭頭 + 月份/年份 select）靜默消失。**修法：`angular.json` polyfills 加入 `"@angular/localize/init"`，套件 `@angular/localize` 通常隨 Angular 主套件一起安裝，無需另行 `npm install`。** 踩坑路徑：曾錯誤推測 CSS cascade（ViewEncapsulation.None）、`minDate/maxDate` 預設值、i18n abstract method 簽章，花費多個 session；最終靠瀏覽器 Console 的錯誤訊息秒解。**教訓：ng-bootstrap 升版後出現 UI 異常，永遠先看 Console，再猜 CSS/JS。**

- [2026-05-28] **Angular 必須逐版升級（不可跳版）**：Angular 17→19 需分兩步：先 `ng update @angular/core@18 @angular/cli@18`，再 `ng update @angular/core@19 @angular/cli@19`。一次跨越兩個 major 版本會失敗。
- [2026-05-28] **ng-bootstrap / Angular 版本對應**：ng-bootstrap@16 = Angular 17、ng-bootstrap@17 = Angular 18、ng-bootstrap@18 = Angular 19、ng-bootstrap@20 = Angular 21。升級 Angular 時同步確認 ng-bootstrap 版本，`ng update` 遇到 peer dep 衝突時用 `--force` 跳過，事後再手動升 ng-bootstrap。
- [2026-05-28] **ng-bootstrap@18 breaking change — getWeekdayLabel 型別**：`NgbDatepickerI18n.getWeekdayLabel()` 的 `width` 參數型別從 `TranslationWidth`（`@angular/common` enum）改為字串字面量 `'long' | 'short' | 'narrow'`。需同時移除 `TranslationWidth` import。受影響檔案：任何繼承 `NgbDatepickerI18n` 並 override 此方法的 component。
- [2026-05-28] **npm install peer dep 衝突 → --legacy-peer-deps**：升級 Angular 後若 `npm install` 因舊版第三方套件的 peer dep 報 `ERESOLVE` 錯誤，使用 `--legacy-peer-deps` 讓 npm 忽略 peer dep 衝突（等同 npm v6 行為），待第三方套件全部升完後消除。

---

## 資安掃描工具

- [2026-05-25] **WebInspect 品牌歸一**：WebInspect = Fortify WebInspect = OpenText DAST，為同一黑箱 DAST 產品，歷經 HP → Micro Focus → OpenText 三次易主。記錄時統一用 `WebInspect`，不需區分品牌版本。（來源：core-ui 弱掃修正需求確認）
- [2026-05-25] **三類弱掃工具正式名稱**：白箱 = Checkmarx One SAST；套件 = Checkmarx One SCA；黑箱 = WebInspect。詳細流程與範本見 `knowledge/security-scan.md`。

---

## Git 歷程追查技巧

- [2026-06-03] **`git log -S "<字串>"` 可精確追查程式碼新增/刪除歷程**：當需要確認某段邏輯（如卡控條件）何時被引入、是否曾被移除，使用 `git log -S "關鍵字串" --oneline` 可列出所有新增或刪除該字串的 commit，比 `git log --grep` 更精確（後者只搜尋 commit message）。進一步用 `git show <commit-hash>` 查看完整 diff，確認是新增還是刪除。**典型場景**：確認某卡控自何時加入 + 是否曾被清除。（來源：pscapply-view03 checkListId=592 卡控歷程追查）

---

## Preflight / Agent 指引

- [2026-06-05] **Preflight skill 遷移模式：skill 優先 + repo-local 保底**：將 per-repo `preflight.instructions.md` 遷移到 workspace 共用 Copilot skill 時，repo 內的文件不應只寫 skill 名稱。正確做法：CLAUDE.md / copilot-instructions.md 寫「優先使用 preflight skill；若 skill 未載入、未命中或不可用，依 [本檔規則 / preflight.instructions.md] 手動完成 preflight」，確保 AI 在 skill 沒載入時仍能自主執行 intake。Skill 的 `description` 欄位是自動觸發的 discovery surface，不需在 repo 文件中寫路徑。Workspace-shared skill 位置：`SDC01/.github/skills/<skill>/SKILL.md`（非 user-local `~/.claude/skills/` 或 per-repo `.github/skills/`，後者等同 workspace-shared 只要在最上層 SDC01 即可）。（來源：preflight skill 三 UI repo 遷移 2026-06-05）

- [2026-06-04] **Preflight 基礎設施不能只寫在 `CLAUDE.md`**：若 commit 目的是導入 preflight intake，至少要確認本地三層鏈完整：`CLAUDE.md` 宣告讀取順序、`.github/copilot-instructions.md` 重申 session / preflight 規則、`.github/instructions/preflight.instructions.md` 定義輸出格式與 local fallback。只有第一層時，Claude 路徑雖可運作，但 Copilot 路徑缺少統一 intake 合約與防呆規則。POS-UI、PA-UI 目前完整；Core-UI 這次 review 僅看到 `CLAUDE.md` 內嵌 preflight，尚未對齊本地 instructions 鏈。（來源：`[infra] add preflight agents` review）

---

## UI 文字校對

- [2026-05-15] 「自定」vs「自訂」：台灣正體中文用「**自訂**」（customize），「自定」為簡體用法。確保保險表單用字為「自訂」。（來源：BMPPOS-12 keyinsert-view02 typo 修正）
- [2026-05-15] `Sesstion` 為常見 typo，正確為 `Session`。（來源：bugfix/fix-wording）
- [2026-05-15] **「統一編證號」是正確業務術語，非錯字**：keyinsert-view02 form-tab 中的「身分證字號／統一編證號」，其中「編證號」為完整正體中文業務用詞，不得修改為「編號」。（來源：BMPPOS-12 code review 誤判）

## Playwright E2E 測試

- [2026-06-08] **共享 Playwright harness 應獨立於 `P:\MEMORY`**：當多個前端專案需要共用 Playwright，但產品 repo 本身未安裝 Playwright 時，較佳做法是建立獨立執行專案（例如 `C:\Users\003689\Desktop\playwright-harness`），讓 `P:\MEMORY` 只保存使用說明與決策規則。若把 `node_modules`、report、trace、browser binaries 混入 Vault，會污染知識庫與增加維護成本。（來源：SDC01 md workflow tooling 實作）
- [2026-06-08] **Windows PowerShell execution policy 會擋 `npm.ps1` / `npx.ps1`**：在企業 Windows 環境初始化 Node.js 工具時，若 PowerShell 報 `PSSecurityException` 無法載入 `npm.ps1` 或 `npx.ps1`，可直接改用 `npm.cmd` / `npx.cmd` 繞過 script execution policy。適用情境：共享 Playwright harness 安裝依賴與瀏覽器。（來源：SDC01 shared Playwright harness 建置）
- [2026-05-26] **Angular 下拉選單 mock 資料注入問題**：`loadDropDown()` 由 API mock 填充下拉資料時，若 mock 因路由時序或 `forkJoin` 完成前 `page.evaluate` 已執行，會導致 dropdown `xxxList` 屬性為空，截圖中下拉選單沒有選項。**解法：在 `page.evaluate` 中直接透過 `ng.getComponent()` 取得元件實例後注入 `xxxList` 屬性值，不依賴 API mock 時序**。範例：`await page.evaluate(() => { const el = document.querySelector('app-my-component'); const comp = (window as any).ng.getComponent(el); comp.caseStatusList = [...]; comp.cdr?.detectChanges?.(); });`。（來源：BMPPOS-19 BSD 測報補截圖）
- [2026-05-20] **ESP Playwright 安裝放專案根目錄**：`package.json` + `playwright.config.ts` 放在專案根目錄（`testMatch: '**/playwright/verify-mock.spec.ts'` 自動掃描所有功能的 spec），各功能子目錄只保留 `verify-mock.spec.ts`。好處：(1) 只需安裝一次 `node_modules`；(2) 從根目錄 `npx playwright test` 即可跑所有截圖；(3) 避免每個功能重複安裝 ~150MB 的 Chromium。（來源：reissuebyESP Playwright 安裝重整）
- [2026-05-19] **ESP UI-VERIFY 截圖前必須確認 Playwright 已安裝**：subagent 產出 Mock HTML + spec 後，若目標目錄無 `package.json` / `node_modules`，截圖無法執行。正確流程：(1) 產出 `package.json`（含 `@playwright/test` pinned 版本）→ (2) 確認專案是否已安裝 playwright（`npx playwright --version`）→ (3) 若未安裝則執行 `npm install` + `npx playwright install chromium` → (4) 執行 `npx playwright test`。AI 無終端機權限時應明確提示使用者執行安裝步驟，不可跳過。（來源：reissuebyESP UI-VERIFY 截圖失敗）
- [2026-05-27] **keyinsert-view02 Playwright 測試的兩個關鍵 mock 條件**：(1) acceptance data 須設 `caseStatus: '3'`（待建檔），否則 `isReadOnly` 為 true，表單不可編輯；(2) formGenerateData 的 `tempPolicy: '2'` 可讓頁面初始化時自動選取雙版頁籤，免手動 click radio。（來源：BMPPOS-21 form-tab02 E2E 測試）
- [2026-05-14] **canActivate guard vs addInitScript 時序問題**：`addInitScript` 注入 sessionStorage 後，Angular route guard 仍可能在 script 注入生效前執行，導致重導至根路徑。解法方向：mock canActivate guard、或使用 `page.route()` 攔截認證 API。（來源：BMPPOS-22 BSD 截圖失敗）

## BSD 測報撰寫

- [2026-05-26] **BSD 變更項名稱須使用 `fieldName`**：keyinsert-view02 各 form-tab 的 `ng-template` 有 `fieldName` 屬性（如「客戶基本資料變更」、「受任人 (受款人)」），BSD 文件中描述受影響項目時必須用這些名稱，不可自編結構描述（如「雙版（要保人/被保人）」）。對應查法：`grep "fieldName=" src/.../form-tabXX.component.html`。（來源：BMPPOS-21 BSD 測報變更項名稱錯誤）
- [2026-05-26] **BSD 截圖 viewport 須 1920×1080**：`Desktop Chrome` Playwright preset 預設 1280×720，keyinsert-view02 等複雜多欄版面會壅擠。`setupPage()` 函式中必須在 `page.goto()` 前呼叫 `await page.setViewportSize({ width: 1920, height: 1080 })`。已更新 bsd-report SKILL.md「模式 B」加入強制規定。（來源：BMPPOS-21 BSD 截圖版面壅擠問題）
- [2026-05-14] 測報的閱讀對象是**非技術業務 User**，禁止使用技術術語（變數名稱、API 路徑、CSS class、元件 selector）。改用畫面元素名稱（按鈕文字、標籤名稱）。（來源：BMPPOS-22 BSD 測報修正）

## Claude Code / AI 工具設定

- [2026-05-14] `~/.claude/settings.json` 不允許 trailing comma，否則 malformed JSON 導致設定檔失效。（來源：Claude Code 設定修復）
- [2026-05-14] Agent 檔案名稱需與 agent description 中的 `name:` 欄位一致（`memory-helper.md` 無法被 `@memory` 呼叫，需改名為 `memory.md`）。（來源：@memory agent 名稱修復）
- [2026-06-04] **自訂 agent 不會因 workspace 有 `CLAUDE.md` 就自動取得 `P:\MEMORY` 背景**：若 agent 需要穩定使用歷史教訓或知識，必須在 agent prompt / workflow 明寫 `Step 0`，指定 `memory.md` → `knowledge.md` → 任務相關 `knowledge/` → family hub / `status.md` 的讀取順序，並加上「Vault 不可用時略過、不必中止」的 fallback。只依賴外層 workspace 規則，行為容易因執行入口不同而不一致。（來源：`code-reviewer` agent 補 `P:\MEMORY` routing）
- [2026-06-08] **工作流 command 應維持輕量，靠流程內問答推進**：當 AI 工作流同時需要 DoR、`/plan` 確認、E2E 環境決策與 DoD 收尾時，不要把 `/start-work` 設計成多個子命令。較穩定的做法是保留單一入口 command，之後用流程中的問答 checkpoint 處理「是否繼續」、「是否建立共享 harness」、「是否進入收尾」。另外，`/plan` 產出後應先停下來請使用者確認，不應直接進入 Step 3。（來源：SDC01 md workflow tooling 設計）

## Obsidian Vault 維護

- [2026-05-18] **Folder Notes 模式**：Obsidian Graph 無法將資料夾顯示為節點；需在各資料夾內建立與資料夾同名的 `.md`（如 `projects/projects.md`）作為中介節點，用 wikilink 串聯父層與子葉檔案，形成可視化階層。（來源：Vault Graph 結構重組）
- [2026-05-18] **孤兒檔稽核**：刪除或重組 hub 檔案後，需用 Glob 全掃並逐一比對 hub 連結，才能找出未被任何 hub 連結的孤兒檔（如先前已收攏的 `journal/_template.md`）。status.md 中可能存有對已刪除檔案的靜態路徑參照，也需同步更新。（來源：Vault 盤點與清理）
- [2026-05-18] **IA 重整工作流**：大規模知識庫重整建議採用：(1) 初始布局審查與破口分析 → (2) 制定完整 IA 方案 → (3) 建立新結構（Hub + 附屬頁） → (4) 內容整併與去重 → (5) 建立回指與保留歷史 → (6) 驗證孤兒檔與斷鏈。採用**非刪除式整併**：先建立新入口，保留歷史脈絡於 `journal/` 與 `history.md`，確認新結構穩定後再移除舊入口。（來源：P:\MEMORY 完整 IA 重整）
- [2026-05-18] **活文件與歷史分離**：Operational notes（如 status.md）只保留當前狀態與下次行動；已完成的工作歷程應移至 `journal/`，長期保留的脈絡與里程碑放在 `history.md`。避免 status 頁面累積過多歷史條目變成流水帳。（來源：POS/PA family status 重組）

## Session 管理

- [2026-05-20] **Quick Reference 嵌入 instructions 模式**：要讓 agent 載入 instructions 時自動獲得 domain context（ESP harness/DAG/docs），可將知識壓縮成 Quick Reference 直接嵌入 `.instructions.md`；附「See also」參考連結指向完整知識頁（`harness-map.md`、`worker-dag.md`、`docs-structure.md`）。好處：(1) agent 無需每次讀三個獨立知識頁；(2) 知識更新只需同步 Quick Reference 段落；(3) 完整細節仍在 Vault，不膨脹 instructions 檔。適用場景：高頻引用的 domain knowledge、需要快速查表的邊界模型、禁止/允許清單。（來源：memory-vault-routing.instructions.md 強化）
- [2026-05-15] `/save` slash command 比 hook（UserPromptSubmit / SessionEnd）更可靠：hook 依賴外部 shell script 且有平台相容問題，slash command 直接在 AI context 內運作。（來源：移除 hook 改用 /save）



## ESP AgentFlow 路徑管理

- [2026-06-05] **E2E agent 環境檢查路徑必須指向專案根目錄**：ESP 的 Playwright 安裝在專案根目錄（`package.json` + `node_modules/`），不在各功能的 `doc_root/playwright/` 下。若 agent prompt 中環境檢查寫 `cd <doc_root>/playwright && npx playwright --version`，會找不到而錯誤判定「環境不可用」。修正：改為 `cd <project_root> && npx playwright --version`；`playwright.config.ts` 的 `testMatch` 設為 `'**/playwright/verify-mock.spec.ts'` 掃描所有子目錄 spec。（來源：verify-spec E2E 錯誤 skip 問題）
- [2026-06-05] **sub-agent prompt_template 不應注入結論，只傳 run_id**：在 `subagent` 的 prompt_template 中直接告訴 agent「環境不可用」或預先注入比對結果，等於跳過了 agent 自行驗證的流程。正確做法：只傳 `run_id` 和 harness path，讓 agent 自己讀 state.json → Gate → 讀 handoff → 執行任務 → 寫 handoff → 更新 state。（來源：verify-spec 首輪不合規問題）
- [2026-05-25] **Harness 路徑遷移時，所有相對路徑都需補前綴**：從外部 vault 遷移至 project-local 路徑時，prompt 中「明確的 `P:/MEMORY` 引用」只是一部分；大量以 `` `harness/<run_id>/... `` 形式書寫的相對路徑同樣需要補 `.kiro/` 前綴，否則 agent 在讀寫 state.json / handoff / run-log 時會找不到檔案。有效做法：對每個 prompt 檔案執行 `replace_all` 將 `` `harness/ `` → `` `.kiro/harness/ ``，再另外處理 `_template/` 與初始 `handoff-init` 等特殊路徑。（來源：ESP AgentFlow 開放化遷移）
- [2026-05-25] **section 標題與術語要同步清理**：遷移功能性路徑後，section 標題（如 `## 失敗處理 / vault fallback / 進度回報`）若仍保留舊術語，會造成語意誤導並在 code-review 中被標出。建議在批次替換路徑後，另搜尋舊術語關鍵字（如 `vault fallback`）確認全部清除。（來源：ESP AgentFlow code-review M-1 問題）
- [2026-05-25] **harness-protocol.md 內的跨檔引用也需同步清理**：路徑遷移時通常只掃「功能性路徑」（`harness/<run_id>/`、`allowedPaths`），但文件內對外部知識檔的引用（如 `conventions.md`）遷移後變成懸空引用，需另外搜尋並改指向 project-local 的對等文件（如 `.kiro/steering/session-memory.md`）。建議遷移後執行 `grep -r "conventions.md\|domain-map.md" .kiro/` 確認無殘留。（來源：ESP harness-protocol.md code-review low 問題）

## Kiro CLI 多代理 / Subagent 工具

- [2026-05-19] **Subagent 工具僅支援 `mode: blocking`**：Kiro CLI 內建 `subagent` 工具無 `background` 選項（schema 標 not yet implemented），且原生不支援自動重試。需要重試邏輯時，必須由 orchestrator prompt 自行控制（呼叫 subagent 後讀回 state.json，找 failed 且 retry_count<2 的 stage 重 spawn）。逐 stage 即時觀察進度需用 `Ctrl+G` 開 crew monitor，主對話只能在 blocking 結束後一次列印結果。（來源：ESP write-spec Harness 化重構）
- [2026-05-19] **Agent JSON `model` 欄位：用 stage-level 而非 agent-level**：agent JSON 的 `model` 欄位控制「手動切換到該 agent 時的模型」；subagent 編排時的模型分級應在 `stages[].model` 指定。若填入非法值（如 placeholder `<complex-model>`），kiro-cli 會報 invalid config 但錯誤訊息不明確。最佳做法：agent JSON 省略 `model`（用預設），orchestrator prompt 中在 stage 物件加 `"model": "actual-id"`。（來源：ESP agent config validation 修正）
- [2026-05-19] **UTF-8 BOM 導致 kiro-cli JSON 解析失敗**：kiro-cli 用 Rust serde_json 解析 agent JSON，不容忍 UTF-8 BOM（`EF BB BF`），報 "expected value at line 1 column 1"。但 PowerShell `ConvertFrom-Json` 容忍 BOM，所以自建驗證腳本不會報錯。修正：用 `[System.IO.File]::ReadAllBytes()` 偵測前 3 bytes 並移除。建議：所有 `.kiro/agents/*.json` 一律存為 UTF-8 without BOM。（來源：ESP agent config BOM 修正）
- [2026-05-19] **PowerShell 讀取 UTF-8 JSON 預設用 Big5（zh-TW）會解析失敗**：在繁體中文 Windows 上 `Get-Content` 不指定 `-Encoding UTF8` 時，會以系統 ANSI（Big5/CP950）讀檔；含中文的 JSON 經 `ConvertFrom-Json` 會報錯但實際內容合法。驗證 JSON 時必加 `-Encoding UTF8`，且寫檔時也必加（避免雙重轉碼破壞）。（來源：ESP harness JSON 範本驗證）
- [2026-05-19] **多代理改造的雙軌並存設計**：把 monolithic prompt 拆成多個 worker agents 時，**保留原 prompt 不破壞**並在開頭加「執行方式」章節（方式 1 自動化 / 方式 2 手動），讓兩種路徑共用相同的 skill / 規則 / 產出格式，差異只在「誰執行」。好處：可逐步遷移、debug 時可手動退回、環境受限時仍可工作。（來源：ESP write-spec.md 雙軌改造）