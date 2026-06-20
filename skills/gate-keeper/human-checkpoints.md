# Human Checkpoints

以下情況命中時，流程必須停下並以問答方式請使用者確認：

## Step 0 / `/plan` 前

- 商業規則未定義或互相衝突
- API contract 未知或錯誤碼無法判定
- AC 雖存在，但無法驗證通過 / 失敗
- 需求涉及既有流程風險，但影響面未確認
- `/plan` 已產出，但尚未得到使用者確認是否依該計畫執行

## Step 3 ~ Step 6

- code-reviewer 指出方向性問題，需要決定回到 spec 還是回到 implementer
- 同一條 AC 的測試與實作對需求理解發生衝突

## Step 7

- 專案本身沒有 Playwright，但功能屬關鍵使用者旅程或整合結果驗證
- 需詢問是否建立共享 harness：`C:\Users\003689\Desktop\playwright-harness`
- 若使用者同意使用共享 harness，可再問是否協助安裝 Playwright 與瀏覽器

## Step 8

- 所有 AC 完成後，需確認是否進入驗收條件（DoD）收尾
- 若 E2E 略過，需確認略過理由是否可接受並記錄

## 建議輸出

```markdown
## Checkpoint

- 狀態：WAITING_FOR_OQ_CONFIRMATION / WAITING_FOR_PLAN_CONFIRMATION / WAITING_FOR_E2E_HARNESS_DECISION / READY_FOR_ACCEPTANCE
- 需要確認：
  1. ...
  2. ...
- 建議選項：
  - 選項 A：...
  - 選項 B：...
```
