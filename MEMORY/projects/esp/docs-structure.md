# ESP Docs Structure

> 目的：固定說明 `.kiro/docs/` 的路徑規則、文件集合、入口型態差異與閱讀順序，避免每次分析、review 或補件都重新推導產出位置。

## 何時先讀

- 需要從 entry point 反推文件應該落在哪個資料夾。
- 需要判斷某份文件缺失是正常 skip 還是真的漏產出。
- 需要 review `.kiro/docs/` 是否符合命名與層級規則。

## 根路徑規則

- AI 產出文件固定放在 `.kiro/docs/`。
- 標準路徑：`.kiro/docs/[MODULE]/[FEATURE]/[PAGE]/[FUNCTION_NAME]/[TYPE].md`
- 跨功能總覽：`.kiro/docs/_global/[FEATURE]-[PAGE]-overview/[TYPE].md`
- 若 orchestrator 判定需要 fallback，只是 run artifact 轉存到 `.kiro/.harness/`，不是把正式 docs 改存到別處。

## 路徑語意模板

- `MODULE`：來源 Maven 模組，例如 `esp-system-ui`、`esp-remoting-server-web-service`。
- `FEATURE`：功能分類、業務區塊或子路徑，例如 `premium`。
- `PAGE`：分析進入點，例如 XHTML 名稱、Class 名稱、Job 名稱。
- `FUNCTION_NAME`：實際分析功能，例如 `reissuebyESP`。
- `TYPE`：固定大寫檔名，用來表示文件類型。

## 標準文件集合

- `DEPENDENCIES.md`
- `VARIABLE-LIST.md`
- `ERD.md`
- `FUNCTION-LIST.md`
- `FLOWCHART.md`
- `BUSINESS-RULES.md`
- `UI-VERIFY.md`（可選）
- `SD.md`
- `API-CONTRACT.md`（僅 WS/API）
- `SA.md`

## 入口型態對照

- **XHTML/UI 分析**：通常落在 `esp-system-ui/<feature>/<page>/<function>/`，常見完整文件集合含 `UI-VERIFY.md`。
- **WS 分析**：通常落在 `esp-remoting-server-web-service/<class>/<page-or-class>/<function>/`，常見完整文件集合含 `API-CONTRACT.md`。
- **REST 分析**：通常落在 `esp-remoting-server-restful/...`，是否需要 `API-CONTRACT.md` 依入口而定。
- **Batch 分析**：通常落在 `esp-batch/<feature>/<job>/<function>/`，通常不會有 `UI-VERIFY.md`。

## 閱讀順序模板

1. 先看 `DEPENDENCIES.md`，確認分析範圍與入口。
2. 再看 `FUNCTION-LIST.md`、`VARIABLE-LIST.md`、`ERD.md`，建立資料與方法輪廓。
3. 再看 `FLOWCHART.md`，理解流程。
4. 再看 `BUSINESS-RULES.md`，理解條件與判斷。
5. 再看 `SD.md`，理解設計層收斂。
6. 最後依入口型態補看 `UI-VERIFY.md`、`API-CONTRACT.md`、`SA.md`。

## 不變條件

- 缺少 `UI-VERIFY.md` 不一定是問題，先確認是不是非 UI 入口。
- 缺少 `API-CONTRACT.md` 不一定是問題，先確認是不是非 WS/API 模組。
- `_global/` 是跨功能總覽，不用拿來取代單一 entry point 的正式文件路徑。
- 若 docs 路徑與 entry point 不一致，先檢查 orchestrator 的 `doc_root` 判定，再決定是否人工修正。

## 常見判斷規則

- **文件應該去哪裡找？** → 先判定 `MODULE`，再順著 `FEATURE/PAGE/FUNCTION_NAME` 下鑽。
- **總覽文件在哪？** → `_global/` 目錄。
- **為什麼少了某一份文件？** → 先比對入口型態與 DAG skip 規則，不要先假設是漏產出。
- **review 時最常看錯什麼？** → 把 run artifact 路徑當成正式 docs 路徑，或把 `_global/` 當成單功能主文件。