# Decisions

- [[decisions/_template|ADR 範本]]

## Accepted Decisions

### 2026-05-18 — ADR-001 Memory Vault Folder Notes IA

**Status**

Accepted

**Context**

`P:\MEMORY` 已從 `index.md` / `overview.md` 過渡到 Folder Notes 模式，但活文件曾殘留舊命名說明，導致入口契約與實際結構不一致。當時同時存在三種語意：

- `memory.md` 與部分治理文件仍提到 `projects/{project}/index.md`
- 歷史日誌保留 `overview.md` 與舊 index 重構紀錄
- 實際可用入口已轉為 family Hub 與 leaf page

若不先固定 IA 契約，後續補齊 Core / API 專案、重組 PA / POS family，會持續擴散命名漂移。

**Decision**

採用以下 Memory Vault IA 規則：

1. 保留 `memory.md` 為唯一首頁，不改名為 `index.md`。
2. Vault 採 Folder Notes 模式，所有需導航的資料夾以同名 Hub 檔作為入口。
3. `index.md` 與 `overview.md` 視為舊制命名，不再用於活文件入口。
4. `projects/{family}/{family}.md` 作為 project family Hub；leaf page 採 `projects/{family}/{leaf}.md`。
5. 結構、命名與跨專案治理規則的重大變更，必須同步寫入 `decisions/`。

**Consequences**

Positive

- 入口命名與實際結構一致，降低 AI 與人類維護時讀錯入口的機率。
- Obsidian Graph 可持續沿用 Folder Notes 呈現，不需再次回退命名模型。
- 後續擴充 project family、API/UI 子系統時，有明確的結構基準可依循。

Negative

- 遷移期間需同步修正多個活文件中的舊路徑描述。
- 歷史日誌仍會保留舊名稱，搜尋時需區分「歷史紀錄」與「現行規則」。

**Alternatives Considered**

- 方案 A：回退到 `index.md` 作為所有資料夾入口。不採用，因為現有 Hub 與 Graph 已轉為 Folder Notes，回退成本高且收益有限。
- 方案 B：將 `memory.md` 改名為 `index.md`。不採用，因為既有 Session 協議與使用習慣已綁定 `memory.md`，改名只會增加遷移面。

**References**

- `P:\MEMORY\memory.md`
- `P:\MEMORY\knowledge\conventions.md`
- `P:\MEMORY\journal\log.md` 2026-05-18 條目

**Sensitive Information Check**

- [x] 未包含憑證、Token、密碼。
- [x] 未包含內部 IP、正式主機名稱或正式環境 URL。
- [x] 未包含個資或正式資料。
