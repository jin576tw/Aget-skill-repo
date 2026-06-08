# Preflight Workflow

## When To Use

- prompt mentions a view, tab, form, or field without an exact file path
- prompt asks for a change or review but does not identify the owning component
- prompt needs candidate specs, views, services, or types before implementation

## Intake Steps

0. **專案偵測** — 讀工作區 `CLAUDE.md`（與 `.github/copilot-instructions.md` 若存在），取得目錄結構根路徑（views/components/services/types/specs）與命名慣例。若 `.github/instructions/preflight.instructions.md` 存在，以它作為後續步驟的 routing guide；否則以 `CLAUDE.md` 提取的資訊為準。
1. Normalize the request into screen, section, action, fields, and constraints.
2. Check whether the user already provided an exact file path, symbol, or failing behavior.
3. If exact anchors exist, skip preflight and move directly to local analysis.
4. If anchors do not exist, use the routing info from Step 0 to identify the nearest spec, view, component, service, and type surface.
5. If `P:\MEMORY` is available, add family-level background only after local project context is established.
6. Return a structured preflight result before deeper implementation or review.

## Output Contract

- 目標畫面或模組
- 候選 spec
- 候選檔案
- 候選 service/type
- 缺少資訊
- 下一步建議

## Fallback Rule

If `P:\MEMORY` is unavailable, continue in local fallback mode and rely on repo instructions, specs, and source code.