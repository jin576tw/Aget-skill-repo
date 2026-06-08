一# Todo List

> 跨專案待辦與工作進度總覽；`/save` 時僅更新本次 session 主要專案區塊。

Last Updated: 2026-06-08 — [POS-UI] BMPPOS-19 resultDisplay pipe 完成；`/start-work` HARD RULES + STOP gate + `@subagent` 強制規則修正完成 ✅

## POS

| 單號                        | 工作內容                                      | 狀態                                                                                      |
| ------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------- |
| `BMPPOS-12`               | 保單紅利給付方式調整 + 05/27 追加需求                   | ✅ **v1.0.7 按原計畫確認**，SDCRELEASE-217 已申請，差異檔已產出                                           |
| `BMPPOS-23`               | 前掃受理系統日                                   | ✅ **v1.0.7 按原計畫確認**，SDCRELEASE-217 已申請，差異檔已產出                                           |
| `BMPPOS-24`               | 休假管理說明文字 + 559/592 卡控暫時停用 + code fix      | ✅ **已合併 `releasev1.0.8`**；✅ BSD 已上傳 JIRA；✅ **SDCRELEASE-219 已開，差異檔已產出**；待 IED 審核部署 PROD |
| `BMPPOS-22`               | 休假管理時間編輯狀態                                | ✅ 測報含截圖且上傳，已併入 `releasev1.0.6`                                                          |
| `BMPPOS-19`               | 任務分配                                      | BSD 已完成；**E2E 測試 8/8 通過**；✅ BSD 已上傳 JIRA；✅ resultDisplay pipe 完成，spec v1.4 已更新       |
| `BMPPOS-21`               | 地址正規化                                     | BSD 已上傳 JIRA；bug fix + spec + **E2E 測試 5/5 通過**；預計併入 `releasev1.0.10`                   |
| `BMPPOS-14` / `BMPPOS-20` | 建檔作業新增檢核 + 變更文件調整（同一修正項目）                 | BSD 共用同一份測報，已上傳 JIRA；預計併入 `releasev1.0.9`                                               |
| `BMPPOS-18`               | 原 BMPPOS-4 後半段未完成項目                       | 駐列，待 Q3 ASD 部門協助                                                                        |
| （無 JIRA）                  | code-reviewer agent 補 `P:\MEMORY` routing | ✅ 已完成；review 前會先讀 `memory.md` / `knowledge.md` / POS hub / `status.md`                  |
| （無 JIRA）                  | 重新開放 checkListId=592 卡控（pscapply-view03）  | ⏸ 暫停中；分支 `feature/remove-doc-validate`，TODO 已標記，待業務確認後取消註解                              |
| （無 JIRA）                  | md workflow tooling + shared harness      | ✅ 已完成；`/start-work` 問答流程、`gate-keeper` / `angular-testing`、共享 Playwright harness 已建立    |


### POS Release 進度

| Release          | 單號                      | 進度                                                        |
| ---------------- | ----------------------- | --------------------------------------------------------- |
| `releasev1.0.6`  | `BMPPOS-22`             | ✅ 已定版上 product                                            |
| `releasev1.0.7`  | `BMPPOS-12`、`BMPPOS-23` | ✅ 按原計畫確認；SDCRELEASE-217 已申請，差異檔已產出，待 IED 部署 PROD          |
| `releasev1.0.8`  | `BMPPOS-24`             | ✅ BSD 已上傳 JIRA；✅ SDCRELEASE-219 已開，差異檔已產出；待 IED 審核部署 PROD |
| `releasev1.0.9`  | `BMPPOS-14`、`BMPPOS-20` | 開發完成，待補上傳測報                                               |
| `releasev1.0.10` | `BMPPOS-21`             | BSD 已上傳 JIRA                                              |
| `releasev1.0.11` | `BMPPOS-19`             | BSD 已上傳 JIRA                                              |
| `releasev1.0.12` | `BMPPOS-18`             | 駐列（Q3 ASD）                                                |


## Core

| 單號             | 工作內容                                                 | 狀態                                                                                         |
| -------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `BMPPCORE-280` | datepicker navigation 消失 — ng-bootstrap v16→v18      | ✅ 已修復：`angular.json` polyfills 加 `"@angular/localize/init"`                                |
| `BMPPCORE-280` | 病例公函 — acceptTimeTS/updateTimeTS 欄位切換 + 核銷清冊建檔日期區間修正 | ✅ 完成（分支 features/jin576tw/BMPCORE-280）；收據狀況 4 選項待後端 `common/v1/invstPaperList` 更新（前端架構已就緒） |
| （無 JIRA）       | core-ui preflight 本地指引鏈補齊                            | ✅ 已完成（2026-06-05）；workspace-shared skill + skill-first fallback 三 UI repo 全部對齊             |
| （待 JIRA）       | docview08 中台參數維護（查詢 + 新增/編輯特調員工清單）                   | ✅ 已完成（2026-06-05），兩輪 code review 通過                                                        |
| （待 JIRA）       | 弱掃修正 — SCA 套件升級（`feature/upgrade-package`）           | ✅ 全部完成；殘留 bluebird LOW（死碼）→ 接受可接受風險；⚠️ **正式區上線前須重打 Base-Image 推送 Harbor**                  |
| （待 JIRA）       | 🔴 **每日追蹤 SCA 弱掃簽核狀況**（2026-06-05 起）                 | 🔴 追蹤中；每日確認 SDCRELEASE 核准進度，直至 PROD 部署完成                                                   |
| （待 JIRA）       | ESP SDD 第一階段簡報                                       | ✅ 初版完成，產出 `P:\SDD-第一階段Poc.pptx`                                                            |
| （無 JIRA）       | crud-view.instructions.md — CRUD view 開發規範           | ✅ 已完成（2026-06-05），8 步驟 + 6 條防呆規則，CLAUDE.md 同步更新                                            |
| （無 JIRA）       | md workflow tooling + shared harness                    | ✅ 已完成；`/start-work` 問答流程、`gate-keeper` / `angular-testing`、共享 Playwright harness 已建立            |

## PA

| 單號        | 工作內容     | 狀態                                                |
| --------- | -------- | ------------------------------------------------- |
| `BMPPA-4` | 受理人員查詢調整 | ✅ 已部署正式環境（2026-06-01 確認完成） |
| （無 JIRA） | md workflow tooling + shared harness | ✅ 已完成；`/start-work` 問答流程、`gate-keeper` / `angular-testing`、共享 Playwright harness 已建立 |

### PA Release 進度

| Release         | 單號        | 進度                      |
| --------------- | --------- | ----------------------- |
| `release/v1.0.1` | `BMPPA-4` | ✅ 已部署正式環境（2026-06-01 確認） |

## ESP

| 單號           | 工作內容                                 | 狀態                                                                    |
| ------------ | ------------------------------------ | --------------------------------------------------------------------- |
| `harness-v1` | write-spec Harness 化重構（多代理 + DAG 編排） | ✅ 路徑遷移 + 知識骨幹填入 + orchestrator 交握驗證 全完成；待：測試 2/3/5、驗證程式碼與規格機制（🟢 低優先） |
| `sdd-ppt` | SDD 第一階段簡報重整輸出 PPT/PPTX | 🟡 Markdown 素材路徑待確認，下次 session 開始時釐清 |
| `verify-agentflow` | verify-spec 改造為 AgentFlow worker（驗證正確率） | 🟡 **優先度提升**（2026-06-05）；設計 `esp-verify` agent，整合至 Harness DAG |
| `skills-split` | skills / prompts 拆分 — 跨專案通用分析 skill | 🟡 新增（2026-06-05）；抽出 Layer 1→4b 分析工法為 `analysis-methodology.md`，跨 POS/Core/PA/ADP 可用 |

## ADP（新團險系統）

| 單號 | 工作內容 | 狀態 |
| --- | --- | --- |
| M3-M5（約 58 張） | 資轉 Jira 單 — 釐清舊K trinity 與新系統對應關係 | 🆕 專案建立；待盤點 Jira 單優先序，與 Bruce 對齊資轉 SQL 根因 |

> 時程：2026-06 ～ 2026-08 ｜ 分支：`release/M3` ｜ Repo：`adp-policy` + `adp-gi-ui` ｜ 主要測試介面：SIT 3 / UAT 3

## SDD
| 工作內容           | 狀態                              |
| -------------- | ------------------------------- |
| ESP SDD 第一階段簡報 | ✅ 初版完成，產出 `P:\SDD-第一階段Poc.pptx` |
