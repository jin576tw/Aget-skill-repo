# POS 查找規則

## Session 啟動

1. 先讀 [[projects/pos/status|POS 工作狀態]]，掌握 family-level 焦點。
2. 若任務落在 UI，接著讀 [[projects/pos/pos-ui|POS UI]]，再視需要回到 `pos/pos-ui` 原始碼與 specs。
3. 若任務落在 API，優先查看 [[projects/pos/pos-api|POS API]]，再回到 `pos/pos-api/specs/`、`src/main/`、`src/test/` 與 `pom.xml`。
4. 若需要跨專案規則、Spec-Kit 或測試模式，回到 [[knowledge/knowledge|Knowledge]]。

## 找功能

- UI 功能與票號進度：先查 [[projects/pos/status|POS 工作狀態]]，再看 [[projects/pos/pos-ui|POS UI]]。
- UI 規格與畫面：查 `pos/pos-ui/specs/`。
- API 規格與後端實作：查 `pos/pos-api/specs/`、`pos/pos-api/src/main/`。
- 共通規範與踩坑：查 [[knowledge/conventions|conventions]]、[[knowledge/lessons-learned|lessons-learned]]。

## 找歷史

- 近期工作紀錄：[[journal/log|工作日誌]]
- Family 層過渡與保留原則：[[projects/pos/history|POS 歷史脈絡]]

## 更新觸發條件

- POS family 新增子專案或入口頁。
- POS API 開始有穩定的 operational notes，需要把查找規則細化。
- POS UI 或 POS API 的主要入口、規格結構或共用模式改變。