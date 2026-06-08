# 工作日誌

<!-- 最新在上，超過三個月的條目需確認已蒸餾後刪除 -->
<!-- 時間戳格式：[YYYY-MM-DDThh:mm:ss.SSS+08:00][專案名] 描述 -->
<!-- 若原始紀錄無精確時間，使用當日 T00:00:00.000+08:00 -->

## 2026-06-08

- [2026-06-08T23:59:59.000+08:00][Infra] **`/start-work` skill 術語中文化完成**：DoD → `驗收條件（DoD）`（首次出現加括弧代號，後續純中文）；AC 敘述文字 → `驗收項（AC）`（首次加代號，後續純中文）；識別碼（AC-XX）原樣保留不替換。異動：`commands/start-work.md`（12 處）、`gate-keeper/dod-checklist.md`、`gate-keeper/dor-checklist.md`、`gate-keeper/SKILL.md`、`gate-keeper/human-checkpoints.md`。

- [2026-06-08T23:00:00.000+08:00][POS-UI] **`/start-work` 流程踩雷與修正**：在執行「keyinsert-view01 查詢結果空值顯示 `-`（加 resultDisplay pipe）」時，AI 跳過了 spec-writer/implementer/code-reviewer subagent 強制規則，直接 inline 實作與更新 spec，並在錯誤位置設 STOP gate（Step 1 spec 更新後不應中斷）。根因：`/start-work` 語言偏軟（「引導進入」非「強制啟動」），subagent 非強制、中斷點語意不清晰。修正：重寫 `/start-work` 為明確 HARD RULES（5 條）、STOP gate 只在計畫確認後（STOP gate #1）與 DoD 前（STOP gate #2）、所有 subagent 前綴 `@`、Spec 更新與變更歷程均強制啟動 `@spec-writer`。參見 `C:\Users\003689\.claude\commands\start-work.md`。
- [2026-06-08T23:59:00.000+08:00][POS-UI] **使用者驗證：`/start-work` 全流程成功完成**（任務：任務重分配空值顯示 `-`）：本次 session 完整跑通 preflight → DoR → spec-writer → 計畫確認（STOP gate #1）→ implementer → code-reviewer → spec 變更歷程更新（`@spec-writer`）→ DoD 收工（STOP gate #2）。確認修正後的 `/start-work` HARD RULES、正確 STOP gate 位置、強制 `@subagent` 命名機制均按預期運作。
- [2026-06-08T23:00:00.000+08:00][POS-UI] **BMPPOS-19 resultDisplay pipe 完成**：`keyinsert-view01` 查詢結果表格所有欄位套用 `| resultDisplay`，空值（null/undefined/空字串）顯示 `-`；`displayEmp | resultDisplay`、`rocDateTime | resultDisplay` 鏈式串接驗證通過；`spec.md` v1.4 已更新，`@code-reviewer` 通過（0 高/0 中/2 低，低項均為 `ResultDisplayPipe` 既有設計問題）。
- [2026-06-08T14:25:40.088+08:00][POS-UI][PA-UI][Core-UI] **md 工作流工具骨架實作完成**：完成 `spec-conventions` 模板升級（`商業規則`、`AC-XX`、Step 2 計畫輸入、E2E 決策）、新增 `gate-keeper` 與 `angular-testing` skills、建立 `unit-test-writer` / `implementer` agents、更新 `spec-writer` / `code-reviewer` / `test-writer` 行為、建立輕量 `/start-work` command，並規定 `/plan` 產出後必須先用問答方式確認計畫，再進入單一 AC 的 Red → Green → Review → Refactor。
- [2026-06-08T14:25:40.088+08:00][POS-UI][PA-UI][Core-UI] **共享 Playwright harness 建立完成**：在 `C:\Users\003689\Desktop\playwright-harness` 建立獨立 Playwright 專案（`package.json`、`playwright.config.ts`、`tests/`、`projects/`、`fixtures/`、`reports/`、`README.md`），完成 `npm.cmd install` 並安裝 Chromium；同步在 `P:\MEMORY\knowledge\playwright-harness.md` 建立使用說明，明確規定 Step 7 若專案本身沒有 Playwright，需先問答確認是否建立 / 使用共享 harness。

## 2026-06-05

- [2026-06-05T19:00:00.000+08:00][Core-UI] **新增 `crud-view.instructions.md` + 更新 `CLAUDE.md`**：將 DocView08 開發過程確立的「查詢列表 + 新增/編輯彈窗」模式沉澱為可重用 instructions。內容涵蓋 8 個步驟（Types/Service/主頁面TS/HTML/SCSS/Dialog TS/HTML/路由），含可複製的程式碼骨架與 6 條防呆規則（Dialog 需加入 imports[]、getRawValue() 取 disabled 值、take(1) 防訂閱累積等）。CLAUDE.md 同步更新：步驟 4 加入 CRUD view 觸發條件，Conventions 段落新增 `CRUD view pattern` 條目。

- [2026-06-05T18:30:00.000+08:00][Core-UI] **DocView08「中台參數維護」完成**：建立查詢 + 新增/編輯完整功能。新增 9 個檔案（types/doc08/req+res、doc-service08、doc-view08 主頁面、upsert-doc08-box dialog）並更新 app.routes.ts。關鍵實作決策：(1) GET `specialInvstEmpList` → 解包 `data.listInvstEmp[]`；(2) POST `upsert` → 解包 `data.clmaInvstEmployee`；(3) 建立者/修改者使用 `prefixName` pipe 顯示 `[id]-[姓名]`；(4) 備註欄加 `remark-cell` class 允許換行；(5) Dialog `empId` 編輯時 disable，用 `getRawValue()` 取值；(6) `refreshTableEvent` 訂閱加 `take(1)` 防止記憶體洩漏。樣式對齊 MedicalReplyView02：藍色表頭 (#9bc2e6)、sticky thead、`.action` sticky right width 1%、`table-scroll-container` 捲動高度 615px。兩輪 code review 全部通過（27 項通過，0 高嚴重度）。

- [2026-06-05T17:00:00.000+08:00][ESP] **reissuebyESP verify-spec 第三次執行（chat subagent）完成**（run-id: 20260605-1700-verify-reissuebyESP）：透過 chat 直接觸發 subagent DAG（mock → e2e(skip) → static → report）。SD-review.md 更新至最新版：差異率 12.8%（❌3 + ⚠️2 / 39 條），E2E 14 場景 13 通過、0 差異。核心差異不變：issuePremiumByEmail overload/回傳型別（D-01）、PLATFORM_ESP="服務管理平台"（D-02）、issueSMS fallback "05"（D-04）。建議個別修正 SD §4.2 與 §11，無需重產。注意：本次為 chat 直接執行，runs.md 未自動更新（harness 手動 subagent 限制）。

- [2026-06-05T17:30:00.000+08:00][Infra] **`preflight` skill 改為跨專案通用**：調查後確認 `~/.claude/skills/preflight/SKILL.md` description 寫死「supports POS-UI only」，導致 core-ui / pa-ui 無法觸發。執行三項修改：(1) `SKILL.md` — description 改為「any Angular project」，移除 POS-UI guardrail；(2) `workflow.md` — 加入 Step 0 專案偵測（讀 `CLAUDE.md`，若有 `.github/instructions/preflight.instructions.md` 則以它為 routing guide，否則從 CLAUDE.md 推導）；(3) 刪除 `pos-ui-routing.md`（由 Step 0 CLAUDE.md 取代）。三個專案（core-ui / pa-ui / pos-ui）皆不需異動。

- [2026-06-05T15:27:00.000+08:00][ESP] **reissuebyESP verify-spec 第二次執行（含 E2E）完成**（run-id: 20260605-1507-verify-reissuebyESP）：修正 playwright.config.ts testDir/testMatch、修改 esp-vspec-e2e.md 降級策略（改為環境就緒則必須執行）、重建 5 個 Mock HTML、成功執行 Playwright 截圖。差異率 12.8%（❌3 + ⚠️2 / 39 條），E2E 14 場景全部通過。核心差異：issuePremiumByEmail overload/回傳型別、PLATFORM_ESP 常數值、issueSMS fallback "05"。差異集中在方法簽章精確度層面，非架構性錯誤。

- [2026-06-05T14:37:00.000+08:00][ESP] **reissuebyESP 首次 verify-spec 試跑完成**（run-id: 20260605-1359-verify-reissuebyESP）：嚴格遵守 harness 協議執行 4-stage pipeline（mock→e2e(skip)→static→report），全套 handoff 文件落地、Gate 交握正確、mock 骨架 3 檔產出。差異率 21%（❌3 + ⚠️3 / 28 條）> 10% 門檻；核心差異：issueSMS state fallback "05" 機制、archivePremium exportEbao="N"、CF indexMap NOMOBILE。E2E 降級 skip（Windows 無 Playwright）。首輪因跳過 harness 協議被使用者指正後重做。

- [2026-06-05T14:27:00.000+08:00][ESP] **esp-verify-spec mini-orchestrator + 4 子 agent 全套實作完成**：建立 `esp-verify-spec`（mini-orchestrator，Ctrl+Shift+V）+ `esp-vspec-mock` / `esp-vspec-static` / `esp-vspec-e2e` / `esp-vspec-report` 共 5 個 agent（各自 json + prompt md，1:1 配對驗證通過）。架構：並行 `[mock, e2e]` → `static` → `report`，兩階段握手 Gate，diff_rate >10% 詢問是否重新進入 start-analysis。同步更新：`harness/_template/`（SD-review-template.md、verify-state.json、handoff-init-to-mock.md、handoff-init-to-e2e.md）、`prompts/verify-spec.md`（改寫為使用說明）、`kiro-layout.md`（agents/prompts 清單、配對規則、文件類型對照表加 ⑨ SD-review.md）、`harness/_validate-agents.ps1`（補建），MEMORY `worker-dag.md` 新增 esp-verify-spec 家族段落。

- [2026-06-05T14:00:00.000+08:00][POS-UI] **BMPPOS-14 / BMPPOS-20 BSD 測報上傳完成**：確認兩張票為同一修正項目，共用同一份 BSD 測報，已上傳 JIRA；後續合併至 release/v1.0.9。status.md + todo-list.md 已同步標記 ✅。

- [2026-06-05T12:00:00.000+08:00][Core-UI][ESP] **優先任務登錄 — 三項新增追蹤**：
  - **Core-UI 弱掃簽核追蹤**：`feature/core-sca` 已合併，自今日起需每日確認 SDCRELEASE 核准進度直至 PROD 部署完成，已更新 `projects/core/status.md` Current Focus + Next Actions。
  - **ESP verify-spec 功能優化**：將優先度從 🟢 低提升至 🟡 中；目標整合 `.kiro/prompts/verify-spec.md` 進 Harness DAG，成為獨立 `esp-verify` worker，輸出驗證統計與一致率報告。
  - **ESP skills / prompts 拆分**：新增任務 — 將 `.kiro/skills/esp-analysis-step.md` 的 Layer 1→4b 分析工法抽出為跨專案通用 skill（暫名 `analysis-methodology.md`），ESP 專屬 pitfall / 欄位格式留在 ESP skill；POS / Core / PA / ADP 可共用相同分析流程。已更新 `projects/esp/status.md`。

- [2026-06-05T00:00:00.000+08:00][POS-UI][PA-UI][Core-UI] **Preflight skill 三 UI repo 收斂完成**：建立 workspace-shared `preflight` skill（`SDC01/.github/skills/preflight/`，含 SKILL.md + workflow.md + pos-ui-routing.md + pa-ui-routing.md + core-ui-routing.md）；三個 UI repo 全部改成「skill 優先、repo-local fallback 保底」模式。POS-UI 刪除 repo-local `preflight.instructions.md`，fallback 以 inline 步驟寫入 `CLAUDE.md`；PA-UI 與 Core-UI 保留既有 `preflight.instructions.md` 作為 fallback，CLAUDE.md + copilot-instructions.md + 功能型 instructions 均更新為「若 skill 未載入、未命中或不可用，則依本地 instructions 手動執行 preflight」。任何人複製 repo 即可得到完整 fallback，不依賴 user-local 路徑。

## 2026-06-04

- [2026-06-04T17:36:32.459+08:00][POS-UI] **code-reviewer agent 補上 `P:\MEMORY` 背景讀取流程**：確認 `c:\Users\003689\.claude\agents\code-reviewer.md` 原本不會主動讀取 Vault 歷史知識，已新增 Step 0，明確要求 review 前依序讀取 `P:\MEMORY\memory.md`、`knowledge\knowledge.md`、任務相關 `knowledge/` 頁面，以及對應 project family 的 Hub 與 `status.md`；並補上用途邊界（只做背景補充，不可取代本地 spec / instructions / 原始碼）與 fallback（Vault 不可用時不得中止 review）。

- [2026-06-04T18:30:00.000+08:00][POS-UI] **BMPPOS-24 SDCRELEASE-219 上線單已開，差異檔產出**：確認 release/v1.0.8（BMPPOS-24）上線單 SDCRELEASE-219 已建立完成；產出差異檔 `K:\06.專案\06.19.保全前掃\11_正式環境上線單\2026\SDCRELEASE_219\前端v1.0.8_diff.txt`（v1.0.7→v1.0.8，3 個異動檔：Dockerfile nginx image 換版、assignee-view04 spec 說明文字欄位規格、holiday-maintain-dialog.html 新增 `<small>` 說明文字）。待 IED 審核通過後部署 PROD。
- [2026-06-04T18:30:00.000+08:00][ESP] **後續任務釐清（尚未實作）**：(1) SDD 第一階段簡報調整 — 重整 Markdown 內容後重新輸出 PPT/PPTX；(2) verify-spec 改造為 AgentFlow 形式，整合至 Harness DAG 作為驗證正確率 worker。

- [2026-06-04T17:00:00.000+08:00][POS-UI][PA-UI][Core-UI] **Review `[infra] add preflight agents`**：確認 POS-UI（817b69865c36992da49b3fd6e968e38c2903c8d7 → 2e3b061dcb001e54593331000780394cf1a55724）與 PA-UI（fcaac6e85d156015313f3079d33cbe3c047256b7 → cc4b9067d35decb8a5712a7e13088c9eadcaf79e）目前已形成 `CLAUDE.md` → `.github/copilot-instructions.md` → `.github/instructions/preflight.instructions.md` 的本地 preflight 鏈；Core-UI（7dd562bdfa6f4a03a26a87e195b6a2ceb566b164 → fbb6148e63244974cc79f7bca4fc2b507c264a64）目前僅在 `CLAUDE.md` 內嵌 preflight 規則，尚未對齊獨立 Copilot / preflight instructions。已補 lessons learned 與 Core status 下一步。
- [2026-06-04T16:30:00.000+08:00][Core-UI][PA-UI][POS-UI] **data-privacy.instructions.md 跨專案建立與串接**：在三個 UI 專案（core-ui、pa-ui、pos-ui）新增 `.github/data-privacy.instructions.md`，定義 PII 敏感資訊保護規則（禁止寫入客戶姓名、身分證號、生日、電話、地址、保單號碼、卡號等至 Copilot Chat history / session logs / memory）。三專案的 `CLAUDE.md` 與 `.github/copilot-instructions.md` 均新增 reference 區段串接 privacy instruction。pos-ui 另刪除 `.github/agents/copilot-instructions.md`（確認為 .specify 自動產生的 artifact，非主要入口）。
- [2026-06-04T16:16:28.160+08:00][POS-UI] `/save` 同步完成：確認 `.github/agents/copilot-instructions.md` 已刪除；保留 `.github/copilot-instructions.md` 作為主要 Copilot workspace 指引，並將「.specify 可能重生 artifact」記錄到 POS 狀態與待辦摘要。

## 2026-06-03

- [2026-06-03T17:00:00.000+08:00][Core-UI] **BMPCORE-280 — acceptTimeTS/updateTimeTS 欄位切換 + 核銷清冊建檔日期區間修正**：
  - **新欄位**：`MedicalReply01ClmaInvst` / `MedicalReply01ClmaInvstLetter` 新增 `acceptTimeTS`/`updateTimeTS`（ISO 8601 with tz）；舊欄位保留。`UtilsService.convertToRocDateTime()` 與 `RocDateTimePipe` 擴充支援 `null | undefined` 輸入（回傳 `''`）。
  - **HTML 模板**：view01 / view02 / invst-letter 三處模板全部換用新欄位，移除 ternary guard。
  - **業務邏輯**：`isRowEditable()`、`onSaveInvstList()`（view01）、invst-letter 列印受理日、save-invst-result-box 核銷清冊列印，全部改用 `acceptTimeTS`。
  - **核銷清冊 PDF 建檔日期區間修正**：根因確認為 `inputDateStr`/`inputDateEnd` 為空字串。修法：在呼叫端（view02、view01、save-invst-result-box）從 `clmaInvstTable`（查詢全表）的 `acceptTimeTS` 計算 min/max ROC 日期後傳入 `printWriteOffList(opts.writeOffDate)`；`medicalReply-print.service.ts` 不再自行計算，移除 `isoToRoc()` 私有方法。單一日期不顯示 `~`。
  - **編譯修正**：view01 和 save-invst-result-box 原仍傳舊參數 `inputDateStr`/`inputDateEnd`，造成 TS2353 錯誤；已修正為傳入計算好的 `writeOffDate`。
  - 剩餘編譯錯誤（`lifeTimeCount-worker.ts` 4 筆）為既有問題，與本次變更無關。



- [2026-06-03T12:00:00.000+08:00][POS-UI] **BMPPOS-24 新增項目：checkListId=559/592 卡控暫時停用，已合併 release/v1.0.8**：
  - `pscApply-view02.ts`：整個 `override handleUpdateApply()` 已完全注解（含 checkListId=559 卡控與 `super.handleUpdateApply()` 呼叫），等同直接使用 base class 流程。
  - `pscapply-view03.component.ts`：checkListId=592 卡控邏輯已注解，加 TODO；其餘 override（重複保單號碼檢查）保留。
  - 兩個 spec 均已更新：卡控相關 EARS 規則、驗收條件、手動測試場景、技術備註標記「暫時停用，BMPPOS-24」，並新增變更歷程 v1.1（2026-06-03）。
  - **Bug Fix**（Code Review 發現）：
    - `pscApply-view02.ts`：移除 `handleClearApply()` 中無效 `patchValue` 整段（`super.handleClearApply()` 已呼叫 `initForm()` 重建 form），精簡為僅呼叫 `super.handleClearApply()`。
    - `pscapply-view03.component.ts`：`handleClearApply()` 中 `cusApplyDate: ''` 修正為 `null`，與規格及 base class 一致。
    - `base-psc-apply-component.ts`：移除 `console.log('明細載入:', data)`（含客戶個資，生產環境資安風險）。
  - 以上所有變更已合併至 `release/v1.0.8`。

- [2026-06-03T00:00:00.000+08:00][POS-UI] **雜項修正：ClaimUi → PosUi**：`src/index.html` L5 與 `.github/prompts/WebInspectFix.prompt.md` L171 的 `<title>ClaimUi</title>` 改為 `<title>PosUi</title>`，消除舊專案名稱殘留。

- [2026-06-03T00:00:00.000+08:00][POS-UI] **checkListId=592 卡控暫時停用（feature/remove-doc-validate）**：
  - 分析 `pscapply-view03.component.ts` 的 `handleUpdateApply()` 共 5 道卡控條件，含來源、行為與訊息。
  - 確認「保單號碼受理不可受理個人資料異動書（checkListId=592）」已在 `specs/views/pscApply-view03/spec.md` L80-84、L101、L133-135、L165-172 明確記載。
  - 用 `git log -S "checkListId"` 追查歷程，確認此卡控僅一次新增（commit `dd40c23`，2026-03-25，`[20260326][feat] 新件前掃文件卡控`），從未被移除。
  - 在 `handleUpdateApply()` 中將 checkListId=592 硬卡控邏輯全部註解，加上 `TODO: 未來需要時再開放此卡控` 說明。
  - 暫停原因：配合 release/v1.0.8 上線，業務需求暫時允許混受理。恢復時機未定。

## 2026-06-02

- [2026-06-02T14:30:00.000+08:00][POS-UI] ✅ **BMPPOS-24 BSD 測報產出**：使用 `/bsd-report` skill 產生 `BMPPOS-24_BSD.docx`，儲存至 `K:\06.專案\06.19.保全前掃\10_正式環境PCR_IR單\2026\BMPPOS-24\`。項目一（新增說明文字「開始時間為13:30時，一律選擇為12:30開始」）含截圖；項目二（下拉選單「13:30」改為「12:30」）截圖由使用者手動補充。後續待上傳 JIRA + 開 SDCRELEASE 上線單（截止 2026-06-05）。

- [2026-06-02T18:00:00.000+08:00][CORE-UI] **MedicalReplyView02 查證核銷清冊 PDF header「建檔日期區間」顯示 "~" 根因調查**：
  - **根因**：`StartEndDatePickerComponent.emitStartEndDate()` 發出非零補位日期字串（`"2026-6-2"`），`medicalReply-print.service.ts` 的 `isoToRoc()` 用 `new Date("2026-6-2")` 解析，Chrome/V8 對非 ISO 格式返回 Invalid Date，導致回傳 `''`，PDF 顯示 ` ~ `。
  - **決策**：前端不修補。等後端改版後由後端直接回傳民國年日期字串，前端移除 `isoToRoc()` 邏輯。

- [2026-06-02T23:59:00.000+08:00][CORE-UI] ✅ **BMPPCORE-280 編輯公函檔需求變更 — 實作完成（分支 v1.0.19）**：
  - **MedicalReplyView02「建檔日期」預設今日**：新增 `aplyDtDefaultRange`，建構子初始化 `aplyDtStr`/`aplyDtEnd`，移除 `ngAfterViewInit`；HTML 加入 `[setDefaultRange]` binding。
  - **收據狀況必填驗證修正**：`invst-letter.component.ts` 驗證改為 `row.paper == null`（原 `!row.paper` 會誤攔 `paper=""` 的「未回覆」合法值）。
  - **`getAbnormalStatus()` 邏輯更新**（`medicalReply-letter-pdf-worker.ts`）：後端代碼 `""=未回覆 "1"=已回覆 "2"=附收據 "3"=附收據且回文件`；新規則：`['匯款','支票','現金'].includes(paymentChi) && paper === ''` → 異常；`paymentChi === '單位支付' && paper === '2'` → 異常。
  - **Code Review 修正**：唯讀模式只顯示 `paperChi`（移除多餘 `paper` 代碼欄位）；兩處 `row.paper || ''` 改 `row.paper ?? ''`；`MedicalReply01TypesReq.ts` 補充 `paper` 欄位注解。
  - ⚠️ 收據狀況 4 選項（後端 `common/v1/invstPaperList` API 更新後前端自動生效，架構已就緒）。

- [2026-06-02T00:00:00.000+08:00][POS-UI] BMPPOS-24 已合併至 release/v1.0.8；待補 BSD 測報並開 SDCRELEASE 上線單，截止 2026-06-05（週五）。

- [2026-06-02T00:00:00.000+08:00][ADP] 新建 ADP 團險專案族群：Highest/High PG M3-M5 約 58 張 Jira 單，時程 2026-06~08，資轉負責人 Bruce，分支 release/M3，Repo adp-policy + adp-gi-ui，問題根源為舊K trinity 資轉 SQL。

- [2026-06-02T00:00:00.000+08:00][CORE-UI] BMPPCORE-280 需求變更確認：(1) 收據狀況下拉改為 4 選項（有收據/無收據/退函(支票)/退函(現金)），移除「單位核銷」；(2) 建檔時未填收據狀況需出錯誤訊息；(3) 報表「異常狀況*」判斷新邏輯（費用匯款/支票/現金+無收據 → 異常；費用單位支付+有收據 → 異常），改寫 `getAbnormalStatus()`；(4) MedicalReplyView02「建檔日期」預設系統日當日。

- [2026-06-02T00:00:00.000+08:00][ESP] SDD 第一階段簡報初版完成：逆向工程回推功能規格，產出 `P:\SDD-第一階段Poc.pptx`。

- [2026-06-02T00:00:00.000+08:00][POS-UI] BMPPOS-24 開發完成（含規格更新）：`holiday-maintain-dialog` 說明文字顏色調整為紅色（`#dc3545`，commit `ee75269`）；`specs/views/assignee-view04/spec.md` 補充欄位備註顏色說明 + 變更歷程（2026-06-02）。分支 `feature/BMPPOS-24`，待合併至 releasev1.0.8。

- [2026-06-02T00:00:00.000+08:00][POS-UI] Release v1.0.7 版本確認：按原定計畫，BMPPOS-12 和 BMPPOS-23 上線 release/v1.0.7；BMPPOS-24 改至 release/v1.0.8。SDCRELEASE-217 上線單已申請完成，已生產差異檔（git diff）。

- [2026-06-02T00:00:00.000+08:00][CORE-UI] ✅ **BMPPCORE-280 / ng-bootstrap v18 datepicker navigation 消失問題 — 已解決**：
  - **根本原因**：ng-bootstrap v18 在 datepicker navigation template 加入 `i18n-aria-label="@@ngb.datepicker.previous-month"` 等 Angular i18n 標記，需要 `$localize` runtime（由 `@angular/localize/init` 提供）。v16 沒有此類標記；升級至 v18 後，第一次開啟日曆即拋出 `ReferenceError: $localize is not defined`，整個 navigation template 渲染中斷，箭頭與月份/年份 select 全部消失。
  - **修法**：`angular.json` → `projects.claim-ui.architect.build.options.polyfills` 陣列加入 `"@angular/localize/init"`（`@angular/localize@19.2.22` 已安裝，無需另外 `npm install`）。
  - **誤判路徑（學習價值高）**：CSS cascade 問題（ViewEncapsulation.None + Bootstrap 注入順序）、`minDate/maxDate` 預設值、i18n abstract method 簽章，花了多個 session 排查，最終靠瀏覽器 Console 的 `$localize is not defined` 錯誤訊息快速定位。
  - **教訓**：ng-bootstrap 升版後若 datepicker navigation 消失，**優先看 Console 錯誤**，不要先猜 CSS 或 JS 邏輯。

- [2026-06-02T00:00:00.000+08:00][POS-UI] 補充 SDCRELEASE 上線單行政程序知識：在 `knowledge/workflow-map.md` 的 SDCRELEASE 上線單流程區段新增（1）包版時間每週二、五；（2）上線前須上傳「資訊安全開發檢核」xlsx 並將 JIRA 狀態調整為「IT主管核准」；（3）若涉及核心包版（Base-Image 更新），需下週才正式上線（申請隔日生效）。

## 2026-06-01

- [2026-06-01T00:00:00.000+08:00][CORE-UI] BMPCORE-280 彈窗放大實作完成：
  - 研究目標元件：確認「編輯公函檔」為 `InvstLetterComponent`（`medical-reply-view01/invst-letter`），非 doc-view07。
  - 收據狀況選項：已透過 `getInvstPaperList()` 從後端取得，前端已就緒，等後端 `common/v1/invstPaperList` API 就緒即可，無前端變更。
  - 彈窗放大：三個開啟 `InvstLetterComponent` 的地方各加入 `fullscreen: true`（medical-reply-view01、save-invst-result-box、medical-reply-view02）。
  - ⚠️ 列印影響分析：`medicalReply-letter-pdf-worker.ts` 的 `getAbnormalStatus()` 硬編碼 `paper === '2'`（舊代碼「附收據」），後端更新代碼後需同步更新 worker 邏輯。

- [2026-06-01T00:00:00.000+08:00][POS-UI] BMPPOS-24 實作完成：
  - 計畫（plan mode）：研究 AssigneeView04 + HolidayMaintainDialogComponent，確認後端已調整 API，前端只需新增 `<small>` 說明文字。
  - 實作：`feature/BMPPOS-24` 分支（from `feature/update-doc-files`），在 `holiday-maintain-dialog.component.html` 「開始時間」select 下方加入 `<small class="text-muted">開始時間為13:30時，一律選擇為12:30開始</small>`。
  - 規格：`specs/views/assignee-view04/spec.md` 更新欄位表格備註 + EARS Where 條件 + 變更歷程章節（BMPPOS-24，2026-06-01）。
  - `/review-change`：Code Review 通過（中嚴重度 1 項：HTML 文字與初版 spec 不一致 → 已同步 spec）。
  - 後續：待釐清合併至哪個 release 版本（原定 releasev1.0.7）。



- [2026-06-01T00:00:00.000+08:00][CORE-UI] BMPPCORE-280 編輯公函檔彈窗新增需求登錄：(1) 收據狀況下拉選項調整（有收據/無收據/退回支票/退回現金/單位核銷），⚠️ 待釐清是否後端提供；(2) 彈窗放大避免內部 table 被遮蔽。status.md + todo-list 同步更新，列為 🔴 高優先。

- [2026-06-01T00:00:00.000+08:00][POS-UI] BMPPOS-24 急件登錄 + Release 版本重排：
  - 新增 BMPPOS-24：AssigneeView04 休假管理彈窗「開始時間」13:30→12:30 + `<small>` 說明文字，確定上 `releasev1.0.7`。
  - BMPPOS-12、BMPPOS-23 退版至 `releasev1.0.8`（退版流程待釐清）。
  - 版本全部後移一位：v1.0.9←14/20、v1.0.10←21、v1.0.11←19。
  - status.md + todo-list Release 表格同步更新。

- [2026-06-01T00:00:00.000+08:00][MULTI] 跨專案進度更新（/todo + /save）：
  - **[PA] BMPPA-4**：正式環境部署確認完成，Next Actions 對應項目標記 ✅。
  - **[POS] BMPPOS-12**：調整完成於 `feature/BMPPOS-12`，已合併 `releasev1.0.7` 並部署 UAT，等待 User 驗測後部署 PROD。
  - **[Core] CRM 開發**：移除，不再支援。
  - **[Core] 高優先項目**：docview08 中台參數維護 + ESP SDD 第一階段簡報列為 🔴 高優先。
  - **[ESP] orchestrator 交握驗證**：✅ 驗證成功（2026-06-01）；新增後續低優先項目：驗證程式碼與規格一致性機制。

## 2026-05-29

- [2026-05-29T21:00:00.000+08:00][ESP] 將 `P:\ESP-POC-Phase1-簡報.md` 轉換為 PDF（`P:\ESP-POC-Phase1-簡報.pdf`，526 KB）。使用 `.kiro/skills/md-to-pdf.md` skill，工具 `npx md-to-pdf@5.2.5`，套用 `.kiro/pdf-style.css` 中文樣式，A4 格式，無 Mermaid 預處理需求。

- [2026-05-29T20:00:00.000+08:00][ESP] 製作 Phase 1 POC 成果簡報：解析 `POC規劃.docx`（4 章節大綱），結合 `.kiro/` 專案知識補充內容，產出 `P:\ESP-POC-Phase1-簡報.md`（15 張投影片）。簡報面向非技術聽眾，技術名稱降級為實作對象欄。涵蓋：系統現況說明、為何選繳費證明、分析框架（AWS 分析模式）、10-worker Agent/Skill DAG 架構圖、4 個功能入口產出成果、SD 吻合率驗證段落（附截圖 A/B 預留位）、Phase 1 結論與 Phase 2 展望。

- [2026-05-29T18:00:00.000+08:00][CORE-UI] `feature/upgrade-package` 收尾 + 分支合併完成：
  - **uuid v4→v7**：補修 3 個檔案（`progress-box.component.ts`、`claim-view03`、`claim-view04`），前次 commit 訊息有誤，檔案未實際改動，本次補正，commit `d768c0d`。
  - **@types/uuid 移除**：uuid v14 自帶型別，`@types/uuid@11` 為空 stub，從 `devDependencies` 移除，commit `5ef796d`。
  - **TS-998113 清理**：Angular 19 新增對 standalone `imports[]` 未使用元件的嚴格檢查，清理 8 個元件（`claim-view01/02/05`、`doc-view04/05/06/07`、`progress-box`）中 37 行多餘 import，commit `93aa885`。關鍵決策：`UpsertClaimComponent`（claim-view01）、`ProgressBoxComponent`（claim-view05）、`FileStatusComponent`（doc-view07）從 `imports[]` 移除但保留 TS import（分別用於 `NgbModal.open()` 參數與 `@ViewChild` 型別引用）。
  - **分支合併**：`features/jin576tw/BMPCORE-280` ← fast-forward `feature/upgrade-package`（13 個檔案，commit 9bcc53f→93aa885），已 push 至 remote；`feature/upgrade-package` 首次 push 到 remote（新分支）；`feature/core-sca` ← ort merge `feature/upgrade-package`（含 package-lock.json，14 個檔案）。

- [2026-05-29T00:00:00.000+08:00][ESP] 補充 SDD 分析兩階段至知識庫：更新 `~/.claude/agents/memory.md` Vault 結構（ESP 節點加入 Phase 1 / Phase 2 樹狀說明）與 `projects/esp/esp.md`（新增 SDD 兩階段對照表）。Phase 1＝逆向工程從程式碼回推 spec；Phase 2（當前）＝多代理 Harness 自動化 SDD 生成。並修正「分析對象」措辭：三個 Maven 模組（esp-system-core / esp-system-ui / esp-remoting-server-web-service）僅為現階段範例，非唯一對象。

- [2026-05-29T12:00:00.000+08:00][POS-UI] BMPPOS-12 05/27 新增需求實作完成（`feature/BMPPOS-12-test`）：(1) `list-array.component.html`：新增(+)與刪除(🗑)按鈕順序對調（新增在前）；(2) `form-tab01` + `form-tab03`：`pscReducePaidUp`（減額繳清）與 `pscPerformEta`（展期定期保險）變更項的「一年期」dropdown 上方各加「其餘附約處理方式」說明 label；Code Review 通過（0 high），`specs/views/keyinsert-view02/spec.md` 變更歷程已更新。教訓：`/plan` 的 Explore agent spawn 成本高，改用直接 Glob/Grep 工具速度快很多。

## 2026-05-28 (SDC01) — 包版流程知識蒸餾

- [2026-05-28T23:59:00.000+08:00][CORE-UI] 確認 `feature/upgrade-package` 套件升級任務：正式區上線前需重新打包 Base-Image 並推送至 Harbor（系統僅開放內網，套件須預打包）。讀取 `P:\筆記\包版流程.txt`，將 VirtualBox VM 設定、Dockerfile 範本、Harbor push、Jenkins Pipeline 流程蒸餾至 `knowledge/build-deploy.md`（新建）；更新 `projects/core/status.md` 加入 Base-Image 重打警示；更新 `knowledge/knowledge.md` 索引。

## 2026-05-28 (SDC01) — 第二次 SCA 掃描分析

- [2026-05-28T16:00:00.000+08:00][CORE-UI] 第二次 SCA 掃描（2026-05-28 08:15 UTC）結果分析：原 4 個漏洞剩 1 個 LOW（bluebird@3.7.2，CVE `Cxda14f253-4e52`，CWE-401）。確認 inflight / uuid×2 已消除。研究 bluebird 依賴鏈（`exceljs → unzipper → bluebird`），發現 bluebird 為死碼（unzipper 只用於 xlsx 讀取路徑 WorkbookReader，本專案 `excel-service.service.ts` 全為寫出操作 `writeBuffer()`，從不讀取 xlsx）。bluebird@3.7.2 是 3.x 最終版，所有 unzipper 版本均需要它，無法透過 npm 升級消除。**決策：接受可接受風險，不做任何程式碼變更。** 可接受風險聲明：「經評估此弱點風險不影響整體系統安全，考量維運人力後列為可接受風險。」

## 2026-05-28 (SDC01) — 續

- [2026-05-28T00:00:00.000+08:00][SDD] PDF skill 維護：將本次 PDF 讀取踩坑蒸餾至 `knowledge/lessons-learned.md`（5 條，「PDF 讀取 Windows 環境」段落），並更新 `~/.claude/skills/pdf/SKILL.md`，新增「Windows 環境 / Python 不可用時的備援方案」段落，包含環境預檢、`pdfreader` 安裝步驟、`read_pdf.js` 範本、`pdf-parse` 禁用警告、中文路徑寫檔說明。

## 2026-05-28 (SDC01)

- [2026-05-28T00:00:00.000+08:00][SDD] 建立 SDD 專案族群（`P:\MEMORY\projects\sdd\`）。讀取 `P:\AI計畫_0422(EdwardxJamesxPatrick).pdf` 第 1-4 頁，內容為「結合 12-Factor App 與 Spec Kit 建立可治理的 SDLC 運行模式」。產出 500 字郵件提案「結合 AI Agent 建立可治理的 SDLC 開發運行模式」，三大面向：CODEBASE（npm CLI + instructions/Guideline + skills & Agent）、DEPENDENCIES（Checkmarx MCP + CVE 即時掃描）、CONFIGURATION（Claude Code hooks SessionStart/FileChanged + .env 範本分離）。三驗證場景：理賠 CRM 受理、保全效能優化、保費憑證體驗優化。

## 2026-05-28

- [2026-05-28T23:00:00.000+08:00][CORE-UI] SCA 套件升級完成（`feature/core-sca`），commit `f3cdff7`：
  - Angular 18→19 升級驗證：`ng update --force` 已完成，npm install `--legacy-peer-deps` 繞過 ng-bootstrap@16 peer dep 衝突，build 通過。
  - 第三方套件升至 Angular 19 相容版本：`@angular/cdk` 17→19.2.19、`@ng-bootstrap/ng-bootstrap` 16→18.0.0、`ngx-spinner` 16→19.0.0、`ngx-toastr` 18→19.1.0。
  - 修復 ng-bootstrap@18 breaking change：`tw-date-picker.component.ts` `CustomDatepickerI18n.getWeekdayLabel()` 的 `width` 參數型別從 `TranslationWidth` 改為 `'long' | 'short' | 'narrow'`。
  - jspdf 升至 4.2.1：修復 CVE-2025-68428（CRITICAL Path Traversal）。jspdf-autotable@5.0.7 已支援 `jspdf@^2||^3||^4`，無需額外升級。
  - `npm audit --audit-level=high` exit code 0：生產依賴 0 CRITICAL、0 HIGH（剩餘 HIGH 均在 devDependencies build tools，不進 production bundle）。
  - 使用者另建 `feature/upgrade-package` 分支（typo checkout 誤操作），主要工作在 `feature/core-sca`。

## 2026-05-27

- [2026-05-27T23:00:00.000+08:00][CORE-UI] SCA 修復 + Angular 升級啟動（`feature/core-sca`）：
  - 研究 SCA 報告：主要弱點為 `jspdf@2.5.1` CVE-2025-68428（CRITICAL，Path Traversal，固定在 ≥3.0.0）；exceljs@4.4.0 已是最新版略過；其餘套件無 HIGH+ CVE。
  - 決策：先升 Angular 17→19，再升 jspdf，確保版本相容性統一管理。
  - Angular 17→18 升級完成（`ng update @angular/core@18 @angular/cli@18`），零 TypeScript 錯誤，build 通過，已 commit（e205d56）。
  - Angular 18→19 升級中（`--force` 繞過 ng-bootstrap@16 peer dep，計畫升完後再升 ng-bootstrap@18）。
  - 套件目標版本對照：ng-bootstrap ^18.x、ngx-spinner ^19.x、ngx-toastr ^20.x、zone.js ~0.15.x、typescript ~5.7.x。

- [2026-05-27T00:00:00.000+08:00][CORE-UI] 弱掃進度更新：SAST（Checkmarx One 白箱）已按既有處理方式完成，準備提交報告；WebInspect（黑箱）掃描通過，無修正項目。SCA 套件掃描狀態待確認。

- [2026-05-27T20:00:00.000+08:00][POS-UI] BMPPOS-19 & BMPPOS-21 E2E 測試完成（test-writer agent）：BMPPOS-19（KeyInsertView01 任務重分配）8/8 通過，新增 `e2e/keyinsert-view01/keyinsert-view01.spec.ts`；BMPPOS-21（form-tab02 地址 radio 啟停 + 地址正規化）5/5 通過，追加 describe 區塊至 `e2e/keyinsert-view02/form-tabs.spec.ts`。關鍵技術：keyinsert-view02 `caseStatus: '3'` 使 `isReadOnly=false`；`tempPolicy: '2'` 自動選取雙版頁籤。
- [2026-05-27T12:00:00.000+08:00][POS-UI] BMPPOS-21 spec 補齊：spec-writer 更新 `specs/views/keyinsert-view02/spec.md`，新增三處：(1) 適用欄位表備註 `formatAddress`（僅 insuredAddressChgOption = '3' 時 enabled）；(2) EARS 規格：`While insuredAddressChgOption ≠ '3'，the system shall 禁用 formatAddress 並清空`；(3) 變更歷程補 2026-05-27 bug fix 記錄。
- [2026-05-27T00:00:00.000+08:00][POS-UI] BMPPOS-21 bug fix：`form-tab02` 166-客戶基本資料變更中，`<ng-template template="3">` 缺少 `[relation]="['formatAddress']"`，導致「居住於」地址輸入框不論 radio 選取狀態均為 enabled。加上 `[relation]` 後 `app-group-field` 的 `relationMap` 正確建立，`initDisabledState` / `eventListener` 可控制 `formatAddress` FormControl 的 enable/disable。code-reviewer 掃描 form-tab01 ~ form-tab06 所有 `app-group-field` 用法，確認無其他相同問題。

## 2026-05-26

- [2026-05-26T21:00:00.000+08:00][POS-UI] BMPPOS-21 BSD 截圖完成並嵌入 docx：10 張 Playwright 截圖（1280×720）嵌入 `BMPPOS-21_BSD.docx`，儲存至 `K:\06.專案\...\BMPPOS-21\`；同步修正 bsd-report SKILL.md，新增 viewport 1920×1080 強制規定（複雜版面必要）。

- [2026-05-26T20:30:00.000+08:00][POS-UI] 記錄 keyinsert-view02 bug：住所地址「居住於：」input 未依 radio 選取狀態 enable/disable；記錄 feedback：BSD 文件變更項名稱須用 HTML fieldName（如「客戶基本資料變更」、「受任人 (受款人)」），不可自編結構描述（如「雙版（要保人/被保人）」）；建立 reference：keyinsert-view02 各頁籤變更項完整對應表。

- [2026-05-26T19:00:00.000+08:00][POS-UI] BMPPOS-19 BSD 測報補充完成（待派建檔截圖補入，Playwright DevTools 注入修正）；spec 文件清理（keyinsert-view01 v1.4、keyinsert-view02 變更歷程）

- [2026-05-26T18:30:00.000+08:00][POS-UI] 修正 keyinsert-view02/spec.md 變更歷程 table（merge conflict 殘留清理）；BMPPOS-19 & BMPPOS-21 已部署 SIT，待完成測報

- [2026-05-26T18:00:00.000+08:00][POS-UI] BMPPOS-19 & BMPPOS-21 merged to feature/develop, deployed to SIT; next: 完成兩項功能測報（BMPPOS-19 補項目三截圖、BMPPOS-21 補完測報並上傳）

- [2026-05-26T00:00:00.000+08:00][ESP] 修正 `start-analysis.md` §1 啟動掃描：加入「若 `runs.md` 不存在則自動建立空表頭」邏輯。根本原因：`runs.md` 被 `.gitignore` 排除，新 clone 的使用者首次觸發 orchestrator 時必定出現「Error(s) while reading file(s)」與「Error(s) while searching workspace」兩個錯誤。修正後 orchestrator 自行初始化，不報錯、不中斷。

## 2026-05-25 (SDC01 session)

- [2026-05-25T23:59:00.000+08:00][KNOWLEDGE] 建立弱掃知識檔 `knowledge/security-scan.md`：整合 `P:\筆記\弱點掃描.txt` 內容，收錄 SCA/WebInspect 流程、誤報處理範本（Clickjacking SPA 說明、CSP 安全標頭說明）、上線前程式清單指令。同步更新 `domain-glossary.md` 新增「資安掃描工具」段落，並補充 `knowledge.md` 索引。
- [2026-05-25T23:59:00.000+08:00][KNOWLEDGE] 確認 WebInspect 品牌歸一：WebInspect = Fortify WebInspect = OpenText DAST 為同一產品，歷經 HP → Micro Focus → OpenText 三次易主。統一所有記錄使用 `WebInspect`，更正工具名稱（原誤記為「UI WebInspect」）。
- [2026-05-25T23:59:00.000+08:00][CORE-UI] 記錄三項新需求：(1) docview08 新增「中台參數維護」功能，含查詢 API 與新增/更新 API，細節待補；(2) 弱掃修正任務從 `release/v1.0.19` 開始，涵蓋 Checkmarx One SAST（白箱）、Checkmarx One SCA（套件）、WebInspect（黑箱）；(3) CRM 相關開發統一從 `feature/CRM` 分支進行。

## 2026-05-25

- [2026-05-25T23:59:00.000+08:00][CORE-UI] 新增三筆待辦至 `projects/core/status.md`：(1) 病例回函受理 — 製作病歷回函 docview08；(2) 病例回函受理 — 前端弱掃修正；(3) CRM 病例回函 — 預計 2026-06-01 起協助開發。

- [2026-05-25T00:00:00.000+08:00][PA-UI] BMPPA-4 受理人員查詢調整：已合併 `release/v1.0.1`，JIRA 上線單已發出，`前端v1.0.1_diff.txt` 已產出並附入上線單，預計 2026-05-25 部署正式環境。
- [2026-05-25T00:00:00.000+08:00][MEMORY] 蒸餾 SDCRELEASE 上線單工作流：將 PA/POS 共用的上線單填寫流程（填單截止 16:30、關聯票號、版本 diff 指令、/save 後自動產生 diff.txt）寫入 `knowledge/workflow-map.md`；更新 `knowledge/conventions.md` Session 結束協議新增「產出 release diff」步驟（步驟 2，條件觸發）；步驟編號重新連號至 10。

- [2026-05-25T23:59:00.000+08:00][ESP] Harness 知識骨幹填入 + session-memory.md 精簡：(1) 填入 `.kiro/harness/knowledge/harness-protocol.md`（從 P:\MEMORY 遷移，路徑全更新，移除 vault fallback §9，保留 §10.2 ESP harness extension）；(2) 填入 `_template/` 三份（state.json 移除 vault_available 欄位、state.schema.json 同步移除屬性、handoff-template.md 直接複製）；(3) 移除 session-memory.md 中的「更新工作日誌」步驟（runs.md + summary.md 已涵蓋，避免多成員 merge conflict）；(4) kiro-layout.md 移除 save.md 條目（個人 vault 工具，不屬共用 AgentFlow layout）；(5) .gitignore 移除 journal.md 規則；(6) code-reviewer 路徑審查：發現 harness-protocol.md 4 處引用 conventions.md（遷移後懸空引用），已全部修正為引用 `.kiro/steering/session-memory.md`，15 項通過，0 項阻塞。

- [2026-05-25T00:00:00.000+08:00][ESP] AgentFlow Harness 路徑遷移完成：將所有 `P:/MEMORY/projects/esp/harness/` 引用遷移至 `.kiro/harness/`，讓其他人無需個人 vault 即可使用 AgentFlow。修改範圍：(1) `.gitignore` harness ignore 規則；(2) 11 個 `agents/*.json` 移除 `P:/MEMORY` allowedPaths，`.kiro/.harness/**` → `.kiro/harness/**`；(3) 10 個 worker prompt — 第零規則 GATE 路徑 + 所有 `harness/<run_id>/` 相對路徑補 `.kiro/` 前綴；(4) `start-analysis.md` — 5 處路徑修正、移除 vault fallback 段落、`_template/` 與 `handoff-init` 補完整路徑；(5) `start-analysis-usage.md`；(6) `session-memory.md` 全文替換；(7) `kiro-layout.md`。新建 `.kiro/harness/{knowledge,_template}/` placeholder。code-reviewer 驗證：高優先全 6 項通過；中優先 M-1（9 個 worker section 標題殘留 `vault fallback` 舊術語）已補修。`save.md` 明確排除（個人 vault 協議保留）。待手動：從 P:\MEMORY 複製 `harness-protocol.md`、`conventions.md`、`_template/state.json` 等至 `.kiro/harness/`。

## 2026-05-22

- [2026-05-22T23:59:59.000+08:00][MEMORY] `/save` 指令修正：新增明確步驟要求每次執行時同步更新 `journal/todo-list.md`（票號狀態列、Release 進度表、Last Updated）；原指令僅依賴「Follow Session 結束協議」隱含此步驟導致常被跳過。

- [2026-05-22T23:59:00.000+08:00][POS-UI] BMPPOS-12 進度更新：將與文管確認第 3 項「保單紅利給付方式（含回饋金）」說明文字調整範圍，預計 2026-05-25（週一）回饋。

- [2026-05-22T23:00:00.000+08:00][MEMORY] /todo 全域指令建立與優化：建立 `~/.claude/commands/todo.md`，從 `P:\MEMORY\projects/{family}/status.md` 讀取 Next Actions / Blocked / 待開發需求，依優先度（🔴🟡🟢）分類輸出；更新加入「總覽表格」（含目標版本欄）與「待開發需求表格」，說明欄控制在 20 字以內。

- [2026-05-22T22:00:00.000+08:00][MEMORY] Claude 自動記憶遷移與清除：(1) 比對 10 條 Claude auto-memory 與 P:\MEMORY 現有內容，確認 9 條已存在；(2) 唯一缺漏「統一編證號非錯字」補入 `knowledge/lessons-learned.md` UI 文字校對段落；(3) 刪除所有 10 個記憶個別檔案，清空 MEMORY.md 索引。

- [2026-05-22T00:00:00.000+08:00][POS-UI] AssigneeView04 `dateCheck` 機制分析：前端自行用 `coreSysDate`（易保日 Unix timestamp）與 `endDateTime` 比較，`endDateTime` 精度截至 minute（second=0, ms=0），`sysDateTime` 保留完整精度。邊界情況：結束日期=易保日當天且結束時間已過時，`endDateTime.isSameOrAfter(sysDateTime)` 為 false → link-disabled。**根本原因確認為 PROD 被退版（rollback），非程式邏輯 bug**。

- [2026-05-22T00:00:00.000+08:00][POS-UI] 新增三筆 reference memory：(1) 環境分支對應紀律（UAT=release/v1.0.x、SIT=feature/develop，insureMo 版本上線前確認脫鉤）；(2) Harbor Image Registry（harbor.transglobe.com.tw project 58）；(3) PROD 部署流程（需開 release 單給 IED，JIRA SDCRELEASE 專案）。

## 2026-05-21

- [2026-05-21T17:57:00.000+08:00][ESP] 從 `kiro/patrick_ui_api` 分支 cherry-pick 分析方法論調整（2 檔）：`esp-function-list.md`（新增 Step 5 方法內流程圖 + DB/Batch 影響矩陣）、`write-spec.md`（前後端邊界切分規則 — ManagedBean 涉及 DB/排程的呼叫鏈視為「後端 API」獨立分析，API-CONTRACT 產出範圍擴大至 UI 模組後端 function）
- [2026-05-21T14:13:47.000+08:00][ESP] Agent 模型分級設定：推翻 5/19 決策（stage-level model），改為 agent JSON 層級直接設定 `"model"` 欄位。分配：`esp-sd` → `claude-opus-4.6`（架構分析需最強推理）；`esp-sa/rules/flow/erd/ui-verify/api-contract/start-analysis` → `claude-sonnet-4.6`；`esp-deps/vars/funcs` → `claude-haiku-4.5`（結構化提取用輕量模型）。11 個 agent JSON 全部更新完成
- [2026-05-21T10:37:31.000+08:00][ESP] 程式碼統計：專案共 2,514 檔 / 565,890 行（Java 439K、XML 98K、XHTML 12K、SQL 11K）；224 個 Java package

## 2026-05-20

- [2026-05-20T17:34:48.000+08:00][ESP] Harness 知識骨幹交握強化：(1) 審視全部 11 個 agent JSON + 11 個 prompt，發現 8 個問題（2 嚴重 / 3 中等 / 3 低風險）。(2) 修正核心問題：在 orchestrator `start-analysis.md` 加入「第零規則：runs.md 寫入驗證」— 寫入 runs.md → 回讀驗證 → 通過才呼叫 subagent；在 10 個 worker prompt 加入「第零規則：runs.md 存在性驗證」— 啟動後讀 runs.md 確認 run_id 存在且 status=running 才開始分析。形成雙重閘門確保知識骨幹交握正常。涉及 11 檔：`prompts/start-analysis.md` + `prompts/agents/esp-{deps,vars,erd,funcs,flow,rules,ui-verify,sd,api-contract,sa}.md`。其餘發現問題（esp-sd handoff gap、Playwright 路徑不一致、cmd vs PowerShell、prompt BOM、絕對路徑）待後續修正。

- [2026-05-20T23:59:00.000+08:00][MEMORY] memory-vault-routing.instructions.md 強化完成（5 項任務）：(1) 新增「Reading Priority Order」區段 — 強制 3 步驟閱讀順序（knowledge/ → family domain pages → status.md），禁止以 status 代替前兩步。(2) 新增「ESP Harness Quick Reference」— 嵌入 run/session-level boundary 模型、state 檔案清單、orchestrator 禁止寫入目標、fallback 路徑。(3) 新增「ESP Worker DAG Quick Reference」— 嵌入 10 stage 固定順序、Layer 1-4 模型、esp-flow bottleneck、skip 規則、state.json 唯一 retry 依據。(4) 新增「ESP Docs Structure Quick Reference」— 嵌入 `.kiro/docs/` 路徑格式、10 file types 固定集合、閱讀順序、MODULE 路由對照表。(5) 驗證知識優先對齊，新增區段與原有 knowledge-first 原則無矛盾。設計決策：Quick Reference 直接嵌入 instructions，agent 載入時自動獲得 ESP domain context，附參考連結指向完整知識頁。目標檔：`c:\Users\003689\AppData\Roaming\Code\User\prompts\memory-vault-routing.instructions.md`

- [2026-05-20T00:00:00.000+08:00][MEMORY] Session 中斷：本次 session 計畫強化 `memory-vault-routing.instructions.md`（knowledge-first 架構、ESP harness/DAG/docs 模板化、知識優先對齊驗證），但對話在執行前即被摘要化中斷，無任何實作產出。待辦待下次 session 繼續：(1) 強化 memory routing guardrail（-已部分完成）(2) 模板化 ESP harness/DAG/docs 知識 (3) 驗證知識優先對齊。目標檔：`c:\Users\003689\AppData\Roaming\Code\User\prompts\memory-vault-routing.instructions.md`

- [2026-05-20T13:57:45.000+08:00][ESP] 修正 Playwright 安裝流程完成：(1) `skills/esp-playwright-verify.md` 前置條件改為三段式流程（檢查→嘗試安裝→降級）+ Step 3 改名「環境準備與執行截圖」+ 新增 package.json/playwright.config.ts 範本。(2) `prompts/agents/esp-ui-verify.md` Step 1 環境檢查改為三段式 + Step 2A 移除重複安裝提示 + Step 2B 加入 package.json/config 寫入與完整還原命令。(3) 將 Playwright 安裝移至專案根目錄：根目錄新增 `package.json` + `playwright.config.ts`（testMatch 掃描 `.kiro/docs/**/playwright/verify-mock.spec.ts`），移除子目錄下的 package.json/node_modules/playwright.config.ts/mock/*.html/run.bat。(4) 重新安裝成功並執行截圖驗證通過（5 張 PNG 產生）。(5) `.gitignore` 加入 `test-results/` 和 `package-lock.json`

- [2026-05-20T12:00:00.000+08:00][POS-UI] BMPPOS-19 BSD 測報產出完成：使用 `/bsd-report` skill 產生 `BMPPOS-19_BSD.docx`（58,236 bytes），4 個測試項目含內嵌截圖，已儲存至 `K:\06.專案\06.19.保全前掃\10_正式環境PCR_IR單\2026\BMPPOS-19\BMPPOS-19_BSD.docx`。項目三（任務重分配區塊操作性）截圖待補，文件中以「(截圖待補)」標示。

## 2026-05-19

- [2026-05-19T17:24:31.000+08:00][ESP] reissuebyESP 逆向工程分析完成（E2E 測試 #1 回歸測試）：使用 chat 中手動 `subagent` DAG 執行 8 stage（deps→vars/erd/funcs→flow→rules→sd→sa），產出 9 份文件 + UI-VERIFY Mock 頁面 + Playwright 截圖腳本。截圖由使用者手動執行 `npx playwright test` 產生 5 張 PNG。**發現問題**：(1) `runs.md` 無紀錄 — 因非透過 orchestrator agent 執行，state.json 未被自動更新（已手動補正）；(2) Playwright 未預裝 — subagent 產出 spec 但未建立 `package.json` 也未安裝依賴，需使用者手動 `npm install`。**教訓已記錄至 lessons-learned.md**

- [2026-05-19T15:57:26.863+08:00][ESP] Agent config BOM 修正（真正根因）：kiro-cli 報 "expected value at line 1 column 1" 是因為 11 個 agent JSON 開頭有 UTF-8 BOM（`EF BB BF`）— Rust serde_json 不容忍 BOM。建立 `.kiro/.harness/_fix-bom.ps1` 腳本移除所有 BOM，`kiro-cli agent list` 確認全部 11 個 workspace agent 正確載入。教訓：PowerShell `ConvertFrom-Json` 容忍 BOM 所以 `_validate-agents.ps1` 不會報錯，但 kiro-cli 會

- [2026-05-19T15:34:19.781+08:00][ESP] Harness 蒸餾分工修正（對齊 `session-memory.md` 核心精神）：診斷 orchestrator §9 把 run-level 事件誤當 session-level 事件，會造成（1）一次 session 多 run 多條 log 條目重複寫入、（2）`Current Focus` 被自動覆寫脫離使用者實際工作焦點、（3）和 `/save` 雙寫衝突。修正：(1) `prompts/start-analysis.md` §9 重寫為「run 結束處理（run-level 蒸餾邊界）」— 只寫 `harness/<run_id>/summary.md` + 更新 `harness/runs.md`，run 結束印 run-level 訊息（**不**印 `Memory has updated!`），summary.md 末尾追加「結束今日工作前執行 `/save`」提示；檔頭硬限制連帶補上禁止寫 journal/status/lessons。(2) `agents/start-analysis.json` 的 `fs_write.allowedPaths` 收緊為僅 `.kiro/docs/**` + `harness/**` + `.kiro/.harness/**`，移除 journal/log.md / status.md / lessons-learned.md。(3) `knowledge/harness-protocol.md` §10 重寫為 run-level / session-level 分工表 + §10.1 §10.2 明確職責；§11 補強邊界條款；變更紀錄追加 2026-05-19 條目。(4) `prompts/save.md` 加入 ESP family extension（步驟 3）：掃 `harness/runs.md` 本日終態 run 彙整為 log 條目，明文「不自動覆寫 Current Focus / Next Actions」。(5) `projects/esp/status.md.Decisions` 加一條「Harness 蒸餾分工（2026-05-19）」記錄。驗證：11 個 agent JSON 通過 `_validate-agents.ps1`

- [2026-05-19T15:27:43.279+08:00][ESP] Agent config validation 修正：(1) 診斷 "invalid agent config" 錯誤根因 — 11 個 agent JSON 的 `model` 欄位使用佔位符 `<complex-model>` / `<simple-model>` 非有效 model ID。(2) 確認 subagent 工具 stage-level `model` 參數才是正確的模型分級控制點（文件明確支援 `stages[].model` override）。(3) 移除所有 11 個 `.kiro/agents/*.json` 的 `model` 欄位，全部通過 `_validate-agents.ps1` 驗證。(4) 更新 `start-analysis.md` 新增 §5a-1「模型分級」段落（分級對照表 + stage-level model 使用方式）。(5) 更新 `start-analysis-usage.md` §7 改寫為新架構說明。(6) 更新 `write-spec.md` 模型分派說明指向新控制點。(7) 更新 `kiro-layout.md` 移除 agents 配對規則中的 model 描述。

- [2026-05-19T14:35:26.415+08:00][ESP] `.kiro/` 結構盤點與 steering/skills 重新分類：(1) 刪除 `skills/esp-md-to-pdf.md`（與 `md-to-pdf.md` 重複的舊版）。(2) 將 `analysis-behavior-rules.md` 從 skills/ 搬到 steering/（屬跨切分析行為規則，無 frontmatter 全域自動載入）；同步更新 22 處引用（11 個 `agents/*.json` + 10 個 `prompts/agents/*.md` + `prompts/write-spec.md`）；`esp-technical-pitfalls.md` §7.3 改為引用新位置避免規則重複。(3) 將 `batch-tracking-guide.md` 從 skills/ 搬到 steering/（加上 `fileMatchPattern: esp-batch/**` 條件載入），並更新 `esp-batch-analysis.md` 的引用路徑。(4) 重寫 `kiro-layout.md`：`SA-SD.md` 範例修正為 `SA.md + SD.md`、移除「來源模組對照」表中重複的 Batch Job row、新增 `agents/*.json ↔ prompts/agents/*.md` 1:1 配對章節、補上 `prompts/save.md` / `prompts/verify-spec.md` / `.harness/E2E-VALIDATION-CHECKLIST.md` / `specs/` / `pdf-style.css` 等先前漏列項目、補上「各層職責」表的 `agents/` 與 `specs/` 兩列。(5) 建立三個先前 layout 列出但磁碟不存在的空殼檔（被 20 處引用、含兩個 agent JSON 用 `file://` URI 載入，刪除會破壞 harness）：`steering/tables.md`（fileMatch: java/xml）、`steering/xhtml-map.md`（fileMatch: xhtml/java）、`steering/human-review-checklist.md`（無 frontmatter，被 8 個 skill 共用）；每檔含警示區段 + 結構建議供日後回填。(6) 驗證：全專案 grep 無死引用、11 個 agent JSON 全部解析成功、agents/ 與 prompts/agents/ 完美 1:1 配對

## 2026-05-19

- [2026-05-19T09:35:00.000+08:00][ESP] write-spec Harness 化重構**全部完成**（Task 8 + Task 9 落地）：(1) `write-spec.md` 雙軌並存改造完成 — 開頭加「執行方式」章節（方式 1 自動化 / 方式 2 手動）+ 末尾加「Skill ↔ Agent 對照表」（11 agents + DAG 結構 + 知識骨幹圖）；原 858 行內容全保留。(2) 新建 `.kiro/prompts/start-analysis-usage.md`（200 行 10 章節速查表：啟動方式 / 三種觸發場景 / 進度監控 / 中斷續跑 / 單 worker 重跑 / 失敗處理 / 模型切換 PowerShell 一行替換 / 故障排除 / 後續延伸 / 相關文件）。(3) `.kiro/steering/kiro-layout.md` 補上 agents/、prompts/agents/、.harness/ 三個目錄；`.gitignore` 加 `.kiro/.harness/`。(4) 新建 `.kiro/.harness/E2E-VALIDATION-CHECKLIST.md`（225 行）含前置 model id 替換 PowerShell 腳本 + 5 項 E2E 驗收測試精確步驟（回歸 / 冷啟動 / 蒸餾 / vault fallback / 失敗處理）。(5) `projects/esp/status.md` 重寫：Current Focus 改為「規劃階段完成 + 待 runtime E2E 驗證」、Decisions 補 Harness 13 場景設計決策 + subagent 原生限制（僅 blocking + 無自動重試 → orchestrator 自管）。Runtime E2E 測試需使用者親自執行（提供 model id + 按 Ctrl+Shift+S + 觀察結果）。9-task 計畫全部完成

## 2026-05-18 (session 4)

- [2026-05-18T23:59:59.999+08:00][MEMORY] `/print-work-status` Claude Code 版本建立與完善：建立 `~/.claude/commands/print-work-status.md`，修正格式為 YAML frontmatter（參考 save.md），更正業務領域對應（CORE=理賠、PA=保費、POS=保全），補充註明（標題、用途、業務領域對應表、資料來源、執行步驟）；同步補充業務領域映射至 `P:\MEMORY\knowledge\domain-glossary.md`

## 2026-05-18 (session 3)

- [2026-05-18T23:59:59.000+08:00][MEMORY] `/print-work-status` 輸出格式調整：改以「業務領域 - JIRA 票號 項目」分組，每項一行 `(n) 簡短說明 - 狀態`，說明不超過 10 字；更新 `~/.claude/commands/print-work-status.md`

## 2026-05-18 (session 2)

- [2026-05-18T23:59:59.000+08:00][POS] todo-list 同步至 status.md：BMPPOS-19 目標版本從「待定」更新為 `releasev1.0.10`；Decisions/Constraints 補上 `v1.0.10 <- BMPPOS-19`；Current Focus 移除已解決的 BMPPOS-12 需求釐清項目

## 2026-05-18

- [2026-05-18T18:30:00.000+08:00][ESP] write-spec Harness 化重構：Task 2-7 完成（建立 11 個 Kiro agents + 對應 worker prompts + 337 行 orchestrator prompt 9 章節）。10 個 worker：esp-deps（Layer 1, complex）/ esp-vars / esp-erd / esp-funcs（Layer 2 平行）/ esp-flow / esp-rules（Layer 3）/ esp-ui-verify（Layer 3.5, 含 execute_bash 限定 npx playwright）/ esp-sd / esp-api-contract / esp-sa（Layer 4，sa 三路分流依 module 動態選 esp-sa/esp-sa-api/esp-sa-batch）。1 個 orchestrator：start-analysis（complex, 快捷鍵 Ctrl+Shift+S, 含 subagent 工具 + crew 設定）。所有 11 個 agent JSON 經 PowerShell ConvertFrom-Json 驗證合法。Task 8-9 待續
- [2026-05-18T18:12:00.000+08:00][ESP] write-spec Harness 化重構（規劃完成 + 執行進行中）：完成 9-task 計畫（將 .kiro/prompts/write-spec.md 拆成 11 個 Kiro agents — 10 worker + 1 orchestrator `start-analysis`，掛 `Ctrl+Shift+S` 快捷鍵；既有 skills 透過 `resources: skill://` 引用，不重構）；模型分派採 simple/complex 二分；handoff 機制透過 `P:\MEMORY\projects\esp\harness\<run-id>\state.json` 交握。執行進度：Task 0（環境檢查）+ Task 1（Harness 目錄/協議）完成 — 已建立 `harness/_template/{state.json,state.schema.json,handoff-template.md}`、`harness/runs.md`、`harness/.gitkeep`、`knowledge/harness-protocol.md`，更新 `memory.md` 與 `projects/esp/esp.md` 索引。Task 2-9 待續（建立 11 個 agent JSON + 對應 prompt + write-spec.md 雙軌章節 + E2E 驗證）
- [2026-05-18T23:59:00.000+08:00][POS-UI] BMPPOS-22 BSD 測報補截圖完成：rebase `playwright-test` 到 `feature/develop` 後 Playwright 導航問題自動消除，3 張截圖（editable/not-editable/mixed）成功取得；以 PowerShell ZipFile 重產 docx（含圖版本 161,709 bytes），覆蓋舊版純文字測報，輸出至 `K:\...\BMPPOS-22\BMPPOS-22_BSD.docx`
- [2026-05-18T23:59:00.000+08:00][POS-UI] bsd-report skill 更新：補記 Windows 環境限制（禁止 bash zip / Write 新檔 / node 讀 WSL 路徑），改用 PowerShell `[System.IO.File]::WriteAllText()` 與 `[System.IO.Compression.ZipFile]::CreateFromDirectory()`；字體從 標楷體 改為 新細明體（SKILL.md + docx-structure.md 共 8 處）
- [2026-05-18T23:59:00.000+08:00][POS-UI] feedback_playwright_branch 記憶更新：新增「執行測試前必須先 rebase playwright-test 到最新 feature/develop」規則
- [2026-05-18T23:55:00.000+08:00][MEMORY][PA-UI][POS-UI] `/save` 任務總覽調整：新增 `journal/todo-list.md` 作為跨專案待辦與工作進度總覽；同步更新 `journal/journal.md`、`knowledge/conventions.md`、VS Code 使用者層 routing guardrail，以及 PA-UI / POS-UI 的 `CLAUDE.md` 與 `.github/copilot-instructions.md`，讓 `/save` 一併更新 `journal/todo-list.md`；依使用者回饋保留較簡潔的表格版型
- [2026-05-18T23:30:00.000+08:00][MEMORY] 建立全域 `/print-work-status` prompt：建立使用者層 prompt（`~\AppData\Roaming\Code\User\prompts\print-work-status.prompt.md`），固定呼叫 `memory` agent，時間範圍改為「上周一至今日」，依「專案 / JIRA 單號」分組輸出，每項一句短句；完成首次執行測試
- [2026-05-18T22:00:00.000+08:00][POS-UI] BMPPOS-19 Code Review 修正與驗收：執行 `/review-change`，reviewer 回報 4 項問題（#1 assignHandeld typo medium、#2 checkbox ID 重複 medium、#3 service method typo medium、#4 disabled binding low）；修正 #2（header checkbox id → `selectAllCheckbox`；row checkbox → `[id]="'row-' + row.pscApplyCode"`）與 #3（`chageApplyStatus` → `changeApplyStatus`，service 與 component 均已更新）；第二次 reviewer 全數 7 項通過 ✅；spec.md 同步更新至 v1.3（變更歷程補記）；#1 assignHandeld 待後端文件確認、#4 未修正
- [2026-05-18T17:00:00.000+08:00][MEMORY] Vault 盤點與清理：補上 `journal/_template.md` 連結至 `journal/journal.md`；清除 `.trash/` 殘留 index 檔（共 5 個）；更新 PA-UI / POS-UI / ESP 三個 `status.md` 中的 `index.md` 參照，改指向對應 hub 檔（`pa-ui.md`、`pos-ui.md`、`esp.md`）
- [2026-05-18T14:35:02.765+08:00][MEMORY][PA-UI][POS-UI] 全域 memory routing 與 journal 收攏：更新 `~/.claude/CLAUDE.md`、`~/.claude/agents/memory.md`、`~/.claude/commands/save.md` 與 VS Code 使用者層 `memory-vault-routing.instructions.md`，統一 `P:\MEMORY` 走 family-level mapping；收攏 `journal/` 為 `journal.md` 入口 + `log.md` 唯一活日誌，移除 legacy 月誌與模板檔
- [2026-05-18T14:21:24.680+08:00][POS-UI][PA-UI] `P:\MEMORY` 對應調整：修正 PA-UI / POS-UI 的 `CLAUDE.md` 與 `.github/copilot-instructions.md`，將舊的 `projects/{leaf}/status.md` 引用改為 family-level hub + `status.md`，並補上 `/save` 結束觸發詞
- [2026-05-18T11:00:00.000+08:00][MEMORY] Obsidian Graph 結構重組：改採 Folder Notes 模式建立 hub 檔案（`projects/projects.md`、`knowledge/knowledge.md`、`journal/journal.md`、`decisions/decisions.md`）；為三個子專案各建立同名 hub（`pa-ui/pa-ui.md`、`pos-ui/pos-ui.md`、`esp/esp.md`）；刪除所有 `index.md`；更新 `memory.md` 導航索引
- [2026-05-18T00:00:00.000+08:00][POS-UI] BMPPOS-12 需求釐清：調查第 3 項「保單紅利給付方式（含回饋金）的變更內容，調整『回饋金年期』、『給付方式』說明文字」，調閱 commit 紀錄查詢已實作變更

## 2026-05-15

- [2026-05-15T21:00:00.000+08:00][POS-UI] BMPPOS-19 派承辦人員 API 串接完成：實作 `handlePscAssignHandle()`（POST `psc/keyInTask/changeHandleId`）、新增 `PscAssignHandleTaskReq`、Service 新增 `assignHandleTask()`；新增 6 個分派紀錄欄位（建檔分派、變更狀態至待承辦、承辦分派，各含人員+時間）；移除舊 `handlerName` 欄位；Code Review 修正 4 項（含既有 bug：`handlePscReassign` pscIdList 缺 pscApplyCode）；spec.md 同步更新
- [2026-05-15T18:00:00.000+08:00][POS-UI] 建立 `/review-change` slash command（`.claude/commands/review-change.md`）：流程為 code-reviewer 審查 → spec-writer 更新規格變更歷程
- [2026-05-15T17:00:00.000+08:00][PA-UI] 驗證 PA-UI CLAUDE.md 與 copilot-instructions.md 的 Session 生命週期設定：確認已正確配置知識讀取前置作業，無需修改
- [2026-05-15T00:00:00.000+08:00][POS-UI] BMPPOS-23 前掃受理系統日：User 驗測完成（releasev1.0.7）
- [2026-05-15T00:00:00.000+08:00][POS-UI][PA-UI] Claude Code 設定優化：修復 `~/.claude/settings.json` trailing comma 造成的 malformed JSON；移除已不需要的 `UserPromptSubmit` hook
- [2026-05-15T00:00:00.000+08:00][POS-UI][PA-UI] Claude Code 設定優化：移除 SessionEnd /clear log hook；新建 /save slash command；CLAUDE.md 加入 /save 觸發詞
- [2026-05-15T00:00:00.000+08:00][POS-UI] keyinsert-view02 用字確認：`統一編證號` 為正確用字，非錯字，勿修改
- [2026-05-15T00:00:00.000+08:00][POS-UI] keyinsert-view02 typo 修正（feature/BMPPOS-12）：`每期自定保險費` → `每期自訂保險費`（form-tab01:900、form-tab03:3491）；Code Review 通過；spec 變更歷程已補記
- [2026-05-15T00:00:00.000+08:00][POS-UI] keyinsert-view02 文字用字修正（bugfix/fix-wording）：`每期自定保險費` → `每期自訂保險費`（form-tab01:890、form-tab03:3478）、`Sesstion` → `Session`（component.ts:1418）；Code Review 全數通過（8/8）

## 2026-05-14

- [2026-05-14T00:00:00.000+08:00][POS-UI][PA-UI] Claude Code 設定優化：診斷並修復 @memory agent 名稱不一致問題（memory-helper.md → memory.md）；實作 UserPromptSubmit hook 自動偵測「收工」等關鍵字並注入 @memory 提醒；SessionEnd hook（matcher: clear）記錄 /clear 事件
- [2026-05-14T00:00:00.000+08:00][POS-UI] BMPPOS-22 BSD 測報產出（純文字版，無截圖）：因 Playwright 導航失敗，截圖缺失，需後續補圖
- [2026-05-14T00:00:00.000+08:00][POS-UI] 建立 `projects/pos-ui/overview.md`
- [2026-05-14T00:00:00.000+08:00][POS-UI] 在 `pos/pos-ui/CLAUDE.md` 加入 `P:\MEMORY\memory.md` 參考
- [2026-05-14T00:00:00.000+08:00][POS-UI] 在 `pos/pos-ui/.github/copilot-instructions.md` 加入本機知識庫弱引用
- [2026-05-14T00:00:00.000+08:00][POS-UI] Session 生命週期完整建立：在 POS-UI CLAUDE.md 與 copilot-instructions.md 加入開始讀取 journal、結束更新 journal 的協議
- [2026-05-14T00:00:00.000+08:00][POS-UI] 建立 `~/.claude/agents/memory.md` 跨專案知識庫管理 agent
- [2026-05-14T00:00:00.000+08:00][POS-UI] 將 journal 格式調整為 Current Focus / Entry Points / Next Actions / Decisions / Constraints
- [2026-05-14T00:00:00.000+08:00][POS-UI] BMPPOS-23 前掃受理系統日：完成合併至 releasev1.0.7，已上傳測報
- [2026-05-14T00:00:00.000+08:00][POS-UI] BMPPOS-12：完成合併至 releasev1.0.7，已上傳測報
- [2026-05-14T00:00:00.000+08:00][POS-UI] BMPPOS-22 休假管理時間編輯狀態：完成合併至 releasev1.0.7（原始版本已上 product v1.0.6）
- [2026-05-14T00:00:00.000+08:00][POS-UI] BMPPOS-21 地址正規化：完成開發，待合併至 releasev1.0.9
- [2026-05-14T00:00:00.000+08:00][POS-UI] BMPPOS-14 & BMPPOS-20：完成開發，待合併至 releasev1.0.8
- [2026-05-14T00:00:00.000+08:00][PA-UI] 建立 `projects/pa-ui/overview.md`
- [2026-05-14T00:00:00.000+08:00][PA-UI] 在 `pa/pa-ui/CLAUDE.md` 加入 `P:\MEMORY\memory.md` 參考
- [2026-05-14T00:00:00.000+08:00][PA-UI] 在 `pa/pa-ui/.github/copilot-instructions.md` 加入本機知識庫弱引用
- [2026-05-14T00:00:00.000+08:00][PA-UI] 將 journal 格式調整為 Current Focus / Entry Points / Next Actions / Decisions / Constraints
- [2026-05-14T00:00:00.000+08:00][PA-UI] BMPPA-4 受理人員查詢調整：完成開發，補測報已上傳 ✅
- [2026-05-14T00:00:00.000+08:00][PA-UI] Session 生命週期完整建立：在 PA-UI CLAUDE.md 與 copilot-instructions.md 加入開始讀取 journal、結束更新 journal 的協議
- [2026-05-14T00:00:00.000+08:00][PA-UI] 在 `P:\MEMORY\knowledge\conventions.md` 新增「Session 結束協議」段落
- [2026-05-14T00:00:00.000+08:00][ESP] 重新整理檔案並測試其他 API 產出（AddressQuery WS）
- [2026-05-14T00:00:00.000+08:00][ESP] 建立 `P:\MEMORY\projects\esp\overview.md` 與 `P:\MEMORY\journal\esp.md`

## 2026-05-11

- [2026-05-11T00:00:00.000+08:00][ESP] Phase 3 完成：Playwright UI 驗證強制化、steering 文件建立、第五版分析

## 2026-05-09

- [2026-05-09T00:00:00.000+08:00][ESP] Phase 2 完成：整合三分支 skills、改寫 write-spec.md
