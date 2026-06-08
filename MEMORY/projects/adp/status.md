# ADP 工作狀態

## Related Lessons

> ADP family 目前以共用規則為主；完整列表見 [lessons-learned.md](../../knowledge/lessons-learned.md)。

- （待補）

---

## Current Focus

- **資轉問題分析**：從 Jira 單（Highest/High、PG 標籤 M3-M5，約 58 張）逐筆追溯舊K trinity 系統（表名含 `_K_`）與新系統的對應關係；負責人 Bruce 協助資轉 SQL 釐清。
- **開發分支**：`release/M3`（後端 `adp-policy`、前端 `adp-gi-ui`）

## Entry Points

**工作區路徑**（相對於工作區根目錄）
- ADP 後端: `adp-policy`
- ADP 前端: `adp-gi-ui`

**規格文件路徑**
- BSD 根目錄: `K:\06.專案\06.25.團旅險系統更新專案\E40系統設計(FunctionTableModule)\S055BSD確認\B01001 團險BSD\`
- BSD_001 計畫書作業（最新作業類）: `TGL_COR_GR_BSD_001A_計劃書作業(作業類)_v4.3.5.docx`
- BSD_002 新契約承保作業（最新作業類）: `TGL_COR_GR_BSD_002_新契約承保作業(作業類)_v5.0.docx`

**Vault 路徑**（相對於 `P:\MEMORY`）
- Context: [projects/adp/adp.md](adp.md), [knowledge/conventions.md](../../knowledge/conventions.md)

**環境**
- SIT：SIT 1 / SIT 2 / **SIT 3（主要介面）**
- UAT：UAT 1 / UAT 2 / **UAT 3（主要介面）**

## Next Actions

- [ ] 盤點 Jira 單清單（Highest/High、PG 標籤 M3-M5），確認優先處理順序
- [ ] 與 Bruce 對齊資轉 SQL 問題根因，建立舊K欄位對應表
- [ ] 釐清 `_K_` 表與新系統對應關係，記錄於知識庫

## Blocked

- 無

## Decisions / Constraints

- 時程目標：六~八月內（2026-06 ～ 2026-08）解完所有 M3-M5 Jira 單
- 資轉負責人 Bruce 為主要聯絡窗口
- 問題根源為資轉 SQL，分析前需先確認舊K欄位（`_K_` 前綴）定義
- 主要測試介面：SIT 3、UAT 3
- `projects/adp/` 是 ADP 的唯一活文件入口
