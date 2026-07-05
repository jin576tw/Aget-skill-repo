---
name: Review Change
description: 變更審查 — 對照規格執行 Code Review，通過後更新規格文件的變更歷程。
---

# 變更審查流程

**針對目前的變更，依序執行 Code Review 與規格文件更新。**

## 輸入參數

`$ARGUMENTS` — 目標頁面或功能名稱，例如 `keyinsert-view01`、`assignee-view03`。若未指定，則根據變更檔案自行判斷關聯的 spec。

---

## Step 0：知識庫背景查詢（非阻塞，不中斷）

在執行 Code Review 前，輸出以下三欄後直接繼續：

| 項目 | 內容 |
|------|------|
| **適用 skills** | 依本次變更類型比對 `~/.claude/skills/` 候選 skill |
| **lessons-learned 對應段** | 依變更類型引用 `P:\MEMORY\knowledge\lessons-learned.md` 段落標題；無則填「無對應段」 |
| **知識庫進度** | `P:\MEMORY\projects/{family}/status.md` Current Focus；不可用時填「P:\MEMORY 不可用」 |

---

## Step 1：Code Review

Spawn **code-reviewer** agent：

- 確認變更範圍（新增/修改的檔案清單）
- 找出對應的規格文件：
  - 頁面規格：`specs/views/$ARGUMENTS/spec.md`
  - 功能規格：`specs/feature/*/spec.md`
- 對照規格執行審查（功能完整性、技術規範合規、程式碼品質）
- 產出驗收報告（含嚴重度分級）

**若有高嚴重度問題**：停止流程，回報問題清單給使用者，待修正後重新執行。

---

## Step 2：更新規格文件

當 Step 1 通過（無高嚴重度問題）後，spawn **spec-writer** agent：

- 提供：驗收報告、spec 路徑、變更摘要
- 更新 spec 文件中的「變更歷程」章節（記錄本次變更內容與日期）
- 若變更涉及規格內容調整（如欄位新增、行為變更），同步更新對應章節

---

## Step 3：回報結果

彙整審查結果，向使用者報告：
- 驗收結論（通過 / 有條件通過）
- 規格文件更新摘要