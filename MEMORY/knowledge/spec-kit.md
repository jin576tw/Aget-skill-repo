# Spec-Kit 工作流程索引

本檔是 Spec-Kit 的跨專案索引，不複製完整 agent、prompt 或 constitution 內容。若與專案內檔案不一致，以專案內真實來源為準。

## 真實來源

### POS family

- UI Constitution：`pos/pos-ui/.specify/memory/constitution.md`
- UI Agents：`pos/pos-ui/.github/agents/`
- UI Prompts：`pos/pos-ui/.github/prompts/`
- UI Templates：`pos/pos-ui/.specify/templates/`
- UI Specs：`pos/pos-ui/specs/`
- API Specs：`pos/pos-api/specs/`

### PA family

- Agents / prompts / templates 依專案實際 `.github/` 與 `.specify/` 內容為準。
- UI View specs：`pa/pa-ui/specs/views/`

### Core family

- 目前無完整 Spec-Kit infrastructure。
- 若後續出現規格導向工作流，再補對應來源位置與使用規則。

## 標準流程

1. specify：建立功能規格。
2. clarify：釐清需求模糊處。
3. plan：產出技術計畫與設計文件。
4. tasks：拆解可執行任務。
5. analyze：檢查規格、計畫與任務一致性。
6. checklist：建立驗收清單。
7. implement：依任務實作。

## 常用原則

- 規格先行，避免直接從程式碼猜需求。
- 每個 User Story 應可獨立測試。
- 任務需標示相依關係與可平行項目。
- 需求、計畫與任務之間不得互相矛盾。
- 產出前需檢查敏感資訊。

## 更新觸發條件

更新本檔的情況：

- Spec-Kit agent、prompt、template 或 constitution 的位置改變。
- 新增或移除主要 slash command。
- 標準流程改變。
- 發現跨專案共用的 Spec-Kit 使用規則。

不要在本檔複製完整 agent 或 prompt 內容；請連回專案內真實來源。
