# Core 定位與技術棧

## 專案定位

- Core family 對應目前工作區中的 `core/core-api` 與 `core/core-ui`。
- 此層作為 family-level 導航與 session 啟動摘要；API 與 UI 的靜態參考分別收斂於 [[projects/core/core-api|Core API]] 與 [[projects/core/core-ui|Core UI]]。
- 歷史工作脈絡目前以 [[projects/core/status|Core 工作狀態]] 與 [[journal/log|工作日誌]] 為主。

## 技術棧

- Core API：Maven / Spring Boot，主要程式碼位於 `core/core-api/src/main/java/`，測試位於 `src/test/java/`。
- Core UI：Angular，主要程式碼位於 `core/core-ui/src/app/`。

## 入口摘要

- Family Hub：[[projects/core/core|Core]]
- Family Status：[[projects/core/status|Core 工作狀態]]
- API Leaf Page：[[projects/core/core-api|Core API]]
- UI Leaf Page：[[projects/core/core-ui|Core UI]]
- History：[[projects/core/history|Core 歷史脈絡]]

## Constraints

- family 層只保留導覽摘要，不複製 API / UI leaf page 已有的細節。
- 若 Vault 內容與原始碼不一致，以原始碼與專案文件為準。