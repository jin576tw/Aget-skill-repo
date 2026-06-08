# Domain Map

> 目的：讓新 session 或新 agent 能先建立跨專案背景，不必每次從 `status.md`、舊對話或原始碼重新拼湊。

## Core Families

- **Core**：理賠相關 family，工作區位於 `core/`。
- **PA**：保費收費與受理 family，工作區位於 `pa/`。
- **POS**：保全與建檔/分派 family，工作區位於 `pos/`。
- **ESP**：外部服務平台與多代理 Harness family。

## Workspace Breakdown

- **Core UI / API**：`core/core-ui`、`core/core-api`，以 README 與原始碼為主。
- **PA UI / API**：`pa/pa-ui`、`pa/pa-api`；PA UI 偏收費受理、憑證、條碼/PDF 流程。
- **POS UI / API**：`pos/pos-ui`、`pos/pos-api`；POS UI 偏保全、建檔、分派、查詢頁與任務重分派流程。
- **ESP**：以 Harness、多代理工作流、外部平台腳本與文件協定為主。

## Family-Level Mental Model

- **UI project**：承接頁面規格、互動流程、共用元件、base classes、前端 service 與 types。
- **API project**：承接後端契約、資料轉換、業務邏輯與 API 實作。
- **Spec / Docs**：承接需求、頁面規格、測報或流程文件；當 agent 需要先理解功能而不是直接改碼時，應優先讀這層。

## Family Roles

- **Family Hub (`projects/{family}/{family}.md`)**：提供該 family 的入口、子專案與附屬頁面索引。
- **Family Status (`projects/{family}/status.md`)**：保存目前進度、Next Actions、Blocked、Decisions；不是主要背景知識載體。
- **Leaf Page (`projects/{family}/{leaf}.md`)**：保存子專案的靜態參考、技術棧與查找重點。

## Knowledge-First Model

- 背景理解優先來自 `knowledge/`，不是 `status.md`。
- `status.md` 只回答「現在做到哪裡」，不回答完整的「這個領域是什麼」。
- 若一段理解在不同 session 或不同 agent 之間會重複出現，就應升級到 `knowledge/`。

## What Belongs Here

- 跨 project family 會反覆使用的業務定位。
- family 與 leaf 之間的責任邊界。
- 高頻模組分類與常見關聯。
- workspace 的第一層查找心智模型，例如「UI 問題先看 view spec / base class / service，API 問題先看 spec / controller/service/type」。

## What Does Not Belong Here

- 單一 ticket 的工作進度。
- 單次 session 的暫時 handoff。
- 尚未驗證、只出現一次的推測性知識。