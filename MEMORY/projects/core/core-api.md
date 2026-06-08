# Core API

## 定位

- Core API 是 Core family 的後端服務專案。
- 此頁承接 API 的靜態參考與查找入口；當前 family-level 狀態見 [[projects/core/status|Core 工作狀態]]。

## 技術棧

- Maven
- Spring Boot

## 主要路徑

- 專案根目錄：`core/core-api`
- 專案文件：`README.md`
- 建置設定：`pom.xml`
- 主程式碼：`src/main/java/`
- 測試：`src/test/java/`
- 資源與設定：`src/main/resources/`

## 查找重點

- 了解服務入口：先讀 `pom.xml` 與 `src/main/java/`
- 了解環境設定：讀 `src/main/resources/` 與 `target/classes/application*.yml`
- 了解測試覆蓋：讀 `src/test/java/`

## Constraints

- 本檔為靜態參考，不取代原始碼、README 或實際建置結果。
- 若發現 Vault 與程式碼不一致，以程式碼與專案文件為準。