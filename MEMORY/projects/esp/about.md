# ESP 專案參考

## 定位

ESP (Enterprise Service Platform) 是全球人壽的企業服務平台，處理保險後台作業，包含繳費證明、實體郵件、訊息通知、批次排程等功能。

本檔是靜態參考資訊，不取代 `.kiro/steering/` 或原始碼。

## 技術棧

- Java 8 / Maven multi-module
- Spring Framework 4.0.4 / Spring Batch 3.0.10 / Spring Security 4.0.4
- MyBatis 3.5.6 + Oracle DB
- JSF 2.2 + PrimeFaces 6.0 (UI)
- SOAP (CXF 2.7.7) + RESTful (Spring MVC)
- Drools 8.38 (Rule Engine)
- Quartz 2.3.2 (Scheduling)
- Redis (Session via Lettuce)

## 主要路徑

- 專案根目錄：`C:\Users\003689\Desktop\ESP`
- Steering 指引：`.kiro/steering/`
- Skills (分析 SOP)：`.kiro/skills/`
- AI 產出文件：`.kiro/docs/`
- Prompts：`.kiro/prompts/`
- DB Scripts：`dbscript/`

## 分支策略

| 分支 | 用途 |
| --- | --- |
| `kiro/kiro-analysis` | AI 分析主線（skills、steering、docs 產出） |
| `kiro/jin576tw` | 個人開發分支（目前 active） |
| `kiro/kiro-init` | 初始整合分支 |
| `kiro/Pattrick` | 協作者分支 |
| `kiro/Andy` | 協作者分支 |
