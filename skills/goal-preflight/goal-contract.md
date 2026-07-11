# Goal Contract 模板與執行協議

> goal-preflight 的 companion 檔。SKILL.md 負責 8 項預檢清單；本檔提供輸出時使用的 Goal Contract 模板、執行協議全文、狀態碼定義與正反範例。
> 方法論依據：`P:\MEMORY\knowledge\loop-engineering.md`（Loop Contract、Maker/Checker Split、Circuit Breaker、Human-in-the-loop）。

## Goal Contract 模板

預檢通過後，於「修正後條件」之前輸出以下區塊：

```
## Goal Contract

**目標**：{一句話描述要達成什麼}
**範圍**：{做什麼、查哪裡}
**不做事項**：{過程中不能動什麼，如「不修改 spec 檔案」「不碰 CI 設定」}

**停止條件（機器可驗證）**：
- {測試：如 test/auth 全部 PASS}
- {品質：如 code-reviewer rubric 總分 ≥16 且單項 ≥3}
- {流程：如 gate-keeper DoD 全部通過}

**完成證據清單**：
- test / build / lint / typecheck 輸出
- checker（code-reviewer / gate-keeper）裁決信號
- diff 已由人類閱讀：yes/no

**高風險操作清單（Human Gate）**：
commit / push、merge、deploy、依賴升版、刪檔或大量搬移、CI/CD 與權限設定、secret 讀寫
→ 遇到即輸出 GOAL_NEEDS_HUMAN_GATE 並暫停

**斷路器**：
- 最大輪數：{N，預設 10}
- 連續 3 輪同一錯誤 → 停止
- 連續 3 輪同一測試失敗且無新證據 → 停止
- 連續 5 輪 diff 為空 → 停止
```

## 執行協議（/goal 迴圈執行期間遵循）

1. **Maker / Checker 分離**：每輪由 Maker（subagent 或主 session）推進，Checker 在 fresh context 依證據裁決。
   - Checker 只看：Goal Contract、diff、test/build/lint/typecheck 輸出摘要、spec/AC/DoD。
   - Checker 不看：Maker 的推理過程與自我描述。
   - 若目標透過 `/start-work` 推進，**不疊加第二層 checker** — `@code-reviewer`（rubric 分數）與 `gate-keeper`（DoD）即為 Checker。
   - Checker 不通過必須附具體評語與下一輪修正目標；Maker 不可覆寫 Checker 裁決。
2. **裁決浮上對話，信號不可代打**：Checker 的裁決與 rubric 分數必須輸出在對話中（如 `AC-03 PASS | R:18/20`），evaluator 只能讀對話輸出，寫在磁碟的報告它看不到。Orchestrator 只能**原文轉述** checker 回傳的信號行，不得自行產生、修改或省略 R 分數；未實際 spawn checker 的輪次不得出現 R 信號——orchestrator 同時是 maker 的協調者，代打信號即球員兼裁判。
3. **STOP gate 優先於 goal 推進**：`/start-work` 的 `WAITING_FOR_OQ_CONFIRMATION`、`WAITING_FOR_PLAN_CONFIRMATION`、`READY_FOR_ACCEPTANCE` 視同 Human Gate — 輸出 `GOAL_NEEDS_HUMAN_GATE` 暫停等待，**不得為了讓 evaluator 判定達成而跳過確認閘**。
4. **狀態寫磁碟**：每輪結束 append 一行至工作目錄的 `goal-evidence.md`：
   ```
   | R{輪次} | {AC/任務} | {signal} | {rubric 或 －} | {checker 報告路徑或 －} | {下一步或 blocked 原因} |
   ```
   防止長迴圈 context compaction 後失憶；報告路徑是信號的審計錨點（人工可回查分數與磁碟報告是否一致）。不產生 per-worker handoff 檔（token 成本高且 evaluator 讀不到）。
5. **診斷式修正**：每輪失敗帶回失敗測試/錯誤訊息、checker 評語、rubric 扣分項；下一輪必須基於 feedback 修正，不得盲目 retry。

## 狀態碼

| 狀態碼 | 時機 | 輸出要求 |
|--------|------|---------|
| `GOAL_DONE` | 停止條件全部成立 | 必附 Evidence 區塊（見下），無證據不得宣告 |
| `GOAL_BLOCKED` | 斷路器觸發或無新策略 | Reason / Evidence / Needs Human Decision 三段；不得縮小目標範圍宣告完成 |
| `GOAL_NEEDS_HUMAN_GATE` | 遇高風險操作或 STOP gate | 只提供 diff、風險、建議指令，不執行 |
| `GOAL_NEEDS_CONTRACT` | 預檢第 6 項 ❌（停止條件不可機器驗證） | 說明缺口，不產出 /goal 條件 |

### GOAL_DONE 格式

```
GOAL_DONE

Completed:
- ...

Evidence:
- test: ...
- build: ...
- lint: ...
- typecheck: ...
- checker: {rubric 總分 / DoD 結果} + 報告檔路徑
- diff reviewed: yes/no

Remaining Risk:
- ...（未跑項目須標明原因）
```

### GOAL_BLOCKED 格式

```
GOAL_BLOCKED
Reason: circuit_breaker | no_new_strategy | ...
Evidence: ...
Needs Human Decision: ...
```

## 範例

### 反例（停止條件不可驗證 → GOAL_NEEDS_CONTRACT）

使用者輸入：`/start-goal 把登入功能做好，確認沒有問題`

- 「做好」「沒有問題」無法轉成測試、build、lint、AC/DoD 或 rubric 檢查 → 第 6 項 `❌`
- 輸出 `GOAL_NEEDS_CONTRACT`，要求補「哪個測試範圍要 PASS」「rubric 門檻」「輪數上限」，不產出條件。

### 正例（完整 Goal Contract）

使用者輸入：`/start-goal 用 start-work 完成 specs/views/login 的 AC-01~04，品質要過 code review，最多 12 輪`

修正後條件：

```
/goal 以 /start-work 推進 specs/views/login 的 AC-01~04：
每條 AC 的測試 PASS 且 @code-reviewer 信號顯示 rubric 總分 ≥16，
gate-keeper 輸出 READY_FOR_ACCEPTANCE，
過程中不修改 spec 範圍、不 commit/push（遇高風險操作輸出 GOAL_NEEDS_HUMAN_GATE 暫停），
遇 WAITING_/READY_ STOP gate 一律暫停等待使用者，
每輪結束 append goal-evidence.md 並輸出本輪信號，
或 12 輪後停止並輸出 GOAL_BLOCKED。
```
