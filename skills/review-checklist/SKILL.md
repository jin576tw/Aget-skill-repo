---
name: review-checklist
description: 程式碼審查清單 — 功能完整性檢查(規格合規)、技術規範檢查(基底類別/override/型別)、程式碼品質、驗收報告格式與嚴重度定義。TRIGGER when 使用者提及 code review、驗收、審查、程式碼審查。DO NOT TRIGGER when 僅討論規格撰寫或測試。
---

# 程式碼審查清單

| 檔案 | 用途 |
|------|------|
| [functional.md](functional.md) | 功能完整性檢查（規格合規） |
| [technical.md](technical.md) | 技術規範檢查（基底類別、override、型別） |
| [report-template.md](report-template.md) | 驗收報告格式 |

## 適用情境

- 開發完成後對照 spec 執行 Code Review
- code-reviewer agent 審查時參考
- 驗收前的品質把關

## 審查流程

### Step 1：收集驗收依據
- 閱讀對應 spec 文件（搜尋專案中 `specs/`、`docs/` 等 spec 目錄）
- 確認驗收條件（快樂路徑 + 錯誤路徑）
- 確認變更範圍（新增/修改的檔案）

### Step 2：逐項審查
- 功能完整性 → [functional.md](functional.md)
- 技術規範合規 → [technical.md](technical.md)
- 程式碼品質（未使用 import、硬編碼值、錯誤處理）

### Step 3：產出驗收報告
- 使用 [report-template.md](report-template.md) 格式

## 嚴重度定義

| 嚴重度 | 定義 | 範例 |
|--------|------|------|
| 高 | 功能無法正常運作或資料錯誤 | API 呼叫參數錯誤、必填驗證缺失 |
| 中 | 功能可運作但不符合規格 | 欄位顯示格式不正確、缺少錯誤處理 |
| 低 | 不影響功能但應改善 | 命名不符慣例、多餘的 import |

## 審查原則

- **唯讀操作**：只閱讀和分析，不修改任何檔案
- 嚴格以規格文件為驗收標準，不加入主觀判斷
- 區分「規格缺漏」（回報 spec-writer）與「實作缺漏」（回報主會話修正）
- 所有報告使用正體中文
- 回報問題時附上檔案路徑、行號與具體描述

## 相關 Skills

- **spec-conventions** — 規格文件的撰寫規範
