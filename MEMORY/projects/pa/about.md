# PA 定位與技術棧

## 專案定位

- PA family 對應目前工作區中的 `pa/pa-api` 與 `pa/pa-ui`。
- 此層作為 family-level 導航與 session 啟動摘要，UI 靜態參考已收斂到 [[projects/pa/pa-ui|PA UI]]。
- 歷史工作脈絡與既有待辦，以 [[projects/pa/status|PA 工作狀態]]、[[projects/pa/history|PA 歷史脈絡]] 與 [[journal/log|工作日誌]] 為主。

## 技術棧

- PA API：Maven / Spring Boot，主要程式碼位於 `pa/pa-api/src/main/` 與 `src/test/`。
- PA UI：Angular，主要程式碼位於 `pa/pa-ui/src/app/`，相關規格位於 `pa/pa-ui/specs/views/`。
- UI 技術棧與重要領域細節收斂於 [[projects/pa/pa-ui|PA UI]]，family 層僅保留導覽摘要。

## 入口摘要

- Family Hub：[[projects/pa/pa|PA]]
- Family Status：[[projects/pa/status|PA 工作狀態]]
- UI Leaf Page：[[projects/pa/pa-ui|PA UI]]
- API Leaf Page：[[projects/pa/pa-api|PA API]]
- History：[[projects/pa/history|PA 歷史脈絡]]

## Constraints

- 活文件已收斂到 family 與 leaf pages；歷史仍保留於 `journal/log.md`。
- 若 Vault 內容與原始碼不一致，以原始碼與專案內指引為準。