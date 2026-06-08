# Handoff: <from-agent> → <to-agent(s)>

> **用途**：壓縮上下文，讓下一棒 agent 不必重讀整段對話歷史。
> 本檔由前一棒 agent 在完成自己的工作後寫入；下一棒 agent 在開工前必讀此檔 + 自己 layer 對應的 .md 文件。

## 你需要讀

- （列出下一棒應讀的檔案路徑，含本棒產出的 .md 與其他必要原始碼）
- 例如：
  - `.kiro/docs/.../DEPENDENCIES.md`（本棒產出）
  - `<workspace>/esp-system-ui/.../premiumReceipt.xhtml`（進入點原始碼）

## 關鍵假設

- （列出本棒在分析過程中所做的關鍵假設或推導，幫助下一棒理解語境）
- 例如：
  - `PremiumService.printOrReissue4Esp()` 為核心方法（從 ManagedBean 反推）
  - 上游資料來源: `manualBatchJob.xhtml`（已查 xhtml-map.md 確認）

## 待人工確認項

- （無 / 條列）
- 例如：
  - ⚠️ 無法確認 `LineNotifyService` 的 timeout 設定（程式碼未指定，可能用 CXF 預設）

## 信心度

high | medium | low

> **填寫規則**
> - high: 從程式碼直接可推、無待人工項
> - medium: 部分推論、有 1~2 待人工項
> - low: 多處推論、有 ≥3 待人工項，建議人工 review 後再進下一層

## 風險旗標（選填）

- （若本棒分析過程中發現可能影響下游 agent 推理的風險，列在這裡）
