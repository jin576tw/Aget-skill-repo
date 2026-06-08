# PA UI

## 定位

- PA UI 是保險業務核心的 Policy Acceptance 前端專案。
- 此頁承接 UI 的靜態參考與查找入口；當前 operational 狀態見 [[projects/pa/status|PA 工作狀態]]。

## 技術棧

- Angular 19.2.x
- Angular Material 19.2.x
- Bootstrap 5.3.x
- TypeScript 5.8.x
- RxJS 7.8.x
- jsPDF / jspdf-autotable
- JsBarcode
- ngx-spinner / ngx-toastr

## 主要路徑

- 專案根目錄：`pa/pa-ui`
- 應用程式碼：`pa/pa-ui/src/app`
- 頁面規格：`pa/pa-ui/specs/views/`
- 專案指引：`pa/pa-ui/CLAUDE.md`
- Copilot 指引：`pa/pa-ui/.github/copilot-instructions.md`
- Instructions：`pa/pa-ui/.github/instructions/`

## 重要領域

- PA 頁面：`pa-view01`、`pa-view02`
- 民國曆日期處理：TwCalendar、RocDateAdapter、RocDateTimePipe、UtilsService
- PDF 列印：條碼 PDF、領款明細 PDF、Web Worker、ProgressBox
- 表單與金額：FormGroup、ThousandInputDirective、decimal math utility
- 共用元件：check-input-group、scan-company、start-end-date-picker 等

## 查找重點

- 了解頁面需求：先讀 `specs/views/{view-name}/spec.md`
- 了解實作：再讀 `src/app/views/{view-name}/`
- 了解 API：搜尋對應 service 與 `types/{module}/req|res/`
- 了解共用 UI：搜尋 `src/app/components/`
- 了解列印：讀 `src/app/services/*pdf-worker.ts` 與 progress box 元件

## Constraints

- 本檔為靜態參考，不取代專案內 `CLAUDE.md`、`copilot-instructions.md` 或原始碼。
- 目前 operational 狀態與待辦由 [[projects/pa/status|PA 工作狀態]] 統一承接。