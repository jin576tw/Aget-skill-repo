# ESP

- [[projects/esp/status|狀態]]
- [[projects/esp/about|定位與技術棧]]
- [[projects/esp/lookup|查找規則]]
- [[projects/esp/history|開發歷程]]

## SDD 分析兩階段

| 階段 | 主題 | 說明 |
|------|------|------|
| Phase 1 | **逆向工程從程式碼回推 spec** | 人工閱讀 ESP legacy 程式碼，重建功能規格與設計文件；分析對象：ESP 各 Maven 模組（目前以 esp-system-core / esp-system-ui / esp-remoting-server-web-service 為範例） |
| Phase 2（當前）| **多代理 Harness 自動化 SDD 生成** | 10-worker DAG（esp-deps → esp-sa）+ orchestrator + Playwright 截圖，產出 `.kiro/docs/` 標準文件集（DEPENDENCIES / FLOWCHART / SD / SA 等） |

## Domain Knowledge

- [[projects/esp/harness-map|Harness Map]]
- [[projects/esp/worker-dag|Worker DAG]]
- [[projects/esp/docs-structure|Docs Structure]]

## Knowledge-First Entry

- 啟動時先讀 `P:\MEMORY\knowledge\knowledge.md`，再依任務補讀 `domain-map.md`、`workflow-map.md`、`lookup-map.md`。
- 若工作涉及 ESP 分析骨幹，優先補讀 `harness-map.md`、`worker-dag.md`、`docs-structure.md`。
- `projects/esp/status.md` 只承接目前進度與待辦，不作為主要背景知識來源。

## Harness Runs

ESP 採多代理 Harness 架構自動化分析（`start-analysis` agent，快捷鍵 `Ctrl+Shift+S`）。
每次執行於 `harness/<run_id>/` 留下短期狀態，7 天後 summary 歸檔到 `_archive/`。

- [[projects/esp/harness/runs|Runs 主清單]]
- 協議：[[knowledge/harness-protocol|harness-protocol]]
- 規範：`<workspace>\.kiro\prompts\write-spec.md`
