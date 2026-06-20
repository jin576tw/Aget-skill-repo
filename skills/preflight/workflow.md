# Preflight Workflow

## When To Use

- prompt mentions a view, tab, form, or field without an exact file path
- prompt asks for a change or review but does not identify the owning component
- prompt needs candidate specs, views, services, or types before implementation

## Intake Steps

0. **專案偵測** — 讀工作區 `CLAUDE.md`（與 `.github/copilot-instructions.md` 若存在），取得目錄結構根路徑（views/components/services/types/specs）與命名慣例。若 `.github/instructions/preflight.instructions.md` 存在，以它作為後續步驟的 routing guide；否則以 `CLAUDE.md` 提取的資訊為準。
1. Normalize the request into screen, section, action, fields, and constraints.
2. Locate nearest spec, view, component, service, and type surface using routing info from Step 0.
   - 若使用者已提供精確路徑：直接在候選檔案欄填入並標注「使用者提供」，跳過搜尋。
3. If `P:\MEMORY` is available, supplement with family-level background (conventions, lessons-learned, domain glossary).
4. **知識補全（Web Search）** — 若 local spec 與 P:\MEMORY 對某個業務規則、框架行為或領域知識沉默，執行 web search：
   - 優先搜尋官方文件、框架 changelog、Angular 規範
   - 搜尋結果摘要納入「開放問題」或直接補入「功能範疇」說明
   - 標注來源（`[Web]`）與搜尋關鍵字，供 main agent 評估可信度
5. Return a structured Plan Input Report before deeper implementation or review.

## Output Contract

- 目標畫面或模組
- 候選 spec
- 候選檔案
- 候選 service/type
- 缺少資訊
- 下一步建議

## Fallback Rule

If `P:\MEMORY` is unavailable, continue in local fallback mode and rely on repo instructions, specs, and source code.
