---
name: compact-signal
description: Compact Signal Protocol — 定義 subagent 回傳 orchestrator 的格式規則。每個 subagent 完成後只回傳決策信號，工件留在磁碟。本 skill 完全自足，不依賴 P:\MEMORY。
---

# Compact Signal Protocol

## 核心原則

> **Orchestrator receives signals, not content.**

Subagent 完成後：
- ✅ 把工件（程式碼、spec、測試、報告）寫到磁碟
- ✅ 只回傳**一行**決策信號給 orchestrator
- ❌ 禁止回傳：程式碼片段、spec 全文、測試代碼、review 全文、CLI 完整輸出

## 通用信號格式

```
成功：{識別符} PASS | {補充資訊（可選）}
失敗：{識別符} FAIL | {原因摘要}
缺口：{識別符} BLOCKED | {原因}
```

各 agent 的具體信號格式定義在其 `## Orchestrator Output` 段落。

## 自足性保證

本 skill 不讀取、不依賴 `P:\MEMORY`。  
無論知識庫是否可達，此協議均正常運作。
