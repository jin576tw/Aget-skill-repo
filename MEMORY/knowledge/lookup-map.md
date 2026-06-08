# Lookup Map

> 目的：降低「知道要找什麼，但不知道去哪裡找」的成本。

## First-Hop Lookup Order

1. **背景問題**：先讀 `knowledge/` 相關檔案。
2. **family 結構問題**：讀 `projects/{family}/{family}.md`、`about.md`、`lookup.md`。
3. **當前進度問題**：讀 `projects/{family}/status.md`。
4. **leaf project 靜態參考**：讀 `projects/{family}/{leaf}.md`。
5. **功能規格**：讀專案內 `specs/feature/` 或 `specs/views/`。
6. **實作與依賴**：再進原始碼、service、types、base classes。

## Common Questions

- **這個 family 在做什麼？** → `knowledge/domain-map.md` + `projects/{family}/{family}.md`
- **這個流程怎麼跑？** → `knowledge/workflow-map.md` + family `lookup.md` / view spec
- **哪裡有已知規則或限制？** → `knowledge/conventions.md` + `knowledge/lessons-learned.md`
- **這個名詞是什麼意思？** → `knowledge/domain-glossary.md`
- **Spec-Kit 或 agent workflow 怎麼走？** → `knowledge/spec-kit.md`、`knowledge/ai-tooling.md`

## SDC01 Quick Lookup

- **POS UI 功能理解**：先看 `pos/pos-ui/specs/views/` 或 `specs/feature/`，再看 `pos/pos-ui/src/app/views/`、base search instructions、相關 service / types。
- **POS API 功能理解**：先看 `pos/pos-api/specs/`，再看 `src/main/` 的 controller/service/model 路徑。
- **PA UI 功能理解**：先看 `pa/pa-ui/specs/views/`，再看 `src/app/views/`、共用元件、PDF worker、service / types。
- **跨專案 memory / workflow 問題**：先看 `P:\MEMORY\memory.md`、`knowledge/knowledge.md`、`knowledge/conventions.md`。
- **Spec-Kit 流程問題**：先看 `knowledge/spec-kit.md` 與專案內 `.specify/`、`.github/prompts/`、`.github/agents/`。

## Escalation Rule

- 若某個查找路徑在多次工作中反覆出現，應更新本檔。
- 若某個定位方式只適用單一 family，優先寫到 `projects/{family}/lookup.md`，再視需要回鏈到本檔。