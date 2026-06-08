# Memory — 跨專案知識庫

> 此檔是 AI 開始工作時的**唯一入口**。讀完本檔即可判斷下一步該讀哪個檔案。

---

## 快速指南（AI 必讀）

1. **判斷專案族群**：根據使用者的工作區或指令判斷目前專案族群（Core / PA / POS / ESP）；若已知子專案，如 PA-UI、POS-API，先回推到對應族群。
2. **讀取專案 Hub**：`projects/{family}/{family}.md` — 專案資料夾採 Folder Notes 模式，Hub 檔列出各子專案與附屬頁。
3. **先取背景知識，再取工作狀態**：先讀 `knowledge/knowledge.md` 並依任務類型補讀對應知識檔，再讀 `projects/{family}/status.md`；若已鎖定子專案，再讀對應 leaf page 或既有 operational notes。
4. **開始工作**：以專案內 `CLAUDE.md`、`.github/copilot-instructions.md` 與原始碼為準，但不要用 session 或 status 取代應沉澱在 `knowledge/` 的背景理解。
5. **需要跨專案知識時**：優先從 `knowledge/` 取用；若本次理解成本高且未來可能重複出現，應在 session 結束時蒸餾回 `knowledge/`。

> **目標：AI 讀本檔 + knowledge Hub + family Hub + `status.md` 即可開始**。按需再讀對應 leaf page、`about.md`（靜態參考）或 `lookup.md`（查找規則）。

---

## ⚠️ 常見陷阱（每次 Session 必讀）

> 從 `knowledge/lessons-learned.md` 蒸餾的最高頻教訓。完整列表見該檔。

1. **BSD 測報禁用技術術語**：閱讀對象是非技術業務 User，用畫面元素名稱（按鈕文字、標籤），不用變數名、API 路徑、CSS class。
2. **Playwright canActivate 時序**：`addInitScript` 注入 sessionStorage 可能晚於 guard 執行，導致重導。需 mock guard 或攔截 API。
3. **正體中文用字**：「自訂」非「自定」；`Session` 非 `Sesstion`。
4. **Agent 檔名 = 呼叫名稱**：`memory-helper.md` 無法被 `@memory` 呼叫，檔名須與 name 一致。
5. **JSON 設定檔陷阱**：(a) 禁止 trailing comma；(b) `.kiro/agents/*.json` 必須存為 UTF-8 without BOM — kiro-cli (serde_json) 不容忍 BOM，PowerShell 驗證不會報錯但 runtime 會失敗。
6. **`/start-work` 軟語言導致 AI 繞過 subagent**：skill 若用軟語氣（「引導」、「建議」），AI 遇到小任務會 inline 實作跳過所有 subagent。必須用 HARD RULES + `@` 前綴強制，且 STOP gate 只設在「計畫確認後」與「DoD 前」兩點，中間自動執行不中斷。

---

## 知識庫結構

| 路徑 | 用途 | 何時讀 | 何時寫 |
| --- | --- | --- | --- |
| `memory.md` | 入口與索引 | Session 開始 | 結構變更時 |
| `knowledge/knowledge.md` | 知識分類 Hub | Session 開始、需要背景理解時 | 知識分類調整時 |
| `projects/{family}/{family}.md` | 專案族群入口 Hub | Session 開始（判斷族群後） | 結構變更時 |
| `projects/{family}/status.md` | 專案族群工作狀態 | Session 開始 | Session 結束（更新狀態） |
| `projects/{family}/{leaf}.md` | 子專案入口頁 | 已鎖定子專案時 | 結構變更時 |
| `projects/{family}/about.md` / `lookup.md` | 族群層靜態參考與查找規則 | 需要跨子專案參考時 | 技術棧或模式變更時 |
| `journal/log.md` | 時間序工作紀錄 | 需要查歷史時 | Session 結束（新增條目） |
| `knowledge/conventions.md` | 跨專案開發慣例 | 需要查規則時 | 蒸餾出新慣例時 |
| `knowledge/lessons-learned.md` | 情境教訓與踩坑經驗 | 遇到類似問題時 | Session 結束（蒸餾） |
| `knowledge/domain-glossary.md` | 跨專案高頻名詞與縮寫 | 遇到術語或縮寫時 | 名詞定義改變或新增時 |
| `knowledge/domain-map.md` | 跨專案業務領域與模組心智模型 | 需要快速理解 family/domain 背景時 | 背景知識有穩定新增時 |
| `knowledge/workflow-map.md` | 高頻業務流程與工作流概觀 | 需要理解流程順序或責任邊界時 | 流程穩定變更時 |
| `knowledge/lookup-map.md` | 常見問題的查找入口與定位策略 | 需要快速找到規格、模組或實作時 | 查找規則變更時 |
| `knowledge/ai-tooling.md` | Skills & Agents 索引 | 需要查工具時 | 工具變更時 |
| `knowledge/spec-kit.md` | Spec-Kit 工作流索引 | 執行 spec-kit 時 | 流程變更時 |
| `knowledge/harness-protocol.md` | ESP 多代理 Harness 協議 | 執行 ESP `start-analysis` 時 | 協議變更時 |
| `projects/esp/harness/` | ESP Harness Run 短期狀態 | 啟動/續跑 ESP 分析時 | 每次 run 自動寫入 |
| `decisions/` | 架構決策紀錄 (ADR) | 需要查歷史決策時 | 有重大取捨時 |

---

## Session 協議摘要

### 開始時

1. 讀取本檔（`memory.md`）— 包含「常見陷阱」。
2. 讀取 `knowledge/knowledge.md`，並依任務類型補讀對應知識檔（如 `conventions.md`、`domain-glossary.md`、`spec-kit.md`）。
3. 判斷專案族群 → 讀取 `projects/{family}/{family}.md`。
4. 讀取 `projects/{family}/status.md` → 掌握 Current Focus / Next Actions / Blocked，但不要把 status 當成主要背景知識來源。
5. 若已知子專案，再讀對應 leaf page 或既有 operational notes。

### 結束時（觸發詞：結束 / 收工 / close session / end session / /clear / /save）

1. 更新 `journal/log.md` 與 `projects/{family}/status.md`。
2. 視需要蒸餾到 `knowledge/lessons-learned.md` 或 `knowledge/conventions.md`。
3. 若有高頻跨專案教訓，再同步本檔「常見陷阱」區段。
4. 完成後顯示 `Memory has updated!`。

> 完整協議細節見 `knowledge/conventions.md` 的「Session 結束協議」區段。

---

## 專案路徑映射

| 專案族群 | 工作區路徑 | 主要指引 | 規格位置 |
| --- | --- | --- | --- |
| Core | `core/core-api`, `core/core-ui` | `core/core-api/README.md`, `core/core-ui/README.md` | 依各子專案 README 與原始碼 |
| PA | `pa/pa-api`, `pa/pa-ui` | `pa/pa-ui/CLAUDE.md`, `pa/pa-api/pom.xml` | `pa/pa-ui/specs/views/` |
| POS | `pos/pos-api`, `pos/pos-ui` | `pos/pos-ui/CLAUDE.md`, `pos/pos-api/AGENTS.md` | `pos/pos-ui/specs/`, `pos/pos-api/specs/` |
| ESP | `C:\Users\003689\Desktop\ESP` | `.kiro/steering/` | `.kiro/docs/` |
| ADP | `adp-policy`（後端）, `adp-gi-ui`（前端） | — | `K:\06.專案\06.25.團旅險系統更新專案\E40系統設計(FunctionTableModule)\S055BSD確認\B01001 團險BSD\` |

---

## 寫入規則摘要

- **禁止寫入**：帳密、Token、內部 IP、正式環境 URL、個資、DB 連線字串。
- **日誌格式**：`[YYYY-MM-DDThh:mm:ss.SSS+08:00][專案名] 描述`，按日期倒序。
- **保留期**：日誌條目保留 90 天，過期需蒸餾後刪除。
- **蒸餾規則**：情境教訓 → `lessons-learned.md`；通用技術慣例 → `conventions.md`。
- **權威來源**：Vault 與專案原始碼不一致時，以原始碼為準。

---

## 導航索引

- [[projects/projects|Projects]] — Core · PA · POS · ESP
- [[knowledge/knowledge|Knowledge]] — 開發慣例 · 教訓庫 · 名詞表 · Spec-Kit · AI 工具
- [[journal/journal|Journal]] — 工作日誌
- [[decisions/decisions|Decisions]] — 架構決策
