# SDD — 族群狀態

_Last Updated: 2026-05-28_

## Current Focus

提案初稿完成：「結合 AI Agent 建立可治理的 SDLC 開發運行模式」  
500 字郵件版本已產出，供 Edward / James / Patrick 內部傳閱。  
PDF 讀取踩坑已蒸餾至 `lessons-learned.md`；`pdf` skill 已補 Windows 備援段落。

## Next Actions

- [ ] 確認提案是否需要製作正式簡報或 Word 文件
- [ ] CONFIGURATION 段落：與團隊確認 Claude Code hooks 在現有 CI/CD 流程的整合方式
- [ ] 評估 Checkmarx MCP Server 與現行 Checkmarx One 授權的相容性
- [ ] 決定三個驗證場景的推進順序與負責人

## Blocked

（無）

## 提案摘要（供快速回顧）

**CODEBASE**：npm CLI 封裝 + instructions Guideline + skills & Agent  
**DEPENDENCIES**：Checkmarx MCP → CVE 即時警示  
**CONFIGURATION**：Claude Code hooks（SessionStart/FileChanged）+ .env 範本分離
