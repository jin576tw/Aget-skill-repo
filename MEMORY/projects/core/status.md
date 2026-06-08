# Core 工作狀態

## Related Lessons

> 目前尚無 Core 專屬蒸餾教訓；跨專案規則以 [conventions.md](../../knowledge/conventions.md) 為準。

- **Preflight 基礎設施不能只寫在 `CLAUDE.md`**：若要讓 Copilot / Claude 共用同一套 intake 與 local fallback 規則，需補齊 `CLAUDE.md` → `copilot-instructions.md` → `preflight.instructions.md` 三層鏈。

---

## Current Focus

- **跨專案 md 工作流工具骨架已建立**（2026-06-08）：user-level `.claude` 已新增 `gate-keeper` / `angular-testing` skills、`unit-test-writer` / `implementer` agents、輕量 `/start-work` command；`/plan` 改為先問答確認後再執行。另已建立共享 Playwright harness：`C:\Users\003689\Desktop\playwright-harness`。
- **🔴 [core-ui] 每日追蹤弱掃簽核狀況**（2026-06-05 起）：`feature/core-sca` 已合併，需每日確認 SDCRELEASE 或相關上線核准單的審核進度，直至 PROD 部署完成。
- **✅ [core-ui] BMPPCORE-280 / ng-bootstrap v18 datepicker navigation 消失 → 已修復**：根因為 `$localize is not defined`（ng-bootstrap v18 navigation template 使用 Angular i18n 標記），修法：`angular.json` polyfills 加入 `"@angular/localize/init"`。
- **[feature/core-sca] SCA 套件升級**：✅ 全部完成。`feature/upgrade-package` 已合併入 `features/jin576tw/BMPCORE-280`（fast-forward）與 `feature/core-sca`（ort merge）。修正項目：Angular 17→19、uuid v4→v7、@types/uuid 移除、TS-998113 未使用 standalone imports 清理（8 個元件）、angular.json Sass/CommonJS 警告抑制、build budget 調高。殘留 bluebird@3.7.2 LOW（死碼）→ 接受可接受風險。
  > ⚠️ **正式區上線前提**：套件有升級，必須重新打包 Base-Image 並推送至 Harbor，Jenkins 才能使用新套件建置。流程見 [[knowledge/build-deploy]]。
- **✅ [core-ui] BMPPCORE-280 編輯公函檔 — 需求變更（2026-06-02）：核心實作完成（分支 v1.0.19）**
  - **彈窗放大**：✅ 已實作（三處 `fullscreen: true`）
  - **收據狀況下拉選項**：確定為「有收據」、「無收據」、「退函(支票)」、「退函(現金)」共 4 項；等後端 `common/v1/invstPaperList` API 就緒後自動生效（前端架構已就緒）
  - **收據狀況必填驗證**：✅ 已修正（`row.paper == null` 判斷，空字串 `""` 為合法「未回覆」值不誤攔）
  - **`getAbnormalStatus()` 新規則**：✅ 已更新（`medicalReply-letter-pdf-worker.ts`）
  - **MedicalReplyView02「建檔日期」預設今日**：✅ 已實作（建構子初始化，`setDefaultRange` binding）
  - **acceptTimeTS/updateTimeTS 欄位切換**：✅ 完成（type、utils、pipe、view01/view02/invst-letter HTML、業務邏輯）
  - **MedicalReplyView02 查證核銷清冊 PDF「建檔日期區間」顯示 "~"**：✅ 已修正（從 `clmaInvstTable` 全表 `acceptTimeTS` 計算 min/max ROC 日期傳入 print service；`isoToRoc()` 已移除）
- **✅ [core-ui] docview08 中台參數維護**：已完成，查詢 + 新增/編輯 dialog 全部實作，兩輪 code review 通過（2026-06-05）。
- **✅ [core-ui] crud-view.instructions.md**：DocView08 模式已沉澱為 instructions 規範，CLAUDE.md 同步更新（2026-06-05）。
- **[ESP] SDD 第一階段簡報**：✅ 初版完成，產出 `P:\SDD-第一階段Poc.pptx`。

## Entry Points

**工作區路徑**（相對於工作區根目錄）
- Core API: `core/core-api`
- Core UI: `core/core-ui`

**Vault 路徑**（相對於 `P:\MEMORY`）
- Context: [projects/core/core.md](core.md), [projects/core/about.md](about.md), [projects/core/lookup.md](lookup.md), [projects/core/history.md](history.md), [knowledge/conventions.md](../../knowledge/conventions.md)

## Next Actions

- [ ] 用一個真實需求 dry run `/start-work` → spec → `/plan` 確認 → 單一 AC 流程，驗證問答 checkpoint 是否順暢
- [ ] **🔴 [core-ui] 每日追蹤弱掃簽核狀況**：每日確認 `feature/core-sca` 弱點掃描上線核准進度（SDCRELEASE 簽核單），直至 PROD 部署完成（2026-06-05 起）
- [ ] 補充 Core API / UI 的常用指令、入口與模組邊界
- [ ] 依實際任務補 Core 常見模組、共用元件與建置指令
- [x] **[core-ui] 補齊 preflight 本地指引鏈**：✅ 已完成（2026-06-05）：CLAUDE.md + copilot-instructions.md 改成「skill 優先、`.github/instructions/preflight.instructions.md` 保底」；workspace-shared skill 已建立，不依賴 user-local 路徑
- [x] **[Infra] preflight skill 改為跨專案通用**：✅ 已完成（2026-06-05）：`~/.claude/skills/preflight/` SKILL.md 移除 POS-UI 限制、workflow.md 加入 Step 0 自動偵測、pos-ui-routing.md 刪除；三個 UI repo 不需異動
- [x] **[core-ui] datepicker navigation 消失** — ✅ 已修復：`angular.json` polyfills 加 `"@angular/localize/init"`
- [x] **[core-ui] BMPPCORE-280 編輯公函檔** — ✅ 核心實作完成（2026-06-02）；收據狀況選項等後端 `common/v1/invstPaperList` 更新後自動生效
- [x] **[core-ui] docview08 中台參數維護** — ✅ 已完成（2026-06-05），查詢 + 新增/編輯全部實作，兩輪 code review 通過
- [x] **[core-ui] crud-view.instructions.md** — ✅ 已完成（2026-06-05），DocView08 開發模式沉澱為 instructions + CLAUDE.md 更新
- [x] **[ESP] SDD 第一階段簡報** — ✅ 初版完成，產出 `P:\SDD-第一階段Poc.pptx`
- [x] **[core-ui] 弱掃修正（SCA）** — SAST ✅、WebInspect ✅、SCA ✅；Angular 17→19 升級完成；jspdf CVE-2025-68428 修復；uuid v4→v7；TS-998113 清理；`feature/upgrade-package` 已合併 `features/jin576tw/BMPCORE-280` + `feature/core-sca`（commit 93aa885）
- [x] **[core-ui] CRM 開發** — 已移除，不再支援

## Blocked

- 無

## Decisions / Constraints

- `/start-work` 應維持單一輕量入口；是否繼續、是否建立共享 harness、是否進入 DoD 收尾，皆以流程問答確認，不新增額外 command 心智負擔。
- `projects/core/` 是 Core 的唯一活文件入口；API / UI 靜態參考由 `core-api.md`、`core-ui.md` 承接。
- 目前以最小足夠導覽為主；若未來出現 Core 長期維護需求，再細分更完整的 operational notes。
- core-ui preflight 已對齊 POS / PA 模式（2026-06-05）：CLAUDE.md + copilot-instructions.md 均改為「skill 優先、preflight.instructions.md 保底」；workspace-shared skill 位於 `SDC01/.github/skills/preflight/`。
- `crud-view.instructions.md` 已建立（2026-06-05）：含 8 步驟、程式碼骨架、6 條防呆規則，為 Core-UI CRUD view 的標準建置規範。