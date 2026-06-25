---
name: java-explain
description: >
  Java 程式碼初學者解說器（專為 adp-policy 設計）。
  TRIGGER when 使用者提供 Java 類別路徑、貼上 Java 程式碼片段，或詢問「這段程式碼在做什麼」、「幫我解釋」等初學者學習請求。
  用正體中文、保險業務語言逐步解釋，不假設使用者有 Java 基礎。
---

# java-explain

專為完全不懂 Java 的人設計，用保險業務語言解釋 adp-policy 程式碼。

使用以下文件：
- [explain-patterns.md](explain-patterns.md) — 解釋格式模板與範例

## 用途

- 使用者指定 Java 類別路徑 → Claude 讀原始碼後用中文解釋
- 使用者貼上程式碼片段 → Claude 直接解釋
- 結合 `adp-knowledge/` 知識庫文件提供業務背景

## 執行流程

1. **判斷輸入類型**
   - 若輸入是路徑（如 `receipt/http/ReceiptController.java`）→ 先用 Read 工具讀檔案
   - 若輸入是貼上的程式碼 → 直接解釋
   - 若未指定 → 詢問使用者想看哪個類別

2. **識別類別角色**
   - 依照 [explain-patterns.md](explain-patterns.md) 的角色判斷表決定是 Controller / Service / Repository / Entity / DTO

3. **查詢 adp-knowledge**
   - 根據功能路徑判斷對應的知識庫目錄
   - 若有對應的 `FLOWCHART.md` 或 `BUSINESS-RULES.md` → 引用業務背景

4. **輸出解釋**
   - 依照 [explain-patterns.md](explain-patterns.md) 的輸出格式輸出

## Guardrails

- **不使用 Java 專業術語**（除非同時附上白話解釋）
- 程式碼解釋粒度：以「段落」為單位（每個 method 一段），不逐行翻譯所有語法
- 保持解釋簡短：一個類別的解釋控制在 200 字以內（複雜類別除外）
- 若知識庫有對應文件，一定要引用，讓使用者知道「這段程式碼對應哪個業務流程」
- 學習完一個類別後，主動建議下一步：「接下來可以看 XxxService 了解它怎麼做到這件事」
