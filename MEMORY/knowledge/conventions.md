# 共用開發慣例

本檔保存跨專案共用規則。專案專屬規則仍以各專案內的 `CLAUDE.md`、`.github/copilot-instructions.md` 與實際原始碼為準。

## AI 協作原則

- 回答使用者使用的語言；目前預設使用繁體中文。
- 優先完成使用者要求的最小範圍，不主動擴大重構。
- 不確定需求時先詢問；能從專案內容推斷時先查證再執行。
- 優先使用內建檔案、搜尋、編輯工具，不用腳本取代可直接完成的檔案操作。
- 修改後需驗證相關錯誤、建置或測試狀態；若無法驗證，需明確說明。

## Core-UI 頁面樣式規範

新增 Core-UI 頁面時，外觀樣式**必須對齊既有頁面**，不得自行創造新風格。

**標準參考頁面**：`MedicalReplyView02`（最完整）、`DocView07`

| 元素 | 規格 |
|------|------|
| 表頭背景 | `th[scope="col"] { background-color: #9bc2e6; color: black; }` |
| 表格列對齊 | `tr { text-align: center; white-space: nowrap; }` |
| 固定表頭 | `thead { position: sticky; top: 0; z-index: 3; }` |
| 操作欄 | `.action { position: sticky; right: 0; width: 1%; white-space: nowrap; }` |
| 表格捲動容器 | `.table-scroll-container > .table-responsive-md { max-height: 615px; overflow-y: auto; }` |
| 查詢/重置按鈕 | `btn btn-outline-primary/danger rounded-pill btn-min-width` |
| 功能按鈕 | `btn btn-outline-primary rounded-pill btn-min-width` |
| 建立者/修改者 | 使用 `prefixName` pipe：`{{ nm \| prefixName: id }}` → `id-姓名` |
| 備註/長文字欄 | 加 `remark-cell` class：`white-space: normal; word-break: break-all; min-width: 150px;` |
| Dialog 按鈕 | 存檔：`btn-outline-primary rounded-pill`；取消：`btn-outline-danger rounded-pill` |

> 若未套用以上規格導致樣式不一致，屬於 Medium 問題需修正。

## Angular 專案通用規則

- 優先使用 Standalone Components。
- 遵守 TypeScript strict 模式，不新增不必要的 `any`。
- 表單預設值需依控制項語意設定：文字與下拉多為空字串，日期可用 `null`，核取方塊使用布林值。
- 服務層與型別需維持清楚邊界，避免在 Component 內散落 API 契約。
- 變更共用元件、Base Class、Directive、Pipe 或 Validator 時，需檢查所有使用端。

## 規格與驗收

- 規格以可驗證為原則。
- 行為規格優先使用 EARS 或 Given-When-Then 表達。
- 任務拆解需能獨立驗收，避免「完成全部」才知道是否正確。
- Code review 回報需標示嚴重度：high / medium / low。

## 敏感資訊保護

禁止寫入：

- 真實帳號、密碼、Token、憑證。
- 內部 IP、正式主機名稱、正式環境 URL。
- 個資或可識別個人的完整資料。
- 正式資料庫連線字串、UNC 路徑、環境變數值。

建議替換：

- 內部 IP：`<INTERNAL_IP>`
- 主機：`<SERVER_HOST>`
- 憑證：`[已遮蔽]`
- 人名：`王○○`

## Session 結束協議

當使用者表示結束工作（如「結束」、「收工」、「close session」、「end session」或 `/clear`、`/save`、exit）時，執行以下步驟：

1. **辨識專案族群**：判斷本次 session 主要操作的 project family（Core、PA、POS、ESP 或其他）；若實際工作落在 leaf project，也需一併標記。
2. **產出 release diff（若本次有合併分支至 release，必須執行）**：上線單 **MUST** 附版本差異 diff 檔，缺少視為上線單不完整。執行 git diff 指令，覆蓋產出版本差異 txt（路徑格式與指令詳見 `knowledge/workflow-map.md` SDCRELEASE 章節），並在後續日誌中記錄「已產出 前端v{x}_diff.txt」。
3. **更新工作日誌**：開啟 `P:\MEMORY\journal\log.md`，在對應日期區段新增完成事項：
   - 時間戳格式：`[YYYY-MM-DDThh:mm:ss.SSS+08:00][專案名] 描述`
   - 若有多專案操作，每條標記對應專案名（可多標籤如 `[POS-UI][PA-UI]`）
   - 最新條目在上
4. **更新專案狀態**：開啟 `P:\MEMORY\projects/{family}/status.md`：
   - `Related Lessons`：新增或移除與當前工作相關的教訓條目（從 `lessons-learned.md` 挑選）
   - `Current Focus`：目前主要焦點與未完成事項
   - `Next Actions`：下次 session 應優先處理的可執行任務
   - `Blocked`：卡住的問題或等待外部回應的事項
   - `Decisions / Constraints`：已確認的做法、限制或不要重複踩的坑
   - 同步更新 `P:\MEMORY\journal\todo-list.md` 中本次 session 主要專案區塊，維持「專案 + 單號 + 簡短狀態」摘要；若該專案有 release 規劃，再一併更新 release 表格
5. **知識蒸餾**：審視本次 session 完成事項，優先判斷是否有能降低未來理解成本的可重用知識：
   - 情境性教訓、踩坑經驗 → 寫入 `P:\MEMORY\knowledge\lessons-learned.md`（按主題歸類）
   - 跨專案通用技術慣例 → 升級到 `P:\MEMORY\knowledge\conventions.md`
   - 跨 session 會重複使用的背景理解、流程語意、查找入口 → 更新 `P:\MEMORY\knowledge\domain-map.md`、`workflow-map.md`、`lookup-map.md`
   - 不是所有事項都需蒸餾；只蒸餾有跨 session 複用價值的知識
6. **同步常見陷阱**：若本次蒸餾的教訓屬高頻且跨專案，更新 `P:\MEMORY\memory.md`「常見陷阱」區段（上限 5 條，替換最不相關的）。
7. **三個月清理**：檢查 `journal/log.md` 是否有超過三個月（90 天）的條目：
   - 若有，逐條判斷是否需蒸餾
   - 需蒸餾的先寫入 `knowledge/` 再刪除條目
   - 不需蒸餾的直接刪除條目
8. **清理 session memory**：若有 `/memories/session/` 中的暫存計畫或筆記，將可延續的內容搬到對應檔案，不再需要的標記為可清除。
9. **簡要回報**：向使用者摘要本次 session 的成果與下次待辦。
10. **完成提示**：完成上述處理後，顯示精確字串 `Memory has updated!`。

> 不強制每次都執行所有步驟；若 session 只做了瑣碎查詢，可跳過。

## Vault 維護規則

- 新增跨專案慣例時，更新本檔。
- `knowledge/` 只收錄跨專案、可重用、已驗證且相對穩定的知識；單一專案內容優先放在 `projects/`，單次工作進度優先放在 `journal/`，有明確取捨理由的方案放在 `decisions/`。
- `knowledge/` 的目標不只保存規則，還要承接未來 agent 不該重新理解一次的背景知識；若某段背景在不同 session 重複被重建，表示它應升級到 `knowledge/`。
- 專案特定規則放在 `projects/{family}/` 對應子檔、leaf page 或專案內指引，不放在本檔。
- 若規則只適用單一任務，優先放在工作日誌，不要升級成全域慣例。
- `memory.md` 只作為入口與索引，避免放入長篇規則或任務細節。
- 大型清單應保持為「查找規則 + 代表性入口」，避免手動複製所有項目。
- 後續補充 `components`、`services`、`types`、`specs` 索引時，需同時參考專案中的規格文件與實際原始碼。
- 若 Vault 內容與專案原始碼不一致，以原始碼與專案內指引為準。

### 命名與 Hub 規則

- Vault 採 **Folder Notes** 模式：每個需導航的資料夾，以同名 Hub 檔作為入口，例如 `projects/pa/pa.md`、`journal/journal.md`。
- `index.md`、`overview.md` 屬舊制命名；除非保留歷史紀錄，否則不得再作為活文件入口。
- Top-level Hub 只列下一層群組或代表性入口；不得在 Hub 內複製長篇規則或完整清單。
- `projects/{family}/{family}.md` 是 project family 入口；leaf page 採 `projects/{family}/{leaf}.md`，`status.md`、`about.md`、`lookup.md` 為附屬頁，命名需一致。
- 調整檔名或搬移 Hub 後，需同步更新 `memory.md`、對應 Hub、相關 `status.md` 與 `knowledge/` 中引用該路徑的索引檔。
- 若專案內 `CLAUDE.md`、`.github/copilot-instructions.md` 或 slash command prompt 有引用 `P:\MEMORY` 路徑，Vault 結構調整後也必須同步更新這些 workspace 指引，避免 `@memory` / `/save` 仍指向舊的 leaf-level `status.md`。
- Project family 遷移採 **非刪除式整併**：先新增 family-level 導航與摘要，再用回指連回 legacy pages 與 `journal/log.md`；未完成蒸餾前，不得刪除既有 operational notes 或歷史頁面。

### 決策紀錄規則

- 結構、命名、流程或跨專案取捨，優先記錄於 `decisions/`，不要只留在 `journal/log.md` 或對話紀錄。
- ADR 建議放在 `decisions/YYYY-MM/ADR-XXX-{kebab-title}.md`，`decisions/decisions.md` 維護入口索引。
- 若新規則改變了 Vault 的使用方式，需同時更新對應 ADR、`memory.md` 摘要與本檔相關段落。

### 日誌保留政策

- `journal/log.md` 中**超過三個月（90 天）**的條目，需確認已蒸餾後刪除。
- 蒸餾檢查規則：每條紀錄至少判斷是否有可重用知識。
  - 有跨 session 複用價值 → 先寫入 `knowledge/lessons-learned.md` 或升級 `conventions.md`，再刪除條目。
  - 無延續價值（如純狀態更新、已完成的合併記錄）→ 直接刪除。
- 此清理在 Session 結束協議步驟 5 執行，或可由使用者手動觸發。

### 知識蒸餾規則

- **通用情境教訓**（踩坑、文字校對、工具設定）→ `knowledge/lessons-learned.md`，按主題分類。
- **跨專案技術慣例**（驗證為持久有效的規則）→ 升級到 `knowledge/conventions.md`。
- 每條蒸餾知識需附：`[來源日期]` + 知識描述 + `（來源：事件概述）`。
- 蒸餾不是複製日誌條目；需提煉為可供未來 session 查詢的知識形式。

## Skills / Agents 維護原則

- 個人建立的 Skills 與 Agents 適合收錄在 `knowledge/`，但應以「索引與使用規則」方式整理，不複製完整 prompt、SKILL.md 或 instructions 全文。
- 每個 Skill 或 Agent 至少記錄：名稱、類型、用途、適用情境、不適用情境、來源位置、最後驗證日期。
- 若某個 Skill 或 Agent 只對單一 project family 或 leaf project 有意義，優先記錄在對應 `projects/{family}/` 子檔、leaf page 或專案內指引。
- 調整 Skill 或 Agent 定義後，若影響使用時機或限制，需同步更新對應索引。
- 若索引內容與實際 Skill / Agent 定義不一致，以實際定義檔為準。

## BSD 測報撰寫規範

BSD 測報的閱讀對象是**非技術的業務 USER**，撰寫時須遵守：

- **以畫面行為為出發點**：描述使用者在畫面上看到什麼、能做什麼，不描述技術細節。
- **禁止使用技術術語**：不得出現變數名稱（如 `isEditAble`）、API 路徑、CSS class（如 `link-disabled`）、元件 selector 等。
- **使用畫面元素名稱**：以使用者可見的標籤、按鈕文字、區塊名稱描述，例如「開始日期連結」、「連結呈現灰色無法點擊」。
- **情境說明精簡**：每條規則用 1-2 句白話描述，再搭配截圖補充視覺佐證，避免長篇條列式規格。
- **截圖為必要元素**：每個驗收情境須附對應畫面截圖；若 Playwright 截圖取不到，應標記為「待補截圖」並另行處理。

> 來源：BMPPOS-22 BSD 測報任務（2026-05-14），文件說明過度技術化導致修正。

## Journal 格式規範

- 工作日誌為統一檔案 `journal/log.md`，按**日期倒序**排列。
- 每條格式：`[ISO-8601-timestamp][專案名] 描述`
-  - 時間戳：`YYYY-MM-DDThh:mm:ss.SSS+08:00`
-  - 專案名：優先標示 family 或實際 leaf project，如 `POS`、`PA-UI`、`POS-API`、`ESP`；多專案可並列如 `[POS][PA]` 或 `[POS-UI][PA-API]`
- 日期以 `## YYYY-MM-DD` 作為 section header。
- 專案工作狀態（Current Focus / Next Actions / Blocked / Decisions）存放在 `projects/{family}/status.md`。
- `journal/todo-list.md` 為跨專案待辦與工作進度總覽，只保留易讀摘要；細節仍以 `journal/log.md` 與 `projects/{family}/status.md` 為準。
