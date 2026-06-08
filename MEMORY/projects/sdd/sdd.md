# SDD — SDLC AI 開發運行模式

- [[projects/sdd/status|族群狀態]]

> 此區為 SDD（SDLC Development Design）專案族群入口。  
> 主旨：結合 AI Agent 建立可治理的 SDLC 開發運行模式，整合 12-Factor App、Spec Kit、Checkmarx MCP 與 Claude Code hooks。

## 核心提案

**標題**：結合 AI Agent 建立可治理的 SDLC 開發運行模式  
**來源**：`P:\AI計畫_0422(EdwardxJamesxPatrick).pdf`（Edward × James × Patrick）  
**工作區**：`C:\Users\003689\Desktop\SDC01`

## 三大治理面向

| 面向 | 工具 | 目的 |
|------|------|------|
| CODEBASE | npm CLI 封裝、instructions + Guideline、skills & Agent | 原始碼品質一致性與設計可追蹤性 |
| DEPENDENCIES | Checkmarx MCP Server、CVE 掃描 | 第三方風險提前控管 |
| CONFIGURATION | Claude Code hooks（SessionStart / FileChanged）、.env 範本 | 跨環境部署治理 |

## 驗證場景

- 理賠 CRM 受理（James）
- 保全效能優化（Patrick）
- 保費憑證體驗優化（Blithe）
