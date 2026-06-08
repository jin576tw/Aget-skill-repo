# Core 查找規則

## Session 啟動

1. 先讀 [[projects/core/status|Core 工作狀態]]，掌握 family-level 焦點。
2. 若任務落在 API，接著讀 [[projects/core/core-api|Core API]]，再回到 `core/core-api` 原始碼與設定。
3. 若任務落在 UI，接著讀 [[projects/core/core-ui|Core UI]]，再回到 `core/core-ui` 原始碼與 Angular 設定。
4. 若需要共用規範，回到 [[knowledge/knowledge|Knowledge]]。

## 找功能

- API 服務與設定：查 `core/core-api/src/main/java/`、`src/main/resources/`、`pom.xml`
- API 測試：查 `core/core-api/src/test/java/`
- UI 元件與畫面：查 `core/core-ui/src/app/`
- UI 依賴與工作區設定：查 `core/core-ui/package.json`、`angular.json`、`tsconfig*.json`

## 找歷史

- 近期工作紀錄：[[journal/log|工作日誌]]
- Family 層定位與保留原則：[[projects/core/history|Core 歷史脈絡]]

## 更新觸發條件

- Core family 新增子專案或入口頁。
- Core API / UI 的主要入口、建置結構或設定位置改變。
- Core 專案開始需要長期 operational notes，需進一步細化 leaf pages。