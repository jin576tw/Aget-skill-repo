# PA 查找規則

## Session 啟動

1. 先讀 [[projects/pa/status|PA 工作狀態]]，掌握 family-level 焦點。
2. 若任務落在 UI，接著讀 [[projects/pa/pa-ui|PA UI]]，再視需要回到 `pa/pa-ui` 原始碼與 specs。
3. 若任務落在 API，優先查看 [[projects/pa/pa-api|PA API]]，再回到 `pa/pa-api/src/main/`、`src/test/` 與 `pom.xml`。
4. 若需要共用規則，回到 [[knowledge/knowledge|Knowledge]]。

## 找功能

- UI 功能與現行 operational notes：先查 [[projects/pa/status|PA 工作狀態]]，再看 [[projects/pa/pa-ui|PA UI]]。
- UI 規格與畫面：查 `pa/pa-ui/specs/views/`。
- API 程式與測試：查 `pa/pa-api/src/main/`、`pa/pa-api/src/test/`。
- 共通規範與踩坑：查 [[knowledge/conventions|conventions]]、[[knowledge/lessons-learned|lessons-learned]]。

## 找歷史

- 近期工作紀錄：[[journal/log|工作日誌]]
- Family 層過渡與保留原則：[[projects/pa/history|PA 歷史脈絡]]

## 更新觸發條件

- PA family 新增子專案或入口頁。
- PA API 開始有穩定的 operational notes，需要把查找規則細化。
- PA UI 或 PA API 的主要入口、規格結構或共用模式改變。