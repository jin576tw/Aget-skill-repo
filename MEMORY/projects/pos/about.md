# POS 定位與技術棧

## 專案定位

- POS family 對應目前工作區中的 `pos/pos-api` 與 `pos/pos-ui`。
- 此層作為 family-level 導航與 session 啟動摘要，UI 靜態參考已收斂到 [[projects/pos/pos-ui|POS UI]]。
- 歷史工作脈絡、票號進度與 release 狀態，以 [[projects/pos/status|POS 工作狀態]]、[[projects/pos/history|POS 歷史脈絡]] 與 [[journal/log|工作日誌]] 為主。

## 技術棧

- POS API：Maven / Spring Boot，主要程式碼位於 `pos/pos-api/src/main/`，規格與專案文件位於 `pos/pos-api/specs/`、`README.md`、`pom.xml`。
- POS UI：Angular，主要程式碼位於 `pos/pos-ui/src/app/`，相關規格位於 `pos/pos-ui/specs/`。
- UI 技術棧與重要領域細節收斂於 [[projects/pos/pos-ui|POS UI]]，family 層僅保留導覽摘要。

## 入口摘要

- Family Hub：[[projects/pos/pos|POS]]
- Family Status：[[projects/pos/status|POS 工作狀態]]
- UI Leaf Page：[[projects/pos/pos-ui|POS UI]]
- API Leaf Page：[[projects/pos/pos-api|POS API]]
- History：[[projects/pos/history|POS 歷史脈絡]]

## Constraints

- 活文件已收斂到 family 與 leaf pages；歷史仍保留於 `journal/log.md`。
- 若 Vault 內容與原始碼不一致，以原始碼與專案內指引為準。