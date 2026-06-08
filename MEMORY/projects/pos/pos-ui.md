# POS UI

## 定位

- POS UI 是保險業務中台前端專案。
- 此頁承接 UI 的靜態參考與查找入口；當前 ticket 與 release 狀態見 [[projects/pos/status|POS 工作狀態]]。

## 技術棧

- Angular 19.2.x
- Angular Material / CDK 18.2.x
- Bootstrap 5.3.x
- TypeScript 5.8.x
- RxJS 7.8.x
- ExcelJS
- jsPDF
- Playwright E2E
- ngx-spinner / ngx-toastr

## 主要路徑

- 專案根目錄：`pos/pos-ui`
- 應用程式碼：`pos/pos-ui/src/app`
- Feature specs：`pos/pos-ui/specs/feature/`
- View specs：`pos/pos-ui/specs/views/`
- 專案指引：`pos/pos-ui/CLAUDE.md`
- Copilot 指引：`pos/pos-ui/.github/copilot-instructions.md`
- Instructions：`pos/pos-ui/.github/instructions/`
- Spec-Kit constitution：`pos/pos-ui/.specify/memory/constitution.md`

## 重要領域

- assignee views
- keyinsert views
- pscApply views
- BaseSearchComponent / BaseSearchSelectComponent 查詢頁模式
- BaseFormTabComponent / BasePscApplyComponent 表單與頁籤模式
- Directives、Pipes、Validators、PageChangesGuard
- Excel / PDF 匯出與 Playwright E2E

## 查找重點

- 了解新需求：先讀 `specs/feature/{feature-name}/`
- 了解頁面需求：先讀 `specs/views/{view-name}/spec.md`
- 了解頁面實作：再讀 `src/app/views/{view-name}/`
- 了解共用查詢模式：讀 base-search instructions 與相關 base class
- 了解 API：搜尋對應 service 與 `types/{module}/req|res/`
- 了解 E2E：讀 `e2e/` 與 `playwright.config.ts`

## Constraints

- 本檔為靜態參考，不取代專案內 `CLAUDE.md`、`copilot-instructions.md` 或原始碼。
- 票號、release 與 blocker 由 [[projects/pos/status|POS 工作狀態]] 統一承接。