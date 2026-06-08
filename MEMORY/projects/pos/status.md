# POS 工作狀態

## Related Lessons

> POS family 目前延續既有 UI 任務脈絡；完整列表見 [lessons-learned.md](../../knowledge/lessons-learned.md)。

- **Playwright canActivate 時序**：`addInitScript` 可能晚於 guard，需 mock guard 或攔截 API。
- **自訂 agent 若要穩定使用 `P:\MEMORY`，必須在 prompt 明寫 routing**：workspace `CLAUDE.md` 可補充背景，但不保證每個 agent 都會自動讀取 Vault；若需要歷史教訓與知識，一律在 agent workflow 加 `Step 0` 明寫讀取順序與 fallback。
- **BSD 測報禁用技術術語**：用畫面元素名稱，不用變數名、API 路徑、CSS class。
- **正體中文用字**：「自訂」非「自定」。
- **Folder Notes 模式**：Vault 採用資料夾同名 Hub 檔作為入口（如 `projects/pos/pos.md`）。
- **非刪除式整併**：IA 重整時先建立新入口與回指，保留歷史脈絡於 `journal/` 與 `history.md`。

---

## Current Focus

- **跨專案 md 工作流工具骨架已建立**（2026-06-08）：user-level `.claude` 已新增 `gate-keeper` / `angular-testing` skills、`unit-test-writer` / `implementer` agents、輕量 `/start-work` command；`/plan` 改為先問答確認後再執行。另已建立共享 Playwright harness：`C:\Users\003689\Desktop\playwright-harness`。
- **code-reviewer agent 已補 `P:\MEMORY` routing**（2026-06-04）：`c:\Users\003689\.claude\agents\code-reviewer.md` 新增 Step 0，review 前明確讀取 `memory.md` → `knowledge.md` → 任務相關 `knowledge/` → family hub/status；並限制 Vault 僅作背景補充，不得取代本地 spec、instructions 與原始碼。
- **Preflight skill 三 UI repo 收斂完成**（2026-06-05）：workspace-shared `preflight` skill 建立於 `SDC01/.github/skills/preflight/`；POS-UI 刪除 repo-local `preflight.instructions.md`，fallback inline 在 `CLAUDE.md`；PA-UI / Core-UI 保留本地 `preflight.instructions.md` 作為 fallback。三 repo 均採「skill 優先、instructions 保底」模式，不依賴 user-local 路徑。
- **data-privacy.instructions.md 跨專案串接完成**（2026-06-04）：POS-UI、Core-UI、PA-UI 三專案已建立 `.github/data-privacy.instructions.md` 並在 `CLAUDE.md` 與 `.github/copilot-instructions.md` 串接；pos-ui 已刪除 `.github/agents/copilot-instructions.md`（.specify artifact）。
- **BMPPOS-24**（✅ 開發完成 + ✅ BSD 已上傳 JIRA + ✅ SDCRELEASE-219 已開 + ✅ 差異檔已產出）：
  - 原始項目：`holiday-maintain-dialog` 說明文字（`f0ea59d`）+ 顏色調整紅色 `#dc3545`（`ee75269`）；spec 更新；Code Review 通過。
  - **新增項目（2026-06-03）**：checkListId=559（pscApply-view02）與 checkListId=592（pscapply-view03）卡控邏輯暫時停用；spec 標記「暫時停用」；修正 `cusApplyDate: ''→null`、移除 `console.log` 個資外洩、移除 pscApply-view02 無效 `patchValue`。
  - 分支：`feature/BMPPOS-24`，已合併至 `release/v1.0.8`。BSD 測報已上傳 JIRA。
  - **SDCRELEASE-219 上線單已開**；差異檔：`K:\06.專案\06.19.保全前掃\11_正式環境上線單\2026\SDCRELEASE_219\前端v1.0.8_diff.txt`（Dockerfile + assignee-view04 spec + holiday-maintain-dialog.html，共 3 檔）；待 IED 審核部署 PROD。
- **checkListId=592 卡控暫停**（2026-06-03）：`pscapply-view03.component.ts` `handleUpdateApply()` 中「保單號碼受理不可受理個人資料異動書」硬卡控邏輯已全部註解，分支 `feature/remove-doc-validate`。原卡控自 commit `dd40c23`（2026-03-25）加入，從未移除；此次暫停配合 release/v1.0.8 上線，業務需求暫時允許混受理，恢復時機未定（TODO 已標記）。
- **BMPPOS-12**（✅ v1.0.7 確認）：按原定計畫上線 release/v1.0.7；SDCRELEASE-217 上線單已申請，已生產差異檔。
- **BMPPOS-23**（✅ v1.0.7 確認）：按原定計畫上線 release/v1.0.7；SDCRELEASE-217 上線單已申請，已生產差異檔。
- **BMPPOS-19**：已合併 feature/develop，已部署 SIT；BSD 已完成；**E2E 測試 8/8 通過**（`e2e/keyinsert-view01/keyinsert-view01.spec.ts`）；✅ **BSD 已上傳 JIRA**。查詢結果空值顯示 `-`（resultDisplay pipe）已完成，spec v1.4 已更新。
- **`/start-work` 流程修正完成**（2026-06-08）：HARD RULES 明文化（5 條）、STOP gate 收斂至計畫確認與驗收條件（DoD）兩個時間點、所有 subagent 前綴 `@`、Spec 更新強制啟動 `@spec-writer`。術語中文化：DoD → 驗收條件（DoD）、AC 敘述 → 驗收項（AC），識別碼 AC-XX 保留。
- **BMPPOS-21**：已合併 feature/develop，已部署 SIT；BSD 含 10 張截圖；bug fix + spec 補齊已完成；**E2E 測試 5/5 通過**（`form-tabs.spec.ts` 追加 BMPPOS-21 區塊）；✅ **BSD 已上傳 JIRA**。
- `/save` 指令已修正，明確加入 `todo-list.md` 同步更新步驟。
- `/todo` 全域指令已建立，依優先度（🔴🟡🟢）分類輸出含總覽表格。

## Entry Points

**工作區路徑**（相對於工作區根目錄）
- POS API: `pos/pos-api`
- POS UI: `pos/pos-ui`

**Vault 路徑**（相對於 `P:\MEMORY`）
- Context: [projects/pos/pos.md](pos.md), [projects/pos/about.md](about.md), [projects/pos/lookup.md](lookup.md), [projects/pos/history.md](history.md), [projects/pos/pos-ui.md](pos-ui.md), [knowledge/spec-kit.md](../../knowledge/spec-kit.md)

## Next Actions

- [ ] 用一個真實需求 dry run `/start-work` → spec → `/plan` 確認 → 單一 AC 流程，驗證問答 checkpoint 是否順暢
- [x] **BMPPOS-24 開發完成**：html 說明文字（`f0ea59d`）+ 紅色樣式（`ee75269``）；spec 欄位備註顏色 + 變更歷程更新；Code Review 通過
- [x] **BMPPOS-24 合併 releasev1.0.8**：✅ 已合併至 release/v1.0.8
- [x] **BMPPOS-24 BSD 已上傳 JIRA**
- [x] **BMPPOS-24 開 SDCRELEASE 上線單**：✅ SDCRELEASE-219 已開（2026-06-04）；差異檔已產出至 `K:\...SDCRELEASE_219\前端v1.0.8_diff.txt`；待 IED 審核部署 PROD
- [x] **BMPPOS-12 v1.0.7 確認**：按原定計畫，SDCRELEASE-217 已申請，差異檔已產出
- [x] **BMPPOS-23 v1.0.7 確認**：按原定計畫，SDCRELEASE-217 已申請，差異檔已產出
- [ ] **releasev1.0.7 部署 PROD**：等 SDCRELEASE-217 核准後由 IED 部署
- [ ] 為 `pos-api` 補 about / lookup / status 細節
- [x] **上傳 BMPPOS-21 測報**：BSD 含截圖已上傳 JIRA（releasev1.0.9）
- [x] BMPPOS-22 測報補截圖（已完成，含圖版本已產出並上傳）
- [x] **BMPPOS-14 / BMPPOS-20（同一修正項目）**：BSD 測報共用同一份，✅ 已上傳 JIRA；後續合併至 release/v1.0.9
- [ ] **未來需要時重新開放 checkListId=592 卡控**：`pscapply-view03.component.ts` `handleUpdateApply()` 中已用 TODO 標記，分支 `feature/remove-doc-validate`；恢復時取消註解並移除 TODO

## 建檔作業待開發需求（截至 2026-05-20）

> 以下三項保全需求尚未開發，**不可在業務確認前先行實作**。

### 1. 新增保全項 — 回饋分享金（指數型）：指定銀行帳戶變更
- 帳戶選擇做成「擇一」：「固定收益帳戶」/ 「指數連結帳戶」
- 若為指數連結型商品，回饋分享金可指定投入帳戶
- **狀態**：待開發（需實作商品類型判斷，動態顯示帳戶選擇選項）

### 2. 調整保全項 — 自動平衡
- 新增「是否為新商品」判斷
- 勾選時顯示 TABLE（申請變更自動平衡批註及平衡頻率）
- **狀態**：TABLE 欄位定義**尚未確定**，需業務確認後再實作

### 3. 新增保全項 — 保單價值準備金部分提領
- **狀態**：需求內容**尚待確認**，不可先行實作

## Blocked

- BMPPOS-18（原 BMPPOS-4 後半段未完成）：待 Q3 ASD 部門協助開發功能

## Decisions / Constraints
- `/start-work` 應維持單一輕量入口；是否繼續、是否建立共享 harness、是否進入驗收條件（DoD）收尾，皆以流程問答確認，不新增額外 command 心智負擔。
- POS-UI 作為獨立資料夾/概念已退場，改由 family + leaf page 結構承接（參考 ADR-001）
- 自訂 code review agent 若需穩定使用 Vault 歷史知識，必須在 agent prompt 內明寫 `P:\MEMORY` 讀取順序；不能只依賴 workspace `CLAUDE.md` 的外層規則。
- `projects/pos/` 是 POS 的唯一活文件入口；UI 靜態參考由 `projects/pos/pos-ui.md` 承接。
- `pos-ui/.github/agents/copilot-instructions.md` 為 `.specify` 腳本產生的 agent context artifact，不是主要 Copilot workspace 入口；主要指引仍是 `pos-ui/.github/copilot-instructions.md`。若保留 `.specify` 更新流程，刪除後仍可能再次生成。
- 調整 Vault 結構或路徑後，需同步更新 `pos-ui/CLAUDE.md` 與 `.github/copilot-instructions.md` 的 memory 入口、status 路徑與 `/save` 觸發詞。
- `journal.md` 只作入口，`journal/log.md` 是唯一活日誌；`journal/todo-list.md` 作為跨專案待辦總覽，不得再新增月誌或 template 型 journal 活文件。
- 既有工作歷程保留在 `projects/pos/history.md` 與 `journal/log.md`，不刪除既有 session 歷史。
- 各版本合併範圍（2026-06-02 更新）：v1.0.7 <- BMPPOS-12、BMPPOS-23（按原計畫，SDCRELEASE-217 已申請）；v1.0.8 <- BMPPOS-24（從 v1.0.7 移出）；v1.0.9 <- BMPPOS-14、BMPPOS-20；v1.0.10 <- BMPPOS-21；v1.0.11 <- BMPPOS-19
- **Playwright 測試前必須先 rebase**：`playwright-test` 執行前需 `git rebase origin/feature/develop`，否則 canActivate guard 可能讀不到 sessionStorage token 而重導
- **bsd-report skill 字體**：文件字體改為 新細明體（非 標楷體），SKILL.md 與 docx-structure.md 已同步（2026-05-18）
- 已上 product：releasev1.0.6（含 BMPPOS-22 原始版本）；v1.0.6 曾發生 PROD rollback，根因為退版而非程式 bug
- **PROD 部署流程**：需開 release 單給 IED 單位，JIRA SDCRELEASE 專案；不可自行部署
- **Harbor Image Registry**：harbor.transglobe.com.tw project 58（包版時確認 image 版本）
- **環境分支紀律**：UAT ↔ release/v1.0.x、SIT ↔ feature/develop；上線前確認 insureMo 版本脫鉤；未在本次發布的功能不可 merge 進 release 分支
- BMPPOS-19 查詢結果 `handlerName` 欄位已移除，改為三組分派追蹤欄位（changeKeyIn、changeToHandel、changeHandel）

## Release 狀態

| Ticket    | 說明                 | 狀態                      | 目標版本                             |
| --------- | ------------------ | ----------------------- | -------------------------------- |
| BMPPOS-24 | 休假管理 AssigneeView04 開始時間修正 | ✅ 已合併；✅ BSD 已上傳 JIRA；✅ SDCRELEASE-219 已開，待 IED 審核部署 PROD | releasev1.0.8 |
| BMPPOS-22 | 休假管理時間編輯狀態         | ✅ **測報含截圖已完成**          | releasev1.0.6（v1.0.6 已上 product） |
| BMPPOS-23 | 前掃受理系統日            | ✅ **v1.0.7 按原計畫確認，SDCRELEASE-217 已申請** | releasev1.0.7 |
| BMPPOS-12 | 保單紅利給付方式調整           | ✅ **v1.0.7 按原計畫確認，SDCRELEASE-217 已申請** | releasev1.0.7 |
| BMPPOS-14 | 建檔作業新增檢核           | 已完成開發，**需補上傳測報**        | releasev1.0.9                    |
| BMPPOS-20 | 變更文件調整             | 已完成開發，**需補上傳測報**        | releasev1.0.9                    |
| BMPPOS-21 | 地址正規化              | ✅ **BSD 已上傳 JIRA**           | releasev1.0.10                   |
| BMPPOS-19 | 任務分配（派承辦人員 API 串接） | ✅ **BSD 已上傳 JIRA**           | releasev1.0.11                   |
| BMPPOS-18 | 原 BMPPOS-4 後半段     | 駐列（Q3 ASD）              | —                                |